import { useEffect, useState } from "react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { getSummary, getHistory } from "../api";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

export default function Dashboard({ refreshKey }) {
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    getSummary().then(setSummary).catch(console.error);
    getHistory().then(setHistory).catch(console.error);
  }, [refreshKey]);

  if (!summary) return <p>Loading dashboard…</p>;

  const trendData = {
    labels: summary.trend.map((t) => t.day),
    datasets: [
      {
        label: "Accuracy %",
        data: summary.trend.map((t) => Math.round((t.correct / t.total) * 100)),
        borderColor: "#1B2A4A",
        backgroundColor: "#AFC9E8",
        tension: 0.3,
      },
    ],
  };

  const difficultyData = {
    labels: summary.byDifficulty.map((d) => d.difficulty),
    datasets: [
      {
        label: "Attempts",
        data: summary.byDifficulty.map((d) => d.total),
        backgroundColor: "#F5A623",
      },
      {
        label: "Correct",
        data: summary.byDifficulty.map((d) => d.correct),
        backgroundColor: "#2E9E6D",
      },
    ],
  };

  return (
    <div className="dashboard">
      <div className="stat-row">
        <div className="stat-card">
          <span className="stat-number">{summary.total}</span>
          <span className="stat-label">Total Attempts</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{summary.correct}</span>
          <span className="stat-label">Correct Answers</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{summary.accuracy}%</span>
          <span className="stat-label">Overall Accuracy</span>
        </div>
      </div>

      <div className="chart-row">
        <div className="chart-box">
          <h3>Accuracy Trend (last 14 days)</h3>
          {summary.trend.length ? <Line data={trendData} /> : <p>No attempts yet.</p>}
        </div>
        <div className="chart-box">
          <h3>Performance by Difficulty</h3>
          {summary.byDifficulty.length ? <Bar data={difficultyData} /> : <p>No attempts yet.</p>}
        </div>
      </div>

      <h3>Recent Attempts</h3>
      <table className="history-table">
        <thead>
          <tr>
            <th>Topic</th>
            <th>Difficulty</th>
            <th>Question</th>
            <th>Result</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {history.slice(0, 20).map((row) => (
            <tr key={row.id}>
              <td>{row.topic}</td>
              <td>{row.difficulty}</td>
              <td>{row.question_text}</td>
              <td className={row.is_correct ? "pass" : "fail"}>
                {row.is_correct ? "Correct" : "Incorrect"}
              </td>
              <td>{new Date(row.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
