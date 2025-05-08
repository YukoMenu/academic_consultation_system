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
  
    const calendar = document.getElementById("calendar");
    const facultyDropdown = document.getElementById("facultyDropdown");
    const appointmentForm = document.getElementById("appointmentForm");
    let selectedFaculty = "";
  
    function generateCalendar(year, month) {
      calendar.innerHTML = "";
      const date = new Date(year, month, 1);
      const daysInMonth = new Date(year, month + 1, 0).getDate();
  
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
  
    facultyDropdown.addEventListener("change", () => {
      selectedFaculty = facultyDropdown.value;
      updateAvailability();
    });
  
    generateCalendar(2025, 4); // May 2025
  })();
  