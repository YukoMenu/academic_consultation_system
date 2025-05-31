// ----- START OF HISTORY.JS -----
(() => {
  console.log("History loaded!")

  // Mock data for demonstration
  const appointmentHistory = [
    // Example:
    // { date: "2025-05-01", faculty: "Dr. Smith", status: "Completed", notes: "Discussed project scope." }
  ];
  const consultationHistory = [
    // Example:
    // { date: "2025-05-10", faculty: "Prof. Lee", status: "Pending", details: "Requested extra session." }
  ];

  function renderAppointmentHistory() {
    const tbody = document.getElementById('historyBody');
    tbody.innerHTML = '';
    if (appointmentHistory.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">No appointment records found.</td></tr>`;
      return;
    }
    appointmentHistory.forEach(entry => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${entry.date}</td>
        <td>${entry.faculty}</td>
        <td>${entry.course}</td>
        <td>${entry.status}</td>
        <td>${entry.notes}</td>
      `;
      tbody.appendChild(row);
    });
  }

  function renderConsultationHistory() {
    const tbody = document.querySelector('#consultation-history-section tbody');
    tbody.innerHTML = '';
    if (consultationHistory.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">No consultation requests found.</td></tr>`;
      return;
    }
    consultationHistory.forEach(entry => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${entry.date}</td>
        <td>${entry.faculty}</td>
        <td>${entry.course}</td>
        <td>${entry.status}</td>
        <td>${entry.details}</td>
      `;
      tbody.appendChild(row);
    });
  }

  // Initial render
  renderAppointmentHistory();

  document.getElementById('appointment-history-btn').addEventListener('click', () => {
    document.getElementById('appointment-history-section').style.display = '';
    document.getElementById('consultation-history-section').style.display = 'none';
    document.getElementById('appointment-history-btn').classList.add('active');
    document.getElementById('consultation-history-btn').classList.remove('active');
    renderAppointmentHistory();
  });

  document.getElementById('consultation-history-btn').addEventListener('click', () => {
    document.getElementById('appointment-history-section').style.display = 'none';
    document.getElementById('consultation-history-section').style.display = '';
    document.getElementById('consultation-history-btn').classList.add('active');
    document.getElementById('appointment-history-btn').classList.remove('active');
    renderConsultationHistory();
  });
})();
// ----- END OF HISTORY.JS -----