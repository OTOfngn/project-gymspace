const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { GoogleGenAI } = require('@google/genai');

// Load environment variables from .env file
// path.join(__dirname, '.env') ensures the .env is found relative to this file,
// not the directory the command was run from.
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Allow frontend to communicate with backend
app.use(express.json()); // Parse JSON request bodies

// Initialize Google Gemini API client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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