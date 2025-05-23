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

module.exports = router;
// ----- END OF USERS.JS -----