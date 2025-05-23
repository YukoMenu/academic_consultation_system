// ----- START OF setuser.js -----
const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET user by ID with role-specific details
router.get('/:id', (req, res) => {
    const userId = req.params.id;
    const sql = `SELECT * FROM users WHERE id = ?`;

    db.get(sql, [userId], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (user.role === 'student') {
            db.get(`SELECT program, year_level FROM students WHERE user_id = ?`, [userId], (err, student) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ ...user, ...student });
            });
        } else if (user.role === 'faculty') {
            db.get(`SELECT department, specialization FROM faculty WHERE user_id = ?`, [userId], (err, faculty) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ ...user, ...faculty });
            });
        } else {
            res.json(user);
        }
    });
});

// UPDATE user and role-specific details
router.put('/:id', (req, res) => {
    const userId = req.params.id;
    const { name, email, role, program, year_level, department, specialization } = req.body;

    const updateUserSql = `UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?`;
    db.run(updateUserSql, [name, email, role, userId], function(err) {
        if (err) return res.status(500).json({ error: err.message });

        if (role === 'student') {
            const updateStudentSql = `
                INSERT INTO students (user_id, program, year_level)
                VALUES (?, ?, ?)
                ON CONFLICT(user_id) DO UPDATE SET
                    program = excluded.program,
                    year_level = excluded.year_level
            `;
            db.run(updateStudentSql, [userId, program || '', year_level || 1], err => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: 'Student updated successfully' });
            });
        } else if (role === 'faculty') {
            const updateFacultySql = `
                INSERT INTO faculty (user_id, department, specialization)
                VALUES (?, ?, ?)
                ON CONFLICT(user_id) DO UPDATE SET
                    department = excluded.department,
                    specialization = excluded.specialization
            `;
            db.run(updateFacultySql, [userId, department || '', specialization || ''], err => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: 'Faculty updated successfully' });
            });
        } else {
            res.json({ message: 'User updated successfully' });
        }
    });
});

// DELETE user and associated student/faculty record
router.delete('/:id', (req, res) => {
    const userId = req.params.id;

    db.get(`SELECT role FROM users WHERE id = ?`, [userId], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'User not found' });

        const deleteUser = () => {
            db.run(`DELETE FROM users WHERE id = ?`, [userId], err => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: `${row.role} deleted successfully` });
            });
        };

        if (row.role === 'student') {
            db.run(`DELETE FROM students WHERE user_id = ?`, [userId], err => {
                if (err) return res.status(500).json({ error: err.message });
                deleteUser();
            });
        } else if (row.role === 'faculty') {
            db.run(`DELETE FROM faculty WHERE user_id = ?`, [userId], err => {
                if (err) return res.status(500).json({ error: err.message });
                deleteUser();
            });
        } else {
            deleteUser();
        }
    });
});

module.exports = router;
// ----- END OF setuser.js -----