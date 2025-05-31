// ----- START OF APPOINTMENT.JS (FACULTY) -----
(() => {
  let currentMonth = new Date().getMonth();
  let currentYear = new Date().getFullYear();
  let facultyAvailability = {}; // day_of_week -> slots array
  let calendarStatus = {}; // { 'YYYY-MM-DD': 'pending'|'accepted' }
  let allRequests = []; // All requests for the month
  let facultyUnavailableDays = []; // Track faculty unavailable days

  const calendarHeader = document.getElementById('calendarHeader');
  const calendarGrid = document.getElementById('calendar');
  const monthYear = document.getElementById('monthYear');
  const prevMonthBtn = document.getElementById('prevMonth');
  const nextMonthBtn = document.getElementById('nextMonth');
  const requestsPanel = document.querySelector('.appointments-list');

  // Get logged-in faculty ID, then load everything
  fetch('/api/getuser', { credentials: 'include' })
    .then(res => res.json())
    .then(data => {
      if (data.user && data.user.role === 'faculty') {
        window.currentFacultyId = data.user.id;
        loadFacultyAvailability();
      } else {
        alert('Not logged in as faculty.');
      }
    })
    .catch(() => {
      alert('Could not fetch user info.');
    });

  async function loadFacultyAvailability() {
    try {
      // 1. Fetch availability
      const res = await fetch(`/api/faculty-availability/${window.currentFacultyId}`);
      const slots = await res.json();
      facultyAvailability = {};
      slots.forEach(slot => {
        const dow = Number(slot.day_of_week);
        if (!facultyAvailability[dow]) facultyAvailability[dow] = [];
        facultyAvailability[dow].push(slot);
      });

      // 2. Fetch calendar status and all requests for this month
      const monthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
      const statusRes = await fetch(`/api/consultation-request/calendar-status?faculty_id=${window.currentFacultyId}&month=${monthStr}`);
      calendarStatus = await statusRes.json();

      const reqRes = await fetch(`/api/consultation-request?faculty_id=${window.currentFacultyId}&month=${monthStr}`);
      allRequests = await reqRes.json();

      // 3. Fetch faculty unavailable days
      const unavailableRes = await fetch(`/api/faculty-unavailable/${window.currentFacultyId}?month=${monthStr}`);
      facultyUnavailableDays = await unavailableRes.json();

      // After fetching all requests for the month:
      const statusByDate = {};
      allRequests.forEach(req => {
        const date = req.date_requested;
        if (!statusByDate[date]) statusByDate[date] = [];
        statusByDate[date].push(req.status);
      });
      Object.entries(statusByDate).forEach(([date, statuses]) => {
        if (statuses.includes('accepted')) {
          calendarStatus[date] = 'accepted';
        } else if (statuses.includes('pending')) {
          calendarStatus[date] = 'pending';
        } else if (statuses.every(s => s === 'rejected')) {
          calendarStatus[date] = 'rejected';
        }
      });

      renderCalendarHeader();
      showCalendar();
    } catch (err) {
      console.error('Failed to load faculty availability:', err);
    }
  }

  function renderCalendarHeader() {
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    monthYear.textContent = `${monthNames[currentMonth]} ${currentYear}`;
  }

  function showCalendar() {
    calendarGrid.innerHTML = '';
    calendarHeader.innerHTML = '';

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    days.forEach(day => {
      const th = document.createElement('div');
      th.textContent = day;
      th.className = 'calendar-day-header';
      calendarHeader.appendChild(th);
    });

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement('div');
      empty.className = 'calendar-cell empty';
      calendarGrid.appendChild(empty);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(currentYear, currentMonth, d);
      const dow = dateObj.getDay();
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const cell = document.createElement('div');
      cell.className = 'calendar-cell';

      // Student logic: mark past days
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      dateObj.setHours(0, 0, 0, 0);
      if (dateObj < today) {
        cell.classList.add('past');
      }

      // Determine cell color
      const status = calendarStatus[dateStr];
      if (facultyUnavailableDays && facultyUnavailableDays.includes(dateStr)) {
        cell.classList.add('unavailable'); // Red: faculty marked unavailable
      } else if (!facultyAvailability[dow] || facultyAvailability[dow].length === 0) {
        cell.classList.add('not-set'); // Gray: no slots set
      } else if (status === 'accepted' || status === 'pending') {
        cell.classList.add('scheduled'); // Blue: has accepted or pending requests
      } else {
        cell.classList.add('available'); // Green: available, no requests
      }

      cell.textContent = d;
      cell.title = "Right-click to toggle unavailable";

      // Only allow click if not past
      if (!cell.classList.contains('past')) {
        cell.addEventListener('click', () => showRequestsForDate(dateStr));
        cell.addEventListener('contextmenu', e => {
          e.preventDefault();
          // Toggle unavailable
          if (facultyUnavailableDays.includes(dateStr)) {
            // Remove unavailable
            fetch('/api/faculty-unavailable', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ faculty_id: window.currentFacultyId, date: dateStr })
            }).then(() => loadFacultyAvailability());
          } else {
            // Add unavailableS
            fetch('/api/faculty-unavailable', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ faculty_id: window.currentFacultyId, date: dateStr })
            }).then(() => loadFacultyAvailability());
          }
        });
      } else {
        cell.style.cursor = 'not-allowed';
      }

      calendarGrid.appendChild(cell);
    }
  }

  // Show requests for a specific date in the right panel
  function showRequestsForDate(dateStr) {
    if (!requestsPanel) return;
    requestsPanel.innerHTML = '';
    let requests = allRequests.filter(r => r.date_requested === dateStr);

    // Sort: pending first, then accepted, then rejected
    const statusOrder = { pending: 0, accepted: 1, rejected: 2 };
    requests.sort((a, b) => (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99));

    if (requests.length === 0) {
      requestsPanel.innerHTML = `<li style="padding:1rem;">No requests for this date.</li>`;
      return;
    }
    requests.forEach(req => {
      const li = document.createElement('li');
      li.className = 'appointment-card';
      li.dataset.requestId = req.id;
      // Add inactive class if not pending
      if (req.status !== 'pending') li.classList.add('inactive');
      li.innerHTML = `
        <div class="appointment-info">
          <p><strong>Student:</strong> ${req.student_names ? req.student_names.split(',').join(', ') : ''}</p>
          <p><strong>Course:</strong> ${req.course_code || ''}</p>
          <p><strong>Date:</strong> ${req.date_requested}</p>
          <p><strong>Time:</strong> ${req.time_requested}</p>
          <p><strong>Reason:</strong> ${req.reason}</p>
          <textarea class="notes-input" placeholder="Add notes…"></textarea>
        </div>
        <div class="appointment-actions">
          ${req.status === 'pending' ? `
            <button class="btn accept-btn">Accept</button>
            <button class="btn reject-btn">Reject</button>
          ` : `<span style="font-weight:bold;color:${req.status === 'accepted' ? 'green' : 'red'}">${req.status.charAt(0).toUpperCase() + req.status.slice(1)}</span>`}
        </div>
      `;
      requestsPanel.appendChild(li);
    });
  }

  // Accept/Reject handler
  if (requestsPanel) {
    requestsPanel.addEventListener("click", e => {
      const btn = e.target;
      if (!btn.classList.contains("accept-btn") && !btn.classList.contains("reject-btn")) return;
      const card = btn.closest(".appointment-card");
      const requestId = card.dataset.requestId;
      const action = btn.classList.contains("accept-btn") ? "accepted" : "rejected";
      const notes = card.querySelector(".notes-input").value.trim();

      fetch(`/api/consultation-request/${requestId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action, notes })
      })
      .then(res => res.json())
      .then(() => {
        // Update the status in allRequests
        const req = allRequests.find(r => r.id == requestId);
        if (req) {
          req.status = action;
          req.notes = notes;
        }
        // Re-render the requests for the current date, sorted
        showRequestsForDate(req.date_requested);
        // Optionally, refresh calendar status/colors
        loadFacultyAvailability();
      });
    });
  }

  prevMonthBtn.addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    loadFacultyAvailability();
  });

  nextMonthBtn.addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    loadFacultyAvailability();
  });

  const consultationBtn = document.getElementById('load-consultation-form');
  if (consultationBtn) {
    consultationBtn.addEventListener('click', () => {
      loadPage('form/form.html');
    });
  }
})();
// ----- END OF APPOINTMENT.JS (FACULTY) -----