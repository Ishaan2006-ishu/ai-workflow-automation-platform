/**
 * aiNode.js
 *
 * WHY THIS FILE EXISTS:
 * This file owns ALL logic for the "ai" node type — reading the prompt,
 * calling Gemini, validating the response, and handling failures. Nothing
 * outside this file needs to know Gemini exists; nodeExecutor.js just
 * calls executeAiNode() and gets back a plain result object, exactly like
 * every other node handler.
 *
 * WHO CALLS THIS FILE:
 * Only nodeExecutor.js imports and calls this function.
 *
 * WHAT IT RETURNS:
 * A consistent output object shape: { nodeId, type, message, output }.
 * Matching the shape other node files use keeps `previousOutput` handoff
 * between nodes predictable across the whole engine.
 */

const { geminiClient, GEMINI_MODEL } = require("../../config/geminiConfig");

/**
 * executeAiNode
 *
 * WHY: The AI node's job is to take a prompt (defined by the user when
 * they built the workflow, per the Phase 3 schema: node.data.prompt) and
 * turn it into generated text via Gemini.
 *
 * VALIDATION (before calling Gemini):
 * We check node.type and the presence of node.data.prompt BEFORE making
 * any network call. This avoids wasting an API request on a node that
 * was never going to succeed, and gives a much clearer error message than
 * whatever Gemini would return for an empty/undefined prompt.
 *
 * ERROR HANDLING (around calling Gemini):
 * Network calls can fail for many reasons outside our control — rate
 * limits, invalid API key, Gemini service outages, timeouts. We wrap the
 * call in try/catch and re-throw a clearly-labeled error so the engine's
 * existing try/catch in executeWorkflow() (see workflowEngine.js) can
 * catch it, mark the run as FAILED, and still return a predictable result
 * object — we don't need to add any new error-handling pattern to the
 * engine itself.
 *
 * VALIDATION (after calling Gemini):
 * We also check that Gemini actually returned usable text. An API call
 * can "succeed" (no thrown error) while still returning an empty or
 * missing response, e.g. if the prompt was blocked by safety filters.
 * That case should fail loudly rather than silently pass an empty string
 * forward.
 *
 * PARAMS:
 *   node           — the ai node object being executed. Expected shape
 *                    (per Phase 3 schema): { id, type: "ai",
 *                    data: { prompt } }.
 *   previousOutput — whatever the previous node returned. Not used in the
 *                    Gemini call itself today (kept simple, per scope),
 *                    but accepted so this function's signature matches
 *                    every other node handler's signature.
 *
 * RETURNS:
 *   { nodeId, type: "ai", message, output } where `output` is the
 *   generated text from Gemini.
 *
 * THROWS: If the node is malformed, the prompt is missing, or Gemini
 * fails / returns no usable text.
 */
async function executeAiNode(node, previousOutput) {
  if (!node || node.type !== "ai") {
    throw new Error(
      "AI Node Error: executeAiNode was called with a node that is missing or not of type 'ai'."
    );
  }

  const prompt = node.data && node.data.prompt;

  if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
    throw new Error(
      `AI Node Error: Node "${node.id}" has no valid 'prompt' in node.data. An AI node cannot run without a prompt.`
    );
  }

  let response;

  try {
    response = await geminiClient.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });
  } catch (error) {
    // We deliberately don't leak raw SDK error internals to the caller —
    // just enough context (node id + original message) to debug, without
    // depending on the shape of the SDK's internal error object.
    throw new Error(
      `AI Node Error: Gemini request failed for node "${node.id}". Reason: ${error.message}`
    );
  }

  const generatedText = response && response.text;

  if (!generatedText || typeof generatedText !== "string" || generatedText.trim().length === 0) {
    throw new Error(
      `AI Node Error: Gemini returned no usable text for node "${node.id}". The prompt may have been blocked or the response was empty.`
    );
  }

  return {
    nodeId: node.id,
    type: "ai",
    message: "AI node executed successfully.",
    output: generatedText,
  };
}

module.exports = {
  executeAiNode,
};