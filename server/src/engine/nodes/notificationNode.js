/**
 * notificationNode.js
 *
 * WHY THIS FILE EXISTS:
 * This file owns ALL logic for the "notification" node type. Its job is
 * to shape a notification object from whatever the previous node
 * produced — nothing more. It deliberately does NOT save that object to
 * MongoDB (per the Phase 3 Notifications schema) or send an email/push
 * message. Persisting and delivering are concerns that belong to a future
 * Notification Service, which will sit above the engine (per the locked
 * Routes → Controllers → Services → Engine architecture) and can call a
 * database layer this file has no business knowing about. Keeping this
 * boundary strict today means adding real persistence later is a change
 * in one new service file, not a rewrite of this one.
 *
 * WHO CALLS THIS FILE:
 * Only nodeExecutor.js imports and calls this function.
 *
 * WHAT IT RETURNS:
 * A consistent output object shape: { nodeId, type, message,
 * notification, previousOutput }. `notification` is shaped to match the
 * Phase 3 Notifications collection schema (userId, message, isRead,
 * createdAt) MINUS `_id` and `userId` — this file has no access to the
 * requesting user's identity (that only exists at the Controller/Service
 * layer, from the authenticated request), so it returns a partial object
 * that a future Notification Service can complete and persist.
 */

/**
 * extractNotificationText
 *
 * WHY: Mirrors the same problem solved in conditionNode.js — previous
 * nodes don't share one exact output shape (an AI node's text lives in
 * `previousOutput.output`, a condition node's summary lives in
 * `previousOutput.message`, etc.). This helper isolates "how do I turn
 * whatever came before into a human-readable notification message" in one
 * place, rather than duplicating that logic or coupling this file to one
 * specific upstream node type.
 *
 * RETURNS: A string. Falls back to a generic message instead of throwing,
 * because a notification with a generic message is still valid — an
 * empty/unreadable previousOutput is not, by itself, an error condition
 * for THIS node.
 */
function extractNotificationText(previousOutput) {
  if (!previousOutput) {
    return "Workflow step completed.";
  }

  if (typeof previousOutput.output === "string" && previousOutput.output.trim().length > 0) {
    return previousOutput.output;
  }

  if (typeof previousOutput.message === "string" && previousOutput.message.trim().length > 0) {
    return previousOutput.message;
  }

  return "Workflow step completed.";
}

/**
 * executeNotificationNode
 *
 * VALIDATION:
 * Confirms the node itself is a valid "notification" node before doing
 * anything else, matching the defensive pattern used in every other node
 * file. There's no node.data requirement for this MVP notification node
 * (per Day 5 scope — it just reports on previousOutput), so there's
 * nothing else to validate on the node itself.
 *
 * PARAMS:
 *   node           — expected shape: { id, type: "notification" }.
 *   previousOutput — whatever the previous node in the chain returned.
 *
 * RETURNS:
 *   { nodeId, type: "notification", message, notification, previousOutput }
 *   where `notification` is a plain object shaped like a partial
 *   Notifications document (missing `_id` and `userId`, which only the
 *   future Notification Service can supply).
 *
 * THROWS: If the node is malformed.
 */
async function executeNotificationNode(node, previousOutput) {
  if (!node || node.type !== "notification") {
    throw new Error(
      "Notification Node Error: executeNotificationNode was called with a node that is missing or not of type 'notification'."
    );
  }

  const notificationText = extractNotificationText(previousOutput);

  // Shaped to match the Phase 3 Notifications schema fields we CAN
  // populate at this layer. `createdAt` is generated here (rather than
  // left for the database) so the exact moment of node execution is
  // captured, independent of whenever this object eventually gets saved.
  const notification = {
    message: notificationText,
    isRead: false,
    createdAt: new Date(),
  };

  return {
    nodeId: node.id,
    type: "notification",
    message: "Notification node executed successfully.",
    notification,
    previousOutput,
  };
}

module.exports = {
  executeNotificationNode,
};