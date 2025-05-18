// history.js
document.addEventListener('DOMContentLoaded', () => {
  const historyList = document.querySelector('.history-list');

  // Mock data - replace with your backend API call
  const pastAppointments = [
    {
      student: "Juan Garcia",
      date: "April 10, 2025",
      time: "2:00 PM - 2:30 PM",
      status: "completed",
      notes: "Reviewed thesis draft and provided feedback."
    },
    {
      student: "Maria Lopez",
      date: "April 8, 2025",
      time: "11:00 AM - 11:30 AM",
      status: "canceled",
      notes: "Student canceled due to illness."
    },
    {
      student: "Carlos Reyes",
      date: "April 5, 2025",
      time: "9:00 AM - 9:30 AM",
      status: "completed",
      notes: "Discussed project milestones."
    }
  ];

  function createHistoryCard(appointment) {
    const li = document.createElement('li');
    li.className = 'history-card';
    
    li.innerHTML = `
      <div class="history-info">
        <p><strong>Student:</strong> ${appointment.student}</p>
        <p><strong>Date:</strong> ${appointment.date}</p>
        <p><strong>Time:</strong> ${appointment.time}</p>
        <p><strong>Status:</strong> <span class="status ${appointment.status}">${capitalize(appointment.status)}</span></p>
        <p><strong>Notes:</strong> ${appointment.notes}</p>
      </div>
    `;

    return li;
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Clear existing list just in case
  historyList.innerHTML = '';

  // Append each appointment card
  pastAppointments.forEach(appointment => {
    const card = createHistoryCard(appointment);
    historyList.appendChild(card);
  });
});
