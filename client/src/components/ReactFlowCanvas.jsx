// src/components/ReactFlowCanvas.jsx

import { ReactFlow, Background, Controls, MiniMap } from '@xyflow/react';
import { nodeTypes } from './nodes/nodeTypes';

/**
 * ReactFlowCanvas
 *
 * A thin, controlled wrapper around the React Flow canvas.
 *
 * WHY "controlled" (MVP rewrite):
 * The original Day 5 version hardcoded two placeholder nodes purely to
 * prove the canvas rendered. This version takes nodes/edges/handlers as
 * PROPS instead, making WorkflowBuilderPage (the parent) the single
 * source of truth for the graph's state — exactly the same pattern
 * React Flow's own docs recommend, and the only way "Save Workflow"
 * can know what to persist.
 *
 * WHY A SEPARATE COMPONENT INSTEAD OF INLINING IN WorkflowBuilderPage:
 * - Keeps the page component focused on layout/page-level concerns
 *   (fetching the workflow, wiring the config panel, saving, running).
 * - Easier to test and reason about the canvas in isolation.
 */
function ReactFlowCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  onPaneClick,
}) {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        fitView
        deleteKeyCode={['Backspace', 'Delete']}
      >
        <Background />
        <Controls />
        <MiniMap pannable zoomable />
      </ReactFlow>
    </div>
  );
}

export default ReactFlowCanvas;
