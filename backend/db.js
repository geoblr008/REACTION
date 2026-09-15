// Uses Node's built-in SQLite module (available in Node 22.5+, stable enough here) —
// no native compilation, no Visual Studio / build tools required on any OS.
const { DatabaseSync } = require("node:sqlite");
const path = require("path");

const db = new DatabaseSync(path.join(__dirname, "data.sqlite"));

db.exec("PRAGMA journal_mode = WAL;");

// One row per question generated (cached so we don't re-call the AI for the same topic+difficulty)
db.exec(`
  CREATE TABLE IF NOT EXISTS question_sets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    question TEXT NOT NULL,
    options TEXT,             -- JSON array, null if free-response
    correct_answer TEXT NOT NULL,
    explanation TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// One row per attempt a student makes on a question
db.exec(`
  CREATE TABLE IF NOT EXISTS attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER,
    topic TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    question_text TEXT NOT NULL,
    submitted_answer TEXT,
    is_correct INTEGER NOT NULL,   -- 0 or 1
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES question_sets(id)
  );
`);

module.exports = db;
