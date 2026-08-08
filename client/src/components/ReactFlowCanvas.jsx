// src/components/ReactFlowCanvas.jsx

import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from "@xyflow/react";

import StartNode from "./nodes/StartNode";
import AINode from "./nodes/AINode";
import ConditionNode from "./nodes/ConditionNode";
import NotificationNode from "./nodes/NotificationNode";

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
  // Node Changes
  // ==========================
  const onNodesChange = (changes) => {
    setNodes((prevNodes) =>
      applyNodeChanges(changes, prevNodes)
    );
  };

  // ==========================
  // Edge Changes
  // ==========================
  const onEdgesChange = (changes) => {
    console.log("EDGE CHANGE:", changes);

    setEdges((prevEdges) =>
      applyEdgeChanges(changes, prevEdges)
    );
  };

  // ==========================
  // Create Connection
  // ==========================
  const onConnect = (connection) => {
    console.log("NEW CONNECTION:", connection);

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
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}

        elementsSelectable={true}
        edgesFocusable={true}
        deleteKeyCode={["Backspace", "Delete"]}

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