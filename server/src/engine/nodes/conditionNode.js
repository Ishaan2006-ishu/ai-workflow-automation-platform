/**
 * conditionNode.js
 *
 * WHY THIS FILE EXISTS:
 * This file owns ALL logic for the "condition" node type — reading the
 * previous node's output, checking it against node.data.condition, and
 * reporting true/false. Nothing outside this file needs to know how a
 * condition is evaluated.
 *
 * WHO CALLS THIS FILE:
 * Only nodeExecutor.js imports and calls this function.
 *
 * IMPORTANT SCOPE BOUNDARY:
 * This node DECIDES a true/false result. It does NOT decide what happens
 * next in the workflow (which edge to follow). That responsibility
 * belongs entirely to workflowEngine.js's findNextNode(), which today
 * follows a single outgoing edge per node regardless of any condition
 * result. Branching based on this result (e.g. "follow edge A if true,
 * edge B if false") is a future engine-level feature, not something this
 * file should reach into and control. Keeping this boundary strict is
 * what lets us evaluate a condition today without having to redesign
 * workflowEngine.js's traversal logic in the same change.
 *
 * WHAT IT RETURNS:
 * A consistent output object shape: { nodeId, type, message, result,
 * previousOutput }. `result` is the boolean the condition evaluated to —
 * whoever consumes this later (a future smarter engine, or a UI showing
 * execution history) can read it without re-deriving it.
 */

/**
 * extractTextFromPreviousOutput
 *
 * WHY: previousOutput isn't always the same shape — an AI node's output
 * lives in `previousOutput.output` (the generated text), while a Start
 * node only has a `message` field and no `output` at all. Rather than
 * make every future node type agree on one exact shape (which would
 * couple them together unnecessarily), this helper isolates the "how do
 * I get readable text out of whatever the previous node returned" logic
 * in one place, so conditionNode.js has one clear source of truth for it.
 *
 * RETURNS: A string to search for the condition keyword in. Falls back to
 * an empty string if nothing usable is found, rather than throwing —
 * an empty string simply means "positive" won't be found, which is
 * correct, expected behavior rather than an error.
 */
function extractTextFromPreviousOutput(previousOutput) {
  if (!previousOutput) {
    return "";
  }

  if (typeof previousOutput.output === "string") {
    return previousOutput.output;
  }

  if (typeof previousOutput.message === "string") {
    return previousOutput.message;
  }

  return "";
}

/**
 * evaluateContainsPositive
 *
 * WHY: Isolated as its own function (rather than inlined in a switch
 * statement) so that adding the next condition type later — e.g.
 * "contains_negative" — is a one-function addition, mirroring the exact
 * pattern used for node handlers in nodeExecutor.js.
 *
 * WHY .toLowerCase(): "Positive", "POSITIVE", and "positive" should all
 * count as a match — a workflow author shouldn't need to worry about
 * Gemini's exact casing for this MVP condition to work correctly.
 */
function evaluateContainsPositive(text) {
  return text.toLowerCase().includes("positive");
}

/**
 * executeConditionNode
 *
 * VALIDATION (before evaluating):
 *   - Confirms the node itself is a valid "condition" node.
 *   - Confirms node.data.condition is present and is a condition type we
 *     actually support. Failing loudly on an unsupported condition type
 *     is safer than silently returning `false` for a typo like
 *     "contains_postive".
 *
 * PARAMS:
 *   node           — expected shape: { id, type: "condition",
 *                    data: { condition: "contains_positive" } }.
 *   previousOutput — whatever the previous node in the chain returned.
 *
 * RETURNS:
 *   { nodeId, type: "condition", message, result: boolean, previousOutput }
 *
 * THROWS: If the node is malformed, or node.data.condition is missing or
 * unrecognized.
 */
async function executeConditionNode(node, previousOutput) {
  if (!node || node.type !== "condition") {
    throw new Error(
      "Condition Node Error: executeConditionNode was called with a node that is missing or not of type 'condition'."
    );
  }

  const conditionType = node.data && node.data.condition;

  if (!conditionType || typeof conditionType !== "string") {
    throw new Error(
      `Condition Node Error: Node "${node.id}" has no valid 'condition' in node.data.`
    );
  }

  const textToCheck = extractTextFromPreviousOutput(previousOutput);

  let result;

  switch (conditionType) {
    case "contains_positive":
      result = evaluateContainsPositive(textToCheck);
      break;
    default:
      // Fail loudly rather than silently defaulting to false — an
      // unrecognized condition type almost always means a typo or a
      // condition type that hasn't been implemented yet, and the
      // workflow author needs to know that, not get a misleading result.
      throw new Error(
        `Condition Node Error: Unsupported condition type "${conditionType}" on node "${node.id}".`
      );
  }

  return {
    nodeId: node.id,
    type: "condition",
    message: `Condition "${conditionType}" evaluated to ${result}.`,
    result,
    previousOutput,
  };
}

module.exports = {
  executeConditionNode,
};