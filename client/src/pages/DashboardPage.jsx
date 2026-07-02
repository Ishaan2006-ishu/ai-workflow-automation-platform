// pages/DashboardPage.jsx
// -----------------------
// Placeholder for the Dashboard page.
// Rendered at: /dashboard (private route — requires authentication)
//
// Day 1: Routing only. No workflow cards, no stats, no UI.
// Future days will add the dashboard UI and data fetching.

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import WorkflowCard from "../components/WorkflowCard";
import { getWorkflows } from "../api/workflowApi";

const DashboardPage = () => {
  const navigate = useNavigate();

  // Holds the list of workflows fetched from the backend
  const [workflows, setWorkflows] = useState([]);

  // Tracks whether the fetch request is still in progress
  const [isLoading, setIsLoading] = useState(true);

  // Holds an error message if the fetch fails
  const [error, setError] = useState("");

  // Fetch workflows once when the Dashboard mounts
  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        const data = await getWorkflows();
        setWorkflows(data);
      } catch (err) {
        setError("Failed to load workflows. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkflows();
  }, []);

  // Navigates to the existing Workflow Builder route to create a new workflow
  const handleCreateWorkflow = () => {
    navigate("/workflow-builder/new");
  };

  return (
    <div>
      <h1 style={{ color: "red" }}>THIS IS MY NEW DASHBOARD</h1>
      <Navbar />

      <div className="dashboard-page">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <button onClick={handleCreateWorkflow}>Create Workflow</button>
        </div>

        <div className="workflow-list">
          {/* Loading state */}
          {isLoading && <p>Loading workflows...</p>}

          {/* Error state */}
          {!isLoading && error && <p>{error}</p>}

          {/* Empty state */}
          {!isLoading && !error && workflows.length === 0 && (
            <p>No workflows yet. Click "Create Workflow" to get started.</p>
          )}

          {/* Success state — render one WorkflowCard per workflow */}
          {!isLoading &&
            !error &&
            workflows.map((workflow) => (
              <WorkflowCard key={workflow._id} workflow={workflow} />
            ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;