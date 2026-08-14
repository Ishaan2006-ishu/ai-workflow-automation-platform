/**
 * @file executionModel.js
 * @description Mongoose model for workflow execution records.
 *
 * One Execution document represents ONE attempt to run a workflow.
 *
 * Example:
 *
 * Workflow:
 * Start → AI → Condition → Notification
 *
 * When the user executes it, we create one Execution document
 * containing the result of that particular run.
 */

const mongoose = require("mongoose");

const { Schema, model } = mongoose;

/* ============================================================
   EXECUTION SCHEMA
   ============================================================ */

const ExecutionSchema = new Schema(
  {
    /**
     * Workflow that was executed.
     *
     * We keep a reference instead of copying the entire workflow
     * definition into the execution document.
     */
    workflowId: {
      type: Schema.Types.ObjectId,
      ref: "Workflow",
      required: true,
      index: true,
    },

    /**
     * User who executed the workflow.
     *
     * This allows us to show only the authenticated user's
     * execution history.
     */
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /**
     * Final execution status.
     *
     * SUCCESS:
     * The complete workflow path finished successfully.
     *
     * FAILED:
     * A node failed during execution.
     */
    status: {
      type: String,
      enum: ["SUCCESS", "FAILED"],
      required: true,
    },

    /**
     * Output produced by the last executed node.
     *
     * Mixed is used because different nodes can return
     * different kinds of data.
     */
    output: {
      type: Schema.Types.Mixed,
      default: null,
    },

    /**
     * IDs of nodes executed during this run.
     *
     * Example:
     *
     * [
     *   "1",
     *   "1786583408132",
     *   "1786586083836",
     *   "1786586230441"
     * ]
     */
    executedNodes: {
      type: [String],
      default: [],
    },

    /**
     * Time when execution started.
     */
    startedAt: {
      type: Date,
      required: true,
    },

    /**
     * Time when execution finished.
     */
    completedAt: {
      type: Date,
      required: true,
    },

    /**
     * Total execution time in milliseconds.
     *
     * Example:
     *
     * 4320
     *
     * means the workflow took 4.32 seconds.
     */
    duration: {
      type: Number,
      required: true,
    },
  },
  {
    /**
     * MongoDB automatically adds:
     *
     * createdAt
     * updatedAt
     */
    timestamps: true,
  }
);

/* ============================================================
   MODEL
   ============================================================ */

const Execution = model(
  "Execution",
  ExecutionSchema
);

module.exports = Execution;