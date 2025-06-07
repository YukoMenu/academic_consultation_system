/* ----- START OF HISTORY.JS (FACULTY) ----- */
(() => {
  // Get faculty user from localStorage
  let user = JSON.parse(localStorage.getItem("user"));
  if (!user || user.role !== "faculty") return;

  // Modal close functionality
  const modal = document.getElementById('appointment-details-modal');
  const closeBtn = document.getElementById('close-modal-btn');

  // Close button click handler
  if (closeBtn) {
      closeBtn.addEventListener('click', () => {
          console.log('Close button clicked');
          modal.classList.remove('show');
          document.body.style.overflow = '';
      });
  } else {
      console.error('Close button not found!');
  }

  // Click outside modal to close
  window.addEventListener('click', (event) => {
      if (event.target === modal) {
          modal.classList.remove('show');
          document.body.style.overflow = '';
      }
  });

  // Appointment History (from consultation-form)
  let appointmentHistory = [];
  async function loadAppointmentHistory() {
      try {
          const res = await fetch(`/api/consultation-form/faculty?faculty_id=${user.id}`);
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          appointmentHistory = await res.json();
          console.log('appointmentHistory:', appointmentHistory);
          renderAppointmentHistory();
      } catch (error) {
          console.error('Error loading appointment history:', error);
      }
  }

  function renderAppointmentHistory() {
      const tbody = document.getElementById('appointmentHistoryBody');
      tbody.innerHTML = '';

      if (!Array.isArray(appointmentHistory) || appointmentHistory.length === 0) {
          tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No appointments found.</td></tr>`;
          return;
      }

      appointmentHistory.forEach(entry => {
          tbody.innerHTML += `
              <tr>
                  <td>${entry.date || ''}</td>
                  <td>${entry.start_time || ''} - ${entry.end_time || ''}</td>
                  <td>${entry.student_names || 'No students listed'}</td>
                  <td>${entry.course_code || ''}</td>
                  <td>${entry.venue || ''}</td>
                  <td>
                      <button class="view-details-btn" data-id="${entry.consultation_id}">View Details</button>
                  </td>
              </tr>
          `;
      });

      // Add click handlers for view details buttons
      document.querySelectorAll('.view-details-btn').forEach(btn => {
          btn.addEventListener('click', function () {
              const id = this.getAttribute('data-id');
              showAppointmentDetailsModal(id);
          });
      });
  }

  async function showAppointmentDetailsModal(id) {
      try {
          const res = await fetch(`/api/consultation-form/${id}`);
          const entry = await res.json();
          if (!entry) return;

          const content = document.getElementById('appointment-details-content');
          const studentNames = Array.isArray(entry.students) && entry.students.length > 0
              ? entry.students.map(student => student.name).join(', ')
              : 'No students listed';

          content.innerHTML = `
              <table>
                  <tr><th>Date</th><td>${entry.date || ''}</td></tr>
                  <tr><th>Student(s)</th><td>${studentNames}</td></tr>
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

          document.getElementById('print-appointment-pdf-btn').onclick = function() {
              window.open(`/api/generate-pdf/appointment-html/${id}`, '_blank');
          };

          const modal = document.getElementById('appointment-details-modal');
          modal.classList.add('show');
          document.body.style.overflow = 'hidden';
      } catch (error) {
          console.error('Error fetching appointment details:', error);
      }
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

  const summaryReportBtn = document.getElementById('summary-report-nav-btn');
  if (summaryReportBtn) {
    summaryReportBtn.addEventListener('click', () => {
      loadPage('generate-summary/generate-summary.html');
      setTimeout(() => {
        if (window.initSummaryReport) {
          window.initSummaryReport();
        }
      }, 100);
    });
  }

  // ----- Summary Report Logic -----
  async function fetchSummaryReports(filters = {}) {
    const params = new URLSearchParams(filters);
    try {
      const response = await fetch(`/api/summary/saved?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch summary reports.");
      return await response.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  function renderSummaryTable(data) {
    const summaryTableBody = document.getElementById("summaryTableBody");
    if (!summaryTableBody) return;

    if (!data.length) {
      summaryTableBody.innerHTML = `<tr><td colspan="9" class="text-center">No summary reports found</td></tr>`;
      return;
    }

    summaryTableBody.innerHTML = data.map(row => `
      <tr>
        <td>${row.school || '-'}</td>
        <td>${row.year_level || '-'}</td>
        <td>${row.academic_year || '-'}</td>
        <td>${row.college_term || '-'}</td>
        <td>${row.bed_shs_term || '-'}</td>
        <td>${row.number_of_students}</td>
        <td>${parseFloat(row.total_hours).toFixed(1)}</td>
        <td>${new Date(row.date_created).toLocaleDateString()}</td>
        <td>
          <button class="view-summary-details-btn" data-id="${row.id}">View Details</button>
        </td>
      </tr>
    `).join('');

    // Add click handlers for the new buttons
    document.querySelectorAll('.view-summary-details-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        const id = this.getAttribute('data-id');
        showSummaryDetailsModal(id);
      });
    });
  }

  async function loadAndRenderSummaryReport(filters = {}) {
    const data = await fetchSummaryReports(filters);
    renderSummaryTable(data);
  }

  // Attach form handler
  document.getElementById("filter-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const filters = {
      academic_year: document.getElementById("academicYear")?.value.trim(),
      college_term: document.getElementById("collegeTerm")?.value,
      bed_shs_term: document.getElementById("bedShsTerm")?.value
    };

    // Remove empty filters
    Object.keys(filters).forEach(key => {
      if (!filters[key]) delete filters[key];
    });

    loadAndRenderSummaryReport(filters);
  });

  async function showSummaryDetailsModal(id) {
    try {
      const res = await fetch(`/api/summary/saved/${id}`);
      const entry = await res.json();
      if (!entry) return;

      const content = document.getElementById('appointment-details-content');
      content.innerHTML = `
        <table>
          <tr><th>School</th><td>${entry.school || '-'}</td></tr>
          <tr><th>Year Level</th><td>${entry.year_level || '-'}</td></tr>
          <tr><th>Academic Year</th><td>${entry.academic_year || '-'}</td></tr>
          <tr><th>College Term</th><td>${entry.college_term || '-'}</td></tr>
          <tr><th>BED/SHS Term</th><td>${entry.bed_shs_term || '-'}</td></tr>
          <tr><th>No. of Students</th><td>${entry.number_of_students}</td></tr>
          <tr><th>Total Hours</th><td>${parseFloat(entry.total_hours).toFixed(1)}</td></tr>
          <tr><th>Date Created</th><td>${new Date(entry.date_created).toLocaleDateString()}</td></tr>
          <tr><th>Summary Report</th><td>${entry.summary_report || '-'}</td></tr>
        </table>
      `;

      // Show summary print button, hide appointment print button
      const printBtn = document.getElementById('print-summary-pdf-btn');
      if (printBtn) {
        printBtn.style.display = '';
        printBtn.onclick = function() {
          window.open(`/api/generate-pdf/summary-html/${id}`, '_blank');
        };
      }
      const appointmentPrintBtn = document.getElementById('print-appointment-pdf-btn');
      if (appointmentPrintBtn) appointmentPrintBtn.style.display = 'none';

      const modal = document.getElementById('appointment-details-modal');
      modal.classList.add('show');
      document.body.style.overflow = 'hidden';
    } catch (error) {
      console.error('Error fetching summary details:', error);
    }
  }

  // Load default tab
  loadAppointmentHistory();
})();
/* ----- END OF HISTORY.JS (FACULTY) ----- */
