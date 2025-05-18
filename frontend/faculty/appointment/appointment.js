//start of appointments.js
(() => {
  console.log('Appointment page loaded');

  const appointmentsList = document.querySelector(".appointments-list");
  if (appointmentsList) {
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
  }

  const formBtn = document.getElementById("load-consultation-form");
  if (formBtn) {
    formBtn.addEventListener("click", () => {
      fetch("form/form.html")
        .then((res) => res.text())
        .then((html) => {
          document.getElementById("main-content").innerHTML = html;

          const existingScript = document.querySelector('script[src="form/form.js"]');
          if (existingScript) existingScript.remove();
          const script = document.createElement("script");
          script.src = "form/form.js";
          script.defer = true;
          document.body.appendChild(script);
        });
    });
  }
})();(() => {
  console.log('Appointment page loaded');

  const appointmentsList = document.querySelector(".appointments-list");
  if (appointmentsList) {
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
  }

  const formBtn = document.getElementById("load-consultation-form");
  if (formBtn) {
    formBtn.addEventListener("click", () => {
      fetch("form/form.html")
        .then((res) => res.text())
        .then((html) => {
          document.getElementById("main-content").innerHTML = html;

          const existingScript = document.querySelector('script[src="form/form.js"]');
          if (existingScript) existingScript.remove();
          const script = document.createElement("script");
          script.src = "form/form.js";
          script.defer = true;
          document.body.appendChild(script);
        });
    });
  }
})();
//end of appointment.js