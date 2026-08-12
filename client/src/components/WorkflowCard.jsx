// src/components/WorkflowCard.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteWorkflow } from "../api/workflowApi";

// Displays a single workflow with Edit and Delete actions
// Receives the workflow object and a callback from DashboardPage
const WorkflowCard = ({ workflow, onDelete }) => {
  const navigate = useNavigate();

  const [isDeleting, setIsDeleting] = useState(false);

  // ============================================================
  // EDIT
  // ============================================================

  const handleEdit = () => {
    navigate(`/workflow-builder/${workflow._id}`);
  };


  // ============================================================
  // DELETE
  // ============================================================

  const handleDelete = async () => {

    // Ask user for confirmation before permanently deleting
    const confirmed = window.confirm(
      `Are you sure you want to delete "${workflow.name}"?`
    );

    if (!confirmed) {
      return;
    }


    try {
      setIsDeleting(true);

      // Delete workflow from MongoDB
      await deleteWorkflow(workflow._id);

      // Tell DashboardPage that deletion succeeded
      onDelete(workflow._id);

    } catch (error) {

      console.error(
        "[WorkflowCard] Delete workflow:",
        error
      );

      alert(
        error.message ||
          "Failed to delete workflow."
      );

    } finally {
      setIsDeleting(false);
    }
  };


  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="workflow-card">

      <h3 className="workflow-card-name">
        {workflow.name}
      </h3>


      <div className="workflow-card-actions">

        {/* Edit */}
        <button onClick={handleEdit}>
          Edit
        </button>


        {/* Delete */}
        <button
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting
            ? "Deleting..."
            : "Delete"}
        </button>

      </div>

    </div>
  );
};


export default WorkflowCard;