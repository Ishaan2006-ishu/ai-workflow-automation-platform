// src/pages/WorkflowBuilderPage.jsx

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNodesState, useEdgesState, addEdge } from '@xyflow/react';

import Navbar from '../components/Navbar';
import ReactFlowCanvas from '../components/ReactFlowCanvas';
import NodePanel from '../components/NodePanel';
import NodeConfigPanel from '../components/NodeConfigPanel';
import RunWorkflowPanel from '../components/RunWorkflowPanel';
import {
  getWorkflowById,
  saveWorkflow,
  createWorkflow,
  executeWorkflow,
} from '../api/workflowApi';
import './WorkflowBuilderPage.css';

/**
 * defaultDataForType
 *
 * WHY: every new node needs SOME starting `data` object so the config
 * panel and the engine never encounter `undefined`. Kept as one small
 * lookup rather than scattering `if (type === 'ai') {...}` branches
 * across the file.
 */
function defaultDataForType(type) {
  switch (type) {
  case 'ai':
    return {
      prompt:
        "Analyze the sentiment of the following customer feedback. Respond with exactly one word: 'positive' or 'negative'.",
    };
  case 'condition':
    return { condition: 'contains_positive' };
  case 'notification':
    return { message: '' };
  case 'start':
  default:
    return {};
  }
}

/**
 * normalizeNodeData
 *
 * WHY THIS EXISTS (bug fix):
 * React Flow itself never crashes on a node with a missing `data`
 * field — CustomNodes.jsx and NodeConfigPanel.jsx both read node.data
 * with optional chaining (`data?.prompt`, etc.), so a node without
 * `data` renders fine on the canvas. But the BACKEND's save validator
 * (workflowValidator.js's validateNode) correctly requires every node
 * to have a real `data` object — and rejects the whole save with
 * "must contain a data object" if even one node doesn't. Some
 * workflows in the database were saved before `data` was always
 * guaranteed on every node type (or via routes outside this builder),
 * so loading one of those and clicking Save reproduces exactly that
 * validation error.
 *
 * This function is the single place that guarantees a node always has
 * a valid `data` object — a plain, non-null, non-array object — no
 * matter where the node came from. It's intentionally a pure,
 * side-effect-free transform (returns a new node rather than mutating)
 * so it's safe to run on every node on both load and save without
 * worrying about stale references.
 */
function normalizeNodeData(node) {
  const hasValidData =
    node.data !== null &&
    typeof node.data === 'object' &&
    !Array.isArray(node.data);

  return hasValidData ? node : { ...node, data: {} };
}

/**
 * NON_EDIT_CHANGE_TYPES
 *
 * React Flow node/edge change types that do NOT represent a real edit
 * to the graph — see the full explanation in the isRealEdit() usage
 * below. Declared at module scope (not inside the component) so it's
 * a stable reference across renders, which is what lets the
 * useCallback hooks that use it skip listing it as a dependency.
 */
const NON_EDIT_CHANGE_TYPES = new Set(['dimensions', 'select']);

/**
 * WorkflowBuilderPage
 *
 * Route: /workflow-builder/:workflowId
 *
 * MVP REWRITE — this page went from a static layout shell (NodePanel +
 * ReactFlowCanvas rendered with no data or handlers) to the actual
 * builder: it owns the graph's state (nodes/edges), loads/saves it
 * against the backend, lets the user configure each node, and runs
 * the saved workflow against real input.
 *
 * Layout:
 *   -------------------------------------------------------------
 *   | Navbar (full width)                                        |
 *   -------------------------------------------------------------
 *   | Toolbar: workflow name · Back · Save · status                |
 *   -------------------------------------------------------------
 *   | Node Panel | Canvas (flex-grow)     | Config Panel (opt.)  |
 *   |            |                        |----------------------|
 *   |            |                        | Run Workflow Panel   |
 *   -------------------------------------------------------------
 */
