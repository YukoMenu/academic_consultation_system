// ----- START OF CONSULTATION.JS -----
const express = require('express');
const router = express.Router();
const db = require('../db/database');

// POST /api/consultation
router.post('/', (req, res) => {
  console.log('Received consultation POST data:', req.body);
  
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

  const faculty_id = req.user?.id;
  if (!faculty_id) {
    return res.status(401).json({ error: 'Not authenticated as faculty' });
  }

  if (!Array.isArray(names) || names.length === 0) {
    return res.status(400).json({ error: 'At least one name is required' });
  }

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

    let linkedCount = 0;

    // Insert each student into consultation_students
    const insertNextStudent = (index) => {
      if (index >= names.length) {
        console.log(`Finished linking ${linkedCount} out of ${names.length} students.`);
        return res.status(201).json({
          message: `Consultation saved. Linked ${linkedCount} of ${names.length} students.`,
          consultation_id
        });
      }

      const name = names[index];

      // Case-insensitive, trimmed match
      db.get(
        `SELECT id FROM users WHERE TRIM(LOWER(name)) = TRIM(LOWER(?)) AND role = 'student'`,
        [name],
        (err, row) => {
          console.log(`Searching for student: "${name}"`);
          if (err) {
            console.error(`Error finding user "${name}":`, err.message);
            return insertNextStudent(index + 1); // Skip on error
          }

          if (!row) {
            console.warn(`No user found for name "${name}". Skipping.`);
            return insertNextStudent(index + 1);
          }

          const user_id = row.id;
          console.log(`Matched student "${name}" with user_id = ${user_id}`);
          db.run(
            `INSERT INTO consultation_students (consultation_id, student_id) VALUES (?, ?)`,
            [consultation_id, user_id],
            (err) => {
              if (err) {
                console.error(`Error linking student "${name}":`, err.message);
              } else {
                console.log(`Linked student "${name}" (user_id ${user_id}) to consultation ${consultation_id}`);
                linkedCount++;
              }
              insertNextStudent(index + 1); // Continue with next
            }
          );
        }
      );
    };

    insertNextStudent(0); // Start loop
  });
});

module.exports = router;
// ----- END OF CONSULTATION.JS -----
