// ----- START OF HISTORY.JS (STUDENT) -----
(() => {
  console.log("History loaded!")
  let consultationHistory = [];

  async function loadConsultationHistory() {
    // Get logged-in user info (assume session or localStorage)
    let user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "student") return;

    const res = await fetch(`/api/consultation-request?student_id=${user.id}`);
    consultationHistory = await res.json();

    renderConsultationHistory();
  }

  function renderConsultationHistory() {
    const tbody = document.querySelector('#consultation-history-section tbody');
    tbody.innerHTML = '';
    if (!consultationHistory || consultationHistory.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;">No consultation requests found.</td></tr>`;
      return;
    }
    consultationHistory.forEach(entry => {
      tbody.innerHTML += `
        <tr>
          <td>${entry.date_requested}</td>
          <td>${entry.faculty_name}</td>
          <td>${entry.course_code}</td>
          <td>${entry.program || ''}</td>
          <td>${entry.start_time || ''}</td>
          <td>${entry.end_time || ''}</td>
          <td>${entry.status}</td>
          <td>${entry.reason || ''}</td>
        </tr>
      `;
    });
  }

  let appointmentHistory = [];

  async function loadAppointmentHistory() {
    let user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "student") return;

    const res = await fetch(`/api/consultation-form?student_id=${user.id}`);
    appointmentHistory = await res.json();

    renderAppointmentHistory();
  }

  function renderAppointmentHistory() {
    const tbody = document.getElementById('historyBody');
    tbody.innerHTML = '';
    if (!appointmentHistory || appointmentHistory.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No appointments found.</td></tr>`;
      return;
    }
    appointmentHistory.forEach(entry => {
      tbody.innerHTML += `
        <tr>
          <td>${entry.date}</td>
          <td>${entry.faculty_name}</td>
          <td>${entry.course_code}</td>
          <td>${entry.term}</td>
          <td>${entry.venue}</td>
          <td>
            <button class="view-details-btn" data-id="${entry.consultation_id}">View Details</button>
          </td>
        </tr>
      `;
    });

    document.querySelectorAll('.view-details-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const id = this.getAttribute('data-id');
        showAppointmentDetailsModal(id);
      });
    });
  }

  async function showAppointmentDetailsModal(id) {
    // Fetch details from backend for this appointment
    const res = await fetch(`/api/consultation-form/${id}`);
    const entry = await res.json();
    if (!entry) return;

    const content = document.getElementById('appointment-details-content');
    content.innerHTML = `
      <table>
        <tr><th>Date</th><td>${entry.date || ''}</td></tr>
        <tr><th>Faculty</th><td>${entry.faculty_name || ''}</td></tr>
        <tr><th>Course</th><td>${entry.course_code || ''}</td></tr>
        <tr><th>Term</th><td>${entry.term || ''}</td></tr>
        <tr><th>Venue</th><td>${entry.venue || ''}</td></tr>
        <tr><th>Program</th><td>${entry.program || ''}</td></tr>
        <tr><th>Start Time</th><td>${entry.start_time || ''}</td></tr>
        <tr><th>End Time</th><td>${entry.end_time || ''}</td></tr>
        <tr><th>Course Concerns</th><td>${entry.course_concerns || ''}</td></tr>
        <tr><th>Intervention</th><td>${entry.intervention || ''}</td></tr>
        <tr><th>Nature of Concerns</th><td>${entry.nature_of_concerns || ''}</td></tr>
      </table>
    `;
    
    const modal = document.getElementById('appointment-details-modal');
    modal.style.display = 'block';
    
    // Re-attach event listener to close button
    document.getElementById('close-modal-btn').onclick = function() {
        modal.style.display = 'none';
    };
  }

  // Close modal logic
  document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded fired");
    document.getElementById('close-modal-btn').onclick = function() {
        console.log("Close button clicked");
      document.getElementById('appointment-details-modal').style.display = 'none';
    };
    // Optional: close modal when clicking outside
    window.onclick = function(event) {
      const modal = document.getElementById('appointment-details-modal');
      if (event.target == modal) {
        modal.style.display = 'none';
      }
    };
  });

  // On page load, load consultation history
  loadConsultationHistory();

  document.getElementById('appointment-history-btn').addEventListener('click', () => {
    document.getElementById('appointment-history-section').style.display = '';
    document.getElementById('consultation-history-section').style.display = 'none';
    document.getElementById('appointment-history-btn').classList.add('active');
    document.getElementById('consultation-history-btn').classList.remove('active');
    loadAppointmentHistory();
  });

  document.getElementById('consultation-history-btn').addEventListener('click', () => {
    document.getElementById('appointment-history-section').style.display = 'none';
    document.getElementById('consultation-history-section').style.display = '';
    document.getElementById('consultation-history-btn').classList.add('active');
    document.getElementById('appointment-history-btn').classList.remove('active');
    renderConsultationHistory();
  });
  
})();
// ----- END OF HISTORY.JS (STUDENT) -----