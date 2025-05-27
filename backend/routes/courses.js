// ----- START OF COURSES.JS -----
const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const dataPath = path.join(__dirname, '../data/courses.json');

// GET all courses
router.get('/', (req, res) => {
  const courses = JSON.parse(fs.readFileSync(dataPath));
  res.json(courses);
});

// ADD a course
router.post('/', (req, res) => {
  const courses = JSON.parse(fs.readFileSync(dataPath));
  const newCourse = req.body;
  courses.push(newCourse);
  fs.writeFileSync(dataPath, JSON.stringify(courses, null, 2));
  res.status(201).json(newCourse);
});

// DELETE a course by ID
router.delete('/:id', (req, res) => {
  let courses = JSON.parse(fs.readFileSync(dataPath));
  const courseId = req.params.id;
  courses = courses.filter(c => c.id !== courseId);
  fs.writeFileSync(dataPath, JSON.stringify(courses, null, 2));
  res.status(200).json({ message: 'Deleted successfully' });
});

module.exports = router;
// ----- END OF COURSES.JS -----