// ----- START OF CONSULTATION-REQUEST.JS -----
const express = require('express');
const router = express.Router();
const db = require('../db/database');

// POST /api/consultation-request
router.post('/', (req, res) => {
  const { faculty_id, course_code, date_requested, time_requested, reason, student_ids } = req.body;

  if (!faculty_id || !course_code || !date_requested || !time_requested || !reason || !Array.isArray(student_ids) || student_ids.length === 0) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Filter out any null/undefined/empty student_ids
  const validStudentIds = student_ids.filter(id => id !== null && id !== undefined);

  if (validStudentIds.length !== student_ids.length) {
    return res.status(400).json({ error: 'One or more student IDs are invalid.' });
  }

  db.run(
    `INSERT INTO consultation_requests (faculty_id, course_code, date_requested, time_requested, reason) VALUES (?, ?, ?, ?, ?)`,
    [faculty_id, course_code, date_requested, time_requested, reason],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      const requestId = this.lastID;

      // Insert students
      const stmt = db.prepare(
        `INSERT INTO consultation_requests_students (consultation_request_id, student_id) VALUES (?, ?)`
      );
      for (const sid of validStudentIds) {
        stmt.run(requestId, sid);
      }
      stmt.finalize();

      res.status(201).json({ message: 'Consultation request created', id: requestId });
    }
  );
});

// GET all consultation requests (optionally filter by faculty or student)
router.get('/', (req, res) => {
  const { faculty_id, student_id } = req.query;
  let sql = `
    SELECT cr.*, group_concat(s.user_id) as student_ids, group_concat(u.name) as student_names, u_faculty.name as faculty_name
    FROM consultation_requests cr
    JOIN consultation_requests_students crs ON cr.id = crs.consultation_request_id
    JOIN students s ON crs.student_id = s.user_id
    JOIN users u ON s.user_id = u.id
    JOIN faculty f ON cr.faculty_id = f.user_id
    JOIN users u_faculty ON f.user_id = u_faculty.id
  `;
  const params = [];
  const where = [];
  if (faculty_id) {
    where.push('cr.faculty_id = ?');
    params.push(faculty_id);
  }
  if (student_id) {
    where.push('crs.student_id = ?');
    params.push(student_id);
  }
  if (where.length) sql += ' WHERE ' + where.join(' AND ');
  sql += ' GROUP BY cr.id ORDER BY cr.date_created DESC';

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// PATCH status (accept/reject/close)
router.patch('/:id/status', (req, res) => {
  const id = req.params.id;
  const { status } = req.body;
  if (!['pending', 'accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  db.run(
    `UPDATE consultation_requests SET status = ?, date_closed = CASE WHEN ? = 'accepted' OR ? = 'rejected' THEN CURRENT_TIMESTAMP ELSE date_closed END WHERE id = ?`,
    [status, status, status, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Status updated', changes: this.changes });
    }
  );
});

// GET requests for a faculty for a given month (for calendar coloring)
router.get('/calendar-status', (req, res) => {
  const { faculty_id, month } = req.query;
  if (!faculty_id || !month) return res.status(400).json({ error: 'Missing params' });
  db.all(
    `SELECT date_requested, status FROM consultation_requests WHERE faculty_id = ? AND date_requested LIKE ?`,
    [faculty_id, `${month}%`],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      // Group by date, prioritize accepted > pending
      const statusByDate = {};
      rows.forEach(r => {
        if (r.status === 'accepted') {
          statusByDate[r.date_requested] = 'accepted';
        } else if (r.status === 'pending' && statusByDate[r.date_requested] !== 'accepted') {
          statusByDate[r.date_requested] = 'pending';
        }
      });
      res.json(statusByDate); // { "2025-05-20": "accepted", ... }
    }
  );
});

// GET a single consultation request by ID (with students)
router.get('/:id', (req, res) => {
  const id = req.params.id;
  db.get(
    `SELECT * FROM consultation_requests WHERE id = ?`,
    [id],
    (err, request) => {
      if (err || !request) return res.status(404).json({ error: 'Not found' });
      db.all(
        `SELECT s.user_id, u.name FROM consultation_requests_students crs
         JOIN students s ON crs.student_id = s.user_id
         JOIN users u ON s.user_id = u.id
         WHERE crs.consultation_request_id = ?`,
        [id],
        (err, students) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ ...request, students });
        }
      );
    }
  );
});

module.exports = router;
// ----- END OF CONSULTATION-REQUEST.JS -----