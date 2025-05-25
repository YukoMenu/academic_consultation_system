// ----- START OF CLASS-MANAGEMENT.JS -----
(async()  => {
    console.log('class-management.js reached')
    const classList = document.getElementById("class-list-ul");
    const facultyList = document.getElementById("faculty-list");
    const studentList = document.getElementById("student-list");
    const form = document.getElementById("class-form");

    // Dummy placeholders - replace with fetch later
    const faculty = await fetch('http://localhost:3000/api/users/faculty').then(res => res.json());
    const students = await fetch('http://localhost:3000/api/users/students').then(res => res.json());
    const classes = await fetch('http://localhost:3000/api/classes').then(res => res.json());

    // Populate sidebar list
    classList.innerHTML = "";
    classes.forEach(cls => {
        const li = document.createElement("li");
        li.textContent = `${cls.class_code} - ${cls.class_name}`;
        li.dataset.id = cls.id;
        classList.appendChild(li);
    });

    function attachDynamicFieldAdder(containerId, inputName, inputClass, datalistId) {
        const container = document.getElementById(containerId);
        const addBtn = container.querySelector("button");

        addBtn.addEventListener("click", () => {
            const wrapper = document.createElement("div");
            wrapper.classList.add("input-wrapper");
            wrapper.innerHTML = `
                <input type="text" name="${inputName}" class="${inputClass}" list="${datalistId}" />
                <button type="button" class="remove-btn">−</button>
            `;
            container.appendChild(wrapper);

            wrapper.querySelector(".remove-btn").addEventListener("click", () => wrapper.remove());
        });
    }

    attachDynamicFieldAdder("faculty-container", "faculty", "faculty-input", "faculty-list");
    attachDynamicFieldAdder("student-container", "students", "student-input", "student-list");


    // Populate selection lists
    facultyList.innerHTML = faculty.map(f => `<option value="${f.name}" data-id="${f.id}"></option>`).join("");
    studentList.innerHTML = students.map(s => `<option value="${s.name}" data-id="${s.id}"></option>`).join("");

    // Handle form submission
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        console.log('handle form submission reached')
        const facultyInputs = document.querySelectorAll(".faculty-input");
        const studentInputs = document.querySelectorAll(".student-input");


        function resolveIdsFromInputs(inputs, dataArray) {
            return Array.from(inputs)
                .map(input => {
                    const inputValue = input.value.trim().toLowerCase();
                    console.log("Checking input:", inputValue);

                    const match = dataArray.find(user => user.name.toLowerCase().trim() === inputValue);
                    if (!match) {
                        console.warn(`No match found for: "${inputValue}"`);
                    } else {
                        console.log(`Match found: ${match.name} → ID ${match.id}`);
                    }

                    return match?.id;
                })
                .filter(Boolean);
        }

        const data = {
            class_code: form.class_code.value,
            class_name: form.class_name.value,
            description: form.description.value,
            faculty_ids: resolveIdsFromInputs(facultyInputs, faculty),
            student_ids: resolveIdsFromInputs(studentInputs, students)
        };
        console.log("Submitting class data:", data);
        const res = await fetch('http://localhost:3000/api/classes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            alert("Class saved!");
            location.reload(); // or refresh the class list only
        } else {
            alert("Failed to save class.");
        }
    });
})();
// ----- END OF CLASS-MANAGEMENT.JS -----