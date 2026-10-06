/* =====================================================
   SOFT MATTER MEET 2026
   LIVE SCHEDULE
===================================================== */

let scheduleData = {};

let selectedDay = "day1";


/* =====================================================
   LOAD SCHEDULE
===================================================== */

async function loadSchedule() {

    try {

        const response = await fetch("schedule.json");

        if (!response.ok) {

            throw new Error("Could not load schedule.json");

        }

        scheduleData = await response.json();

        renderSchedule(selectedDay);

        updateLiveStatus();

        setInterval(updateLiveStatus, 1000);

    }

    catch (error) {

        console.error(error);

        document.getElementById("schedule").innerHTML = `
            <div style="
                padding:40px;
                text-align:center;
                font-family:'PT Serif',serif;
                color:#777;
            ">
                Unable to load the conference schedule.
            </div>
        `;

    }

}


/* =====================================================
   FORMAT TIME
===================================================== */

function formatTime(time) {

    return time;

}


/* =====================================================
   CONVERT TIME TO MINUTES
===================================================== */

function timeToMinutes(time) {

    const parts = time.split(":");

    let hours = parseInt(parts[0]);

    const minutes = parseInt(parts[1]);

    return hours * 60 + minutes;

}


/* =====================================================
   GET CURRENT IST TIME
===================================================== */

function getIndiaTime() {

    const now = new Date();

    const indiaString = now.toLocaleString(
        "en-US",
        {
            timeZone: "Asia/Kolkata"
        }
    );

    return new Date(indiaString);

}


/* =====================================================
   UPDATE CLOCK
===================================================== */

function updateClock() {

    const now = getIndiaTime();

    let hours = now.getHours();

    const minutes = String(
        now.getMinutes()
    ).padStart(2, "0");

    const seconds = String(
        now.getSeconds()
    ).padStart(2, "0");

    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;

    hours = hours || 12;

    document.getElementById("clock").textContent =
        `${hours}:${minutes}:${seconds} ${ampm}`;

}


/* =====================================================
   FIND CURRENT DAY
===================================================== */

function getCurrentDay() {

    const now = getIndiaTime();

    const year = now.getFullYear();

    const month = now.getMonth() + 1;

    const date = now.getDate();

    if (
        year === 2026 &&
        month === 10 &&
        date === 12
    ) {

        return "day1";

    }

    if (
        year === 2026 &&
        month === 10 &&
        date === 13
    ) {

        return "day2";

    }

    if (
        year === 2026 &&
        month === 10 &&
        date === 14
    ) {

        return "day3";

    }

    return null;

}


/* =====================================================
   UPDATE LIVE STATUS
===================================================== */

