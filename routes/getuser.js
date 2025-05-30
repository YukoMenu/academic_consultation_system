// ----- START OF getuser.js -----
const express = require('express');
const router = express.Router();
const db = require('../db/database');
const bcrypt = require('bcrypt');

// GET user by ID (general info)
router.get('/:id', (req, res) => {
    const sql = `SELECT id, name, email FROM users WHERE id = ?`;
    db.get(sql, [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row || {});
    });
});

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

// REMOVE or comment out this block:
/*
router.put('/update/:id', (req, res) => {
    const { name, password } = req.body;
    if (!name && !password) {
        return res.status(400).json({ error: 'No fields to update' });
    }
    const updates = [];
    const values = [];
    if (name) {
        updates.push(`name = ?`);
        values.push(name);
    }
    if (password) {
        updates.push(`password = ?`);
        values.push(password);
    }
    values.push(req.params.id);
    const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    db.run(sql, values, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'User updated successfully' });
    });
});
*/

// KEEP this async version:
router.put('/update/:id', async (req, res) => {
    const userId = req.params.id;
    const newPassword = req.body.password;
    if (!newPassword) {
        return res.status(400).json({ error: "New password is required" });
    }
    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const sql = `UPDATE users SET password = ? WHERE id = ?`;
        db.run(sql, [hashedPassword, userId], function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(200).json({ message: "Password updated successfully" });
        });
    } catch (err) {
        res.status(500).json({ error: "Failed to hash password" });
    }
});

function getUserById(id) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM users WHERE id = ?';
        db.get(sql, [id], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

// POST /api/getuser/verify-password/:id
router.post('/verify-password/:id', async (req, res) => {
    const { oldPassword } = req.body;
    const userId = req.params.id;

    try {
        const user = await getUserById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Password does not match" });
        }

        return res.status(200).json({ message: "Password verified" });
    } catch (err) {
        return res.status(500).json({ message: "Server error", error: err.message });
    }
});

// PUT /api/getuser/changepassword/:id
router.put('/changepassword/:id', async (req, res) => {
    const { newPassword } = req.body;
    const userId = req.params.id;

    if (!newPassword) {
        return res.status(400).json({ error: "New password is required" });
    }

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const sql = `UPDATE users SET password = ? WHERE id = ?`;
        db.run(sql, [hashedPassword, userId], function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(200).json({ message: "Password updated successfully" });
        });
    } catch (err) {
        res.status(500).json({ error: "Failed to hash password" });
    }
});

module.exports = router;
// ----- END OF getuser.js -----