// ----- START OF CONSULTATION.JS -----

const express = require('express');
const router = express.Router();
const db = require('../db/database');

// POST /api/consultation
router.post('/', (req, res) => {
  const {
    names,
    date,
    start_time,
    end_time,
    program,
    course_code,
    venue,
    term,
    course_concerns,
    intervention,
    nature_of_concerns
  } = req.body;

  const faculty_id = 1; // Replace this with actual logic based on logged-in user

  const insertFormQuery = `
    INSERT INTO consultation_form (
      faculty_id,
      date,
      program,
      venue,
      start_time,
      end_time,
      course_code,
      term,
      course_concerns,
      intervention,
      nature_of_concerns
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    faculty_id,
    date,
    program,
    venue,
    start_time,
    end_time,
    course_code,
    term,
    course_concerns,
    intervention,
    nature_of_concerns
  ];

  db.run(insertFormQuery, values, function(err) {
    if (err) {
      console.error('Error inserting consultation:', err.message);
      return res.status(500).json({ error: 'Database error' });
    }

    const consultation_id = this.lastID;
    console.log('Inserted consultation ID:', consultation_id);

    // Here you might insert student names into consultation_students (optional)
    console.log('Consultation saved!');
    res.status(201).json({ message: 'Consultation saved', consultation_id });
  });
});

module.exports = router;
// ----- END OF CONSULTATION.JS -----
