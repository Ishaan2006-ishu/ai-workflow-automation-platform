// src/components/ReactFlowCanvas.jsx

import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  applyNodeChanges,
  addEdge,
} from "@xyflow/react";

import StartNode from "./nodes/StartNode";
import AINode from "./nodes/AINode";
import ConditionNode from "./nodes/ConditionNode";
import NotificationNode from "./nodes/NotificationNode";

/**
 * ReactFlowCanvas
 *
 * Responsibilities:
 * 1. Display workflow nodes and edges.
 * 2. Notify parent when nodes move.
 * 3. Notify parent when two nodes are connected.
 *
 * WorkflowBuilderPage owns the state.
 */

const nodeTypes = {
  start: StartNode,
  ai: AINode,
  condition: ConditionNode,
  notification: NotificationNode,
};

function ReactFlowCanvas({
  nodes,
  edges,
  setNodes,
  setEdges,
}) {

  // ==========================
  // Node Dragging
  // ==========================
  const onNodesChange = (changes) => {
    setNodes((prevNodes) =>
      applyNodeChanges(changes, prevNodes)
    );
  };

  // ==========================
  // Node Connection
  // ==========================
  const onConnect = (connection) => {
    setEdges((prevEdges) =>
      addEdge(connection, prevEdges)
    );
  };

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
         nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onConnect={onConnect}
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