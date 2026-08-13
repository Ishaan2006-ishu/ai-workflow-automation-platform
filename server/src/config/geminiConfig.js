const { GoogleGenAI } = require("@google/genai");

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error(
    "Gemini Config Error: GEMINI_API_KEY is missing from environment variables. " +
    "Add it to your .env file before starting the server."
  );
}

const geminiClient = new GoogleGenAI({ apiKey });

const GEMINI_MODEL = "gemini-3.6-flash";

module.exports = {
  geminiClient,
  GEMINI_MODEL,
};