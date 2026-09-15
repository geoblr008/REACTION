# Smart Question Generator (PS-2Y-06)

AI-generated practice questions at Easy / Medium / Hard difficulty for any topic, with an
attempt-and-score interface and a performance dashboard.

## File Structure

```
smart-question-generator/
├── backend/
│   ├── server.js              # Express app entry point
│   ├── db.js                  # SQLite connection + schema
│   ├── ai.js                  # Provider switch: Anthropic (cloud) or Ollama (local)
│   ├── routes/
│   │   ├── questions.js       # POST /api/questions/generate  (calls ai.js)
│   │   └── attempts.js        # POST/GET /api/attempts        (scoring + history)
│   ├── package.json
│   └── .env.example           # copy to .env — set AI_PROVIDER + relevant keys
│
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── main.jsx
│       ├── App.jsx            # top-level view state (practice vs dashboard)
│       ├── api.js             # fetch wrappers for the backend
│       ├── index.css
│       └── components/
│           ├── TopicInput.jsx
│           ├── DifficultyTabs.jsx
│           ├── QuestionCard.jsx
│           └── Dashboard.jsx
│
└── README.md
```

## Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# edit .env and set ANTHROPIC_API_KEY=sk-ant-...
npm run dev
```

The API starts on `http://localhost:4000`. A `data.sqlite` file is created automatically
on first run using Node's built-in `node:sqlite` module — no separate database install,
and no native module compilation (this avoids the common Windows/`better-sqlite3` +
Visual Studio Build Tools headache). Requires **Node.js 22.5 or newer**; you'll see a
one-line "SQLite is an experimental feature" warning on startup — that's expected and
harmless.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Opens on `http://localhost:5173`. Vite proxies `/api/*` requests to the backend
(see `vite.config.js`), so no CORS configuration is needed in dev.

## How the pieces fit together

1. **Topic input** (`TopicInput.jsx`) sends `{ topic }` to `POST /api/questions/generate`.
2. **Backend** (`routes/questions.js`) builds a structured prompt, calls the Anthropic API,
   parses the JSON response, and stores every generated question in `question_sets` so each
   has a stable `id`.
3. **Question cards** (`QuestionCard.jsx`) render one question at a time per difficulty tab;
   on submit, the answer and correctness are sent to `POST /api/attempts`.
4. **Dashboard** (`Dashboard.jsx`) reads `GET /api/attempts/summary` (aggregate stats + 14-day
   trend) and `GET /api/attempts/history` (raw attempt log) to render charts and a table.

## Running fully local (no API key, no cost)

All AI logic lives in `backend/ai.js`, switched by the `AI_PROVIDER` env var. To use a
locally-run model instead of the Claude API:

1. Install [Ollama](https://ollama.com) (Mac/Windows/Linux).
2. Pull a model that handles structured JSON reasonably well:
   ```bash
   ollama pull llama3.1        # good default, ~4.7GB
   # or: ollama pull qwen2.5   # or: ollama pull mistral-nemo
   ```
3. In `backend/.env`, set:
   ```
   AI_PROVIDER=ollama
   OLLAMA_MODEL=llama3.1
   ```
4. Run `ollama serve` (or it may already be running as a background service), then start
   the backend as usual (`npm run dev`). No `ANTHROPIC_API_KEY` is needed in this mode.

Check `GET /api/health` — it returns `{ status: "ok", aiProvider: "ollama" }` to confirm
which provider is active.

**Trade-offs of local models for this app:**
- Free and works offline, but smaller models are less reliable at strictly following the
  JSON schema and at writing genuinely hard-tier questions — check a few generations by hand.
- Generation is slower on modest hardware (no GPU can mean 10–30s per topic vs ~2–5s on
  the cloud API).
- `format: "json"` in `ai.js` constrains Ollama to valid JSON syntax, but doesn't guarantee
  it matches the exact schema — the app's existing `JSON.parse` error handling covers
  malformed responses either way.

To point at a different local runtime entirely (LM Studio, llama.cpp server, vLLM, etc.),
most of these expose an OpenAI-compatible `/v1/chat/completions` endpoint — swap the
`generateFromOllama` function in `ai.js` for a fetch to that endpoint instead.

## Production notes

- Swap `node:sqlite` for Postgres by replacing `db.js` with a `pg` connection — the SQL in
  the route files is plain enough to port with minimal changes.
- Add auth (e.g. a `user_id` column on `attempts`) before deploying multi-user.
- Rate-limit `/api/questions/generate` since each call costs an AI API request.
