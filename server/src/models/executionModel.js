/**
 * @file executionModel.js
 * @description Mongoose model for a single Workflow Execution record.
 *
 * WHY THIS FILE EXISTS:
 * Every time a user clicks "Run Workflow", the engine walks the graph
 * and produces a result — but that result is ephemeral unless something
 * saves it. This model is that persistence layer: one document per run,
 * so the Execution History page has real data to show instead of a
 * permanently-empty stub.
 *
 * WHO WRITES THIS MODEL:
 * Only executionService.js creates Execution documents (after calling
 * the pure workflowEngine.executeWorkflow()). The engine itself never
 * touches the database — this keeps the "Engine → Executor → Node
 * Files" layer free of Mongo/Express concerns, per the locked
 * architecture.
 *
 * Architecture: Model layer — no business logic lives here.
 */

const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const ExecutionSchema = new Schema(
  {
    /**
     * Which workflow was run. Kept as a reference (not embedded) so
     * history rows stay lightweight even for workflows with large
     * node/edge graphs.
     */
    workflowId: {
      type: Schema.Types.ObjectId,
      ref: "Workflow",
      required: true,
      index: true,
    },

    /**
     * Denormalized copy of the workflow's name AT THE TIME OF EXECUTION.
     * WHY DENORMALIZE: If the user later renames or deletes the source
     * workflow, past history rows should still read sensibly ("Customer
     * Feedback Automation ran at 3:04pm") instead of showing a blank or
     * throwing a lookup error for a workflow that no longer exists.
     */
    workflowName: {
      type: String,
      required: true,
      trim: true,
    },

    /**
     * The user who triggered this run. Used for ownership-scoped
     * history queries, exactly like Workflow.userId.
     */
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /**
     * Mirrors the engine's own status field so the API/UI never have to
     * re-derive success/failure from anything else.
     */
    status: {
      type: String,
      enum: ["SUCCESS", "FAILED"],
      required: true,
    },

    /**
     * The raw text the user typed into the "Run Workflow" input box.
     * Stored so a history row is self-explanatory without needing to
     * re-open the workflow builder.
     */
    input: {
      type: String,
      default: "",
    },

    /**
     * A short, human-readable summary of what the run produced —
     * e.g. the AI node's generated text, or the notification message
     * that was created. Built by executionService.js from the engine's
     * full step-by-step result (see workflowEngine.js's `stepResults`).
     */
    output: {
      type: String,
      default: "",
    },

    /**
     * Ordered list of node ids that were actually executed, exactly as
     * returned by workflowEngine.executeWorkflow(). Lets the history UI
     * show which branch a run took (e.g. condition -> notification vs.
     * condition -> ai).
     */
    executedNodes: {
      type: [String],
      default: [],
    },

    startTime: {
      type: Date,
      required: true,
    },

    completionTime: {
      type: Date,
      required: true,
    },

    /**
     * Duration in milliseconds (completionTime - startTime). Stored
     * explicitly rather than computed on every read, since it's cheap
     * to compute once and this is a field the history UI displays for
     * every single row.
     */
    duration: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Compound index: history is always queried "give me this user's runs,
 * most recent first" — this index makes that query efficient without
 * needing to touch every Execution document in the collection.
 */
ExecutionSchema.index({ userId: 1, createdAt: -1 });

const Execution = model("Execution", ExecutionSchema);

module.exports = Execution;
