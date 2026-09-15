import { useState } from "react";

export default function QuestionCard({ question, topic, difficulty, onAnswered }) {
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const isCorrect = selected === question.correct_answer;

  function handleSubmit() {
    if (!selected) return;
    setSubmitted(true);
    onAnswered({
      question_id: question.id,
      topic,
      difficulty,
      question_text: question.question,
      submitted_answer: selected,
      is_correct: isCorrect,
    });
  }

  return (
    <div className="question-card">
      <p className="question-text">{question.question}</p>
      <div className="options">
        {question.options.map((opt) => {
          let cls = "option";
          if (submitted) {
            if (opt === question.correct_answer) cls += " correct";
            else if (opt === selected) cls += " incorrect";
          } else if (opt === selected) {
            cls += " selected";
          }
          return (
            <button
              key={opt}
              className={cls}
              disabled={submitted}
              onClick={() => setSelected(opt)}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {!submitted ? (
        <button className="submit-btn" onClick={handleSubmit} disabled={!selected}>
          Submit Answer
        </button>
      ) : (
        <div className={`feedback ${isCorrect ? "correct" : "incorrect"}`}>
          <strong>{isCorrect ? "Correct!" : "Not quite."}</strong>
          {question.explanation && <p>{question.explanation}</p>}
        </div>
      )}
    </div>
  );
}
