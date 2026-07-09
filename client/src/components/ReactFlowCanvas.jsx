// src/components/ReactFlowCanvas.jsx

// React Flow's core component + built-in UI helpers.
// Background = the dotted/grid canvas backdrop
// Controls = zoom/fit-view buttons in the corner
// MiniMap = small overview map in the corner
import { ReactFlow, Background, Controls, MiniMap } from '@xyflow/react';

// Placeholder nodes so we can SEE the canvas working before real
// workflow data exists. These will later come from state/API data,
// not be hardcoded here — this is just for Day 5 visual proof.
const initialNodes = [
  {
    id: '1',
    position: { x: 100, y: 100 }, // x/y coordinates on the canvas
    data: { label: 'Start' },     // text shown inside the node
  },
  {
    id: '2',
    position: { x: 350, y: 100 },
    data: { label: 'Action' },
  },
];

// Placeholder edge connecting the two placeholder nodes above.
// 'source' and 'target' must match node ids exactly.
const initialEdges = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
  },
];

/**
 * ReactFlowCanvas
 *
 * A self-contained wrapper around the React Flow canvas.
 *
 * Why a separate component instead of putting this directly in
 * WorkflowBuilderPage?
 * - Keeps the page component focused on layout/page-level concerns.
 * - Makes the canvas reusable if we need it in another page later
 *   (e.g. a read-only workflow preview).
 * - Easier to test and reason about in isolation.
 *
 * Note: We are NOT wiring up onNodesChange/onEdgesChange/onConnect
 * yet, because Day 5's scope is "render a working canvas," not
 * "support editing." That comes in a later day once we handle
 * workflow saving.
 */
function ReactFlowCanvas() {
  return (
    // The outer div MUST have an explicit height, or React Flow
    // renders a canvas with zero visible height (a common gotcha).
    <div style={{ width: '100%', height: '600px' }}>
      <ReactFlow
        nodes={initialNodes}
        edges={initialEdges}
        fitView // automatically zooms/pans so all nodes are visible on load
      >
        {/* Dotted grid background so the canvas doesn't look empty/blank */}
        <Background />

        {/* Zoom in/out and "fit view" buttons, bottom-left by default */}
        <Controls />

        {/* Small overview map, useful once workflows get large */}
        <MiniMap />
      </ReactFlow>
    </div>
  );
}

export default ReactFlowCanvas;