function WorkflowBuilderPage() {
  const { workflowId } = useParams();
  const navigate = useNavigate();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const [workflowName, setWorkflowName] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Tracks whether the canvas has unsaved changes. The backend engine
  // always runs the PERSISTED graph (see executionController.js), so
  // "Run Workflow" is only meaningful — and only enabled — right after
  // a successful save, never against edits that only exist in the
  // browser.
  const [isDirty, setIsDirty] = useState(false);
  const [effectiveWorkflowId, setEffectiveWorkflowId] = useState(workflowId);

  // ── Load the workflow on mount ─────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const loadWorkflow = async () => {
      setIsLoading(true);
      setLoadError('');

      try {
        // Safety net: an old bookmark/link using the pre-MVP
        // "/workflow-builder/new" placeholder still works by creating
        // a real workflow on the fly, rather than trying (and failing)
        // to fetch a workflow whose id is literally the word "new".
        if (workflowId === 'new') {
          const created = await createWorkflow({ name: 'Untitled Workflow' });
          const newId = created.data.workflowId;
          if (!cancelled) {
            navigate(`/workflow-builder/${newId}`, { replace: true });
          }
          return;
        }

        const response = await getWorkflowById(workflowId);
        const workflow = response.data;

        if (cancelled) return;

        setWorkflowName(workflow.name || 'Untitled Workflow');
        // Bug fix: normalize every loaded node so a legacy node saved
        // without a `data` object (from before this was consistently
        // enforced) becomes `data: {}` instead of silently carrying a
        // missing/invalid data field that would later fail the
        // backend's save validation the moment the user hits Save.
        setNodes((workflow.nodes || []).map(normalizeNodeData));
        setEdges(workflow.edges || []);
        setEffectiveWorkflowId(workflow._id);
        setIsDirty(false);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err.message || 'Failed to load this workflow.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadWorkflow();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workflowId]);

  // MVP fix (Issue 2 — run without edit/save): React Flow's onNodesChange
  // / onEdgesChange fire for changes that are NOT real edits — most
  // importantly a 'dimensions' change for every node the moment React
  // Flow measures it on initial mount, and a 'select' change whenever a
  // node/edge is merely clicked to view/select it. The previous code
  // called setIsDirty(true) for ANY change at all, which meant a
  // workflow was marked "unsaved" the instant it finished rendering —
  // even with zero user edits — permanently forcing Save before Run.
  // This is the actual root cause the bug report asked to be fixed
  // (not just disabling/hiding the Run button): only change types that
  // represent a genuine edit to the persisted graph should flip
  // isDirty.
  const isRealEdit = useCallback(
    (changes) => changes.some((change) => !NON_EDIT_CHANGE_TYPES.has(change.type)),
    []
  );

  const handleAddNode = useCallback(
    (type) => {
      if (type === 'start' && nodes.some((n) => n.type === 'start')) {
        window.alert('This workflow already has a Start node. Only one is allowed.');
        return;
      }

      const newNode = {
        id: `${type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type,
        // Staggered placement so newly-added nodes don't all stack on
        // top of each other at (0,0) — simple, no collision detection
        // needed for MVP scope.
        position: {
          x: 120 + ((nodes.length * 60) % 480),
          y: 80 + ((nodes.length * 90) % 420),
        },
        data: defaultDataForType(type),
      };

      setNodes((prev) => [...prev, newNode]);
      setIsDirty(true);
    },
    [nodes, setNodes]
  );

  const handleNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes);
      if (isRealEdit(changes)) {
        setIsDirty(true);
      }
    },
    [onNodesChange, isRealEdit]
  );

  const handleEdgesChange = useCallback(
    (changes) => {
      onEdgesChange(changes);
      if (isRealEdit(changes)) {
        setIsDirty(true);
      }
    },
    [onEdgesChange, isRealEdit]
  );

  const handleConnect = useCallback(
    (params) => {
      // addEdge (from @xyflow/react) preserves `sourceHandle` from the
      // connection params automatically — this is the exact field the
      // backend engine reads to route a Condition node's True/False
      // branches (see workflowEngine.js's findNextNode).
      setEdges((prev) => addEdge(params, prev));
      setIsDirty(true);
    },
    [setEdges]
  );

  const handleNodeClick = useCallback((_event, node) => {
    setSelectedNodeId(node.id);
  }, []);

  const handlePaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  const handleNodeConfigChange = useCallback(
    (nodeId, newData) => {
      setNodes((prev) =>
        prev.map((n) => (n.id === nodeId ? { ...n, data: newData } : n))
      );
      setIsDirty(true);
    },
    [setNodes]
  );

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null;

  // ── Save ─────────────────────────────────────────────────────────

  // MVP fix (Issue 1 — workflow naming): renaming is a real edit to the
  // persisted document just like adding a node — it should require a
  // Save before Run can trust it's reflected on the backend, exactly
  // like every other change tracked by isDirty.
  const handleNameChange = useCallback((value) => {
    setWorkflowName(value);
    setIsDirty(true);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');

    // Falls back to a default so an emptied-out name field can't save
    // a workflow with a blank name (the backend validator would also
    // reject this, but catching it here avoids a round trip for the
    // most common way to trigger it).
    const nameToSave = workflowName.trim().length > 0 ? workflowName.trim() : 'Untitled Workflow';

    try {
      // Strip React Flow's client-only runtime fields (selected,
      // dragging, measured, etc.) down to just what the backend schema
      // actually validates/stores — keeps the payload predictable even
      // though Mongoose would silently drop unknown fields anyway.
      //
      // Bug fix: run every node through normalizeNodeData() here too
      // (not just on load) as a second, defensive guarantee — so a
      // node can never leave this page without a valid `data` object,
      // regardless of how it got into state (e.g. a node added via
      // some future code path that forgets to set one).
      const cleanNodes = nodes.map(normalizeNodeData).map((n) => ({
        id: n.id,
        type: n.type,
        position: n.position,
        data: n.data,
      }));

      const cleanEdges = edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        ...(e.sourceHandle ? { sourceHandle: e.sourceHandle } : {}),
      }));

      // MVP fix (Issue 1 — workflow naming): `name` now travels in the
      // same PUT request as nodes/edges, updating the SAME workflow
      // document (see workflowService.js's saveWorkflow) rather than
      // creating a new one — this is what makes "rename + Save" update
      // the existing workflow's name instead of duplicating it.
      await saveWorkflow(effectiveWorkflowId, {
        name: nameToSave,
        nodes: cleanNodes,
        edges: cleanEdges,
      });

      setWorkflowName(nameToSave);
      setIsDirty(false);
      setSaveMessage('Saved.');
      setTimeout(() => setSaveMessage(''), 2500);
    } catch (err) {
      setSaveMessage(err.message || 'Failed to save workflow.');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Run ──────────────────────────────────────────────────────────

  const handleRun = async (input) => {
    const response = await executeWorkflow(effectiveWorkflowId, input);
    const data = response.data;

    // Reshape the backend's response into the flat object
    // RunWorkflowPanel expects (see that component's file header).
    return {
      status: data.status,
      output: data.execution?.output,
      execution: data.execution,
      notification: data.notification,
    };
  };

  if (isLoading) {
    return (
      <div className="workflow-builder-page">
        <Navbar />
        <div className="workflow-builder-page__status">Loading workflow…</div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="workflow-builder-page">
        <Navbar />
        <div className="workflow-builder-page__status workflow-builder-page__status--error">
          {loadError}
        </div>
      </div>
    );
  }

  return (
    <div className="workflow-builder-page">
      <Navbar />

      <header className="workflow-builder-page__header">
        <div className="workflow-builder-page__header-left">
          <button
            className="workflow-builder-page__back-btn"
            onClick={() => navigate('/dashboard')}
          >
            ← Back to Dashboard
          </button>
          <input
            type="text"
            className="workflow-builder-page__name-input"
            value={workflowName}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Untitled Workflow"
            aria-label="Workflow name"
            maxLength={150}
          />
        </div>

        <div className="workflow-builder-page__header-right">
          {saveMessage && <span className="workflow-builder-page__save-msg">{saveMessage}</span>}
          {isDirty && !saveMessage && (
            <span className="workflow-builder-page__dirty-msg">Unsaved changes</span>
          )}
          <button
            className="workflow-builder-page__save-btn"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving…' : 'Save Workflow'}
          </button>
        </div>
      </header>

      <div className="workflow-builder-page__body">
        <div className="workflow-builder-page__panel">
          <NodePanel onAddNode={handleAddNode} />
        </div>

        <div className="workflow-builder-page__canvas">
          <ReactFlowCanvas
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onConnect={handleConnect}
            onNodeClick={handleNodeClick}
            onPaneClick={handlePaneClick}
          />
        </div>

        <div className="workflow-builder-page__side">
          {selectedNode && (
            <NodeConfigPanel
              key={selectedNode.id}
              node={selectedNode}
              onChange={handleNodeConfigChange}
              onClose={() => setSelectedNodeId(null)}
            />
          )}
          <RunWorkflowPanel onRun={handleRun} disabled={isDirty || isSaving} />
        </div>
      </div>
    </div>
  );
}

export default WorkflowBuilderPage;