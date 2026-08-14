// src/pages/WorkflowBuilderPage.jsx

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

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
 *
 * 1. Create a new workflow
 * 2. Load an existing workflow
 * 3. Own nodes and edges state
 * 4. Save nodes, edges and workflow name
 * 5. Update node configuration
 */
function WorkflowBuilderPage() {

  // ==========================================================
  // WORKFLOW ID FROM URL
  // ==========================================================

  const { workflowId } = useParams();


  // ==========================================================
  // WORKFLOW NAME
  // ==========================================================

  const [workflowName, setWorkflowName] =
    useState("My Workflow");


  // ==========================================================
  // WORKFLOW STATE
  // ==========================================================

  const [nodes, setNodes] = useState([
    {
      id: "1",
      type: "start",
      position: {
        x: 100,
        y: 100,
      },
      data: {
        label: "Start",
      },
    },
  ]);

  const [edges, setEdges] = useState([]);


  // ==========================================================
  // SAVING STATE
  // ==========================================================

  const [isSaving, setIsSaving] =
    useState(false);

  const [saveMessage, setSaveMessage] =
    useState("");


  // ==========================================================
  // LOADING STATE
  // ==========================================================

  const [isLoading, setIsLoading] =
    useState(false);


  // ==========================================================
  // UPDATE CONDITION
  // ==========================================================

  const updateCondition = (
    nodeId,
    condition
  ) => {

    setNodes((prevNodes) =>
      prevNodes.map((node) => {

        if (node.id !== nodeId) {
          return node;
        }

        return {
          ...node,

          data: {
            ...node.data,
            condition,
          },
        };

      })
    );
  };


  // ==========================================================
  // LOAD EXISTING WORKFLOW
  // ==========================================================

  useEffect(() => {

    // New workflow
    if (
      !workflowId ||
      workflowId === "new"
    ) {
      return;
    }


    const loadWorkflow = async () => {

      try {

        setIsLoading(true);
        setSaveMessage("");


        const response =
          await getWorkflowById(
            workflowId
          );


        const workflow =
          response.data;


        // ==========================
        // Load workflow name
        // ==========================

        setWorkflowName(
          workflow.name ||
          "My Workflow"
        );


        // ==========================
        // Load nodes
        // ==========================

        const loadedNodes =
          (workflow.nodes || []).map(
            (node) => {

              if (
                node.type === "condition"
              ) {

                return {
                  ...node,

                  data: {
                    ...node.data,

                    condition:
                      node.data?.condition ||
                      "contains_positive",

                    onChange:
                      updateCondition,
                  },
                };

              }

              return node;
            }
          );


        setNodes(loadedNodes);


        // ==========================
        // Load edges
        // ==========================

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
          "Workflow not found"
        );

      } finally {

        setIsLoading(false);

      }
    };


    loadWorkflow();

  }, [workflowId]);


  // ==========================================================
  // ADD NODE
  // ==========================================================

  const addNode = (type) => {

    // ========================================================
    // Only one Start node
    // ========================================================

    if (type === "start") {

      const hasStartNode =
        nodes.some(
          (node) =>
            node.type === "start"
        );


      if (hasStartNode) {

        alert(
          "Only one Start node is allowed."
        );

        return;
      }
    }


    // ========================================================
    // Create new node
    // ========================================================

    const newNode = {

      id: Date.now().toString(),

      type,

      position: {
        x: 100 + nodes.length * 80,
        y: 100 + nodes.length * 80,
      },

      data: {

        label:
          type === "start"
            ? "Start"
            : type.toUpperCase(),


        // ====================================================
        // AI configuration
        // ====================================================

        ...(type === "ai" && {
          prompt: "",
        }),


        // ====================================================
        // Condition configuration
        // ====================================================

        ...(type === "condition" && {

          condition:
            "contains_positive",

          onChange:
            updateCondition,

        }),

      },

    };


    setNodes((prevNodes) => [
      ...prevNodes,
      newNode,
    ]);
  };


  // ==========================================================
  // SAVE WORKFLOW
  // ==========================================================

  const handleSaveWorkflow = async () => {

    try {

      setIsSaving(true);

      setSaveMessage("");


      // ======================================================
      // Validate workflow name
      // ======================================================

      if (!workflowName.trim()) {

        setSaveMessage(
          "Please enter a workflow name."
        );

        return;
      }


      // ======================================================
      // Current workflow ID
      // ======================================================

      let currentWorkflowId =
        workflowId !== "new"
          ? workflowId
          : null;


      // ======================================================
      // FIRST SAVE
      // ======================================================

      if (!currentWorkflowId) {

        const createResponse =
          await createWorkflow({

            name:
              workflowName.trim(),

          });


        currentWorkflowId =
          createResponse.data.workflowId;
      }


      // ======================================================
      // REMOVE FRONTEND-ONLY FUNCTIONS
      // ======================================================
      //
      // React needs `onChange`.
      //
      // MongoDB does NOT need it.
      //
      // We remove it before sending the nodes
      // to the backend.
      //
      // condition remains:
      //
      // data: {
      //   condition: "contains_positive"
      // }
      //
      // ======================================================

      const nodesToSave =
        nodes.map((node) => {

          const {
            onChange,
            ...cleanData
          } = node.data || {};


          return {
            ...node,

            data: cleanData,
          };

        });


      // ======================================================
      // SAVE NODES + EDGES + NAME
      // ======================================================

      await saveWorkflow(
        currentWorkflowId,
        {
          name:
            workflowName.trim(),

          nodes:
            nodesToSave,

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


  // ==========================================================
  // LOADING SCREEN
  // ==========================================================

  if (isLoading) {

    return (
      <div>

        <h2>
          Loading workflow...
        </h2>

      </div>
    );
  }


  // ==========================================================
  // UI
  // ==========================================================

  return (

    <div className="workflow-builder-page">

      {/* ====================================================
          HEADER
          ==================================================== */}

      <header
        className="workflow-builder-page__header"
      >

        <h1
          className="workflow-builder-page__title"
        >
          Workflow Builder
        </h1>


        {/* ==================================================
            Workflow Name
            ================================================== */}

        <input
          type="text"
          value={workflowName}
          onChange={(event) =>
            setWorkflowName(
              event.target.value
            )
          }
          placeholder="Workflow name"
        />


        {/* ==================================================
            Save Button
            ================================================== */}

        <button
          onClick={handleSaveWorkflow}
          disabled={isSaving}
        >
          {isSaving
            ? "Saving..."
            : "Save Workflow"}
        </button>


        {/* ==================================================
            Save Message
            ================================================== */}

        {saveMessage && (
          <span>
            {saveMessage}
          </span>
        )}

      </header>


      {/* ====================================================
          MAIN BODY
          ==================================================== */}

      <div
        className="workflow-builder-page__body"
      >

        {/* ==================================================
            NODE PANEL
            ================================================== */}

        <div
          className="workflow-builder-page__panel"
        >

          <NodePanel
            onAddNode={addNode}
          />

        </div>


        {/* ==================================================
            REACT FLOW CANVAS
            ================================================== */}

        <div
          className="workflow-builder-page__canvas"
        >

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