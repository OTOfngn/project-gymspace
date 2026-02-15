console.log("js connected");


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
function createBookingBtn(text = "Book") {
    const btn = document.createElement("button");
    btn.textContent = text;
    let if_booked = false;
    btn.onclick = function () {
        if (if_booked) {
            btn.textContent = "Book";
            if_booked = false;
        } else {
            btn.textContent = "Booked";
            if_booked = true;
        }
    };
    return btn;
}

// Fill empty table cells with booking buttons
const cells = document.querySelectorAll("tbody td:not(:first-child)");
cells.forEach(cell => { cell.appendChild(createBookingBtn()); });
