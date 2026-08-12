/**
 * conditionNode.js
 *
 * Handles the business logic of the Condition node.
 *
 * It receives the previous node's output,
 * evaluates the configured condition,
 * and returns true/false.
 */

/**
 * Extract readable text from the previous node's output.
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
 * Checks whether the text contains the word "positive".
 */
function evaluateContainsPositive(text) {
  return text.toLowerCase().includes("positive");
}

/**
 * Executes a Condition node.
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

  const textToCheck =
    extractTextFromPreviousOutput(previousOutput);

  let result;

  switch (conditionType) {
    case "contains_positive":
      result = evaluateContainsPositive(textToCheck);
      break;

    default:
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