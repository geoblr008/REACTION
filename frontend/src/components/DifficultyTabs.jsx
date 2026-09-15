const LEVELS = ["easy", "medium", "hard"];

export default function DifficultyTabs({ active, onChange, counts }) {
  return (
    <div className="difficulty-tabs">
      {LEVELS.map((level) => (
        <button
          key={level}
          className={level === active ? "tab active" : "tab"}
          onClick={() => onChange(level)}
        >
          {level.charAt(0).toUpperCase() + level.slice(1)}
          {counts && ` (${counts[level] ?? 0})`}
        </button>
      ))}
    </div>
  );
}
