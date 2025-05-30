// ----- START OF CLASS-LIST.JS -----
const express = require("express");
const router = express.Router();
const db = require("../db/database"); // your SQLite setup

router.get("/", async (req, res) => {
  if (!req.session.user || req.session.user.user_type !== "faculty") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const stmt = db.prepare(`
      SELECT class_code, class_name 
      FROM classes 
      WHERE faculty_id = ?
    `);
    const classes = stmt.all(req.session.user.id);
    res.json(classes);
  } catch (err) {
    res.status(500).json({ error: "Database error", details: err.message });
  }
});

module.exports = router;
// ----- END OF CLASS-LIST.JS -----