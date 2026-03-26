console.log("js connected");

// page refresh
function refresh() {
    window.location.reload();
}

// data storage
const MAX_APPOINTMENTS = 3; // Set your maximum appointment limit here

// Helper function to count how many current bookings the user has for the selected gym
function getBookedCount() {
    let count = 0;
    for (let i = 0; i < localStorage.length; i++) {
        const storageKey = localStorage.key(i);
        // Only count if the key belongs to currentGym and its status is "booked"
        if (storageKey && storageKey.startsWith(`booking_${currentGym}_`) && localStorage.getItem(storageKey) === 'booked') {
            count++;
        }
    }
    return count;
}

// Theme button
const themeBtn = document.getElementById("theme-btn");
const body = document.body;

themeBtn.onclick = function () {
    if (body.classList.contains("dark-theme")) {
        body.classList.remove("dark-theme");
        body.classList.add("light-theme");
    } else {
        body.classList.remove("light-theme");
        body.classList.add("dark-theme");
    }
};

// Booking button template
function createBookingBtn(position = 0) {
    const btn = document.createElement("a");
    // Ensure the localStorage key distinguishes between different gyms
    const key = `booking_${currentGym}_${position}`;
    // btn.href = "#";
    if (localStorage.getItem(key) === null) {
        localStorage.setItem(key, 'available');
    }
    let if_booked = localStorage.getItem(key);
    btn.textContent = if_booked === 'booked' ? "Booked" : 'Book';
    if (if_booked === 'booked') btn.style.color = "var(--primary-color)";

    btn.onclick = function () {
        switch (if_booked) {
            case 'booked':
                btn.textContent = "Book";
                btn.style.color = "var(--text-color)";
                if_booked = 'available';
                break;
            case 'available':
                // Check if the user has reached their maximum limit before allowing a new booking
                if (getBookedCount() >= MAX_APPOINTMENTS) {
                    alert(`You can only book up to ${MAX_APPOINTMENTS} appointments.`);
                    return; // Stop the code here to prevent booking
                }

                btn.textContent = "Booked";
                btn.style.color = "var(--primary-color)";
                if_booked = 'booked';
                break;
            case 'booked by someone else':
                alert("This is booked by someone else.");
                break;
        }
        localStorage.setItem(key, if_booked);
    };
    return btn;
}

// Gym selection and dynamic table rendering
let currentGym = "Gym 1"; // Default active gym
const gymButtons = document.querySelectorAll("#gym-list button");

function renderTable() {
    // Find all the cells, clear previous buttons, and render new ones for currentGym
    const cells = document.querySelectorAll("tbody td:not(:first-child)");
    cells.forEach((cell, index) => {
        cell.innerHTML = ""; // Clear existing button before adding new one
        cell.appendChild(createBookingBtn(index));
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
