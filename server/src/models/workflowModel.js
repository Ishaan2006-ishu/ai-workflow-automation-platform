/**
 * @file workflowModel.js
 * @description Mongoose model for Workflow documents.
 *
 * A Workflow represents a user-defined automation pipeline composed of
 * interconnected Nodes (processing units) and Edges (directional links
 * between nodes). This schema is designed to be consumed by a visual
 * workflow builder on the frontend (e.g. React Flow) and executed by
 * the backend workflow engine.
 *
 * Architecture: Model layer — no business logic lives here.
 */

const mongoose = require("mongoose");

const { Schema, model } = mongoose;

/* ─────────────────────────────────────────────
 * SUB-SCHEMA: Position
 * ───────────────────────────────────────────── */

const PositionSchema = new Schema(
  {
    /**
     * Horizontal offset in pixels from the canvas origin.
     */
    x: {
      type: Number,
      required: true,
      default: 0,
    },

    /**
     * Vertical offset in pixels from the canvas origin.
     */
    y: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    /**
     * Position is an embedded object.
     * We do not need a separate MongoDB _id for it.
     */
    _id: false,
  }
);

/* ─────────────────────────────────────────────
 * SUB-SCHEMA: Node
 * ───────────────────────────────────────────── */

const NodeSchema = new Schema(
  {
    /**
     * Client-generated unique identifier for this node.
     * Referenced by EdgeSchema.source and EdgeSchema.target.
     */
    id: {
      type: String,
      required: true,
      trim: true,
    },

    /**
     * Tells the engine which handler should execute this node.
     *
     * Examples:
     * "start"
     * "ai"
     * "condition"
     * "notification"
     */
    type: {
      type: String,
      required: true,
      trim: true,
    },

    /**
     * Canvas coordinates used by React Flow.
     */
    position: {
      type: PositionSchema,
      required: true,
      default: () => ({ x: 0, y: 0 }),
    },

    /**
     * Configuration specific to the node type.
     *
     * Example:
     * condition node:
     * { condition: "contains_positive" }
     */
    data: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    /**
     * Nodes already have their own client-generated id.
     */
    _id: false,
  }
);

/* ─────────────────────────────────────────────
 * SUB-SCHEMA: Edge
 * ───────────────────────────────────────────── */

const EdgeSchema = new Schema(
  {
    /**
     * Client-generated unique identifier for this edge.
     */
    id: {
      type: String,
      required: true,
      trim: true,
    },

    /**
     * ID of the node where this edge starts.
     */
    source: {
      type: String,
      required: true,
      trim: true,
    },

    /**
     * ID of the specific source handle.
     *
     * Normal nodes may not need this.
     *
     * Condition nodes use:
     * "true"
     * "false"
     *
     * This value comes from React Flow's sourceHandle.
     */
    sourceHandle: {
      type: String,
      trim: true,
      default: null,
    },

    /**
     * ID of the node where this edge ends.
     */
    target: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    /**
     * Edges already have their own client-generated id.
     */
    _id: false,
  }
);

/* ─────────────────────────────────────────────
 * MAIN SCHEMA: Workflow
 * ───────────────────────────────────────────── */

const WorkflowSchema = new Schema(
  {
    /**
     * Reference to the User who owns this workflow.
     * Used for authorization checks in the service layer.
     */
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /**
     * Human-readable workflow name.
     */
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    /**
     * Nodes that make up the workflow.
     *
     * Execution order is determined by edges,
     * not by array position.
     */
    nodes: {
      type: [NodeSchema],
      default: [],
    },

    /**
     * Connections between workflow nodes.
     */
    edges: {
      type: [EdgeSchema],
      default: [],
    },
  },
  {
    /**
     * Automatically creates:
     * createdAt
     * updatedAt
     */
    timestamps: true,
  }
);

/* ─────────────────────────────────────────────
 * MODEL EXPORT
 * ───────────────────────────────────────────── */

const Workflow = model("Workflow", WorkflowSchema);

module.exports = Workflow;