// src/pages/DashboardPage.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import WorkflowCard from "../components/WorkflowCard";

import { getWorkflows } from "../api/workflowApi";


const DashboardPage = () => {

  const navigate = useNavigate();


  // ============================================================
  // WORKFLOW STATE
  // ============================================================

  const [workflows, setWorkflows] = useState([]);


  // ============================================================
  // LOADING STATE
  // ============================================================

  const [isLoading, setIsLoading] = useState(true);


  // ============================================================
  // ERROR STATE
  // ============================================================

  const [error, setError] = useState("");


  // ============================================================
  // FETCH WORKFLOWS
  // ============================================================

  useEffect(() => {

    const fetchWorkflows = async () => {

      try {

        const response = await getWorkflows();

        console.log(
          "WORKFLOW RESPONSE:",
          response
        );


        /*
          Backend response:

          {
            success: true,
            message: "Workflows fetched successfully",
            data: [...]
          }

          Therefore the actual workflow array
          is response.data.
        */

        setWorkflows(
          response.data || []
        );

      } catch (err) {

        console.error(
          "[DashboardPage] Fetch workflows:",
          err
        );

        setError(
          err.message ||
          "Failed to load workflows."
        );

      } finally {

        setIsLoading(false);

      }

    };


    fetchWorkflows();

  }, []);


  // ============================================================
  // CREATE WORKFLOW
  // ============================================================

  const handleCreateWorkflow = () => {

    navigate("/workflow-builder/new");

  };


  // ============================================================
  // DELETE WORKFLOW
  // ============================================================

  const handleDeleteWorkflow = (deletedWorkflowId) => {

    /*
      Remove the deleted workflow from React state.

      Example:

      Before:
      [A, B, C]

      Delete B

      After:
      [A, C]
    */

    setWorkflows((prevWorkflows) =>
      prevWorkflows.filter(
        (workflow) =>
          workflow._id !== deletedWorkflowId
      )
    );

  };


  // ============================================================
  // UI
  // ============================================================

  return (

    <div className="dashboard-page">

      {/* ======================================================
          NAVBAR
          ====================================================== */}

      <Navbar />


      {/* ======================================================
          HEADER
          ====================================================== */}

      <div className="dashboard-header">

        <h1>
          Dashboard
        </h1>


        <button
          onClick={handleCreateWorkflow}
        >
          Create Workflow
        </button>

      </div>


      {/* ======================================================
          WORKFLOW LIST
          ====================================================== */}

      <div className="workflow-list">

        {/* ----------------------------------------------------
            Loading State
            ---------------------------------------------------- */}

        {isLoading && (
          <p>
            Loading workflows...
          </p>
        )}


        {/* ----------------------------------------------------
            Error State
            ---------------------------------------------------- */}

        {!isLoading && error && (
          <p>
            {error}
          </p>
        )}


        {/* ----------------------------------------------------
            Empty State
            ---------------------------------------------------- */}

        {!isLoading &&
          !error &&
          workflows.length === 0 && (

            <p>
              No workflows yet.
              Click "Create Workflow" to get started.
            </p>

          )}


        {/* ----------------------------------------------------
            Workflow Cards
            ---------------------------------------------------- */}

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

  );

};


export default DashboardPage;