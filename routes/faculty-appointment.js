// ----- START OF FACULTY-APPOINTMENT.JS -----
const express = require('express');
const router = express.Router();
const db = require('../db/database');

// Utility: Get all dates in the next N months for a given day_of_week
function pad(n) { return n < 10 ? '0' + n : n; }
function getDatesForDayOfWeek(dayOfWeek, startDate, endDate) {
  const dates = [];
  let current = new Date(startDate);
  // Set to the first occurrence of the dayOfWeek
  current.setDate(current.getDate() + ((7 + dayOfWeek - current.getDay()) % 7));
  while (current <= endDate) {
    const yyyy = current.getFullYear();
    const mm = pad(current.getMonth() + 1);
    const dd = pad(current.getDate());
    dates.push(`${yyyy}-${mm}-${dd}`);
    current.setDate(current.getDate() + 7);
  }
  return dates;
}

router.get('/faculty/:faculty_id/calendar', async (req, res) => {
  const facultyId = req.params.faculty_id;

  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const end = new Date(today.getFullYear(), today.getMonth() + 2, 0);

  db.all(
    `SELECT day_of_week, start_time, end_time FROM faculty_availability WHERE faculty_id = ?`,
    [facultyId],
    (err, availRows) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch availability' });
      let availableDates = new Set();
      availRows.forEach(row => {
        getDatesForDayOfWeek(row.day_of_week, start, end).forEach(date => availableDates.add(date));
      });

      db.all(
        `SELECT date_requested, status FROM consultation_requests WHERE faculty_id = ? AND date_requested BETWEEN ? AND ?`,
        [facultyId, start.toISOString().slice(0, 10), end.toISOString().slice(0, 10)],
        (err, reqRows) => {
          if (err) return res.status(500).json({ error: 'Failed to fetch requests' });
          const dateStatus = {};
          availableDates.forEach(date => dateStatus[date] = 'available');
          reqRows.forEach(row => {
            if (row.status === 'accepted') {
              dateStatus[row.date_requested] = 'scheduled';
            } else if (row.status === 'pending') {
              dateStatus[row.date_requested] = 'scheduled';
            } else if (row.status === 'rejected') {
            }
          });

          const result = Object.entries(dateStatus).map(([date, status]) => ({ date, status }));
          res.json(result);
        }
      );
    }
  );
});

module.exports = router;
// ----- END OF FACULTY-APPOINTMENT.JS -----