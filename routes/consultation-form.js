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
    db.all(sql, [student_id], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    });
  });
});

// GET all consultation forms for a faculty (appointment history)
router.get('/faculty', (req, res) => {
  const { faculty_id } = req.query;
  if (!faculty_id) return res.status(400).json({ error: 'Missing faculty_id' });

  const sql = `
      SELECT 
          cf.*,
          GROUP_CONCAT(u_student.name) as student_names
      FROM consultation_form cf
      LEFT JOIN consultation_students cs ON cf.consultation_id = cs.consultation_id
      LEFT JOIN users u_student ON cs.student_id = u_student.id
      WHERE cf.faculty_id = ?
      GROUP BY cf.consultation_id
      ORDER BY cf.date DESC, cf.start_time DESC
  `;

  db.all(sql, [faculty_id], (err, rows) => {
      if (err) {
          return res.status(500).json({ error: 'Database error' });
      }
      res.json(rows);
  });
});

// GET /api/consultation-form/summary-source?year_level=...&college_term=... OR &bed_shs_term=...
router.get('/summary-source', (req, res) => {

  const { year_level, college_term, bed_shs_term } = req.query;

  // Validate required parameters
  if (!year_level || (!college_term && !bed_shs_term)) {
    console.warn('Missing required parameters:', { year_level, college_term, bed_shs_term });
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  // Determine the term value
  const term = college_term
    ? (college_term === 'PreFinal' ? 'Final' : college_term)
    : bed_shs_term;
  console.log('Resolved term value:', term);

  // Prepare the SQL query
  const sql = `
    WITH ConsultationStats AS (
      SELECT 
        cf.consultation_id,
        cf.course_concerns,
        cf.intervention,
        cf.nature_of_concerns,
        ROUND(
          (JULIANDAY(cf.end_time) - JULIANDAY(cf.start_time)) * 24.0,
          1
        ) as duration_hours,
        s.year_level,
        cs.student_id
      FROM consultation_form cf
      JOIN consultation_students cs ON cf.consultation_id = cs.consultation_id
      JOIN students s ON cs.student_id = s.user_id
      WHERE s.year_level = ?
      AND cf.term = ?
    )
    SELECT 
      COUNT(DISTINCT student_id) as number_of_students,
      ROUND(SUM(duration_hours), 1) as total_hours,
      GROUP_CONCAT(DISTINCT course_concerns) as course_concerns,
      GROUP_CONCAT(DISTINCT intervention) as intervention,
      GROUP_CONCAT(DISTINCT nature_of_concerns) as nature_of_concerns
    FROM ConsultationStats;
  `;

  // Execute the query
  db.get(sql, [parseInt(year_level), term], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    // If no result or zero students, respond with 404 or empty data
    if (!result || result.number_of_students === 0) {
      console.warn('No matching records found.');
      return res.status(404).json({ error: 'Not found' });
    }

    // Prepare the response object
    const response = {
      number_of_students: result.number_of_students,
      total_hours: result.total_hours,
      course_concerns: (result.course_concerns || '').split(',').filter(Boolean),
      intervention: (result.intervention || '').split(',').filter(Boolean),
      nature_of_concerns: (result.nature_of_concerns || '').split(',').filter(Boolean)
    };

    res.json(response);
  });
});

router.post('/save-summary', (req, res) => {
  const {
    school,
    year_level,
    academic_year,
    college_term,
    bed_shs_term,
    number_of_students,
    total_hours,
    summary_report
  } = req.body;

  const faculty_id = req.user?.id; // Make sure req.user is set via session

  const sql = `
    INSERT INTO consultation_summary (
      school,
      year_level,
      academic_year,
      college_term,
      bed_shs_term,
      number_of_students,
      total_hours,
      summary_report,
      faculty_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    school,
    year_level,
    academic_year,
    college_term || null,
    bed_shs_term || null,
    number_of_students,
    total_hours,
    summary_report,
    faculty_id
  ];

  db.run(sql, params, function(err) {
    if (err) {
      console.error('Error saving summary:', err);
      return res.status(500).json({ error: 'Failed to save summary' });
    }
    res.json({ 
      success: true, 
      id: this.lastID,
      message: 'Summary saved successfully' 
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

        // Fetch students for the consultation
        const studentSql = `
            SELECT s.user_id, u.name
            FROM consultation_students cs
            JOIN students s ON cs.student_id = s.user_id
            JOIN users u ON s.user_id = u.id
            WHERE cs.consultation_id = ?
        `;
        db.all(studentSql, [id], (err, students) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ ...row, students });
        });
    });
});

module.exports = router;
/* ----- END OF CONSULTATION-FORM.JS ----- */