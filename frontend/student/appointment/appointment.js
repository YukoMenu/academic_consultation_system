(() => {
    console.log("Appointment loaded!");
  
    const facultyAvailability = {
      "dr-smith": {
        "2025-05-10": "available",
        "2025-05-12": "scheduled",
        "2025-05-14": "unavailable"
      },
      "prof-jane": {
        "2025-05-11": "available",
        "2025-05-13": "scheduled",
        "2025-05-15": "unavailable"
      },
      "mr-lee": {
        "2025-05-09": "scheduled",
        "2025-05-10": "unavailable",
        "2025-05-14": "available"
      }
    };
  
    const calendarHeader = document.getElementById("calendarHeader");
    const calendar = document.getElementById("calendar");
    const facultyDropdown = document.getElementById("facultyDropdown");
    const appointmentForm = document.getElementById("appointmentForm");
    let selectedFaculty = "";
  
    function renderCalendarHeader() {
        calendarHeader.innerHTML = "";
        const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        daysOfWeek.forEach(day => {
            const dayHeader = document.createElement("div");
            dayHeader.className = "calendar-day-header";
            dayHeader.innerText = day;
            calendarHeader.appendChild(dayHeader);
        });
    }
  
    function generateCalendar(year, month) {
        calendar.innerHTML = "";
  
        const date = new Date(year, month, 1);
        const daysInMonth = new Date(year, month + 1, 0).getDate();
  
        // Add empty slots for days before the 1st of the month
        const firstDay = date.getDay();
        for (let i = 0; i < firstDay; i++) {
            const emptyCell = document.createElement("div");
            emptyCell.className = "calendar-day empty";
            calendar.appendChild(emptyCell);
        }
  
        for (let i = 1; i <= daysInMonth; i++) {
            const dayDate = new Date(year, month, i);
            const dateString = dayDate.toISOString().split("T")[0];
  
            const dayElement = document.createElement("div");
            dayElement.className = "calendar-day";
            dayElement.innerText = i;
            dayElement.dataset.date = dateString;
  
            dayElement.addEventListener("click", () => {
                const status = facultyAvailability[selectedFaculty]?.[dateString];
                if (status === "available") {
                    appointmentForm.style.display = "block";
                } else {
                    appointmentForm.style.display = "none";
                }
            });
  
            calendar.appendChild(dayElement);
        }
    }
  
    function updateAvailability() {
      if (!selectedFaculty) return;
      const days = document.querySelectorAll(".calendar-day");
  
      days.forEach(day => {
        const date = day.dataset.date;
        const status = facultyAvailability[selectedFaculty]?.[date];
  
        day.classList.remove("available", "scheduled", "unavailable");
  
        if (status) {
          day.classList.add(status);
        }
      });
  
      appointmentForm.style.display = "none";
    }
  
    async function populateFacultyDropdown() {
        const res = await fetch('/api/faculty-availability/faculty/list');
        const facultyList = await res.json();
        facultyDropdown.innerHTML = '<option value="">-- Select --</option>';
        facultyList.forEach(faculty => {
            const option = document.createElement('option');
            option.value = faculty.id;
            option.textContent = faculty.name;
            facultyDropdown.appendChild(option);
        });
    }
  
    // Call this on page load
    populateFacultyDropdown();
  
    // When a faculty is selected, fetch their availability
    facultyDropdown.addEventListener("change", async () => {
        selectedFaculty = facultyDropdown.value;
        if (selectedFaculty) {
            const res = await fetch(`/api/faculty-availability/${selectedFaculty}`);
            const availability = await res.json();
            // Process and display availability as needed
            // (You may need to adapt your calendar logic to use this data)
        }
        updateAvailability();
    });
  
    // Render the calendar header and current month on page load
    const today = new Date();
    renderCalendarHeader();
    generateCalendar(today.getFullYear(), today.getMonth());
  })();
