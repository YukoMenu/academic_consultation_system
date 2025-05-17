const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to an existing SQLite database created with SQLiteStudio
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Failed to connect to database:', err.message);
    } else {
        console.log('Connected to existing SQLite database.');
    }
});

// Example GET route: Fetch all users
app.get('/users', (req, res) => {
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

// Example POST route: Add a new user
app.post('/users', (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }

    const sql = 'INSERT INTO users (name) VALUES (?)';
    db.run(sql, [name], function (err) {
        if (err) {
            console.error(err.message);
            res.status(500).json({ error: err.message });
        } else {
            res.status(201).json({ id: this.lastID, name });
        }
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
