/**
 * startNode.js
 *
 * The Start node is the entry point of a workflow.
 * It receives the input provided by the user when the workflow is run.
 */

async function executeStartNode(node, previousOutput, workflowInput) {
  if (!node || node.type !== "start") {
    throw new Error(
      "Start Node Error: executeStartNode was called with a node that is missing or not of type 'start'."
    );
  }

  return {
    nodeId: node.id,
    type: "start",
    message: "Workflow started.",
    input: workflowInput || "",
  };
}

module.exports = {
  executeStartNode,
};