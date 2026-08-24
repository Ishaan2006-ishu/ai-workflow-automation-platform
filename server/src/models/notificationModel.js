/**
 * @file notificationModel.js
 * @description Mongoose model for a persisted, in-app Notification.
 *
 * WHY THIS FILE EXISTS:
 * notificationNode.js (engine layer) deliberately stops short of saving
 * anything to the database — it only SHAPES a notification object and
 * hands it back up the call stack (see that file's own comments for
 * why). This model is the other half of that design: the piece a
 * Notification Service (here, executionService.js) uses to actually
 * persist the notification once it has access to the authenticated
 * user's id, which the engine layer never sees.
 *
 * This is what makes the "Notification" node a real in-app action
 * instead of a no-op: after a run where a notification node executes,
 * a document lands here and is visible to the user going forward, not
 * just in that one execution's response payload.
 *
 * Architecture: Model layer — no business logic lives here.
 */

const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const NotificationSchema = new Schema(
  {
    /**
     * Owner of this notification. Every read of this collection is
     * scoped by userId, exactly like Workflow and Execution.
     */
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /**
     * Which workflow produced this notification. Optional at the
     * schema level (not every future notification source has to be a
     * workflow run), but always populated for MVP scope.
     */
    workflowId: {
      type: Schema.Types.ObjectId,
      ref: "Workflow",
    },

    /**
     * Which specific execution produced this notification. Lets the
     * UI deep-link from a notification back to the run that created
     * it, without a second lookup by timestamp guessing.
     */
    executionId: {
      type: Schema.Types.ObjectId,
      ref: "Execution",
    },

    /**
     * The human-readable notification text, e.g. "Positive customer
     * feedback detected." Produced by notificationNode.js and passed
     * through unchanged.
     */
    message: {
      type: String,
      required: true,
      trim: true,
    },

    /**
     * Whether the user has seen/dismissed this notification. Defaults
     * to false since every notification starts unread.
     */
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

NotificationSchema.index({ userId: 1, createdAt: -1 });

const Notification = model("Notification", NotificationSchema);

module.exports = Notification;
