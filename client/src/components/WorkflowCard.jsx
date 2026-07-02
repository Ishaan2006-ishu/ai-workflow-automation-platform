
import React from "react";
import { useNavigate } from "react-router-dom";

// Displays a single workflow with Edit and Delete actions
// Receives the workflow object as a prop from DashboardPage
const WorkflowCard = ({ workflow }) => {
  const navigate = useNavigate();

  // Navigates to the existing Workflow Builder route for this workflow
  const handleEdit = () => {
    navigate(`/workflow-builder/${workflow._id}`);
  };

  return (
    <div className="workflow-card">
      <h3 className="workflow-card-name">{workflow.name}</h3>

      <div className="workflow-card-actions">
        <button onClick={handleEdit}>Edit</button>

        {/* Delete button is UI-only for now — no functionality yet (Day 3 scope) */}
        <button>Delete</button>
      </div>
    </div>
  );
};

export default WorkflowCard;