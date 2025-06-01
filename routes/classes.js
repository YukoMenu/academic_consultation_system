// ----- START OF CLASSES.JS -----
console.log('classes route loaded');
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

// GET all classes assigned to the logged-in faculty
router.get('/faculty', (req, res) => {
  const facultyId = req.user.id;

  db.all(`
    SELECT c.*
    FROM classes c
    JOIN class_faculty cf ON c.id = cf.class_id
    WHERE cf.faculty_id = ?
  `, [facultyId], async (err, classRows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch classes' });

    const results = await Promise.all(classRows.map(async (cls) => {
      const students = await new Promise((resolve) => {
        db.all(`
          SELECT u.id, u.name, u.email
          FROM class_students cs
          JOIN users u ON u.id = cs.student_id
          WHERE cs.class_id = ?
        `, [cls.id], (_, rows) => resolve(rows));
      });

      return { ...cls, students }; // omit faculty list here if not needed
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
  const user = req.user;
  const isFaculty = user.role === 'faculty';
  const isAdmin = user.role === 'admin';

  let { class_code, class_name, description, faculty_ids, student_ids } = req.body;

  console.log('Incoming POST /classes:', {
    user,
    body: req.body
  });

  // Faculty override
  if (isFaculty) {
    faculty_ids = [user.id];
  }

  // Validate input
  if (
    !class_code || 
    !class_name || 
    !Array.isArray(faculty_ids) || 
    !Array.isArray(student_ids)
  ) {
    return res.status(400).json({ error: 'Missing or invalid fields' });
  }

  db.run(
    'INSERT INTO classes (class_code, class_name, description) VALUES (?, ?, ?)',
    [class_code, class_name, description],
    function (err) {
      if (err) {
        console.error('DB Insert Error:', err.message);
        return res.status(500).json({ error: 'Failed to create class', details: err.message });
      }

      const classId = this.lastID;
      console.log('Inserted class ID:', classId);

      // Insert faculty
      const insertFaculty = db.prepare('INSERT INTO class_faculty (class_id, faculty_id) VALUES (?, ?)');
      for (const fid of faculty_ids) {
        insertFaculty.run(classId, fid, err => {
          if (err) console.error('Insert class_faculty error:', err.message);
        });
      }
      insertFaculty.finalize();

      // Insert students
      const insertStudents = db.prepare('INSERT INTO class_students (class_id, student_id) VALUES (?, ?)');
      for (const sid of student_ids) {
        insertStudents.run(classId, sid, err => {
          if (err) console.error('Insert class_students error:', err.message);
        });
      }
      insertStudents.finalize();

      res.status(201).json({ message: 'Class created successfully', class_id: classId });
    }
  );
});

// DELETE a class along with related entries in join tables
router.delete('/:id', (req, res) => {
  const classId = req.params.id;
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    db.run('DELETE FROM class_faculty WHERE class_id = ?', [classId], function(err) {
      if (err) {
        db.run('ROLLBACK');
        return res.status(500).json({ error: 'Failed to delete class faculty' });
      }
      
      db.run('DELETE FROM class_students WHERE class_id = ?', [classId], function(err) {
        if (err) {
          db.run('ROLLBACK');
          return res.status(500).json({ error: 'Failed to delete class students' });
        }

        db.run('DELETE FROM classes WHERE id = ?', [classId], function(err) {
          if (err) {
            db.run('ROLLBACK');
            return res.status(500).json({ error: 'Failed to delete class' });
          }

          db.run('COMMIT');
          return res.json({ message: 'Class and related data deleted' });
        });
      });
    });
  });
});

// UPDATE a class
router.put('/:id', (req, res) => {
  const classId = req.params.id;
  const { class_code, class_name, description, faculty_ids, student_ids } = req.body;

  if (!class_code || !class_name || !Array.isArray(faculty_ids) || !Array.isArray(student_ids)) {
    return res.status(400).json({ error: 'Missing or invalid fields' });
  }

  // Update class info
  db.run(
    'UPDATE classes SET class_code = ?, class_name = ?, description = ? WHERE id = ?',
    [class_code, class_name, description, classId],
    function (err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Class code already exists' });
        }

        console.error('DB Update Error:', err.message);
        return res.status(500).json({ error: 'Failed to update class', details: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Class not found' });
      }

      // Continue with clearing and reinserting faculty/students
      db.run('DELETE FROM class_faculty WHERE class_id = ?', [classId]);
      db.run('DELETE FROM class_students WHERE class_id = ?', [classId]);

      if (faculty_ids.length > 0) {
        const insertFaculty = db.prepare('INSERT INTO class_faculty (class_id, faculty_id) VALUES (?, ?)');
        faculty_ids.forEach(fid => insertFaculty.run(classId, fid));
        insertFaculty.finalize();
      }

      if (student_ids.length > 0) {
        const insertStudents = db.prepare('INSERT INTO class_students (class_id, student_id) VALUES (?, ?)');
        student_ids.forEach(sid => insertStudents.run(classId, sid));
        insertStudents.finalize();
      }

      res.json({ message: 'Class updated successfully' });
    }
  );
});

module.exports = router;
// ----- END OF CLASSES.JS -----