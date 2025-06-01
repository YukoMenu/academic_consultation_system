/* ----- START OF SUMMARY.JS ----- */
const express = require('express');
const router = express.Router();
const { generateSummary } = require('../nlp/summarize');

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

module.exports = router;
/* ----- END OF SUMMARY.JS ----- */