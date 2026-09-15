import { useState } from "react";
import TopicInput from "./components/TopicInput.jsx";
import DifficultyTabs from "./components/DifficultyTabs.jsx";
import QuestionCard from "./components/QuestionCard.jsx";
import Dashboard from "./components/Dashboard.jsx";
import { generateQuestions, submitAttempt } from "./api";

export default function App() {
  const [view, setView] = useState("practice"); // "practice" | "dashboard"
  const [topic, setTopic] = useState("");
  const [questions, setQuestions] = useState(null); // { easy: [], medium: [], hard: [] }
  const [difficulty, setDifficulty] = useState("easy");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  async function handleGenerate(newTopic) {
    setLoading(true);
    setError(null);
    try {
      const data = await generateQuestions(newTopic);
      setTopic(data.topic);
      setQuestions(data.questions);
      setDifficulty("easy");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAnswered(attempt) {
    try {
      await submitAttempt(attempt);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      console.error("Failed to log attempt:", err);
    }
  }

  const counts = questions && {
    easy: questions.easy.length,
    medium: questions.medium.length,
    hard: questions.hard.length,
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Smart Question Generator</h1>
        <nav>
          <button className={view === "practice" ? "nav-active" : ""} onClick={() => setView("practice")}>
            Practice
          </button>
          <button className={view === "dashboard" ? "nav-active" : ""} onClick={() => setView("dashboard")}>
            Score Dashboard
          </button>
        </nav>
      </header>

      {view === "practice" ? (
        <main>
          <TopicInput onGenerate={handleGenerate} loading={loading} />
          {error && <p className="error">{error}</p>}

          {questions && (
            <>
              <h2>Topic: {topic}</h2>
              <DifficultyTabs active={difficulty} onChange={setDifficulty} counts={counts} />
              <div className="question-list">
                {questions[difficulty].map((q) => (
                  <QuestionCard
                    key={q.id}
                    question={q}
                    topic={topic}
                    difficulty={difficulty}
                    onAnswered={handleAnswered}
                  />
                ))}
              </div>
            </>
          )}
        </main>
      ) : (
        <main>
          <Dashboard refreshKey={refreshKey} />
        </main>
      )}
    </div>
  );
}
