// START OF AVAILABILITY.JS

document.addEventListener('DOMContentLoaded', () => {
  const daysOfWeek = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
  ];

  const container = document.getElementById("availability-container");
  const addBtn = document.getElementById("add-day-btn");

  function createDayRow() {
    const row = document.createElement("div");
    row.className = "availability-row";

    row.innerHTML = `
      <select name="day_of_week" required>
        ${daysOfWeek.map((day, i) => `<option value="${i}">${day}</option>`).join("")}
      </select>
      <label>From:
        <input type="time" name="start_time" required>
      </label>
      <label>To:
        <input type="time" name="end_time" required>
      </label>
      <button type="button" class="remove-btn">−</button>
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

    const rows = document.querySelectorAll(".availability-row");
    const availability = [];

    rows.forEach(row => {
      const day = row.querySelector("select").value;
      const start = row.querySelector('input[name="start_time"]').value;
      const end = row.querySelector('input[name="end_time"]').value;

      if (start && end) {
        availability.push({
          day_of_week: parseInt(day),
          start_time: start,
          end_time: end
        });
      }
    });

    try {
      const res = await fetch("http://localhost:3000/api/faculty-availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availability })
      });

      if (!res.ok) throw new Error("Failed to save availability");
      alert("Availability saved!");
    } catch (err) {
      console.error(err);
      alert("Error saving availability.");
    }
  });
});
// END OF AVAILABILITY.JS