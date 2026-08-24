// pages/DashboardPage.jsx
// -----------------------
// Dashboard page: lists the user's workflows and lets them create,
// edit, or delete a workflow, and jump into Execution History.
// Rendered at: /dashboard (private route — requires authentication)

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import WorkflowCard from "../components/WorkflowCard";
import { getWorkflows, createWorkflow, deleteWorkflow } from "../api/workflowApi";
import "./DashboardPage.css";

const DashboardPage = () => {
  const navigate = useNavigate();

  // Holds the list of workflows fetched from the backend
  const [workflows, setWorkflows] = useState([]);

  // Tracks whether the fetch request is still in progress
  const [isLoading, setIsLoading] = useState(true);

  // Holds an error message if the fetch fails
  const [error, setError] = useState("");

  // Tracks whether "Create Workflow" is currently in flight, so the
  // button can show feedback and not be double-clicked into creating
  // two workflows at once.
  const [isCreating, setIsCreating] = useState(false);

  // Fetch workflows once when the Dashboard mounts
  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        const response = await getWorkflows();
        // BUGFIX: the backend's sendSuccess() previously omitted the
        // `data` field entirely for an empty array (see
        // responseHelper.js), which made response.data undefined here
        // for any brand-new user with zero workflows. That's now
        // fixed on the backend, but `|| []` is kept as a defensive
        // fallback so this page never crashes on `.length`/`.map()`
        // even if a future backend change reintroduces the issue.
        setWorkflows(response.data || []);
      } catch {
        setError("Failed to load workflows. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkflows();
  }, []);

  // Creates a brand-new workflow via the backend (so it has a real
  // _id from the very first save), then navigates straight into the
  // builder for it.
  //
  // WHY THIS CHANGED: the previous version navigated to
  // "/workflow-builder/new" — a literal string "new" that isn't a
  // valid Mongo ObjectId, which the builder page had no way to turn
  // into a real, saveable workflow. Creating it here means the
  // builder always receives a real _id to work with.
  const handleCreateWorkflow = async () => {
    setIsCreating(true);
    setError("");

    try {
      const response = await createWorkflow({ name: "Untitled Workflow" });
      const newWorkflowId = response.data.workflowId;
      navigate(`/workflow-builder/${newWorkflowId}`);
    } catch (err) {
      setError(err.message || "Failed to create workflow. Please try again.");
      setIsCreating(false);
    }
  };

  // Deletes a workflow, then removes it from local state so the UI
  // updates immediately without a full re-fetch.
  const handleDeleteWorkflow = async (workflowId) => {
    try {
      await deleteWorkflow(workflowId);
      setWorkflows((prev) => prev.filter((w) => w._id !== workflowId));
    } catch (err) {
      setError(err.message || "Failed to delete workflow. Please try again.");
    }
  };

  return (
    <div className="dashboard-shell">
      <Navbar />

      <div className="dashboard-page">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Dashboard</h1>
            <p className="dashboard-subtitle">
              Build, run, and track your AI-powered workflows.
            </p>
          </div>
          <button
            className="dashboard-create-btn"
            onClick={handleCreateWorkflow}
            disabled={isCreating}
          >
            {isCreating ? "Creating…" : "+ Create Workflow"}
          </button>
        </div>

        <div className="workflow-list">
          {/* Loading state */}
          {isLoading && <p className="dashboard-status">Loading workflows...</p>}

          {/* Error state */}
          {!isLoading && error && <p className="dashboard-status dashboard-status--error">{error}</p>}

          {/* Empty state */}
          {!isLoading && !error && workflows.length === 0 && (
            <div className="dashboard-empty">
              <p>No workflows yet.</p>
              <p className="dashboard-empty__hint">
                Click "Create Workflow" to build your first automation.
              </p>
            </div>
          )}

          {/* Success state — render one WorkflowCard per workflow */}
          {!isLoading &&
            !error &&
            workflows.map((workflow) => (
              <WorkflowCard
                key={workflow._id}
                workflow={workflow}
                onDelete={handleDeleteWorkflow}
              />
            ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
