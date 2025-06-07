// ----- START OF CONSULTATION-REQUEST.JS -----
const express = require('express');
const router = express.Router();
const db = require('../db/database');

// POST /api/consultation-request
router.post('/', (req, res) => {
  const { faculty_id, course_code, date_requested, start_time, end_time, program, reason, term, student_ids } = req.body;

  if (!faculty_id || !course_code || !date_requested || !start_time || !end_time || !program || !reason || !term || !Array.isArray(student_ids) || student_ids.length === 0) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Filter out any null/undefined/empty student_ids
  const validStudentIds = student_ids.filter(id => id !== null && id !== undefined);

  if (validStudentIds.length !== student_ids.length) {
    return res.status(400).json({ error: 'One or more student IDs are invalid.' });
  }

  const sql = `
    INSERT INTO consultation_requests
    (faculty_id, course_code, date_requested, start_time, end_time, program, reason, term, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
  `;
  const params = [
    faculty_id,
    course_code,
    date_requested,
    start_time,
    end_time,
    program,
    reason,
    term
  ];

  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
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
  });
});

// GET all consultation requests (optionally filter by faculty or student)
router.get('/', (req, res) => {
  const { faculty_id, student_id, status } = req.query;
  let sql = `
    SELECT cr.*
    FROM consultation_requests cr
    WHERE 1=1
      AND cr.date_requested >= DATE('now')
      AND (cr.status IS NULL OR cr.status != 'closed')
  `;
  const params = [];
  if (faculty_id) {
    sql += ' AND cr.faculty_id = ?';
    params.push(faculty_id);
  }
  if (status) {
    sql += ' AND cr.status = ?';
    params.push(status);
  }
  // ...add other filters as needed...

  sql += ' ORDER BY cr.date_requested DESC';

  // 1. Get all requests
  db.all(sql, params, (err, requests) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!requests.length) return res.json([]);

    // 2. For each request, get students
    const reqIds = requests.map(r => r.id);
    db.all(
      `SELECT crs.consultation_request_id, u.id, u.name
       FROM consultation_requests_students crs
       JOIN users u ON crs.student_id = u.id
       WHERE crs.consultation_request_id IN (${reqIds.map(() => '?').join(',')})`,
      reqIds,
      (err2, students) => {
        if (err2) return res.status(500).json({ error: err2.message });
        // Group students by request
        const studentsByReq = {};
        students.forEach(s => {
          if (!studentsByReq[s.consultation_request_id]) studentsByReq[s.consultation_request_id] = [];
          studentsByReq[s.consultation_request_id].push({ id: s.id, name: s.name });
        });
        // Attach to each request
        requests.forEach(r => {
          r.students = studentsByReq[r.id] || [];
        });
        res.json(requests);
      }
    );
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

// GET upcoming appointments and recent scheduled appointments for a student
router.get('/student/:student_id/dashboard', (req, res) => {
  const studentId = req.params.student_id;
  const now = new Date();
  const today = now.toISOString().slice(0, 10); // Get today's date in YYYY-MM-DD format

  // Fetch upcoming appointments (accepted or pending)
  const upcomingAppointmentsQuery = `
    SELECT cr.id, cr.date_requested, cr.time_requested, cr.course_code, u.name AS faculty_name
    FROM consultation_requests cr
    JOIN consultation_requests_students crs ON cr.id = crs.consultation_request_id
    JOIN users u ON cr.faculty_id = u.id
    WHERE crs.student_id = ?
    AND cr.date_requested >= ?
    AND cr.status IN ('accepted', 'pending')
    ORDER BY cr.date_requested, cr.time_requested
    LIMIT 5;
  `;

  // Fetch recent scheduled appointments (accepted or rejected in the last 7 days)
  const recentAppointmentsQuery = `
    SELECT cr.id, cr.date_requested, cr.time_requested, cr.course_code, u.name AS faculty_name, cr.status
    FROM consultation_requests cr
    JOIN consultation_requests_students crs ON cr.id = crs.consultation_request_id
    JOIN users u ON cr.faculty_id = u.id
    WHERE crs.student_id = ?
    AND cr.date_closed BETWEEN DATE(?, '-7 days') AND ?
    AND cr.status IN ('accepted', 'rejected')
    ORDER BY cr.date_closed DESC
    LIMIT 5;
  `;

  db.all(upcomingAppointmentsQuery, [studentId, today], (err, upcomingAppointments) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    db.all(recentAppointmentsQuery, [studentId, today, today], (err, recentAppointments) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({
        upcomingAppointments: upcomingAppointments,
        recentAppointments: recentAppointments
      });
    });
  });
});

// GET a single consultation request by ID (with students)
router.get('/:id', (req, res) => {
  const id = req.params.id;
  db.get(
    `SELECT * FROM consultation_requests WHERE id = ?`,
    [id],
    (err, request) => {
      if (err || !request) return res.status(404).json({ error: 'Not found' });

      // Get students for this request
      db.all(
        `SELECT u.id, u.name FROM consultation_requests_students crs
         JOIN users u ON crs.student_id = u.id
         WHERE crs.consultation_request_id = ?`,
        [id],
        (err2, students) => {
          if (err2) return res.status(500).json({ error: err2.message });
          // Attach students array to the request object
          request.students = students || [];
          res.json(request);
        }
      );
    }
  );
});

module.exports = router;
// ----- END OF CONSULTATION-REQUEST.JS -----