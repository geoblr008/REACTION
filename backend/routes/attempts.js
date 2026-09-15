const express = require("express");
const db = require("../db");

const router = express.Router();

// POST /api/attempts  { question_id, topic, difficulty, question_text, submitted_answer, is_correct }
router.post("/", (req, res) => {
  const { question_id, topic, difficulty, question_text, submitted_answer, is_correct } = req.body;

  if (!topic || !difficulty || !question_text || is_correct === undefined) {
    return res.status(400).json({ error: "Missing required attempt fields." });
  }

  const insert = db.prepare(`
    INSERT INTO attempts (question_id, topic, difficulty, question_text, submitted_answer, is_correct)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const info = insert.run(
    question_id || null,
    topic,
    difficulty,
    question_text,
    submitted_answer || "",
    is_correct ? 1 : 0
  );

  res.status(201).json({ id: info.lastInsertRowid });
});

// GET /api/attempts/history  -> full attempt log, most recent first
router.get("/history", (_req, res) => {
  const rows = db
    .prepare(`SELECT * FROM attempts ORDER BY created_at DESC LIMIT 200`)
    .all();
  res.json(rows);
});

// GET /api/attempts/summary -> aggregate stats for the dashboard
router.get("/summary", (_req, res) => {
  const totals = db
    .prepare(
      `SELECT COUNT(*) as total, SUM(is_correct) as correct FROM attempts`
    )
    .get();

  const byDifficulty = db
    .prepare(
      `SELECT difficulty, COUNT(*) as total, SUM(is_correct) as correct
       FROM attempts GROUP BY difficulty`
    )
    .all();

  const byTopic = db
    .prepare(
      `SELECT topic, COUNT(*) as total, SUM(is_correct) as correct
       FROM attempts GROUP BY topic ORDER BY total DESC LIMIT 10`
    )
    .all();

  // Daily accuracy trend for the last 14 days
  const trend = db
    .prepare(
      `SELECT date(created_at) as day, COUNT(*) as total, SUM(is_correct) as correct
       FROM attempts
       WHERE created_at >= datetime('now', '-14 days')
       GROUP BY day ORDER BY day ASC`
    )
    .all();

  res.json({
    total: totals.total || 0,
    correct: totals.correct || 0,
    accuracy: totals.total ? Math.round((totals.correct / totals.total) * 100) : 0,
    byDifficulty,
    byTopic,
    trend,
  });
});

module.exports = router;
