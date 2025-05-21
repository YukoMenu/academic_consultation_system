// ----- START OF DADTABASE.JS -----
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database(__dirname + '/database.db', (err) => {
    if (err) {
        console.error('Failed to connect to database:', err.message);
    } else {
        console.log('Connected to existing SQLite database.');
    }
});

module.exports = db;
// ----- ENND OF DATABASE.JS -----