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

import mongoose from "mongoose";

const { Schema, model } = mongoose;

/* ─────────────────────────────────────────────
 * SUB-SCHEMA: Position
 * Stores the (x, y) coordinates of a node on
 * the visual canvas. Used exclusively inside
 * the NodeSchema.
 * ───────────────────────────────────────────── */
const PositionSchema = new Schema(
  {
    /** Horizontal offset in pixels from the canvas origin */
    x: {
      type: Number,
      required: true,
      default: 0,
    },

    /** Vertical offset in pixels from the canvas origin */
    y: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    /** Suppress auto-generated _id for embedded sub-documents */
    _id: false,
  }
);

/* ─────────────────────────────────────────────
 * SUB-SCHEMA: Node
 * Represents a single processing unit (step) in
 * the workflow graph. Each node maps to an action
 * the engine will execute (e.g. HTTP request,
 * AI call, data transform, conditional branch).
 *
 * The `id` field is a client-generated string ID
 * (e.g. from React Flow) so it can be referenced
 * by edges without relying on MongoDB ObjectIds.
 * ───────────────────────────────────────────── */
const NodeSchema = new Schema(
  {
    /**
     * Client-generated unique identifier for this node.
     * Referenced by EdgeSchema.source and EdgeSchema.target.
     * Example: "node_1", "trigger-abc123"
     */
    id: {
      type: String,
      required: true,
      trim: true,
    },

    /**
     * Discriminator that tells the engine which handler to invoke.
     * Examples: "trigger", "httpRequest", "aiPrompt",
     *           "condition", "dataTransform", "output"
     */
    type: {
      type: String,
      required: true,
      trim: true,
    },

    /**
     * Canvas coordinates for rendering the node in the UI.
     * Has no effect on engine execution.
     */
    position: {
      type: PositionSchema,
      required: true,
      default: () => ({ x: 0, y: 0 }),
    },

    /**
     * Arbitrary configuration payload for this node.
     * Contents vary by node type — validated at the
     * service/engine layer, not at the schema level.
     * Example for "httpRequest": { url, method, headers, body }
     * Example for "aiPrompt":    { model, prompt, temperature }
     */
    data: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    _id: false, // Nodes are identified by their `id` string field
  }
);

/* ─────────────────────────────────────────────
 * SUB-SCHEMA: Edge
 * Represents a directed connection (arrow) between
 * two nodes in the workflow graph. The engine follows
 * edges to determine execution order.
 *
 * `source` and `target` map to NodeSchema.id values,
 * not to MongoDB ObjectIds.
 * ───────────────────────────────────────────── */
const EdgeSchema = new Schema(
  {
    /**
     * Client-generated unique identifier for this edge.
     * Example: "edge_1", "edge-node1-node2"
     */
    id: {
      type: String,
      required: true,
      trim: true,
    },

    /**
     * `id` of the Node where this edge originates (output handle).
     * Must correspond to an existing NodeSchema.id in the same workflow.
     */
    source: {
      type: String,
      required: true,
      trim: true,
    },

    /**
     * `id` of the Node where this edge terminates (input handle).
     * Must correspond to an existing NodeSchema.id in the same workflow.
     */
    target: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    _id: false, // Edges are identified by their `id` string field
  }
);

/* ─────────────────────────────────────────────
 * MAIN SCHEMA: Workflow
 * Top-level document stored in the `workflows`
 * collection. Owned by a single User and contains
 * the full graph definition (nodes + edges) along
 * with display metadata (name).
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
      index: true, // Common query pattern: find all workflows by user
    },

    /**
     * Human-readable label for the workflow.
     * Displayed in the dashboard and used for search.
     * Example: "Lead Enrichment Pipeline", "Daily Report Generator"
     */
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    /**
     * Ordered collection of processing units in the workflow graph.
     * The engine resolves execution order via the edges array, not
     * the array index, so insertion order is not significant.
     */
    nodes: {
      type: [NodeSchema],
      default: [],
    },

    /**
     * Directed connections between nodes.
     * Together with `nodes`, these define the full DAG
     * (Directed Acyclic Graph) that the engine traverses.
     */
    edges: {
      type: [EdgeSchema],
      default: [],
    },
  },
  {
    /**
     * Automatically manages `createdAt` and `updatedAt` fields.
     * `updatedAt` is refreshed on every save/update operation,
     * making it useful for cache invalidation and audit trails.
     */
    timestamps: true,

   
  }
);

/* ─────────────────────────────────────────────
 * INDEXES
 * Compound index on (userId, name) supports fast
 * lookup when checking for duplicate workflow names
 * within the same user's account.
 * ───────────────────────────────────────────── */
WorkflowSchema.index({ userId: 1 });

/* ─────────────────────────────────────────────
 * MODEL EXPORT
 * Exported as a named constant so the service
 * layer can import it directly:
 *   import Workflow from "../models/workflowModel.js";
 * ───────────────────────────────────────────── */
const Workflow = model("Workflow", WorkflowSchema);

export default Workflow;