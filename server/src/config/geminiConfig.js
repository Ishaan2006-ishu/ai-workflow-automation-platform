/**
 * geminiConfig.js
 *
 * WHY THIS FILE EXISTS:
 * Any code that needs to talk to Gemini should get a ready-to-use client
 * from ONE place, instead of every file reading process.env and
 * constructing its own client. That would scatter API-key handling across
 * the codebase and make it hard to change SDK versions or auth strategy
 * later. This file is that one place.
 *
 * WHO CALLS THIS FILE:
 * Only engine/nodes/aiNode.js imports this today. It contains no
 * workflow logic and no knowledge of nodes, workflows, or the engine —
 * it only knows how to build a Gemini client.
 *
 * WHY THE API KEY IS NEVER HARDCODED:
 * The key is read from process.env.GEMINI_API_KEY, which must be set in
 * a local .env file (loaded via dotenv at server startup, e.g. in
 * server.js/app.js — not here). Hardcoding secrets in source code is a
 * security risk and would leak the key if this project is ever pushed to
 * a public GitHub repo, which is likely for a placement portfolio.
 *
 * WHY WE VALIDATE THE KEY AT STARTUP:
 * Failing immediately with a clear message is far easier to debug than
 * discovering, deep inside a workflow run, that Gemini silently rejected
 * every request because the key was undefined.
 */

const { GoogleGenAI } = require("@google/genai");

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error(
    "Gemini Config Error: GEMINI_API_KEY is missing from environment variables. " +
    "Add it to your .env file before starting the server."
  );
}

// A single shared client instance. The SDK is stateless per-call (each
// generateContent call is independent), so one instance can safely be
// reused across every AI node execution in every workflow run — there is
// no need to construct a new client per request.
const geminiClient = new GoogleGenAI({ apiKey });

// Centralizing the model name here (rather than inside aiNode.js) means
// upgrading models later (e.g. gemini-2.5-flash -> a newer version) is a
// one-line change in config, not a change to business logic.
const GEMINI_MODEL = "gemini-3.6-flash";

module.exports = {
  geminiClient,
  GEMINI_MODEL,
};