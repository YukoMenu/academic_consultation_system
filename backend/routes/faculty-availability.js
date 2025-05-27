// ----- START OF FACULTY-AVAILABILITY.JS -----
const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET availability for a faculty member
router.get('/:faculty_id', (req, res) => {
  const facultyId = req.params.faculty_id;
  db.all('SELECT * FROM faculty_availability WHERE faculty_id = ?', [facultyId], (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Failed to fetch availability' });
    }
    res.json(rows);
  });
});

// POST new availability
router.post('/', (req, res) => {
  const { faculty_id, availability } = req.body;

  if (!Array.isArray(availability) || typeof faculty_id !== 'number') {
    return res.status(400).json({ error: 'Missing or invalid fields' });
  }

  const stmt = db.prepare(`
    INSERT INTO faculty_availability (faculty_id, day_of_week, start_time, end_time, course)
    VALUES (?, ?, ?, ?, ?)
  `);

  try {
    db.serialize(() => {
      availability.forEach(entry => {
        if (
          typeof entry.day_of_week === 'number' &&
          entry.start_time &&
          entry.end_time &&
          entry.course
        ) {
          stmt.run(faculty_id, entry.day_of_week, entry.start_time, entry.end_time, entry.course);
        }
      });
    });

    stmt.finalize();
    res.status(201).json({ message: 'Availability saved successfully' });
  } catch (err) {
    console.error('Error inserting availability:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// PUT: update a single availability entry
router.put('/:id', (req, res) => {
  const id = req.params.id;
  const { course, day_of_week, start_time, end_time } = req.body;

  if (
    typeof day_of_week !== 'number' ||
    !start_time || !end_time || !course
  ) {
    return res.status(400).json({ error: 'Missing or invalid fields' });
  }

  const query = `
    UPDATE faculty_availability
    SET course = ?, day_of_week = ?, start_time = ?, end_time = ?
    WHERE id = ?
  `;

  db.run(query, [course, day_of_week, start_time, end_time, id], function (err) {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Failed to update availability' });
    }

    res.json({ message: 'Availability updated', changes: this.changes });
  });
});

// Optional: DELETE availability
router.delete('/:id', (req, res) => {
  const id = req.params.id;
  db.run('DELETE FROM faculty_availability WHERE id = ?', [id], function (err) {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Failed to delete availability' });
    }
    res.json({ message: 'Availability deleted', changes: this.changes });
  });
});

module.exports = router;
// ----- END OF FACULTY-AVAILABILITY.JS -----