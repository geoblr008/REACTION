import { useState } from "react";

export default function TopicInput({ onGenerate, loading }) {
  const [topic, setTopic] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (topic.trim()) onGenerate(topic.trim());
  }

  return (
    <form className="topic-input" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Enter a topic — e.g. Photosynthesis, Fractions, Newton's Laws"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        disabled={loading}
      />
      <button type="submit" disabled={loading || !topic.trim()}>
        {loading ? "Generating…" : "Generate Questions"}
      </button>
    </form>
  );
}
