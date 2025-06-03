// ----- START OF APPOINTMENT.JS (STUDENT) -----
(() => {
    console.log("Appointment loaded!");

    const calendarHeader = document.getElementById("calendarHeader");
    const calendar = document.getElementById("calendar");
    const facultyDropdown = document.getElementById("facultyDropdown");
    const appointmentModal = document.getElementById("appointment-modal");
    const appointmentForm = document.getElementById("appointmentForm");
    const timeSlotDropdown = document.getElementById("timeSlot");
    const studentContainer = document.getElementById("student-container");
    const addStudentBtn = document.getElementById("add-student-btn");
    const studentList = document.getElementById("student-list");
    const cancelBtn = document.getElementById("cancelBtn");
    let selectedFaculty = "";
    let facultyAvailability = {};
    let allStudents = [];
    let facultyUnavailableDays = [];
    let facultyRequestStatusByDate = {};

    // Fetch and populate faculty dropdown
    async function loadFacultyList() {
        const res = await fetch("/api/faculty-availability/faculty/list");
        const faculty = await res.json();
        facultyDropdown.innerHTML = `<option value="">-- Select --</option>`;
        faculty.forEach(f => {
            facultyDropdown.innerHTML += `<option value="${f.id}">${f.name}</option>`;
        });
    }

    // Fetch faculty availability from backend
    async function loadFacultyAvailability(facultyId) {
        const res = await fetch(`/api/faculty-availability/${facultyId}`);
        const slots = await res.json();
        facultyAvailability = {};
        slots.forEach(slot => {
            const dow = Number(slot.day_of_week);
            if (!facultyAvailability.hasOwnProperty(dow)) facultyAvailability[dow] = [];
            facultyAvailability[dow].push(slot);
        });

        const monthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
        const unavailableRes = await fetch(`/api/faculty-unavailable/${facultyId}?month=${monthStr}`);
        facultyUnavailableDays = await unavailableRes.json();

        const statusRes = await fetch(`/api/consultation-request/calendar-status?faculty_id=${facultyId}&month=${monthStr}`);
        facultyRequestStatusByDate = await statusRes.json();

        updateAvailability();
    }

    // Update calendar coloring based on availability
    function updateAvailability() {
        const days = document.querySelectorAll(".calendar-day");
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        days.forEach(day => {
            day.classList.remove("available", "scheduled", "unavailable", "default", "past");
            if (!day.dataset.date) {
                day.classList.add("empty");
                day.classList.add("past");
                return;
            }
            const date = new Date(day.dataset.date);
            date.setHours(0, 0, 0, 0);
            const dow = date.getDay();
            const slots = facultyAvailability[dow] || [];
            if (date < today) {
                day.classList.add("past");
            } else if (!facultyAvailability.hasOwnProperty(dow)) {
                day.classList.add("default");
            } else if (slots.length > 0) {
                day.classList.add("available");
            } else {
                day.classList.add("unavailable");
            }

            const dateStr = day.dataset.date;
            if (facultyUnavailableDays.includes(dateStr)) {
                day.classList.add("unavailable");
                day.classList.remove("available", "scheduled");
                day.style.pointerEvents = "none";
                day.style.cursor = "not-allowed";
            } else if (facultyRequestStatusByDate[dateStr] === "pending" || facultyRequestStatusByDate[dateStr] === "accepted") {
                day.classList.add("scheduled");
            } else if (slots.length > 0) {
                day.classList.add("available");
            } else {
                day.classList.add("default");
            }
        });
    }

    // Calendar day click: show modal with available slots
    calendar.addEventListener("click", (e) => {
        if (!e.target.classList.contains("calendar-day")) return;
        if (
            !e.target.classList.contains("available") ||
            e.target.classList.contains("unavailable")
        ) {
            appointmentModal.style.display = "none";
            return;
        }
        document.querySelectorAll(".calendar-day").forEach(day => day.classList.remove("selected"));
        e.target.classList.add("selected");

        resetAppointmentForm();

        const date = new Date(e.target.dataset.date);
        const dow = date.getDay();
        const slots = facultyAvailability[dow] || [];
        timeSlotDropdown.innerHTML = "";
        slots.forEach(slot => {
            timeSlotDropdown.innerHTML += `<option value="${slot.start_time}" data-course="${slot.course}">
                ${slot.start_time} - ${slot.end_time} (${slot.course})
            </option>`;
        });

        appointmentModal.style.display = "flex";
    });

    // Faculty dropdown change handler
    facultyDropdown.addEventListener("change", () => {
        selectedFaculty = facultyDropdown.value;
        if (selectedFaculty) {
            loadFacultyAvailability(selectedFaculty);
        } else {
            facultyAvailability = {};
            facultyUnavailableDays = [];
            updateAvailability();
        }
    });

    // Render calendar header
    function renderCalendarHeader() {
        const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        calendarHeader.innerHTML = "";
        daysOfWeek.forEach(day => {
            const div = document.createElement("div");
            div.className = "calendar-day-header";
            div.textContent = day;
            calendarHeader.appendChild(div);
        });
    }

    // Generate calendar grid
    function generateCalendar(year, month) {
        calendar.innerHTML = "";
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDay = firstDay.getDay();
        const totalDays = lastDay.getDate();

        for (let i = 0; i < startDay; i++) {
            const emptyCell = document.createElement("div");
            emptyCell.className = "calendar-day empty";
            calendar.appendChild(emptyCell);
        }
        for (let day = 1; day <= totalDays; day++) {
            const date = new Date(year, month, day);
            const cell = document.createElement("div");
            cell.className = "calendar-day";
            cell.dataset.date = [
                date.getFullYear(),
                String(date.getMonth() + 1).padStart(2, '0'),
                String(date.getDate()).padStart(2, '0')
            ].join('-');
            cell.textContent = day;
            calendar.appendChild(cell);
        }
        const totalCells = startDay + totalDays;
        const trailing = (7 - (totalCells % 7)) % 7;
        for (let i = 0; i < trailing; i++) {
            const emptyCell = document.createElement("div");
            emptyCell.className = "calendar-day empty";
            calendar.appendChild(emptyCell);
        }
    }

    let currentYear = new Date().getFullYear();
    let currentMonth = new Date().getMonth();

    const monthYear = document.getElementById("monthYear");
    const prevMonthBtn = document.getElementById("prevMonth");
    const nextMonthBtn = document.getElementById("nextMonth");

    function updateMonthYearDisplay() {
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        monthYear.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    }

    function showCalendar() {
        updateMonthYearDisplay();
        generateCalendar(currentYear, currentMonth);
        updateAvailability();
    }

    prevMonthBtn.addEventListener("click", () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        loadFacultyAvailability(selectedFaculty);
        showCalendar();
    });

    nextMonthBtn.addEventListener("click", () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        loadFacultyAvailability(selectedFaculty);
        showCalendar();
    });

    // On page load
    renderCalendarHeader();
    showCalendar();
    loadFacultyList();

    // Add student input row
    function addStudentInput(value = "") {
        const wrapper = document.createElement("div");
        wrapper.style.display = "flex";
        wrapper.style.alignItems = "center";
        wrapper.style.marginBottom = "0.5rem";
        wrapper.innerHTML = `
            <input type="text" name="student" class="student-input" list="student-list" value="${value}" style="flex:1; margin-right:0.5rem;" />
            <button type="button" class="remove-student-btn btn-outline" style="padding:0.2rem 0.7rem;">
              <i class="ri-close-line"></i>
            </button>
          `;
        wrapper.querySelector(".remove-student-btn").onclick = () => wrapper.remove();

        // Validate input on blur
        const input = wrapper.querySelector(".student-input");
        input.addEventListener("blur", () => {
            const valid = allStudents.some(
                s => s.name.trim().toLowerCase() === input.value.trim().toLowerCase()
            );
            if (!valid && input.value.trim() !== "") {
                input.style.border = "2px solid red";
            } else {
                input.style.border = "";
            }
        });

        studentContainer.appendChild(wrapper);
    }

    addStudentBtn.onclick = () => addStudentInput();

    // Load all students for datalist
    async function loadAllStudents() {
        const res = await fetch("/api/users/students");
        allStudents = await res.json();
        studentList.innerHTML = allStudents.map(s => `<option value="${s.name}"></option>`).join("");
    }
    loadAllStudents();

    // Confirm Appointment button handler
    document.getElementById("confirmBtn").onclick = async function(e) {
        e.preventDefault();

        // Get selected faculty
        const facultyId = facultyDropdown.value;
        if (!facultyId) {
            alert("Please select a faculty member.");
            return;
        }

        // Get selected date
        const selectedDay = document.querySelector(".calendar-day.selected");
        if (!selectedDay) {
            alert("Please select a date.");
            return;
        }
        const dateRequested = selectedDay.dataset.date;

        // Get selected time
        const timeRequested = timeSlotDropdown.value;
        if (!timeRequested) {
            alert("Please select a time slot.");
            return;
        }

        // Get reason
        const reason = document.getElementById("reason").value.trim();
        if (!reason) {
            alert("Please enter a reason for the appointment.");
            return;
        }

        // Get student names from inputs
        const studentInputs = studentContainer.querySelectorAll(".student-input");
        const studentNames = Array.from(studentInputs)
            .map(input => input.value.trim())
            .filter(Boolean);

        if (studentNames.length === 0) {
            alert("Please add at least one student.");
            return;
        }

        // Convert student names to IDs
        const studentIds = studentNames.map(name => {
            const found = allStudents.find(
                s => s.name.trim().toLowerCase() === name.trim().toLowerCase()
            );
            return found ? found.id : null;
        }).filter(id => id !== null);

        if (studentIds.length !== studentNames.length) {
            alert("One or more student names are invalid.");
            return;
        }

        // Get course code from selected time slot
        const selectedOption = timeSlotDropdown.selectedOptions[0];
        const courseCode = selectedOption ? selectedOption.getAttribute('data-course') : '';

        // Send POST request to backend
        try {
            const res = await fetch("/api/consultation-request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    faculty_id: facultyId,
                    course_code: courseCode,
                    date_requested: dateRequested,
                    time_requested: timeRequested,
                    reason,
                    student_ids: studentIds
                })
            });
            const data = await res.json();
            if (res.ok) {
                alert("Appointment request submitted!");
                appointmentModal.style.display = "none";
                resetAppointmentForm();
                updateAvailability();
            } else {
                alert(data.error || "Failed to submit appointment.");
            }
        } catch (err) {
            alert("Network error.");
        }
    };

    // Hide modal on cancel
    cancelBtn.onclick = function() {
        appointmentModal.style.display = "none";
        resetAppointmentForm();
    };

    // Hide modal when clicking outside the form
    appointmentModal.onclick = function(e) {
        if (e.target === appointmentModal) {
            appointmentModal.style.display = "none";
            resetAppointmentForm();
        }
    };

    // Reset form fields
    function resetAppointmentForm() {
        studentContainer.innerHTML = "";
        addStudentInput();
        document.getElementById("reason").value = "";
        timeSlotDropdown.selectedIndex = -1;
    }
})();
// ----- END OF APPOINTMENT.JS (STUDENT) -----