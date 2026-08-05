// src/components/ReactFlowCanvas.jsx

import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  applyNodeChanges,
} from "@xyflow/react";

/**
 * ReactFlowCanvas
 *
 * Responsibilities:
 * 1. Display workflow nodes and edges.
 * 2. Notify the parent when nodes move.
 *
 * NOTE:
 * WorkflowBuilderPage owns the state.
 * This component only renders it and reports changes.
 */

function ReactFlowCanvas({
  nodes,
  edges,
  setNodes,
}) {

  /**
   * Called automatically by React Flow whenever:
   * - a node is dragged
   * - a node is selected
   * - a node position changes
   */
  const onNodesChange = (changes) => {
    setNodes((prevNodes) =>
      applyNodeChanges(changes, prevNodes)
    );
  };

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}

export default ReactFlowCanvas;