// ----- START OF APPOINTMENT.JS -----
(() => {
    console.log("Appointment loaded!");
  
    const calendarHeader = document.getElementById("calendarHeader");
    const calendar = document.getElementById("calendar");
    const facultyDropdown = document.getElementById("facultyDropdown");
    const appointmentForm = document.getElementById("appointmentForm");
    const timeSlotDropdown = document.getElementById("timeSlot");
    let selectedFaculty = "";
    let facultyAvailability = {};
  
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
        const dow = Number(slot.day_of_week); // Ensure it's a number!
        if (!facultyAvailability.hasOwnProperty(dow)) facultyAvailability[dow] = [];
        facultyAvailability[dow].push(slot);
      });
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
      });
      appointmentForm.style.display = "none";
    }
  
    // When a calendar day is clicked, show available time slots
    calendar.addEventListener("click", (e) => {
      if (!e.target.classList.contains("calendar-day")) return;
      if (!e.target.classList.contains("available")) {
        appointmentForm.style.display = "none";
        return;
      }
      const date = new Date(e.target.dataset.date);
      const dow = date.getDay();
      const slots = facultyAvailability[dow] || [];
      // Populate timeSlotDropdown
      timeSlotDropdown.innerHTML = "";
      slots.forEach(slot => {
        timeSlotDropdown.innerHTML += `<option value="${slot.start_time}">${slot.start_time} - ${slot.end_time} (${slot.course})</option>`;
      });
      appointmentForm.style.display = "block";
    });
  
    // Faculty dropdown change handler
    facultyDropdown.addEventListener("change", () => {
      selectedFaculty = facultyDropdown.value;
      if (selectedFaculty) {
        loadFacultyAvailability(selectedFaculty);
      } else {
        facultyAvailability = {};
        updateAvailability();
      }
    });
  
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
  
    function generateCalendar(year, month) {
      calendar.innerHTML = "";
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const startDay = firstDay.getDay(); // 0=Sunday, ..., 6=Saturday
      const totalDays = lastDay.getDate();

      // Fill initial empty cells (before the 1st)
      for (let i = 0; i < startDay; i++) {
        const emptyCell = document.createElement("div");
        emptyCell.className = "calendar-day empty";
        calendar.appendChild(emptyCell);
      }

      // Fill days of the month
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

      // Fill trailing empty cells to complete the last week
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
  
    // Update generateCalendar to use currentYear/currentMonth
    function showCalendar() {
      updateMonthYearDisplay();
      generateCalendar(currentYear, currentMonth);
      updateAvailability();
    }
  
    // Button handlers
    prevMonthBtn.addEventListener("click", () => {
      currentMonth--;
      if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
      }
      showCalendar();
    });
  
    nextMonthBtn.addEventListener("click", () => {
      currentMonth++;
      if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
      }
      showCalendar();
    });
  
    // On page load, show the calendar and header
    renderCalendarHeader();
    showCalendar();
  
    // Fetch faculty list on initial load
    loadFacultyList();
  })();
// ----- END OF APPOINTMENT.JS -----