const Anthropic = require("@anthropic-ai/sdk");

// Which provider to use — set AI_PROVIDER=ollama in .env to run fully local.
const PROVIDER = process.env.AI_PROVIDER || "anthropic";

// Model string for Claude — check https://docs.claude.com for the current recommended model.
const ANTHROPIC_MODEL = "claude-sonnet-5";

// Local Ollama config — install from https://ollama.com, then `ollama pull <model>`.
const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.1";

const SYSTEM_PROMPT = `You are a question-generation engine for an education app.
Given a topic, generate exactly 3 easy, 3 medium, and 3 hard practice questions.

Rules:
- easy = single-fact recall, one correct answer obvious from basic knowledge
- medium = requires applying a concept or combining 2 facts
- hard = requires multi-step reasoning, synthesis, or handling an edge case
- Every question is multiple choice with exactly 4 options.
- Respond with ONLY valid JSON (no markdown fences, no commentary), matching this shape exactly:

{
  "easy": [ { "question": "string", "options": ["a","b","c","d"], "correct_answer": "string (must exactly match one option)", "explanation": "one sentence" } ],
  "medium": [ ... same shape ... ],
  "hard": [ ... same shape ... ]
}`;

const anthropic = PROVIDER === "anthropic"
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

async function generateFromAnthropic(topic) {
  const message = await anthropic.messages.create({
    model: ANTHROPIC_MODEL,
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: `Topic: ${topic}` }],
  });

  return message.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("");
}

async function generateFromOllama(topic) {
  // Ollama's native chat endpoint. `format: "json"` forces valid JSON output
  // on models that support it (llama3.1, qwen2.5, mistral-nemo, etc.).
  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      stream: false,
      format: "json",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Topic: ${topic}` },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Ollama request failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  return data.message?.content || "";
}

/**
 * Returns the raw text response from whichever provider is configured.
 * The caller (routes/questions.js) is responsible for JSON.parse-ing it.
 */
async function generateQuestionsRaw(topic) {
  if (PROVIDER === "ollama") return generateFromOllama(topic);
  return generateFromAnthropic(topic);
}

module.exports = { generateQuestionsRaw, PROVIDER };
