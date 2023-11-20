var currentYear, currentMonth;

function generateCalendar(year, month) {
    const calendar = document.getElementById("calendar");
    calendar.innerHTML = "";

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    console.log("月" + daysInMonth, "日" + firstDayOfMonth);

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const header = document.createElement("div");
    header.classList.add("calendar-header");
    header.innerHTML = `<span class="current-month">${monthNames[month]} ${year}</span>`;
    calendar.appendChild(header);

    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const daysContainer = document.createElement("div");
    daysContainer.classList.add("calendar-days");

    daysOfWeek.forEach(day => {
        const dayElement = document.createElement("div");
        var num = 1;
        dayElement.classList.add("dayOfWeek");
        dayElement.textContent = day;
        daysContainer.appendChild(dayElement);
    });

    for (let i = 0; i < firstDayOfMonth; i++) {
        const emptyDay = document.createElement("div");
        emptyDay.classList.add("day");
        daysContainer.appendChild(emptyDay);
    }

    for (let i = 1; i <= daysInMonth; i++) {
        const dayElement = document.createElement("div");
        dayElement.classList.add("day");
        dayElement.textContent = i;
        dayElement.setAttribute("data-date",`${currentYear}${currentMonth+1}${i}`);
        daysContainer.appendChild(dayElement);
    }

    calendar.appendChild(daysContainer);
}

function showPreviousMonth() {
    if (currentMonth === 0) {
        currentYear--;
        currentMonth = 11;
    } else {
        currentMonth--;
    }
    generateCalendar(currentYear, currentMonth);
}


function showNextMonth() {
    if (currentMonth === 11) {
        currentYear++;
        currentMonth = 0;
    } else {
        currentMonth++;
    }
    generateCalendar(currentYear, currentMonth);
}

/* function showDialy() {

   } */

var currentDate = new Date();
currentYear = currentDate.getFullYear();
currentMonth = currentDate.getMonth();
generateCalendar(currentYear, currentMonth);
generateCalendar(currentDate.getFullYear(), currentDate.getMonth());