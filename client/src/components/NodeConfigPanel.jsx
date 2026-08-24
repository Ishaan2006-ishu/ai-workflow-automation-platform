// src/components/NodeConfigPanel.jsx

import { useState } from 'react';
import './NodeConfigPanel.css';

/**
 * NodeConfigPanel
 *
 * WHY THIS FILE EXISTS:
 * A node on the canvas is just a shape until it's configured — an AI
 * node needs a prompt, a Condition node needs to know which keyword to
 * check for, a Notification node can optionally have a fixed message.
 * Rather than editing node.data inline on the canvas (cramped, and
 * React Flow nodes aren't meant to host complex forms), clicking a
 * node opens this panel, which reads/writes that one node's `data`
 * object.
 *
 * WHY LOCAL STATE + AN EXPLICIT "APPLY" ON EVERY KEYSTROKE ANYWAY:
 * We call `onChange` on every keystroke (not just on a separate Save
 * button) so the canvas's live preview (the node's subtitle text, see
 * CustomNodes.jsx) updates immediately — this is what lets a user
 * confirm they typed the right prompt without extra clicks. The panel
 * still keeps its own `useState` (initialized from the selected node)
 * so typing feels instant and isn't fighting a round-trip through
 * parent state on every character.
 *
 * WHY NO useEffect TO RE-SYNC STATE ON node CHANGES:
 * The parent (WorkflowBuilderPage.jsx) renders this component with
 * `key={selectedNode.id}` — that key forces React to fully UNMOUNT and
 * REMOUNT this component whenever the selected node changes, which
 * naturally re-runs `useState`'s initializers with the new node's
 * data. That makes a manual "sync state when node changes" effect
 * both unnecessary and something React's own rules flag (setting
 * state synchronously inside an effect); the `key` prop is the
 * intended, effect-free way to handle exactly this reset-on-prop-
 * change scenario.
 *
 * PARAMS:
 *   node      — the currently-selected React Flow node object, or null
 *               (panel renders nothing useful, parent hides it).
 *   onChange  — (nodeId, newData) => void. Called whenever a field
 *               changes, so the parent can merge it into that node's
 *               `data`.
 *   onClose   — () => void. Called when the user dismisses the panel.
 */
function NodeConfigPanel({ node, onChange, onClose }) {
  const [prompt, setPrompt] = useState(node?.data?.prompt || '');
  const [condition, setCondition] = useState(node?.data?.condition || 'contains_positive');
  const [message, setMessage] = useState(node?.data?.message || '');

  if (!node) {
    return null;
  }

  const handlePromptChange = (value) => {
    setPrompt(value);
    onChange(node.id, { ...node.data, prompt: value });
  };

  const handleConditionChange = (value) => {
    setCondition(value);
    onChange(node.id, { ...node.data, condition: value });
  };

  const handleMessageChange = (value) => {
    setMessage(value);
    onChange(node.id, { ...node.data, message: value });
  };

  return (
    <aside className="node-config-panel">
      <div className="node-config-panel__header">
        <h3 className="node-config-panel__title">Configure Node</h3>
        <button
          type="button"
          className="node-config-panel__close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <p className="node-config-panel__type">{node.type}</p>

      {node.type === 'start' && (
        <p className="node-config-panel__note">
          The Start node needs no configuration — it marks where every run
          begins.
        </p>
      )}

      {node.type === 'ai' && (
        <div className="node-config-panel__field">
          <label htmlFor="ai-prompt">Prompt</label>
          <textarea
            id="ai-prompt"
            rows={6}
            value={prompt}
            onChange={(e) => handlePromptChange(e.target.value)}
            placeholder="e.g. Analyze the sentiment of the following customer feedback. Respond with exactly one word: 'positive' or 'negative'."
          />
          <p className="node-config-panel__hint">
            The user's input (or the previous node's output) is
            automatically appended below this prompt when the workflow
            runs.
          </p>
        </div>
      )}

      {node.type === 'condition' && (
        <div className="node-config-panel__field">
          <label htmlFor="condition-type">Condition</label>
          <select
            id="condition-type"
            value={condition}
            onChange={(e) => handleConditionChange(e.target.value)}
          >
            <option value="contains_positive">Previous output contains "positive"</option>
            <option value="contains_negative">Previous output contains "negative"</option>
          </select>
          <p className="node-config-panel__hint">
            Connect this node's <strong>True</strong> handle and{' '}
            <strong>False</strong> handle to different next steps to
            create two branches.
          </p>
        </div>
      )}

      {node.type === 'notification' && (
        <div className="node-config-panel__field">
          <label htmlFor="notification-message">
            Message <span className="node-config-panel__optional">(optional)</span>
          </label>
          <textarea
            id="notification-message"
            rows={3}
            value={message}
            onChange={(e) => handleMessageChange(e.target.value)}
            placeholder="e.g. Positive customer feedback detected."
          />
          <p className="node-config-panel__hint">
            Leave blank to automatically use the previous node's output as
            the notification message.
          </p>
        </div>
      )}
    </aside>
  );
}

export default NodeConfigPanel;
