// ===================================
// HABIT SHEET
// ===================================


let habits = JSON.parse(localStorage.getItem("habits")) || [];


const habitGrid = document.getElementById("habitGrid");
const addHabitBtn = document.getElementById("addHabitBtn");


const DAYS_TO_SHOW = 14;


// --------------------------------
// Save habits
// --------------------------------

function saveHabits() {

    localStorage.setItem(
        "habits",
        JSON.stringify(habits)
    );

}


// --------------------------------
// Date helpers (LOCAL TIME)
// --------------------------------

function formatLocalDate(date) {

    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        date.getDate()
    ).padStart(2, "0");


    return `${year}-${month}-${day}`;

}



function getToday() {

    return formatLocalDate(
        new Date()
    );

}



function formatDisplayDate(dateString) {

    const parts = dateString.split("-");


    const date = new Date(
        Number(parts[0]),
        Number(parts[1]) - 1,
        Number(parts[2])
    );


    return date.toLocaleDateString(
        undefined,
        {
            month: "short",
            day: "numeric"
        }
    );

}



// --------------------------------
// Generate date columns
// --------------------------------

function getDisplayedDates() {

    const dates = [];


    const today = new Date();


    for (let i = 0; i < DAYS_TO_SHOW; i++) {


        const date = new Date(today);


        date.setDate(
            today.getDate() - i
        );


        dates.push(
            formatLocalDate(date)
        );

    }


    return dates;

}



// --------------------------------
// Completion percentage
// --------------------------------

function getCompletion(habit) {


    const start = new Date(
        habit.dateAdded + "T00:00:00"
    );


    const today = new Date();


    let total = 0;
    let completed = 0;



    while (start <= today) {


        const key = formatLocalDate(start);


        total++;


        if (habit.history[key]) {

            completed++;

        }


        start.setDate(
            start.getDate() + 1
        );


    }



    if (total === 0) {

        return 0;

    }


    return Math.round(
        (completed / total) * 100
    );


}



// --------------------------------
// Toggle checkbox
// --------------------------------

function toggleHabit(
    id,
    date,
    checked
) {


    const habit = habits.find(
        h => h.id === id
    );


    if (!habit) return;


    habit.history[date] = checked;


    saveHabits();


    renderGrid();

}



// --------------------------------
// Rename
// --------------------------------

function renameHabit(id) {


    const habit = habits.find(
        h => h.id === id
    );


    const newName = prompt(
        "Rename habit:",
        habit.name
    );


    if (!newName) return;


    habit.name = newName;


    saveHabits();


    renderGrid();

}



// --------------------------------
// Delete
// --------------------------------

function deleteHabit(id) {


    if (
        !confirm("Delete this habit?")
    ) {

        return;

    }


    habits = habits.filter(
        h => h.id !== id
    );


    saveHabits();


    renderGrid();

}



// --------------------------------
// Add habit
// --------------------------------

addHabitBtn.addEventListener(
    "click",
    () => {


        const name = prompt(
            "Habit name:"
        );


        if (!name) return;



        habits.push({

            id: Date.now().toString(),

            name: name,

            dateAdded: getToday(),

            history: {}

        });



        saveHabits();


        renderGrid();


    }
);



// --------------------------------
// Render grid
// --------------------------------

function renderGrid() {


    habitGrid.innerHTML = "";


    const dates = getDisplayedDates();



    const table = document.createElement(
        "table"
    );



    let html = `

    <thead>

    <tr>


        <th class="sticky-col habit-col">
            Habit
        </th>


        <th class="sticky-col percent-col">
            %
        </th>


    `;



    dates.forEach(date => {


        html += `

        <th>
            ${formatDisplayDate(date)}
        </th>

        `;


    });



    html += `

    </tr>

    </thead>

    `;



    table.innerHTML = html;



    const tbody = document.createElement(
        "tbody"
    );



    habits.forEach(habit => {


        const row = document.createElement(
            "tr"
        );


        let rowHTML = `


        <td class="sticky-col habit-col">


            <span class="habit-text">
                ${habit.name}
            </span>


            <button
            class="menu-btn">
                ⋮
            </button>


        </td>



        <td class="sticky-col percent-col">

            ${getCompletion(habit)}%

        </td>


        `;



        dates.forEach(date => {


            if (
                date < habit.dateAdded
            ) {


                rowHTML += `

                <td class="before-created">
                    —
                </td>

                `;


            }

            else {


                const checked =
                    habit.history[date]
                    ? "checked"
                    : "";



                rowHTML += `

                <td>

                    <input
                    type="checkbox"
                    data-id="${habit.id}"
                    data-date="${date}"
                    ${checked}
                    >

                </td>

                `;


            }


        });



        row.innerHTML = rowHTML;



        row.querySelectorAll(
            "input"
        ).forEach(box => {


            box.addEventListener(
                "change",
                e => {


                    toggleHabit(
                        e.target.dataset.id,
                        e.target.dataset.date,
                        e.target.checked
                    );


                }
            );


        });



        row.querySelector(
            ".menu-btn"
        )
        .addEventListener(
            "click",
            () => {


                const choice = prompt(
`Choose action:

1 - Rename
2 - Delete`
                );


                if (choice === "1") {

                    renameHabit(
                        habit.id
                    );

                }


                if (choice === "2") {

                    deleteHabit(
                        habit.id
                    );

                }


            }
        );



        tbody.appendChild(row);


    });



    table.appendChild(
        tbody
    );


    habitGrid.appendChild(
        table
    );


}



// --------------------------------
// Initial load
// --------------------------------

renderGrid();
