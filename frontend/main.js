console.log("js connected");

let renderedMonday = getMondayDate().toISOString();

// Real-time Week Checker
function checkWeekInRealtime() {
    const currentMonday = getMondayDate().toISOString();
    if (currentMonday !== renderedMonday) {
        console.log("A new week has officially started! Refreshing booking table...");
        renderedMonday = currentMonday;
        updateWeekDates();
        renderTable();
    }
}
// Check every 60 seconds
setInterval(checkWeekInRealtime, 60000);

// Authentication State
let currentUserId = localStorage.getItem("userId");
let currentUsername = localStorage.getItem("username");

// Update UI based on auth state
function updateAuthUI() {
    const loginBtn = document.getElementById("login-btn");
    const userDisplay = document.getElementById("user-display");
    if (currentUserId) {
        loginBtn.textContent = "Logout";
        userDisplay.textContent = `Welcome, ${currentUsername}`;
        userDisplay.style.display = "inline-block";
    } else {
        loginBtn.textContent = "Login";
        userDisplay.style.display = "none";
    }
}
updateAuthUI();

// Login / Logout / Register Logic
const loginBtn = document.getElementById("login-btn");
const loginModal = document.getElementById("login-modal");
const closeModalBtn = document.getElementById("close-modal-btn");
const loginAuthBtn = document.getElementById("login-auth-btn");
const registerAuthBtn = document.getElementById("register-auth-btn");
const usernameInput = document.getElementById("username-input");
const passwordInput = document.getElementById("password-input");

loginBtn.onclick = () => {
    if (currentUserId) {
        // Logout
        localStorage.removeItem("userId");
        localStorage.removeItem("username");
        currentUserId = null;
        currentUsername = null;
        updateAuthUI();
        renderTable();
    } else {
        // Show login modal
        loginModal.style.display = "flex";
    }
};

closeModalBtn.onclick = () => {
    loginModal.style.display = "none";
};

async function handleAuth(url) {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) return alert("Please enter both username and password.");

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();

        if (data.success) {
            localStorage.setItem("userId", data.user.id);
            localStorage.setItem("username", data.user.username);
            currentUserId = data.user.id;
            currentUsername = data.user.username;
            updateAuthUI();
            loginModal.style.display = "none";
            usernameInput.value = "";
            passwordInput.value = "";
            renderTable(); // Re-render to show correct booking statuses
        } else {
            alert(data.error || "Authentication failed.");
        }
    } catch (err) {
        console.error(err);
        alert("Server error.");
    }
}

loginAuthBtn.onclick = () => handleAuth('https://gymspace-4sfc.onrender.com/login');
registerAuthBtn.onclick = () => handleAuth('https://gymspace-4sfc.onrender.com/register');

// page refresh
function refresh() {
    window.location.reload();
}

// data storage removed - limits now strictly enforced by the secure backend

// Theme button
const themeBtn = document.getElementById("theme-btn");
const body = document.body;

// Load saved theme initially
const savedTheme = localStorage.getItem("gymspace-theme");
if (savedTheme) {
    if (savedTheme === "light-theme") body.classList.add("light-theme");
    else if (savedTheme === "dark-theme") body.classList.add("dark-theme");
}

themeBtn.onclick = function () {
    if (body.classList.contains("light-theme")) {
        body.classList.remove("light-theme");
        body.classList.add("dark-theme");
        localStorage.setItem("gymspace-theme", "dark-theme");
    } else {
        body.classList.remove("dark-theme");
        body.classList.add("light-theme");
        localStorage.setItem("gymspace-theme", "light-theme");
    }
};

// Booking button template
function createBookingBtn(dateString, timeSlot, initialStatus) {
    const btn = document.createElement("a");

    let if_booked = initialStatus;

    if (if_booked === 'booked') {
        btn.textContent = "Booked";
        btn.style.color = "var(--primary-color)";
    } else if (if_booked === 'booked by someone else') {
        btn.textContent = "Booked";
        btn.style.color = "grey";
        btn.style.cursor = "not-allowed";
    } else {
        btn.textContent = "Book";
    }

    // Custom attribute to track state easily without localStorage
    btn.setAttribute("data-status", if_booked);

    btn.onclick = async function () {
        let newStatus = 'available';

        switch (if_booked) {
            case 'booked':
                newStatus = 'available';
                break;
            case 'available':
                if (!currentUserId) {
                    alert("Please login first to book an appointment.");
                    return;
                }
                newStatus = 'booked';
                break;
            case 'booked by someone else':
                alert("This is booked by someone else.");
                return;
        }

        // Save to Database Configured in server.js
        try {
            const response = await fetch('http://localhost:3000/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    gymName: currentGym,
                    dateString: dateString,
                    timeSlot: timeSlot,
                    status: newStatus,
                    userId: currentUserId
                })
            });

            if (response.ok) {
                if_booked = newStatus;
                btn.textContent = if_booked === 'booked' ? "Booked" : "Book";
                btn.style.color = if_booked === 'booked' ? "var(--primary-color)" : "var(--text-color)";
                btn.setAttribute("data-status", if_booked);
            } else {
                const errorData = await response.json();
                console.error("Backend DB rejected booking update.");
                alert(errorData.error || "Database failed to record booking.");
            }
        } catch (error) {
            console.error("Failed to connect to backend", error);
            alert("Could not reach backend API!");
        }
    };
    return btn;
}

