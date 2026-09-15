const BASE = "/api";

async function handle(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed with status ${res.status}`);
  }
  return res.json();
}

export function generateQuestions(topic) {
  return fetch(`${BASE}/questions/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic }),
  }).then(handle);
}

export function submitAttempt(attempt) {
  return fetch(`${BASE}/attempts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(attempt),
  }).then(handle);
}

export function getHistory() {
  return fetch(`${BASE}/attempts/history`).then(handle);
}

export function getSummary() {
  return fetch(`${BASE}/attempts/summary`).then(handle);
}
