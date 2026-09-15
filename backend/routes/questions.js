const express = require("express");
const db = require("../db");
const { generateQuestionsRaw, PROVIDER } = require("../ai");

const router = express.Router();

// POST /api/questions/generate  { topic: string }
router.post("/generate", async (req, res) => {
  const { topic } = req.body;
  if (!topic || typeof topic !== "string" || !topic.trim()) {
    return res.status(400).json({ error: "A non-empty 'topic' string is required." });
  }

  try {
    const rawText = await generateQuestionsRaw(topic.trim());

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch (err) {
      console.error("Failed to parse AI response as JSON:", rawText);
      return res.status(502).json({ error: "AI response was not valid JSON. Try again." });
    }

    // Persist each generated question and attach its DB id (needed later for attempts)
    const insert = db.prepare(`
      INSERT INTO question_sets (topic, difficulty, question, options, correct_answer, explanation)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const withIds = {};
    for (const difficulty of ["easy", "medium", "hard"]) {
      withIds[difficulty] = (parsed[difficulty] || []).map((q) => {
        const info = insert.run(
          topic.trim(),
          difficulty,
          q.question,
          JSON.stringify(q.options || []),
          q.correct_answer,
          q.explanation || ""
        );
        return { id: info.lastInsertRowid, ...q };
      });
    }

    res.json({ topic: topic.trim(), questions: withIds });
  } catch (err) {
    console.error("Question generation error:", err);
    res.status(500).json({ error: "Failed to generate questions. Please try again." });
  }
});

module.exports = router;
