// ----- START OF CLASS-MANAGEMENT.JS -----
(async () => {
    const classList = document.getElementById("class-list-ul");
    const facultyList = document.getElementById("faculty-list");
    const studentList = document.getElementById("student-list");

    const formCreate = document.getElementById("class-form-create");
    const formEdit = document.getElementById("class-form-edit");

    const viewBtn = document.getElementById("view-classes-btn");
    const createBtn = document.getElementById("create-class-btn");
    const editBtn = document.getElementById("edit-class-btn");

    const viewSection = document.getElementById("class-view");
    const createSection = document.getElementById("class-create");
    const editSection = document.getElementById("class-edit");

    const classCodeInput = document.getElementById("class-code-input-create");
    const classNameInput = document.getElementById("class-name-input-create");
    const classCodeInputEdit = document.getElementById("class-code-input-edit");
    const classNameInputEdit = document.getElementById("class-name-input-edit");
    const courseDatalist = document.getElementById("course-code-list");
    const classNameDatalist = document.getElementById("class-name-list");

    let faculty = [];
    let students = [];
    let classes = [];
    let editingClassId = null;
    let currentView = "view";

    function clearViewSpans() {
        document.getElementById("view-class-code").textContent = "";
        document.getElementById("view-class-name").textContent = "";
        document.getElementById("view-description").textContent = "";
        document.getElementById("view-faculty").textContent = "";
        document.getElementById("view-students").textContent = "";
    }

    function switchView(view) {
        if (view === "view") clearViewSpans();
        viewSection.style.display = view === "view" ? "block" : "none";
        createSection.style.display = view === "create" ? "block" : "none";
        editSection.style.display = view === "edit" ? "block" : "none";
        currentView = view;
    }

    viewBtn.addEventListener("click", () => switchView("view"));
    createBtn.addEventListener("click", () => {
        switchView("create")
        document.getElementById("delete-class-btn").style.display = "inline-block";
    });
    editBtn.addEventListener("click", async () => {
        if (!editingClassId && classes.length > 0) {
            editingClassId = classes[0].id;
        }

        if (editingClassId) {
            const cls = await fetch(`http://localhost:3000/api/classes/${editingClassId}`).then(res => res.json());
            switchView("edit");
            loadClassForEditing(cls);
        }
    });

    const courses = await fetch('/api/courses').then(res => res.json());
    
    courseDatalist.innerHTML = courses.map(c => `<option value="${c.id}"></option>`).join("");
    classNameDatalist.innerHTML = courses.map(c => `<option value="${c.name}"></option>`).join("");
   
    classCodeInput.addEventListener("input", () => {
        const selected = courses.find(c => c.id === classCodeInput.value);
        if (selected) classNameInput.value = selected.name;
    });

    classNameInput.addEventListener("input", () => {
        const selected = courses.find(c => c.name === classNameInput.value);
        if (selected) classCodeInput.value = selected.id;
    });

    // Fetch data
    faculty = await fetch('/api/users/faculty').then(res => res.json());
    students = await fetch('/api/users/students').then(res => res.json());
    classes = await fetch('/api/classes').then(res => res.json());

    facultyList.innerHTML = faculty.map(f => `<option value="${f.name}"></option>`).join("");
    studentList.innerHTML = students.map(s => `<option value="${s.name}"></option>`).join("");

    classList.innerHTML = "";
    classes.forEach(cls => {
        const li = document.createElement("li");
        li.textContent = `${cls.class_code} - ${cls.class_name}`;
        li.dataset.id = cls.id;
        classList.appendChild(li);
    });

    document.getElementById("search-class-input").addEventListener("input", function () {
        const searchValue = this.value.toLowerCase();
        const items = classList.querySelectorAll("li");

        items.forEach(li => {
            const className = li.textContent.toLowerCase();
            li.style.display = className.includes(searchValue) ? "list-item" : "none";
        });
    });

    // Auto-select first class after loading
    if (classes.length > 0) {
        const firstLi = classList.querySelector("li");
        if (firstLi) {
            editingClassId = firstLi.dataset.id;
            firstLi.classList.add("selected"); // Optional visual cue
            editBtn.disabled = false;
        }
    }

    function attachDynamicFieldAdder(containerId, inputName, inputClass, datalistId) {
        const container = document.getElementById(containerId);

        container.addEventListener("click", function (e) {
            if (e.target.classList.contains(`add-${inputName}-btn`)) {
            const wrapper = document.createElement("div");
            wrapper.classList.add("input-wrapper");
            wrapper.innerHTML = `
                <input type="text" name="${inputName}" class="${inputClass}" list="${datalistId}" />
                <button type="button" class="remove-btn">−</button>
            `;
            container.insertBefore(wrapper, e.target.closest(".input-wrapper")); // Insert above the add button
            wrapper.querySelector(".remove-btn").addEventListener("click", () => wrapper.remove());
            }
        });
    }

    attachDynamicFieldAdder("create-faculty-container", "faculty", "faculty-input", "faculty-list");
    attachDynamicFieldAdder("create-student-container", "student", "student-input", "student-list");

    attachDynamicFieldAdder("edit-faculty-container", "faculty", "faculty-input", "faculty-list");
    attachDynamicFieldAdder("edit-student-container", "student", "student-input", "student-list");

    function resolveIdsFromInputs(inputs, dataArray) {
        return Array.from(inputs).map(input => {
        const val = input.value.trim().toLowerCase();
        const match = dataArray.find(u => u.name.toLowerCase() === val);
        return match?.id;
        }).filter(Boolean);
    }

    formCreate.addEventListener("submit", async (e) => {
        e.preventDefault();
        const facultyInputs = formCreate.querySelectorAll(".faculty-input");
        const studentInputs = formCreate.querySelectorAll(".student-input");

        const data = {
        class_code: formCreate.class_code.value,
        class_name: formCreate.class_name.value,
        description: formCreate.description.value,
        faculty_ids: resolveIdsFromInputs(facultyInputs, faculty),
        student_ids: resolveIdsFromInputs(studentInputs, students)
        };

        const res = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
        });

        if (res.ok) {
        alert("Class created!");
        location.reload();
        } else {
        alert("Failed to create class.");
        }
    });

    classList.addEventListener("click", async (e) => {
        const li = e.target.closest("li");
        if (!li) return;
        const classId = li.dataset.id;
        editBtn.disabled = false;
        editingClassId = classId;

        // Detect current visible section
        if (viewSection.style.display === "block") {
            // View mode – fetch and show read-only class info
            const cls = await fetch(`http://localhost:3000/api/classes/${classId}`).then(res => res.json());

            // Update individual spans instead of replacing innerHTML
            document.getElementById("view-class-code").textContent = cls.class_code || "";
            document.getElementById("view-class-name").textContent = cls.class_name || "";
            document.getElementById("view-description").textContent = cls.description || "";
            document.getElementById("view-faculty").textContent = cls.faculty.map(f => f.name).join(", ");
            document.getElementById("view-students").textContent = cls.students.map(s => s.name).join(", ");
        } else if (editSection.style.display === "block") {
            // Edit mode – fetch full class data before loading
            const cls = await fetch(`http://localhost:3000/api/classes/${classId}`).then(res => res.json());
            loadClassForEditing(cls);
        }
        });

    function loadClassForEditing(cls) {
        editingClassId = cls.id;
        document.getElementById("delete-class-btn").style.display = "inline-block";

        formEdit.class_code.value = cls.class_code;
        formEdit.class_name.value = cls.class_name;
        formEdit.description.value = cls.description;

        const facultyContainer = document.getElementById("edit-faculty-container");
        const studentContainer = document.getElementById("edit-student-container");

        facultyContainer.innerHTML = "";
        studentContainer.innerHTML = "";

        // Populate existing faculty
        cls.faculty.forEach(f => {
            const wrapper = document.createElement("div");
            wrapper.classList.add("input-wrapper");
            wrapper.innerHTML = `
                <input type="text" name="faculty" class="faculty-input" value="${f.name}" list="faculty-list" />
                <button type="button" class="remove-btn">−</button>
            `;
            facultyContainer.appendChild(wrapper);
            wrapper.querySelector(".remove-btn").addEventListener("click", () => wrapper.remove());
        });

        // Add empty faculty input with + button
        const addFacultyWrapper = document.createElement("div");
        addFacultyWrapper.classList.add("input-wrapper");
        addFacultyWrapper.innerHTML = `
            <input type="text" name="faculty" class="faculty-input" list="faculty-list" />
            <button type="button" class="add-faculty-btn">+</button>
        `;
        facultyContainer.appendChild(addFacultyWrapper);

        // Populate existing students
        cls.students.forEach(s => {
            const wrapper = document.createElement("div");
            wrapper.classList.add("input-wrapper");
            wrapper.innerHTML = `
                <input type="text" name="student" class="student-input" value="${s.name}" list="student-list" />
                <button type="button" class="remove-btn">−</button>
            `;
            studentContainer.appendChild(wrapper);
            wrapper.querySelector(".remove-btn").addEventListener("click", () => wrapper.remove());
        });

        // Add empty student input with + button
        const addStudentWrapper = document.createElement("div");
        addStudentWrapper.classList.add("input-wrapper");
        addStudentWrapper.innerHTML = `
            <input type="text" name="student" class="student-input" list="student-list" />
            <button type="button" class="add-student-btn">+</button>
        `;
        studentContainer.appendChild(addStudentWrapper);
    }

    formEdit.addEventListener("submit", async (e) => {
        e.preventDefault();

        const facultyInputs = formEdit.querySelectorAll(".faculty-input");
        const studentInputs = formEdit.querySelectorAll(".student-input");

        const data = {
        class_code: formEdit.class_code.value,
        class_name: formEdit.class_name.value,
        description: formEdit.description.value,
        faculty_ids: resolveIdsFromInputs(facultyInputs, faculty),
        student_ids: resolveIdsFromInputs(studentInputs, students)
        };

        const res = await fetch(`http://localhost:3000/api/classes/${editingClassId}`, {
        method: "PUT",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
        });

        if (res.ok) {
        alert("Class updated!");
        editingClassId = null;
        location.reload();
        } else {
        alert("Failed to update class.");
        }
    });

    document.getElementById("delete-class-btn").addEventListener("click", async () => {
        if (!editingClassId) return;

        const confirmed = confirm("Are you sure you want to delete this class?");
        if (!confirmed) return;

        const res = await fetch(`http://localhost:3000/api/classes/${editingClassId}`, {
        method: 'DELETE'
        });

        if (res.ok) {
        alert("Class deleted.");
        editingClassId = null;
        location.reload();
        } else {
        alert("Failed to delete class.");
        }
    });

})();
// ----- END OF CLASS-MANAGEMENT.JS -----