// START OF AVAILABILITY.JS
(() => {
  console.log('Availability Page Loaded!');
  const createForm = document.getElementById("availability-form");
  const viewList = document.getElementById("availability-view");
  const editSection = document.getElementById("availability-edit");
  const availabilityList = document.getElementById("availability-list");

  // Mode toggle
  document.querySelectorAll(".sidebar-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      document.querySelectorAll(".sidebar-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      // Hide all sections first
      createForm.classList.add("hidden");
      viewList.classList.add("hidden");
      editSection.classList.add("hidden");

      if (btn.id === "create-btn") {
        createForm.classList.remove("hidden");
      } else if (btn.id === "view-btn") {
        viewList.classList.remove("hidden");
        await loadAvailability(); // load view list from server
      } else if (btn.id === "edit-btn") {
        editSection.classList.remove("hidden");
        await loadAvailabilityForEdit();
      }
    });
  });

  const courseList = []; // Will hold fetched courses
  const courseDatalist = document.createElement("datalist");
  courseDatalist.id = "course-options";
  document.body.appendChild(courseDatalist);

  (async () => {
    try {
      const res = await fetch('/api/courses');
      if (!res.ok) throw new Error("Failed to fetch courses");
      const courses = await res.json();
      courseList.push(...courses); // Save to variable if needed later
      courseDatalist.innerHTML = courses.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
    } catch (err) {
      console.error("Error loading courses:", err);
    }
  })();

  const daysOfWeek = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
  ];

  const container = document.getElementById("availability-container");
  const addBtn = document.getElementById("add-day-btn");

  function createDayRow() {
    const row = document.createElement("div");
    row.className = "availability-row";

    row.innerHTML = `
      <div class="icon-input">
        <i class="ri-book-open-line"></i>
        <input type="text" name="course" placeholder="Course (e.g., CS101)" list="course-options" required>
      </div>

      <div class="icon-input">
        <i class="ri-calendar-event-line"></i>
        <select name="day_of_week" required>
          ${daysOfWeek.map((day, i) => `<option value="${i}">${day}</option>`).join("")}
        </select>
      </div>

      <label class="icon-input">
        <i class="ri-time-line"></i> From:
        <input type="time" name="start_time" required>
      </label>

      <label class="icon-input">
        <i class="ri-time-line"></i> To:
        <input type="time" name="end_time" required>
      </label>

      <button type="button" class="remove-btn" title="Remove"><i class="ri-close-line"></i></button>
    `;

    row.querySelector(".remove-btn").addEventListener("click", () => {
      row.remove();
    });

    container.appendChild(row);
  }

  addBtn.addEventListener("click", createDayRow);
  createDayRow(); // Add one by default

  document.getElementById("availability-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "faculty") {
      alert("Only faculty members can submit availability.");
      return;
    }

    const rows = document.querySelectorAll(".availability-row");
    const availability = [];

    rows.forEach(row => {
      const course = row.querySelector('input[name="course"]').value.trim();
      const day = row.querySelector("select").value;
      const start = row.querySelector('input[name="start_time"]').value;
      const end = row.querySelector('input[name="end_time"]').value;

      if (course && start && end) {
        availability.push({
          course,
          day_of_week: parseInt(day),
          start_time: start,
          end_time: end
        });
      }
    });

    try {
      const res = await fetch(`/api/faculty-availability`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ faculty_id: user.id, availability })
      });

      if (!res.ok) throw new Error("Failed to save availability");
      alert("Availability saved!");
    } catch (err) {
      console.error(err);
      alert("Error saving availability.");
    }
  });

  async function loadAvailability() {
    availabilityList.innerHTML = ""; // clear old

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "faculty") return;

    try {
      const res = await fetch(`/api/faculty-availability/${user.id}`);
      if (!res.ok) throw new Error("Failed to load availability");

      const data = await res.json();

      if (data.length === 0) {
        availabilityList.innerHTML = "<li>No availability found.</li>";
      } else {
        data.forEach(slot => {
          const item = document.createElement("li");
          item.className = "availability-list-item";
          item.innerHTML = `
            <i class="ri-book-2-line"></i> <strong>${slot.course}</strong><br>
            <i class="ri-calendar-line"></i> ${daysOfWeek[slot.day_of_week]}<br>
            <i class="ri-time-line"></i> ${slot.start_time} &rarr; ${slot.end_time}
          `;
          availabilityList.appendChild(item);
        });
      }
    } catch (err) {
      console.error(err);
      availabilityList.innerHTML = "<li>Error loading availability.</li>";
    }
  }

  async function loadAvailabilityForEdit() {
    editSection.innerHTML = ""; // clear previous content

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "faculty") return;

    try {
      const res = await fetch(`/api/faculty-availability/${user.id}`);
      if (!res.ok) throw new Error("Failed to load availability");

      const data = await res.json();

      if (data.length === 0) {
        editSection.innerHTML = "<p>No availability found to edit.</p>";
      } else {
        data.forEach(slot => {
          const row = document.createElement("div");
          row.className = "availability-edit-row";

          row.innerHTML = `
            <input type="text" value="${slot.course}" placeholder="Course" list="course-options">
            <select>
              ${daysOfWeek.map((day, i) =>
                `<option value="${i}" ${slot.day_of_week === i ? "selected" : ""}>${day}</option>`).join("")}
            </select>
            <input type="time" value="${slot.start_time}">
            <input type="time" value="${slot.end_time}">
            <button class="save-btn" title="Save"><i class="ri-check-line"></i></button>
            <button class="delete-btn" title="Delete"><i class="ri-delete-bin-line"></i></button>
          `;

          // Save button
          row.querySelector(".save-btn").addEventListener("click", async () => {
            const course = row.querySelector("input[type='text']").value;
            const day = parseInt(row.querySelector("select").value);
            const start = row.querySelectorAll("input[type='time']")[0].value;
            const end = row.querySelectorAll("input[type='time']")[1].value;

            try {
              const res = await fetch(`/api/faculty-availability/${slot.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ course, day_of_week: day, start_time: start, end_time: end })
              });

              if (!res.ok) throw new Error("Failed to update");
              alert("Availability updated!");
              await loadAvailabilityForEdit(); // Refresh list
            } catch (err) {
              console.error(err);
              alert("Error updating availability.");
            }
          });

          // Delete button
          row.querySelector(".delete-btn").addEventListener("click", async () => {
            if (!confirm("Are you sure you want to delete this entry?")) return;
            try {
              const res = await fetch(`/api/faculty-availability/${slot.id}`, {
                method: "DELETE"
              });

              if (!res.ok) throw new Error("Failed to delete");
              alert("Entry deleted!");
              await loadAvailabilityForEdit(); // Refresh list
            } catch (err) {
              console.error(err);
              alert("Error deleting entry.");
            }
          });

          editSection.appendChild(row);
        });
      }
    } catch (err) {
      console.error(err);
      editSection.innerHTML = "<p>Error loading entries.</p>";
    }
  }
})();
// END OF AVAILABILITY.JS