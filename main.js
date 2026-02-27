console.log("js connected");

// page refresh
function refresh() {
    window.location.reload();
}

// data storage

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
    const key = "booking_" + position;
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

// Fill empty table cells with booking buttons
const cells = document.querySelectorAll("tbody td:not(:first-child)");
cells.forEach((cell, index) => { cell.appendChild(createBookingBtn(index)); });
// localStorage.clear();
