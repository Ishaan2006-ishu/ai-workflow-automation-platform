import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./WorkflowCard.css";

// Displays a single workflow with Edit and Delete actions
// Receives the workflow object and an onDelete callback from DashboardPage
const WorkflowCard = ({ workflow, onDelete }) => {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  // Navigates to the existing Workflow Builder route for this workflow
  const handleEdit = () => {
    navigate(`/workflow-builder/${workflow._id}`);
  };

  // Confirms with the user, then delegates the actual API call to the
  // parent (DashboardPage), which owns the workflows list and needs to
  // remove this entry from it once the delete succeeds.
  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Delete "${workflow.name}"? This cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete(workflow._id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="workflow-card">
      <h3 className="workflow-card-name">{workflow.name}</h3>

      <div className="workflow-card-actions">
        <button className="workflow-card-btn workflow-card-btn--edit" onClick={handleEdit}>
          Edit
        </button>

        <button
          className="workflow-card-btn workflow-card-btn--delete"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? "Deleting…" : "Delete"}
        </button>
      </div>
    </div>
  );
};

export default WorkflowCard;
