/* ----- START OF HISTORY.JS (FACULTY) ----- */
(() => {
  // Get faculty user from localStorage
  let user = JSON.parse(localStorage.getItem("user"));
  if (!user || user.role !== "faculty") return;

  // Appointment History (from consultation-form)
  let appointmentHistory = [];
  async function loadAppointmentHistory() {
    const res = await fetch(`/api/consultation-form/faculty?faculty_id=${user.id}`);
    appointmentHistory = await res.json();
    console.log('appointmentHistory:', appointmentHistory);
    renderAppointmentHistory();
  }

  function renderAppointmentHistory() {
    const list = document.querySelector('#past-appointments-section .history-list');
    list.innerHTML = '';
    if (!Array.isArray(appointmentHistory) || appointmentHistory.length === 0) {
      list.innerHTML = `<li class="history-card"><div class="history-info">No appointments found.</div></li>`;
      return;
    }
    appointmentHistory.forEach(entry => {
      const li = document.createElement('li');
      li.className = 'history-card';
      li.innerHTML = `
        <div class="history-info">
          <p><strong>Student(s):</strong> ${entry.student_id || ''}</p>
          <p><strong>Date:</strong> ${entry.date || ''}</p>
          <p><strong>Time:</strong> ${entry.start_time || ''} - ${entry.end_time || ''}</p>
          <p><strong>Status:</strong> <span class="status completed">Completed</span></p>
          <p><strong>Course:</strong> ${entry.course_code || ''}</p>
          <p><strong>Venue:</strong> ${entry.venue || ''}</p>
        </div>
      `;
      list.appendChild(li);
    });
  }

  // Consultation Request History (from consultation-request)
  let consultationHistory = [];
  async function loadConsultationHistory() {
    const res = await fetch(`/api/consultation-request?faculty_id=${user.id}`);
    consultationHistory = await res.json();
    renderConsultationHistory();
  }

  function renderConsultationHistory() {
    const tbody = document.getElementById('faculty-consultation-history-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (!Array.isArray(consultationHistory) || consultationHistory.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No consultation requests to show.</td></tr>`;
      return;
    }
    consultationHistory.forEach(entry => {
      tbody.innerHTML += `
        <tr>
          <td>${entry.date_requested || ''}</td>
          <td>${entry.student_names || ''}</td>
          <td>${entry.course_code || ''}</td>
          <td>${capitalize(entry.status)}</td>
          <td>${entry.reason || ''}</td>
        </tr>
      `;
    });
  }

  function capitalize(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
  }

  // Tab logic
  const tabButtons = [
    { btn: 'past-appointments-btn', section: 'past-appointments-section' },
    { btn: 'consultation-requests-btn', section: 'consultation-requests-section' },
    { btn: 'consultation-reports-btn', section: 'consultation-reports-section' },
    { btn: 'summary-report-btn', section: 'summary-report-section' }
  ];

  tabButtons.forEach(({ btn, section }) => {
    document.getElementById(btn).addEventListener('click', () => {
      // Set active button
      tabButtons.forEach(({ btn: b }) =>
        document.getElementById(b).classList.toggle('active', b === btn)
      );
      // Show the selected section, hide others
      tabButtons.forEach(({ section: s }) =>
        document.getElementById(s).style.display = (s === section) ? '' : 'none'
      );
      // Load data for the selected tab
      if (section === 'past-appointments-section') loadAppointmentHistory();
      if (section === 'consultation-requests-section') loadConsultationHistory();
    });
  });

  // Load default tab
  loadAppointmentHistory();
})();
/* ----- END OF HISTORY.JS (FACULTY) ----- */
