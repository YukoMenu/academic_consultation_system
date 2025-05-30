const bcrypt = require('bcrypt');
const db = require('./db/database');

const name = 'Admin';
const email = 'admin@example.com';
const plainPassword = 'q';
const role = 'admin';

bcrypt.hash(plainPassword, 10, (err, hashedPassword) => {
  if (err) throw err;

  db.run(
    `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
    [name, email, hashedPassword, role],
    function (err) {
      if (err) return console.error(err.message);
      console.log(`Admin created with ID: ${this.lastID}`);
    }
  );
});