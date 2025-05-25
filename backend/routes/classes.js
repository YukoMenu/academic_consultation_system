// ----- START OF CLASSES.JS -----
const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET all classes with faculty and students
router.get('/', (req, res) => {
  db.all('SELECT * FROM classes', [], async (err, classRows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch classes' });

    const results = await Promise.all(classRows.map(async (cls) => {
      const faculty = await new Promise((resolve) => {
        db.all(`
          SELECT u.id, u.name, u.email
          FROM class_faculty cf
          JOIN users u ON u.id = cf.faculty_id
          WHERE cf.class_id = ?
        `, [cls.id], (_, rows) => resolve(rows));
      });

      const students = await new Promise((resolve) => {
        db.all(`
          SELECT u.id, u.name, u.email
          FROM class_students cs
          JOIN users u ON u.id = cs.student_id
          WHERE cs.class_id = ?
        `, [cls.id], (_, rows) => resolve(rows));
      });

      return { ...cls, faculty, students };
    }));

    res.json(results);
  });
});

// GET a specific class
router.get('/:id', (req, res) => {
  const classId = req.params.id;

  db.get('SELECT * FROM classes WHERE id = ?', [classId], (err, cls) => {
    if (err || !cls) return res.status(404).json({ error: 'Class not found' });

    const getFaculty = new Promise((resolve) => {
      db.all(`
        SELECT u.id, u.name, u.email
        FROM class_faculty cf
        JOIN users u ON u.id = cf.faculty_id
        WHERE cf.class_id = ?
      `, [classId], (_, rows) => resolve(rows));
    });

    const getStudents = new Promise((resolve) => {
      db.all(`
        SELECT u.id, u.name, u.email
        FROM class_students cs
        JOIN users u ON u.id = cs.student_id
        WHERE cs.class_id = ?
      `, [classId], (_, rows) => resolve(rows));
    });

    Promise.all([getFaculty, getStudents]).then(([faculty, students]) => {
      res.json({ ...cls, faculty, students });
    });
  });
});

// POST a new class
router.post('/', (req, res) => {
  const { class_code, class_name, description, faculty_ids, student_ids } = req.body;

  if (!class_code || !class_name || !Array.isArray(faculty_ids) || !Array.isArray(student_ids)) {
    return res.status(400).json({ error: 'Missing or invalid fields' });
  }

  db.run(
    'INSERT INTO classes (class_code, class_name, description) VALUES (?, ?, ?)',
    [class_code, class_name, description],
    function (err) {
      console.log('Inserting class with data:', {
        class_code,
        class_name,
        description
      });

      if (err) {
        console.error('DB Insert Error:', err.message);
        return res.status(500).json({ error: 'Failed to create class', details: err.message });
      }

      const classId = this.lastID;
      console.log('Class inserted with ID:', classId);
      console.log('Faculty IDs:', faculty_ids);
      console.log('Student IDs:', student_ids);

      if (faculty_ids.length > 0) {
        const insertFaculty = db.prepare('INSERT INTO class_faculty (class_id, faculty_id) VALUES (?, ?)');
        faculty_ids.forEach(facultyId => {
          console.log(`Inserting into class_faculty: (${classId}, ${facultyId})`);
          insertFaculty.run(classId, facultyId);
        });
        insertFaculty.finalize();
      }

      if (student_ids.length > 0) {
        const insertStudents = db.prepare('INSERT INTO class_students (class_id, student_id) VALUES (?, ?)');
        student_ids.forEach(studentId => {
          console.log(`Inserting into class_students: (${classId}, ${studentId})`);
          insertStudents.run(classId, studentId);
        });
        insertStudents.finalize();
      }

      res.status(201).json({ message: 'Class created successfully', class_id: classId });
    }
  );
});

// DELETE a class
router.delete('/:id', (req, res) => {
  const classId = req.params.id;
  db.run('DELETE FROM classes WHERE id = ?', [classId], function (err) {
    if (err) return res.status(500).json({ error: 'Failed to delete class' });
    res.json({ message: 'Class deleted', changes: this.changes });
  });
});

module.exports = router;
// ----- END OF CLASSES.JS -----