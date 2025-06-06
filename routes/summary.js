/* ----- START OF SUMMARY.JS ----- */
const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { generateSummary } = require('../nlp/summarize');

// GET saved summaries from database with filters
router.get('/saved', (req, res) => {
  const { academic_year, college_term, bed_shs_term } = req.query;
  const faculty_id = req.user?.id; // Get from session

  let sql = `SELECT * FROM consultation_summary`;
  const params = [];
  const conditions = [];

  if (faculty_id) {
    conditions.push('faculty_id = ?');
    params.push(faculty_id);
  }
  if (academic_year) {
    conditions.push('academic_year = ?');
    params.push(academic_year);
  }
  if (college_term) {
    conditions.push('college_term = ?');
    params.push(college_term);
  }
  if (bed_shs_term) {
    conditions.push('bed_shs_term = ?');
    params.push(bed_shs_term);
  }

  if (conditions.length) {
    sql += ` WHERE ${conditions.join(' AND ')}`;
  }

  sql += ` ORDER BY date_created DESC`;

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Keep existing route for summary generation
router.get('/', (req, res) => {
  const { academic_year, college_term, bed_shs_term } = req.query;

  // Filter mock data accordingly
  let results = summaryReports;

  if (academic_year) {
    results = results.filter(r => r.academic_year === academic_year);
  }
  if (college_term) {
    results = results.filter(r => r.college_term === college_term);
  }
  if (bed_shs_term) {
    results = results.filter(r => r.bed_shs_term === bed_shs_term);
  }

  res.json(results);
});

// Keep existing POST route for generating summaries
router.post('/', async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  try {
    const summary = await generateSummary(text);
    res.json({ summary });
  } catch (err) {
    console.error('Error generating summary:', err.message);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

// Get a specific saved summary by ID
router.get('/saved/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM consultation_summary WHERE id = ?', [id], (err, row) => {
    if (err || !row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  });
});

module.exports = router;
/* ----- END OF SUMMARY.JS ----- */