// src/pages/WorkflowBuilderPage.jsx

// Import the canvas component we just built. The page doesn't need
// to know anything about React Flow's internals — it just renders it.
import ReactFlowCanvas from '../components/ReactFlowCanvas';

/**
 * WorkflowBuilderPage
 *
 * This is the route-level page for building workflows.
 * It intentionally stays "dumb" about React Flow — its only job
 * right now is page layout (heading + canvas). Logic like saving,
 * loading, or executing workflows will be added on later days,
 * and even then it should live in hooks/context, not grow this
 * file into a monolith.
 */
function WorkflowBuilderPage() {
  return (
    <div>
      <h1>Workflow Builder</h1>

      {/* All the React Flow wiring lives inside this one component */}
      <ReactFlowCanvas />
    </div>
  );
}

export default WorkflowBuilderPage;