function updateLiveStatus() {

    updateClock();

    const currentDay = getCurrentDay();

    if (!currentDay || !scheduleData[currentDay]) {

        document.getElementById("current-title").textContent =
            "Conference schedule";

        document.getElementById("current-speaker").textContent =
            "Soft Matter Meet 2026";

        document.getElementById("current-time").textContent =
            "12–14 October 2026";

        document.getElementById("next-title").textContent =
            "See the full schedule";

        document.getElementById("next-speaker").textContent =
            "";

        document.getElementById("next-time").textContent =
            "";

        return;

    }


    const now = getIndiaTime();

    const currentMinutes =
        now.getHours() * 60 +
        now.getMinutes() +
        now.getSeconds() / 60;


    const events = scheduleData[currentDay];


    let currentEvent = null;

    let nextEvent = null;


    for (let i = 0; i < events.length; i++) {

        const event = events[i];

        const start =
            timeToMinutes(event.start);

        const end =
            timeToMinutes(event.end);


        if (
            currentMinutes >= start &&
            currentMinutes < end
        ) {

            currentEvent = event;

            if (i + 1 < events.length) {

                nextEvent = events[i + 1];

            }

            break;

        }


        if (
            currentMinutes < start &&
            !nextEvent
        ) {

            nextEvent = event;

        }

    }


    /* CURRENT */

    if (currentEvent) {

        document.getElementById(
            "current-title"
        ).textContent =
            currentEvent.title || "Session";


        document.getElementById(
            "current-speaker"
        ).textContent =
            currentEvent.speaker || "";


        document.getElementById(
            "current-time"
        ).textContent =
            `${currentEvent.start} – ${currentEvent.end}`;


        const start =
            timeToMinutes(currentEvent.start);

        const end =
            timeToMinutes(currentEvent.end);


        const progress =
            ((currentMinutes - start) /
            (end - start)) * 100;


        document.getElementById(
            "progress"
        ).style.width =
            `${Math.max(0, Math.min(100, progress))}%`;

    }

    else {

        document.getElementById(
            "current-title"
        ).textContent =
            "No session at this time";


        document.getElementById(
            "current-speaker"
        ).textContent =
            "Please check the schedule";


        document.getElementById(
            "current-time"
        ).textContent =
            "";


        document.getElementById(
            "progress"
        ).style.width =
            "0%";

    }


    /* NEXT */

    if (nextEvent) {

        document.getElementById(
            "next-title"
        ).textContent =
            nextEvent.title || "Next session";


        document.getElementById(
            "next-speaker"
        ).textContent =
            nextEvent.speaker || "";


        document.getElementById(
            "next-time"
        ).textContent =
            `${nextEvent.start} – ${nextEvent.end}`;

    }

    else {

        document.getElementById(
            "next-title"
        ).textContent =
            "No more sessions";


        document.getElementById(
            "next-speaker"
        ).textContent =
            "";


        document.getElementById(
            "next-time"
        ).textContent =
            "";

    }


    /* Highlight current row */

    if (selectedDay === currentDay) {

        highlightCurrentEvent(currentEvent);

    }

}


/* =====================================================
   HIGHLIGHT CURRENT EVENT
===================================================== */

function highlightCurrentEvent(event) {

    const rows =
        document.querySelectorAll(".schedule-row");


    rows.forEach(row => {

        row.classList.remove("current");

    });


    if (!event) {

        return;

    }


    rows.forEach(row => {

        if (
            row.dataset.start === event.start &&
            row.dataset.title === event.title
        ) {

            row.classList.add("current");

        }

    });

}


/* =====================================================
   RENDER SCHEDULE
===================================================== */

function renderSchedule(day) {

    const container =
        document.getElementById("schedule");


    const events =
        scheduleData[day];


    if (!events || events.length === 0) {

        container.innerHTML = `
            <div style="
                padding:40px;
                text-align:center;
                font-family:'PT Serif',serif;
                color:#777;
            ">
                No schedule available.
            </div>
        `;

        return;

    }


    container.innerHTML = "";


    events.forEach(event => {

        const row =
            document.createElement("div");


        row.className =
            "schedule-row";


        if (
            event.type === "break" ||
            event.type === "meal"
        ) {

            row.classList.add(
                "break-row"
            );

        }


        row.dataset.start =
            event.start;

        row.dataset.title =
            event.title;


        row.innerHTML = `

            <div class="schedule-time">
                ${event.start}
                –
                ${event.end}
            </div>

            <div class="schedule-content">

                <div class="schedule-title">
                    ${event.title}
                </div>

                ${
                    event.speaker
                    ?
                    `
                    <div class="schedule-speaker">
                        ${event.speaker}
                    </div>
                    `
                    :
                    ""
                }

                ${
                    event.type
                    ?
                    `
                    <div class="schedule-type">
                        ${event.type}
                    </div>
                    `
                    :
                    ""
                }

            </div>

        `;


        container.appendChild(row);

    });


    const currentDay =
        getCurrentDay();


    if (
        currentDay === day
    ) {

        updateLiveStatus();

    }

}


/* =====================================================
   DAY BUTTONS
===================================================== */

document
    .querySelectorAll(".day-tab")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(".day-tab")
                    .forEach(tab => {

                        tab.classList.remove(
                            "active"
                        );

                    });


                button.classList.add(
                    "active"
                );


                selectedDay =
                    button.dataset.day;


                renderSchedule(
                    selectedDay
                );

            }
        );

    });


/* =====================================================
   START
===================================================== */

loadSchedule();
