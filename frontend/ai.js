console.log("ai.js connected");

// ===========================
// THEME TOGGLE BUTTON
// ===========================

// Get a reference to the Theme button element from the HTML using its id="theme-btn"
const themeBtn = document.getElementById("theme-btn");

// Get a reference to the <body> element so we can change its CSS class for theming
const body = document.body;

// When the Theme button is clicked, toggle between dark and light themes.
// We use localStorage to save the preference across pages.
const savedTheme = localStorage.getItem("gymspace-theme");
if (savedTheme) {
    if (savedTheme === "light-theme") body.classList.add("light-theme");
    else if (savedTheme === "dark-theme") body.classList.add("dark-theme");
}

themeBtn.onclick = function () {
    // If it's currently light, switch to dark. 
    // Default (no class) is dark, so any other condition means switch to light.
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

// ===========================
// AI WORKOUT ASSISTANT
// ===========================

// Get references to the HTML elements we need to interact with:
// - aiBtn: the "Ask AI" button the user clicks to send their question
// - aiInput: the text input field where the user types their question
// - aiResponse: the <p> element where we display the AI's answer
const aiBtn = document.getElementById("ai-btn");
const aiInput = document.getElementById("ai-input");
const aiResponse = document.getElementById("ai-response");

// This function runs when the "Ask AI" button is clicked.
// It is marked "async" because it uses "await" to wait for the API response.
// Without async/await, the code would continue running before getting the response.
aiBtn.onclick = async function () {
    // Get the user's question from the input field.
    // .trim() removes any extra whitespace from the start/end of the text.
    const question = aiInput.value.trim();

    // If the input is empty, do nothing (return early)
    if (!question) return;

    // Show a "Thinking..." message so the user knows the AI is processing
    aiResponse.textContent = "Thinking...";

    // Disable the button while waiting for the response
    // to prevent the user from sending multiple requests at once
    aiBtn.disabled = true;

    // try/catch is used for error handling.
    // If anything goes wrong with the API request, the catch block will run
    // instead of crashing the page.
    try {
        // fetch() sends the question to our own backend server
        const response = await fetch('http://localhost:3000/api/chat', {
            // POST method is used because we are SENDING data (the question) to the API
            method: 'POST',

            // Headers tell the server that we are sending JSON-formatted data
            headers: { 'Content-Type': 'application/json' },

            // body contains the actual data we send to the backend.
            // JSON.stringify() converts a JavaScript object into a JSON string
            // because APIs communicate using text (JSON), not JavaScript objects.
            body: JSON.stringify({
                messages: [{ role: "user", content: question }]
            })
        });

        // response.json() converts the backend's response from JSON text
        // back into a JavaScript object we can work with.
        // "await" pauses here again until the conversion is done.
        const data = await response.json();

        // The backend returns { reply: "..." } with the AI's answer
        if (data.reply) {
            aiResponse.textContent = data.reply;
        } else {
            aiResponse.textContent = "No response received. Try again.";
        }
    } catch (error) {
        // If the fetch() failed (e.g. no internet, backend not running),
        // display an error message to the user
        aiResponse.textContent = "Error connecting to the AI.";
        console.error(error);
    }

    // Re-enable the button so the user can ask another question
    aiBtn.disabled = false;
};

// ===========================
// ENTER KEY SHORTCUT
// ===========================

// Listen for keyboard events on the input field.
// When the user presses the Enter key, simulate a click on the "Ask AI" button.
// This makes it more convenient — the user doesn't have to click the button manually.
aiInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") aiBtn.click();
});
