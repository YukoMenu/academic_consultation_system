// appointments.js
document.addEventListener("DOMContentLoaded", () => {
  const appointmentsList = document.querySelector(".appointments-list");

  appointmentsList.addEventListener("click", (e) => {
    const target = e.target;
    if (target.classList.contains("accept-btn") || target.classList.contains("reject-btn")) {
      const card = target.closest(".appointment-card");
      if (!card) return;

      const student = card.querySelector("p strong").nextSibling.textContent.trim();
      const notes = card.querySelector(".notes-input").value.trim();
      const action = target.classList.contains("accept-btn") ? "accepted" : "rejected";

      // Example: Show alert, replace with actual backend call
      alert(`Appointment for ${student} has been ${action}.\nNotes: ${notes}`);

      // Optionally remove or mark the appointment in UI after action
      card.style.opacity = "0.6";
      card.style.pointerEvents = "none";
    }
  });
});
