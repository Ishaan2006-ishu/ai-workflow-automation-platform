// src/pages/WorkflowBuilderPage.jsx

import ReactFlowCanvas from '../components/ReactFlowCanvas';
import NodePanel from '../components/NodePanel';
import './WorkflowBuilderPage.css';

/**
 * WorkflowBuilderPage
 *
 * Route-level page for building workflows. Still stays "dumb" about
 * both React Flow and the node panel — its only job is layout:
 *
 *   -----------------------------------------
 *   | Node Panel (~250px) | Canvas (rest)    |
 *   -----------------------------------------
 *
 * fixed at full viewport height, never stacked vertically.
 *
 * This pass only touches layout (the wrapper structure + CSS
 * classes below). NodePanel and ReactFlowCanvas each own their own
 * internals, so neither React Flow's nodes/edges/handlers nor the
 * node panel's data were changed here.
 */
function WorkflowBuilderPage() {
  return (
    <div className="workflow-builder-page">
      {/* Compact header — a small title bar, not a hero section,
          so it doesn't eat vertical space the canvas needs. */}
      <header className="workflow-builder-page__header">
        <h1 className="workflow-builder-page__title">Workflow Builder</h1>
      </header>

      {/* Flex row: panel and canvas side by side, filling the
          remaining viewport height below the header. */}
      <div className="workflow-builder-page__body">
        <div className="workflow-builder-page__panel">
          <NodePanel />
        </div>

        <div className="workflow-builder-page__canvas">
          <ReactFlowCanvas />
        </div>
      </div>
    </div>
  );
}

export default WorkflowBuilderPage;