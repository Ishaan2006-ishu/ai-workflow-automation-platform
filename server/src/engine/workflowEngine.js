/**
 * workflowEngine.js
 *
 * WHY THIS FILE EXISTS:
 * The Workflow Engine is the "brain" that decides HOW a workflow runs.
 *
 * Its job is orchestration:
 * - Find the Start node
 * - Execute nodes in order
 * - Pass previous output to the next node
 * - Follow normal edges
 * - Follow TRUE/FALSE branches from Condition nodes
 *
 * It does not know about Express or MongoDB.
 */

const { executeNode } = require("./nodeExecutor");

/**
 * Find the Start node.
 */
function findStartNode(nodes) {
  const startNode = nodes.find(
    (node) => node.type === "start"
  );

  if (!startNode) {
    throw new Error(
      "Workflow Engine Error: No start node found. Every workflow must contain exactly one node with type 'start'."
    );
  }

  return startNode;
}

/**
 * Find the next node to execute.
 *
 * For normal nodes:
 *
 *     Start → AI
 *
 * We simply follow the outgoing edge.
 *
 * For Condition nodes:
 *
 *                 ┌── true
 *     Condition ──┤
 *                 └── false
 *
 * We use the Condition node's result to decide
 * which sourceHandle to follow.
 */
function findNextNode(
  currentNode,
  nodes,
  edges,
  previousOutput
) {
  // ---------------------------------------------------------
  // Find all outgoing edges from the current node
  // ---------------------------------------------------------

  const outgoingEdges = edges.filter(
    (edge) => edge.source === currentNode.id
  );

  // No outgoing edge means workflow has finished.
  if (outgoingEdges.length === 0) {
    return null;
  }

  // =========================================================
  // CONDITION NODE
  // =========================================================

  if (currentNode.type === "condition") {
    // The Condition node should return:
    //
    // {
    //   result: true
    // }
    //
    // or:
    //
    // {
    //   result: false
    // }

    if (
      !previousOutput ||
      typeof previousOutput.result !== "boolean"
    ) {
      throw new Error(
        `Workflow Engine Error: Condition node "${currentNode.id}" did not produce a valid boolean result.`
      );
    }

    const conditionResult =
      previousOutput.result;

    // Convert boolean to the React Flow handle ID.
    //
    // true  → "true"
    // false → "false"
    const requiredHandle = conditionResult
      ? "true"
      : "false";

    console.log(
      `[WorkflowEngine] Condition "${currentNode.id}" result: ${conditionResult}`
    );

    console.log(
      `[WorkflowEngine] Following "${requiredHandle}" branch`
    );

    // Find the edge connected to the correct handle.
    const selectedEdge = outgoingEdges.find(
      (edge) =>
        edge.sourceHandle === requiredHandle
    );

    if (!selectedEdge) {
      throw new Error(
        `Workflow Engine Error: Condition node "${currentNode.id}" has no "${requiredHandle}" outgoing edge.`
      );
    }

    const nextNode = nodes.find(
      (node) =>
        node.id === selectedEdge.target
    );

    if (!nextNode) {
      throw new Error(
        `Workflow Engine Error: Edge references missing target node "${selectedEdge.target}".`
      );
    }

    return nextNode;
  }

  // =========================================================
  // NORMAL NODE
  // =========================================================

  // For Start, AI, Notification, etc.
  //
  // We currently follow the first outgoing edge.
  const outgoingEdge = outgoingEdges[0];

  const nextNode = nodes.find(
    (node) =>
      node.id === outgoingEdge.target
  );

  if (!nextNode) {
    throw new Error(
      `Workflow Engine Error: Edge references missing target node "${outgoingEdge.target}".`
    );
  }

  return nextNode;
}

/**
 * Execute the current node.
 */
async function executeCurrentNode(
  node,
  previousOutput
) {
  return executeNode(
    node,
    previousOutput
  );
}

/**
 * Validate workflow before execution.
 */
function validateWorkflow(workflow) {
  if (!workflow) {
    throw new Error(
      "Workflow Engine Error: Workflow object is null or undefined."
    );
  }

  if (
    !Array.isArray(workflow.nodes) ||
    workflow.nodes.length === 0
  ) {
    throw new Error(
      "Workflow Engine Error: Workflow must contain at least one node."
    );
  }

  if (!Array.isArray(workflow.edges)) {
    throw new Error(
      "Workflow Engine Error: Workflow must contain an edges array (it may be empty)."
    );
  }
}

/**
 * Execute the complete workflow.
 */
async function executeWorkflow(workflow) {
  const executedNodes = [];

  try {
    validateWorkflow(workflow);

    const { nodes, edges } = workflow;

    // -------------------------------------------------------
    // Start from the Start node
    // -------------------------------------------------------

    let currentNode = findStartNode(nodes);

    let previousOutput = null;

    // -------------------------------------------------------
    // Execute nodes one by one
    // -------------------------------------------------------

    while (currentNode) {
      console.log(
        `[WorkflowEngine] Executing node: ${currentNode.id} (${currentNode.type})`
      );

      // Execute current node.
      previousOutput =
        await executeCurrentNode(
          currentNode,
          previousOutput
        );

      // Remember that this node executed.
      executedNodes.push(
        currentNode.id
      );

      // Find the next node.
      //
      // IMPORTANT:
      // We pass previousOutput here because
      // Condition nodes need its `result`.
      currentNode =
        findNextNode(
          currentNode,
          nodes,
          edges,
          previousOutput
        );
    }

    // -------------------------------------------------------
    // Successful execution
    // -------------------------------------------------------

    return {
      success: true,
      output: previousOutput,
      executedNodes,
      status: "SUCCESS",
    };

  } catch (error) {

    console.error(
      "[WorkflowEngine] Execution failed:",
      error
    );

    return {
      success: false,
      output: error.message,
      executedNodes,
      status: "FAILED",
    };
  }
}

module.exports = {
  executeWorkflow,
  findStartNode,
  findNextNode,
  executeCurrentNode,
};