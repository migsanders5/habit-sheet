// ===================================
// HABIT SHEET
// ===================================

let habits = JSON.parse(localStorage.getItem("habits")) || [];

const habitGrid = document.getElementById("habitGrid");
const addHabitBtn = document.getElementById("addHabitBtn");

const DAYS_TO_SHOW = 14;


// --------------------------------
// Save
// --------------------------------
function saveHabits() {
    localStorage.setItem("habits", JSON.stringify(habits));
}


// --------------------------------
// Format date as YYYY-MM-DD (local time)
// --------------------------------
function formatLocalDate(date) {

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;

}





// --------------------------------
// Today's date
// --------------------------------
function getToday() {
    return formatLocalDate(new Date());
}


// --------------------------------
// Generate dates
// --------------------------------
function getDisplayedDates() {

    const dates = [];

    for (let i = 0; i < DAYS_TO_SHOW; i++) {

        const d = new Date();

        d.setDate(d.getDate() - i);

        dates.push(formatLocalDate(d));

    }

    return dates;
}


// --------------------------------
// Completion %
// --------------------------------
function getCompletion(habit) {

    const start = new Date(habit.dateAdded);
    const today = new Date(getToday());

    let total = 0;
    let completed = 0;


    while (start <= today) {

        const key = start.toISOString().split("T")[0];

        total++;

        if (habit.history[key]) {
            completed++;
        }

        start.setDate(start.getDate() + 1);

    }


    return total === 0
        ? 0
        : Math.round((completed / total) * 100);

}


// --------------------------------
// Toggle completion
// --------------------------------
function toggleHabit(id, date, checked) {

    const habit = habits.find(
        h => h.id === id
    );

    habit.history[date] = checked;

    saveHabits();

    renderGrid();

}


// --------------------------------
// Rename habit
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
// Delete habit
// --------------------------------
function deleteHabit(id) {


    const confirmDelete = confirm(
        "Delete this habit?"
    );


    if (!confirmDelete) return;


    habits = habits.filter(
        h => h.id !== id
    );


    saveHabits();

    renderGrid();

}


// --------------------------------
// Add habit
// --------------------------------
addHabitBtn.addEventListener("click",()=>{


    const name = prompt(
        "Habit name:"
    );


    if (!name) return;


    habits.push({

        id: Date.now().toString(),

        name:name,

        dateAdded:getToday(),

        history:{}

    });


    saveHabits();

    renderGrid();


});


// --------------------------------
// Render
// --------------------------------
function renderGrid(){


    habitGrid.innerHTML="";


    const dates = getDisplayedDates();


    const table=document.createElement("table");



    // HEADER

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


    dates.forEach(date=>{


        html += `

        <th>
            ${new Date(date)
            .toLocaleDateString(
                undefined,
                {
                    month:"short",
                    day:"numeric"
                }
            )}
        </th>

        `;


    });


    html += `</tr></thead>`;


    table.innerHTML = html;



    const tbody=document.createElement("tbody");



    habits.forEach(habit=>{


        const row=document.createElement("tr");


        let rowHTML=`


        <td class="sticky-col habit-col">

            <span class="habit-text">
                ${habit.name}
            </span>

            <button
                class="menu-btn"
                data-id="${habit.id}">
                ⋮
            </button>

        </td>


        <td class="sticky-col percent-col">

            ${getCompletion(habit)}%

        </td>


        `;



        dates.forEach(date=>{


            if(date < habit.dateAdded){


                rowHTML += `

                <td class="before-created">
                    —
                </td>

                `;


            }
            else{


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



        row.innerHTML=rowHTML;



        // Checkbox listeners

        row.querySelectorAll("input")
        .forEach(box=>{


            box.addEventListener(
                "change",
                e=>{


                    toggleHabit(
                        e.target.dataset.id,
                        e.target.dataset.date,
                        e.target.checked
                    );


                }
            );


        });



        // Menu button

        row.querySelector(".menu-btn")
        .addEventListener(
            "click",
            ()=>{


                const choice = prompt(
`Choose action:

1 - Rename
2 - Delete`
                );


                if(choice==="1")
                    renameHabit(habit.id);


                if(choice==="2")
                    deleteHabit(habit.id);


            }
        );



        tbody.appendChild(row);


    });


    table.appendChild(tbody);


    habitGrid.appendChild(table);


}



renderGrid();
