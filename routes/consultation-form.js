/* ----- START OF CONSULTATION-FORM.JS ----- */
const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET all consultation forms for a student (appointment history)
router.get('/', (req, res) => {
  const { student_id } = req.query;
  
  // First, verify the student exists
  db.get(`
    SELECT u.*, s.* 
    FROM users u 
    JOIN students s ON u.id = s.user_id 
    WHERE u.id = ?
  `, [student_id], (err, student) => {
    if (err || !student) {
      console.log('Student verification failed:', err || 'Not found');
      return res.status(404).json({ error: 'Student not found' });
    }

    // If student exists, run main query with LEFT JOINs
    const sql = `
      SELECT 
        cf.*,
        u_faculty.name AS faculty_name,
        cs.student_id,
        f.user_id AS faculty_user_id
      FROM consultation_students cs
      LEFT JOIN consultation_form cf ON cs.consultation_id = cf.consultation_id
      LEFT JOIN faculty f ON cf.faculty_id = f.user_id
      LEFT JOIN users u_faculty ON f.user_id = u_faculty.id
      WHERE cs.student_id = ?
      ORDER BY cf.date DESC, cf.start_time DESC
    `;
    
    console.log('Executing SQL:', sql);
    db.all(sql, [student_id], (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: err.message });
      }
      console.log('Found rows:', rows.length);
      console.log('Data:', rows);
      res.json(rows);
    });
  });
});

// GET a single consultation form by ID (for modal details)
router.get('/:id', (req, res) => {
  const id = req.params.id;
  const sql = `
    SELECT cf.*, u.name AS faculty_name
    FROM consultation_form cf
    JOIN faculty f ON cf.faculty_id = f.user_id
    JOIN users u ON f.user_id = u.id
    WHERE cf.consultation_id = ?
  `;
  db.get(sql, [id], (err, row) => {
    if (err || !row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  });
});

// GET all consultation forms for a faculty (appointment history)
router.get('/faculty', (req, res) => {
  const { faculty_id } = req.query;
  if (!faculty_id) return res.status(400).json({ error: 'Missing faculty_id' });

  const sql = `
    SELECT 
      cf.*,
      u_faculty.name AS faculty_name,
      cs.student_id
    FROM consultation_form cf
    LEFT JOIN faculty f ON cf.faculty_id = f.user_id
    LEFT JOIN users u_faculty ON f.user_id = u_faculty.id
    LEFT JOIN consultation_students cs ON cf.consultation_id = cs.consultation_id
    WHERE cf.faculty_id = ?
    ORDER BY cf.date DESC, cf.start_time DESC
  `;
  db.all(sql, [faculty_id], (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: err.message, rows: [] });
    }
    res.json(Array.isArray(rows) ? rows : []);
  });
});

module.exports = router;
/* ----- END OF CONSULTATION-FORM.JS ----- */