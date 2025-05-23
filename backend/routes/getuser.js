// ----- START OF getuser.js -----
const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET student details by user_id
router.get('/students/:id', (req, res) => {
    const sql = `SELECT * FROM students WHERE user_id = ?`;
    db.get(sql, [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row || {});
    });
});

// GET faculty details by user_id
router.get('/faculty/:id', (req, res) => {
    const sql = `SELECT * FROM faculty WHERE user_id = ?`;
    db.get(sql, [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row || {});
    });
});

module.exports = router;
// ----- END OF getuser.js -----