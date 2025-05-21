// ----- START OF APPOINTMENT.JS -----
(() => {
  console.log("Appointments page script loaded");

  /* Accept / Reject handler */
  const list = document.querySelector(".appointments-list");
  if (list) {
    list.addEventListener("click", e => {
      const btn = e.target;
      if (!btn.classList.contains("accept-btn") &&
          !btn.classList.contains("reject-btn")) return;

      const card   = btn.closest(".appointment-card");
      const action = btn.classList.contains("accept-btn") ? "accepted" : "rejected";
      const notes  = card.querySelector(".notes-input").value.trim();
      const student = card.querySelector("p strong").nextSibling.textContent.trim();

      alert(`Appointment for ${student} has been ${action}.\nNotes: ${notes}`);
      card.style.opacity = "0.6";
      card.style.pointerEvents = "none";
    });
  }

  /* ── Load Consultation Form dynamically ── */
  const formBtn = document.getElementById('load-consultation-form');

   if (formBtn) {
      formBtn.addEventListener('click', () => {
         fetch('form/form.html')
          .then(res => res.text())
          .then(html => {
              const main = document.getElementById('main');
              main.innerHTML = html;

              // Remove previous dynamic style
              const existingStyle = document.getElementById('dynamic-style');
              if (existingStyle) existingStyle.remove();

              const css = document.createElement('link');
              css.rel = 'stylesheet';
              css.href = 'form/form.css';
              css.id = 'dynamic-style';
              document.head.appendChild(css);

              const script = document.createElement('script');
              script.src = 'form/form.js';
              script.defer = true;
              document.body.appendChild(script);
          })
          .catch(err => {
              console.error('Error loading form.html:', err);
          });
      });
   }
})();
// ----- END OF APPOINTMENT.JS -----