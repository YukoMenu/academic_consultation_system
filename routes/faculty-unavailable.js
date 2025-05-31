// ----- START OF FACULTY-UNAVAILABLE.JS -----
const express = require('express');
const router = express.Router();
const db = require('../db/database');

// Get unavailable days for a faculty (month)
router.get('/:faculty_id', (req, res) => {
  const { faculty_id } = req.params;
  const { month } = req.query; // e.g. '2025-05'
  db.all(
    `SELECT date FROM faculty_unavailable_days WHERE faculty_id = ? AND date LIKE ?`,
    [faculty_id, `${month}%`],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows.map(r => r.date));
    }
  );
});

// Set a day as unavailable
router.post('/', (req, res) => {
  const { faculty_id, date } = req.body;
  db.run(
    `INSERT OR IGNORE INTO faculty_unavailable_days (faculty_id, date) VALUES (?, ?)`,
    [faculty_id, date],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

// Remove unavailable day
router.delete('/', (req, res) => {
  const { faculty_id, date } = req.body;
  db.run(
    `DELETE FROM faculty_unavailable_days WHERE faculty_id = ? AND date = ?`,
    [faculty_id, date],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

module.exports = router;
// ----- END OF FACULTY-UNAVAILABLE.JS -----