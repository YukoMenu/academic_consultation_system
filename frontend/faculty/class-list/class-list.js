// ----- START OF CLASS-LIST.JS -----
(async () => {
    const classListContainer = document.getElementById("class-list");
    const createBtn = document.getElementById("create-classes-btn");
    const modal = document.getElementById("class-modal");
    const form = document.getElementById("class-form");
    const cancelBtn = document.getElementById("cancel-class-btn");
    const studentContainer = document.getElementById("student-container");
    const addStudentBtn = document.getElementById("add-student-btn");
    const studentList = document.getElementById("student-list");
    const classCodeInput = document.getElementById("class-code-input");
    const classNameInput = document.getElementById("class-name-input");
    const courseCodeList = document.getElementById("course-code-list");
    const courseNameList = document.getElementById("class-name-list");
    const deleteBtn = document.getElementById("delete-class-btn");

    let editingClass = null;
    let allStudents = [];
    let courses = [];

    // Fetch all students for datalist
    async function loadAllStudents() {
        const res = await fetch("/api/users/students");
        allStudents = await res.json();
        studentList.innerHTML = allStudents.map(s => `<option value="${s.name}"></option>`).join("");
    }

    // Fetch all courses for datalists
    async function loadAllCourses() {
        const res = await fetch("/api/courses");
        courses = await res.json();
        courseCodeList.innerHTML = courses.map(c => `<option value="${c.id}"></option>`).join("");
        courseNameList.innerHTML = courses.map(c => `<option value="${c.name}"></option>`).join("");
    }

    // Autofill logic
    classCodeInput.addEventListener("input", () => {
        const selected = courses.find(c => c.id === classCodeInput.value);
        if (selected) classNameInput.value = selected.name;
    });
    classNameInput.addEventListener("input", () => {
        const selected = courses.find(c => c.name === classNameInput.value);
        if (selected) classCodeInput.value = selected.id;
    });

    // Helper to add a student input row
    function addStudentInput(value = "", id = null) {
        const wrapper = document.createElement("div");
        wrapper.style.display = "flex";
        wrapper.style.alignItems = "center";
        wrapper.style.marginBottom = "0.5rem";
        wrapper.innerHTML = `
            <input type="text" name="student" class="student-input" list="student-list" value="${value}" style="flex:1; margin-right:0.5rem;" />
            <button type="button" class="remove-student-btn btn-outline" style="padding:0.2rem 0.7rem;">&times;</button>
        `;
        wrapper.querySelector(".remove-student-btn").onclick = () => wrapper.remove();
        studentContainer.appendChild(wrapper);
    }

    addStudentBtn.onclick = () => addStudentInput();

    function showModal(cls = null) {
        modal.style.display = "flex";
        form.class_id.value = cls?.id || "";
        form.class_code.value = cls?.class_code || "";
        form.class_name.value = cls?.class_name || "";
        form.description.value = cls?.description || "";
        editingClass = cls;

        // Show delete button only when editing
        if (cls && cls.id) {
            deleteBtn.style.display = "";
        } else {
            deleteBtn.style.display = "none";
        }

        // Populate students
        studentContainer.innerHTML = "";
        if (cls && cls.students && cls.students.length) {
            cls.students.forEach(s => addStudentInput(s.name, s.id));
        } else {
            addStudentInput();
        }
    }
    function hideModal() {
        modal.style.display = "none";
        form.reset();
        studentContainer.innerHTML = "";
        editingClass = null;
    }
    cancelBtn.onclick = hideModal;

    createBtn.onclick = () => showModal();

    form.onsubmit = async (e) => {
        e.preventDefault();
        // Resolve student IDs from names
        const studentInputs = studentContainer.querySelectorAll(".student-input");
        const student_ids = Array.from(studentInputs)
            .map(input => {
                const val = input.value.trim().toLowerCase();
                const match = allStudents.find(s => s.name.toLowerCase() === val);
                return match?.id;
            })
            .filter(Boolean);

        const payload = {
            class_code: form.class_code.value,
            class_name: form.class_name.value,
            description: form.description.value,
            faculty_ids: [], // backend will set this for faculty
            student_ids
        };
        let url = "/api/classes";
        let method = "POST";
        if (editingClass) {
            url = `/api/classes/${editingClass.id}`;
            method = "PUT";
        }
        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        if (res.ok) {
            hideModal();
            await loadClasses();
        } else {
            const err = await res.json();
            alert("Failed to save class: " + (err.error || res.statusText));
        }
    };

    deleteBtn.onclick = async () => {
        if (!editingClass || !editingClass.id) return;
        if (!confirm("Are you sure you want to delete this class?")) return;
        const res = await fetch(`/api/classes/${editingClass.id}`, { method: "DELETE" });
        if (res.ok) {
            hideModal();
            await loadClasses();
        } else {
            alert("Failed to delete class.");
        }
    };

    async function loadClasses() {
        classListContainer.innerHTML = "<p>Loading...</p>";
        try {
            const res = await fetch("/api/classes/faculty");
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to fetch classes.");
            }

            if (data.length === 0) {
                classListContainer.innerHTML = "<p>No classes assigned.</p>";
                return;
            }

            classListContainer.innerHTML = "";
            data.forEach(cls => {
                const card = document.createElement("div");
                card.className = "class-card";
                card.innerHTML = `
                    <div class="class-title">${cls.class_name}</div>
                    <div class="class-info">Code: ${cls.class_code}</div>
                    <div class="class-info">Description: ${cls.description || "No description provided."}</div>
                    <div class="class-info"><b>Students:</b> ${cls.students && cls.students.length ? cls.students.map(s => s.name).join(", ") : "None"}</div>
                    <button class="edit-btn" style="margin-top:0.5rem;">Edit</button>
                `;
                card.querySelector(".edit-btn").onclick = () => showModal(cls);
                classListContainer.appendChild(card);
            });

        } catch (error) {
            classListContainer.innerHTML = `<p>Error loading classes: ${error.message}</p>`;
        }
    }

    // Initial load
    await loadAllCourses();
    await loadAllStudents();
    await loadClasses();
})();
// ----- END OF CLASS-LIST.JS -----