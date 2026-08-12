// src/pages/WorkflowBuilderPage.jsx

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import ReactFlowCanvas from "../components/ReactFlowCanvas";
import NodePanel from "../components/NodePanel";

import {
  createWorkflow,
  getWorkflowById,
  saveWorkflow,
} from "../api/workflowApi";

import "./WorkflowBuilderPage.css";

/**
 * WorkflowBuilderPage
 *
 * Responsibilities:
 * 1. Own workflow state (nodes & edges)
 * 2. Display the workflow builder
 * 3. Create a new workflow when saving for the first time
 * 4. Load an existing workflow when editing
 * 5. Save nodes and edges to the backend
 */

function WorkflowBuilderPage() {
  // ============================================================
  // URL PARAMETER
  // ============================================================

  /*
    AppRouter.jsx defines:

    /workflow-builder/:workflowId

    Therefore React Router gives us "workflowId".
  */
  const { workflowId: urlWorkflowId } = useParams();

  const navigate = useNavigate();


  // ============================================================
  // WORKFLOW STATE
  // ============================================================

  const [nodes, setNodes] = useState([
    {
      id: "1",
      type: "start",
      position: { x: 100, y: 100 },
      data: {
        label: "Start",
      },
    },
  ]);

  const [edges, setEdges] = useState([]);


  // ============================================================
  // WORKFLOW INFORMATION
  // ============================================================

  /*
    If URL is:

    /workflow-builder/new

    this becomes null because the workflow
    has not been created yet.

    If URL is:

    /workflow-builder/abc123

    this becomes "abc123".
  */
  const [workflowId, setWorkflowId] = useState(
    urlWorkflowId !== "new"
      ? urlWorkflowId
      : null
  );

  const [workflowName, setWorkflowName] = useState("");


  // ============================================================
  // LOADING STATE
  // ============================================================

  const [isLoading, setIsLoading] = useState(
    urlWorkflowId !== "new"
  );


  // ============================================================
  // SAVE STATE
  // ============================================================

  const [isSaving, setIsSaving] = useState(false);

  const [saveMessage, setSaveMessage] = useState("");


  // ============================================================
  // LOAD EXISTING WORKFLOW
  // ============================================================

  useEffect(() => {

    // "new" means there is nothing to load.
    if (urlWorkflowId === "new") {
      setIsLoading(false);
      return;
    }


    const loadWorkflow = async () => {
      try {
        setIsLoading(true);
        setSaveMessage("");


        /*
          Ask backend for the workflow whose ID
          came from the URL.
        */
        const response = await getWorkflowById(
          urlWorkflowId
        );


        console.log(
          "LOADED WORKFLOW:",
          response
        );


        /*
          Backend response:

          {
            success: true,
            message: "...",
            data: workflow
          }

          So the actual workflow is response.data.
        */
        const workflow = response.data;


        // Store workflow information
        setWorkflowId(workflow._id);

        setWorkflowName(
          workflow.name || ""
        );


        // Restore saved canvas
        setNodes(
          workflow.nodes || []
        );

        setEdges(
          workflow.edges || []
        );

      } catch (error) {

        console.error(
          "[WorkflowBuilderPage] Load workflow:",
          error
        );

        setSaveMessage(
          error.message ||
            "Failed to load workflow."
        );

      } finally {
        setIsLoading(false);
      }
    };


    loadWorkflow();

  }, [urlWorkflowId]);


  // ============================================================
  // ADD NEW NODE
  // ============================================================

  const addNode = (type) => {

    // Only one Start node is allowed
    if (type === "start") {

      const hasStartNode = nodes.some(
        (node) => node.type === "start"
      );


      if (hasStartNode) {
        alert(
          "Only one Start node is allowed."
        );

        return;
      }
    }


    // Create new node
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


    setNodes((prevNodes) => [
      ...prevNodes,
      newNode,
    ]);
  };


  // ============================================================
  // SAVE WORKFLOW
  // ============================================================

  const handleSaveWorkflow = async () => {

    try {

      setIsSaving(true);

      setSaveMessage("");


      let currentWorkflowId = workflowId;


      // ========================================================
      // CREATE NEW WORKFLOW
      // ========================================================

      /*
        This runs ONLY when workflowId is null.

        That means we are currently on:

        /workflow-builder/new
      */

      if (!currentWorkflowId) {

        const createResponse =
          await createWorkflow({
            name:
              workflowName.trim() ||
              "My Workflow",
          });


        /*
          Backend returns:

          {
            success: true,
            data: {
              workflowId: "..."
            }
          }
        */

        currentWorkflowId =
          createResponse.data.workflowId;


        setWorkflowId(
          currentWorkflowId
        );


        /*
          Change URL from:

          /workflow-builder/new

          to:

          /workflow-builder/<workflowId>

          From this point onward,
          this workflow is an EXISTING workflow.
        */
        navigate(
          `/workflow-builder/${currentWorkflowId}`,
          {
            replace: true,
          }
        );
      }


      // ========================================================
      // SAVE NODES + EDGES
      // ========================================================

      await saveWorkflow(
        currentWorkflowId,
        {
          nodes,
          edges,
        }
      );


      setSaveMessage(
        "Workflow saved successfully."
      );

    } catch (error) {

      console.error(
        "[WorkflowBuilderPage] Save workflow:",
        error
      );


      setSaveMessage(
        error.message ||
          "Failed to save workflow."
      );

    } finally {

      setIsSaving(false);

    }
  };


  // ============================================================
  // LOADING SCREEN
  // ============================================================

  if (isLoading) {

    return (
      <div>
        <h2>
          Loading workflow...
        </h2>
      </div>
    );
  }


  // ============================================================
  // UI
  // ============================================================

  return (

    <div className="workflow-builder-page">

      {/* ==========================
          HEADER
          ========================== */}

      <header className="workflow-builder-page__header">

        <h1 className="workflow-builder-page__title">
          Workflow Builder
        </h1>


        {/* Workflow Name */}

        <input
          type="text"
          placeholder="Workflow name"
          value={workflowName}
          onChange={(event) =>
            setWorkflowName(
              event.target.value
            )
          }
        />


        {/* Save Button */}

        <button
          onClick={handleSaveWorkflow}
          disabled={isSaving}
        >
          {isSaving
            ? "Saving..."
            : "Save Workflow"}
        </button>


        {/* Save Message */}

        {saveMessage && (
          <span>
            {saveMessage}
          </span>
        )}

      </header>


      {/* ==========================
          MAIN LAYOUT
          ========================== */}

      <div className="workflow-builder-page__body">

        {/* LEFT SIDEBAR */}

        <div className="workflow-builder-page__panel">

          <NodePanel
            onAddNode={addNode}
          />

        </div>


        {/* REACT FLOW CANVAS */}

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