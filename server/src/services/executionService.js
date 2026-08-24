/**
 * @file executionService.js
 * @description Business logic for executing a saved workflow and
 * persisting the outcome. This is the piece the original codebase's
 * comments referred to as "the Execution Service, to be built later"
 * (see workflowEngine.js's file header) — it is the ONLY caller of
 * workflowEngine.executeWorkflow() in the whole app.
 *
 * Architecture:
 * Controller → Service → Workflow Engine → Node Executor → Node Files
 *                     ↘︎ Database (Workflow / Execution / Notification)
 *
 * The engine itself never touches Mongo — this file is where the
 * engine's pure result object gets turned into real, persisted
 * documents (an Execution history row, and optionally a Notification).
 */

const Workflow = require("../models/workflowModel");
const Execution = require("../models/executionModel");
const Notification = require("../models/notificationModel");
const { executeWorkflow } = require("../engine/workflowEngine");

/**
 * buildDisplayOutput
 *
 * WHY: Execution.output is a single short string meant for a history
 * list / result banner — not the full step-by-step trace (that's what
 * `stepResults` in the engine result is for, returned separately to the
 * controller for the immediate "you just ran this" response). This
 * derives the most useful one-line summary depending on how the run
 * ended:
 *   - Failed run          → the engine's error message.
 *   - Ended on a notification node → the notification text (this IS
 *     the demo's headline behavior — "Positive customer feedback
 *     detected.").
 *   - Ended on an AI node  → the generated text.
 *   - Anything else        → whatever generic message the last node
 *     produced.
 */
function buildDisplayOutput(engineResult) {
  if (!engineResult.success) {
    return typeof engineResult.output === "string"
      ? engineResult.output
      : "Workflow execution failed.";
  }

  const lastStep = engineResult.output;

  if (!lastStep) {
    return "Workflow completed with no output.";
  }

  if (lastStep.notification && typeof lastStep.notification.message === "string") {
    return lastStep.notification.message;
  }

  if (typeof lastStep.output === "string" && lastStep.output.trim().length > 0) {
    return lastStep.output;
  }

  if (typeof lastStep.message === "string") {
    return lastStep.message;
  }

  return "Workflow completed.";
}

/**
 * findNotificationStep
 *
 * WHY: A workflow only performs a real "Notification" action if one of
 * the nodes it actually executed (per the chosen branch) was a
 * notification node. Scanning `stepResults` (not just the final output)
 * means this works correctly regardless of where the notification node
 * sits in the graph.
 */
function findNotificationStep(engineResult) {
  if (!Array.isArray(engineResult.stepResults)) {
    return null;
  }

  return (
    engineResult.stepResults.find(
      (step) => step && step.type === "notification" && step.notification
    ) || null
  );
}

/**
 * runWorkflow
 *
 * Orchestrates a full "Run Workflow" request:
 *   1. Fetch the workflow (ownership-scoped — a user can never execute
 *      someone else's workflow, mirroring the pattern already used by
 *      getWorkflowById/saveWorkflow/deleteWorkflowService).
 *   2. Call the pure engine to actually walk the graph.
 *   3. If a notification node fired, persist a real Notification
 *      document — this is what makes the Notification node a genuine
 *      in-app action instead of a value that only exists for one
 *      response and then disappears.
 *   4. Persist an Execution document so the run shows up in history.
 *
 * @param {string} workflowId
 * @param {string} userId
 * @param {string} input - raw text from the "Run Workflow" input box
 * @returns {Promise<Object>} { execution, notification, engineResult }
 * @throws {Error} name: "NotFoundError" if the workflow doesn't exist
 *                 or isn't owned by this user (kept as 404, not 403, to
 *                 avoid confirming a workflow id exists at all — same
 *                 rationale as getWorkflowById's existing behavior).
 */
const runWorkflow = async (workflowId, userId, input) => {
  const workflow = await Workflow.findOne({ _id: workflowId, userId }).lean();

  if (!workflow) {
    const err = new Error("Workflow not found.");
    err.name = "NotFoundError";
    throw err;
  }

  const startTime = new Date();
  const engineResult = await executeWorkflow(workflow, input);
  const completionTime = new Date();
  const duration = completionTime.getTime() - startTime.getTime();

  // ── Persist a Notification, if this run actually triggered one ──────
  let persistedNotification = null;
  const notificationStep = findNotificationStep(engineResult);

  if (notificationStep) {
    const notificationDoc = await Notification.create({
      userId,
      workflowId: workflow._id,
      message: notificationStep.notification.message,
      isRead: false,
    });

    persistedNotification = notificationDoc.toObject();
  }

  // ── Persist the Execution history row ────────────────────────────────
  const executionDoc = await Execution.create({
    workflowId: workflow._id,
    workflowName: workflow.name,
    userId,
    status: engineResult.status,
    input: typeof input === "string" ? input : "",
    output: buildDisplayOutput(engineResult),
    executedNodes: engineResult.executedNodes,
    startTime,
    completionTime,
    duration,
  });

  // Link the notification back to the execution that produced it, now
  // that we know the execution's id (chicken-and-egg: the execution
  // needs the notification's outcome to build its display output, so
  // it's created second; the notification is updated after).
  if (persistedNotification) {
    await Notification.findByIdAndUpdate(persistedNotification._id, {
      executionId: executionDoc._id,
    });
    persistedNotification.executionId = executionDoc._id;
  }

  return {
    execution: executionDoc.toObject(),
    notification: persistedNotification,
    engineResult,
  };
};

/**
 * fetchExecutionHistory
 *
 * Returns every execution belonging to the requesting user, most
 * recent first — exactly the shape the Execution History page needs to
 * render directly with no client-side sorting/filtering required.
 *
 * @param {string} userId
 * @returns {Promise<Array<Object>>}
 */
const fetchExecutionHistory = async (userId) => {
  const executions = await Execution.find({ userId })
    .sort({ createdAt: -1 })
    .lean();

  return executions;
};

module.exports = {
  runWorkflow,
  fetchExecutionHistory,
};