// Gym selection and dynamic table rendering
let currentGym = "Gym 1"; // Default active gym
const gymButtons = document.querySelectorAll("#gym-list button");

function getMondayDate() {
    const today = new Date();
    const dayOfWeek = today.getDay() === 0 ? 6 : today.getDay() - 1;
    const mondayDate = new Date(today);
    mondayDate.setHours(0, 0, 0, 0); // Normalize time
    mondayDate.setDate(today.getDate() - dayOfWeek);
    return mondayDate;
}

async function renderTable() {
    // 1. Fetch bookings from backend
    let activeBookings = [];
    try {
        const userIdParam = currentUserId ? `?userId=${currentUserId}` : '';
        const response = await fetch(`http://localhost:3000/api/bookings/${encodeURIComponent(currentGym)}${userIdParam}`);
        if (response.ok) {
            activeBookings = await response.json();
        }
    } catch (err) {
        console.error("No connection to backend:", err);
    }

    const mondayDate = getMondayDate();
    const rows = document.querySelectorAll("tbody tr");

    rows.forEach(row => {
        const timeSlotCell = row.querySelector("td:first-child");
        const timeSlot = timeSlotCell.textContent.trim();

        const cells = row.querySelectorAll("td:not(:first-child)");
        cells.forEach((cell, colIndex) => {
            const cellDate = new Date(mondayDate);
            cellDate.setDate(mondayDate.getDate() + colIndex);

            // Format to YYYY-MM-DD
            const dateString = `${cellDate.getFullYear()}-${String(cellDate.getMonth() + 1).padStart(2, '0')}-${String(cellDate.getDate()).padStart(2, '0')}`;

            // Match with database state
            const dbRecord = activeBookings.find(b => b.date_string === dateString && b.time_slot === timeSlot);

            let status = 'available';
            if (dbRecord) {
                status = dbRecord.status;
            }

            cell.innerHTML = ""; // Clear existing button before adding new one
            cell.appendChild(createBookingBtn(dateString, timeSlot, status));
        });
    });
}

// Add click events to gym buttons to switch views
gymButtons.forEach(btn => {
    btn.addEventListener("click", function () {
        currentGym = this.textContent.trim();

        // Update the title to show which gym is active
        const titleElement = document.getElementById("workout-plans-title");
        if (titleElement) {
            titleElement.textContent = `Workout Plans - ${currentGym}`;
        }

        // Optional: you could highlight the selected button here

        // Render the appointments for the newly selected gym
        renderTable();
    });
});

// Run the initial setup when the page loads
renderTable();
// localStorage.clear();

// ===========================
// DYNAMIC WEEK DATES
// ===========================
function updateWeekDates() {
    const mondayDate = getMondayDate();

    const days = [
        { id: "th-mon", name: "Monday" },
        { id: "th-tue", name: "Tuesday" },
        { id: "th-wed", name: "Wednesday" },
        { id: "th-thu", name: "Thursday" },
        { id: "th-fri", name: "Friday" },
        { id: "th-sat", name: "Saturday" },
        { id: "th-sun", name: "Sunday" }
    ];

    // Loop through the 7 days of the week, calculate their specific date, and update the HTML element
    for (let i = 0; i < 7; i++) {
        const currentDate = new Date(mondayDate);
        currentDate.setDate(mondayDate.getDate() + i);

        // Format the date as "DD/MM" (e.g., "15/04")
        const dateStr = currentDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });

        const thElement = document.getElementById(days[i].id);
        if (thElement) {
            thElement.innerHTML = `${days[i].name}<br><span style="font-size: 0.8em; font-weight: normal; color: var(--secondary-text-color, #777);">${dateStr}</span>`;
        }
    }
}

// Call the function to update dates when the page loads
updateWeekDates();
