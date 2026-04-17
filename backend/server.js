const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
// Load environment variables FIRST
dotenv.config({ path: path.join(__dirname, '.env') });

const { GoogleGenAI } = require('@google/genai');
const sql = require('./db');



const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Allow frontend to communicate with backend
app.use(express.json()); // Parse JSON request bodies

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// Initialize Google Gemini API client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Ensure database table exists
async function initDB() {
    try {
        await sql`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(50) NOT NULL
            )
        `;
        
        // Ensure columns exist just in case the table was created by something else previously
        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(50)`;
        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(50)`;
        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255) DEFAULT ''`;
        await sql`
            CREATE TABLE IF NOT EXISTS gym_bookings (
                id SERIAL PRIMARY KEY,
                gym_name VARCHAR(50) NOT NULL,
                date_string VARCHAR(20) NOT NULL,
                time_slot VARCHAR(50) NOT NULL,
                status VARCHAR(20) DEFAULT 'available',
                user_id INT REFERENCES users(id),
                UNIQUE(gym_name, date_string, time_slot)
            )
        `;
        console.log("Database initialized.");
    } catch (err) {
        console.error("Database initialization failed:", err);
    }
}
initDB();

// --- API ENDPOINTS ---

// AUTHENTICATION Endpoints
app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ error: "Username and password required" });
        
        const result = await sql`
            INSERT INTO users (username, password, password_hash)
            VALUES (${username}, ${password}, ${password})
            RETURNING id, username
        `;
        res.json({ success: true, user: result[0] });
    } catch (err) {
        if (err.code === '23505') { // unique violation
            res.status(400).json({ error: "Username already exists" });
        } else {
            console.error(err);
            res.status(500).json({ error: "Register failed" });
        }
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const users = await sql`
            SELECT id, username FROM users 
            WHERE username = ${username} AND password = ${password}
        `;
        if (users.length > 0) {
            res.json({ success: true, user: users[0] });
        } else {
            res.status(401).json({ error: "Invalid username or password" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Login failed" });
    }
});

// GET bookings for a specific gym
app.get('/api/bookings/:gym', async (req, res) => {
    try {
        const { gym } = req.params;
        const currentUserId = req.query.userId; // Pass from frontend safely
        
        const bookings = await sql`
            SELECT date_string, time_slot, status, user_id FROM gym_bookings WHERE gym_name = ${gym}
        `;
        
        // Hide user_ids and process "booked by someone else" directly in backend
        const processedBookings = bookings.map(b => {
            let finalStatus = b.status;
            if (finalStatus === 'booked' && String(b.user_id) !== String(currentUserId)) {
                finalStatus = 'booked by someone else';
            }
            return {
                date_string: b.date_string,
                time_slot: b.time_slot,
                status: finalStatus
            };
        });
        
        res.json(processedBookings);
    } catch (err) {
        console.error("Error fetching bookings:", err);
        res.status(500).json({ error: "Failed to fetch bookings" });
    }
});

// POST to update or add a booking
app.post('/api/bookings', async (req, res) => {
    try {
        const { gymName, dateString, timeSlot, status, userId } = req.body;
        
        if (!userId) return res.status(401).json({ error: "Must be logged in to book" });

        // Enforce max appointment limit in backend (if booking a new one)
        if (status === 'booked') {
            const currentBookings = await sql`
                SELECT COUNT(*) as count FROM gym_bookings 
                WHERE user_id = ${userId} AND status = 'booked' AND gym_name = ${gymName}
            `;
            if (currentBookings[0].count >= 3) {
                return res.status(400).json({ error: "You can only book up to 3 appointments." });
            }
        }

        // Insert or Update the booking status
        await sql`
            INSERT INTO gym_bookings (gym_name, date_string, time_slot, status, user_id)
            VALUES (${gymName}, ${dateString}, ${timeSlot}, ${status}, ${userId})
            ON CONFLICT (gym_name, date_string, time_slot) 
            DO UPDATE SET status = EXCLUDED.status, user_id = EXCLUDED.user_id
        `;
        
        res.json({ success: true });
    } catch (err) {
        console.error("Error saving booking:", err);
        res.status(500).json({ error: "Failed to save booking" });
    }
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { messages } = req.body;

        if (!messages || messages.length === 0) {
            return res.status(400).json({ error: "Messages are required." });
        }

        // The frontend sends OpenAI-style messages [{role: 'user', content: 'hello'}]
        // We extract the user's latest question.
        const userQuestion = messages[messages.length - 1].content;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userQuestion,
            config: {
                // This acts as a hidden "pre-prompt" to tell the AI how to behave.
                // The user doesn't see this, but it guides all of the AI's answers.
                systemInstruction: "You are a professional, motivating workout assistant for an app called GymSpace. Your goal is to help users with fitness, workout routines, diet, and gym-related questions. Be encouraging but keep your answers relatively concise. If a user asks a question entirely unrelated to health and fitness, politely decline to answer and remind them you are a fitness assistant.",
            }
        });

        // Send the AI's response back to the frontend
        res.json({ reply: response.text });

    } catch (error) {
        console.error("Error communicating with AI:", error.message);
        res.status(500).json({ error: "Failed to connect to AI provider." });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
});