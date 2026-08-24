/**
 * nodeOutputUtils.js
 *
 * WHY THIS FILE EXISTS:
 * conditionNode.js, notificationNode.js, and (as of this MVP pass)
 * aiNode.js all face the exact same problem: `previousOutput` isn't one
 * consistent shape. A Start node's output is just `{ output: <string> }`
 * (the user's raw input), an AI node's output lives in
 * `previousOutput.output` (generated text), and if nothing usable is
 * there at all, falling back to `previousOutput.message` is still
 * better than nothing.
 *
 * This was previously duplicated as a private, unexported function
 * inside conditionNode.js. Pulling it out here means every node file
 * that needs "give me readable text from whatever ran before me" reads
 * from exactly one implementation, instead of three copies quietly
 * drifting apart over time.
 *
 * WHO CALLS THIS FILE:
 * Only files inside engine/nodes/ import this. It has zero knowledge of
 * Express, MongoDB, or the workflow engine's traversal logic — it is a
 * pure string-extraction utility.
 */

/**
 * extractTextFromPreviousOutput
 *
 * MVP FIX — WALK NESTED previousOutput CHAINS:
 * Some node types (condition, notification) return a result object that
 * itself embeds the PRIOR node's full result as `previousOutput`, e.g.
 * a condition node's result looks like:
 *   { message: "Condition ... evaluated to true.", result: true,
 *     previousOutput: { output: "positive", ... } }
 * The original implementation only ever looked at the immediate
 * object's own `.output` / `.message` fields. That meant a node placed
 * right after a condition node (branching to another AI node, say)
 * would receive the condition's generic status message ("Condition
 * ... evaluated to true.") instead of the actual upstream content
 * (the AI's generated text, or ultimately the user's raw input) —
 * silently losing the real data the workflow was supposed to be
 * carrying forward.
 *
 * The fix: prefer a direct `.output` string; if there isn't one, recurse
 * into `.previousOutput` looking for the deepest real `.output` before
 * ever settling for a generic `.message` string. This makes multi-hop
 * chains (start -> ai -> condition -> ai/notification) actually carry
 * real content through every hop, not just the first one.
 *
 * RETURNS: A string to use as input text. Falls back to an empty
 * string if nothing usable is found, rather than throwing — an empty
 * string is a normal, valid signal (e.g. "no text to check"), not an
 * error condition.
 */
function extractTextFromPreviousOutput(previousOutput) {
  if (!previousOutput) {
    return "";
  }

  if (typeof previousOutput.output === "string" && previousOutput.output.trim().length > 0) {
    return previousOutput.output;
  }

  if (previousOutput.previousOutput) {
    const nested = extractTextFromPreviousOutput(previousOutput.previousOutput);
    if (nested) {
      return nested;
    }
  }

  if (typeof previousOutput.message === "string") {
    return previousOutput.message;
  }

  return "";
}

module.exports = {
  extractTextFromPreviousOutput,
};
