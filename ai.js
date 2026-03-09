console.log("ai.js connected");

// ===========================
// THEME TOGGLE BUTTON
// ===========================

// Get a reference to the Theme button element from the HTML using its id="theme-btn"
const themeBtn = document.getElementById("theme-btn");

// Get a reference to the <body> element so we can change its CSS class for theming
const body = document.body;

// When the Theme button is clicked, toggle between dark and light themes.
// This works by swapping CSS classes on the <body> element.
// The "dark-theme" and "light-theme" classes are defined in style.css
// and they change CSS variables like --bg-color and --text-color.
themeBtn.onclick = function () {
    if (body.classList.contains("dark-theme")) {
        // If currently dark, switch to light
        body.classList.remove("dark-theme");
        body.classList.add("light-theme");
    } else {
        // If currently light (or default), switch to dark
        body.classList.remove("light-theme");
        body.classList.add("dark-theme");
    }
};

// ===========================
// AI WORKOUT ASSISTANT
// ===========================

// API_KEY is the authentication key for the Google Gemini API.
// It is needed so that Google knows who is making the request
// and allows us to use the AI service.
const API_KEY = "AIzaSyBZE4S0aoghhF0E1ny-Pk_YVLjRy1Whd1c";

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
        // fetch() sends an HTTP request to the Gemini API.
        // - The URL is the Gemini API endpoint for generating text content.
        // - The API_KEY is passed as a query parameter in the URL.
        // - "await" pauses execution here until the API sends back a response.
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
            {
                // POST method is used because we are SENDING data (the question) to the API
                method: "POST",

                // Headers tell the API that we are sending JSON-formatted data
                headers: { "Content-Type": "application/json" },

                // body contains the actual data we send to the API.
                // JSON.stringify() converts a JavaScript object into a JSON string
                // because APIs communicate using text (JSON), not JavaScript objects.
                // The "contents" array with "parts" is the format that Gemini API expects.
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [{ text: question }]
                        }
                    ]
                })
            }
        );

        // response.json() converts the API's response from JSON text
        // back into a JavaScript object we can work with.
        // "await" pauses here again until the conversion is done.
        const data = await response.json();

        // Check if the API returned valid results.
        // "data.candidates" is an array of possible answers from the AI.
        // If it exists and has at least one item, we extract the text.
        if (data.candidates && data.candidates.length > 0) {
            // Navigate through the response structure to get the actual text:
            // data.candidates[0] = first answer option
            // .content.parts[0] = first part of that answer
            // .text = the actual text string
            aiResponse.textContent = data.candidates[0].content.parts[0].text;
        } else {
            // If no candidates were returned, show a fallback message
            aiResponse.textContent = "No response received. Try again.";
        }
    } catch (error) {
        // If the fetch() failed (e.g. no internet, API down, invalid key),
        // display the error message to the user
        aiResponse.textContent = "Error: " + error.message;
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
