//start of form.js
console.log('Form is loaded');
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

      alert(`Appointment for ${student} has been ${action}.\nNotes: ${notes}`);

      card.style.opacity = "0.6";
      card.style.pointerEvents = "none";
    }
  });

  // Load consultation form dynamically
  const formButton = document.getElementById("load-consultation-form");
  if (formButton) {
    formButton.addEventListener("click", () => {
      const mainContent = document.getElementById("main-content");
      if (mainContent) {
        fetch("form/form.html")
          .then(response => response.text())
          .then(html => {
            mainContent.innerHTML = html;
            window.history.pushState({}, '', '#/consultation-form'); // Optional: update URL hash
          })
          .catch(error => {
            console.error("Error loading form:", error);
            mainContent.innerHTML = "<p>Failed to load the consultation form.</p>";
          });
      }
    });
  }
});
//end of form.js