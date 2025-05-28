// ----- START OF USERS.JS -----
const express = require('express');
const router = express.Router();
const db = require('../db/database');
const bcrypt = require('bcrypt');

// GET all users
router.get('/', (req, res) => {
    const sql = 'SELECT * FROM users';
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error(err.message);
            res.status(500).json({ error: err.message });
        } else {
            res.json({ data: rows });
        }
    });
});

// Register user (extended: adds to students or faculty table based on role)
router.post('/', async (req, res) => {
    const { name, email, password, role, program, year_level, department, specialization } = req.body;

    if (!name || !email || !password || !role) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`;
        db.run(sql, [name, email, hashedPassword, role], function(err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(409).json({ error: 'Email already registered' });
                }
                return res.status(500).json({ error: err.message });
            }

            const userId = this.lastID;

            if (role === 'student') {
                const insertStudentSql = `
                    INSERT INTO students (user_id, program, year_level)
                    VALUES (?, ?, ?)
                `;
                db.run(insertStudentSql, [userId, program || '', year_level || 1], function(err) {
                    if (err) {
                        console.error('Error inserting into students table:', err.message);
                        return res.status(500).json({ error: 'Failed to insert student record' });
                    }

                    return res.status(201).json({
                        message: 'Student registered successfully',
                        user: { id: userId, name, email, role }
                    });
                });
            } else if (role === 'faculty') {
                const insertFacultySql = `
                    INSERT INTO faculty (user_id, department, specialization)
                    VALUES (?, ?, ?)
                `;
                db.run(insertFacultySql, [userId, department || '', specialization || ''], function(err) {
                    if (err) {
                        console.error('Error inserting into faculty table:', err.message);
                        return res.status(500).json({ error: 'Failed to insert faculty record' });
                    }

                    return res.status(201).json({
                        message: 'Faculty registered successfully',
                        user: { id: userId, name, email, role }
                    });
                });
            } else {
                return res.status(201).json({
                    message: 'User registered successfully',
                    user: { id: userId, name, email, role }
                });
            }
        });
    } catch (err) {
        console.error('Server error:', err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET all faculty users
router.get('/faculty', (req, res) => {
    const sql = `SELECT users.*, faculty.department, faculty.specialization
                 FROM users
                 JOIN faculty ON users.id = faculty.user_id
                 WHERE users.role = 'faculty'`;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// GET all student users
router.get('/students', (req, res) => {
    const sql = `SELECT users.*, students.program, students.year_level
                 FROM users
                 JOIN students ON users.id = students.user_id
                 WHERE users.role = 'student'`;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Get single user by ID (with joined student/faculty info)
router.get('/getuser/:id', (req, res) => {
    const id = req.params.id;

    // Query user base info
    const userSql = `SELECT * FROM users WHERE id = ?`;
    db.get(userSql, [id], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Based on role, join student or faculty info
        if (user.role === 'student') {
            const studentSql = `SELECT program, year_level FROM students WHERE user_id = ?`;
            db.get(studentSql, [id], (err, student) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ ...user, ...student });
            });
        } else if (user.role === 'faculty') {
            const facultySql = `SELECT department, specialization FROM faculty WHERE user_id = ?`;
            db.get(facultySql, [id], (err, faculty) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ ...user, ...faculty });
            });
        } else {
            res.json(user);
        }
    });
});

// Update user basic info by ID (name, email, optionally password)
router.put('/getuser/update/:id', async (req, res) => {
    const id = req.params.id;
    const { name, email, password } = req.body;

    if (!name || !email) {
        return res.status(400).json({ error: 'Name and email are required' });
    }

    try {
        // Check if email is already used by other users
        const emailCheckSql = `SELECT id FROM users WHERE email = ? AND id != ?`;
        db.get(emailCheckSql, [email, id], async (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (row) return res.status(409).json({ error: 'Email already in use' });

            // Hash password if provided
            let hashedPassword = null;
            if (password) {
                const bcrypt = require('bcrypt');
                hashedPassword = await bcrypt.hash(password, 10);
            }

            // Update SQL and params
            let updateSql, params;
            if (hashedPassword) {
                updateSql = `UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?`;
                params = [name, email, hashedPassword, id];
            } else {
                updateSql = `UPDATE users SET name = ?, email = ? WHERE id = ?`;
                params = [name, email, id];
            }

            db.run(updateSql, params, function(err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: 'User updated successfully' });
            });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
// ----- END OF USERS.JS -----