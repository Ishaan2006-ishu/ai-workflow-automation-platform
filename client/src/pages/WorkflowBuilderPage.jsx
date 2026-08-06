// src/pages/WorkflowBuilderPage.jsx

import { useState } from "react";
import ReactFlowCanvas from "../components/ReactFlowCanvas";
import NodePanel from "../components/NodePanel";
import "./WorkflowBuilderPage.css";

/**
 * WorkflowBuilderPage
 *
 * Parent component of the Workflow Builder.
 *
 * Responsibilities:
 * 1. Own the workflow state (nodes & edges)
 * 2. Pass state to ReactFlowCanvas
 * 3. Pass functions (callbacks) to NodePanel
 */

function WorkflowBuilderPage() {
  // ==========================
  // Workflow State
  // ==========================
  const [nodes, setNodes] = useState([
    {
      id: "1",
      type: "start",
      position: { x: 100, y: 100 },
      data: { label: "Start" },
    },
  ]);

  const [edges, setEdges] = useState([]);

  // ==========================
  // Add New Node
  // ==========================
  const addNode = (type) => {

  // ==========================
  // Allow only one Start node
  // ==========================
  if (type === "start") {
    const hasStartNode = nodes.some(
      (node) => node.type === "start"
    );

    if (hasStartNode) {
      alert("Only one Start node is allowed.");
      return;
    }
  }

  // ==========================
  // Create New Node
  // ==========================
  const newNode = {
    id: Date.now().toString(),
    type,
    position: {
  x: 100 + nodes.length * 80,
  y: 100 + nodes.length * 80,
},
    data: {
      label: type.toUpperCase(),
    },
  };

  setNodes((prevNodes) => [...prevNodes, newNode]);
};

  return (
    <div className="workflow-builder-page">
      {/* Header */}
      <header className="workflow-builder-page__header">
        <h1 className="workflow-builder-page__title">
          Workflow Builder
        </h1>
      </header>

      {/* Main Layout */}
      <div className="workflow-builder-page__body">
        {/* Left Sidebar */}
        <div className="workflow-builder-page__panel">
          <NodePanel onAddNode={addNode} />
        </div>

        {/* React Flow Canvas */}
        <div className="workflow-builder-page__canvas">
         <ReactFlowCanvas
    nodes={nodes}
    edges={edges}
    setNodes={setNodes}
    setEdges={setEdges}
/>
        </div>
      </div>
    </div>
  );
}

export default WorkflowBuilderPage;