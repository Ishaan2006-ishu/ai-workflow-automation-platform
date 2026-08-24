// src/components/RunWorkflowPanel.jsx

import { useState } from 'react';
import './RunWorkflowPanel.css';

/**
 * RunWorkflowPanel
 *
 * WHY THIS FILE EXISTS:
 * "Save Workflow" only persists the graph. Actually DEMONSTRATING the
 * automation — typing real feedback text and watching it produce a
 * different result depending on what was typed — needs its own UI:
 * an input box, a Run button, and a place to show what happened. This
 * panel owns all three, so WorkflowBuilderPage only has to hand it a
 * workflow id and a callback.
 *
 * PARAMS:
 *   onRun     — async (input) => result. Actually calls the backend
 *               (owned by the parent, which knows the workflow id and
 *               already has it saved).
 *   disabled  — true when the workflow hasn't been saved yet (running
 *               an unsaved graph would run stale/nonexistent data).
 */
function RunWorkflowPanel({ onRun, disabled }) {
  const [input, setInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleRun = async () => {
    setError('');
    setResult(null);
    setIsRunning(true);

    try {
      const data = await onRun(input);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Failed to run workflow.');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="run-panel">
      <h3 className="run-panel__title">Run Workflow</h3>

      <label htmlFor="run-input" className="run-panel__label">
        Input
      </label>
      <textarea
        id="run-input"
        className="run-panel__input"
        rows={3}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="e.g. I really love this product. It is excellent."
        disabled={disabled}
      />

      <button
        type="button"
        className="run-panel__button"
        onClick={handleRun}
        disabled={disabled || isRunning}
      >
        {isRunning ? 'Running…' : 'Run Workflow'}
      </button>

      {disabled && (
        <p className="run-panel__hint">Save your changes before running this workflow.</p>
      )}

      {error && <p className="run-panel__error">{error}</p>}

      {result && (
        <div className={`run-panel__result run-panel__result--${result.status?.toLowerCase()}`}>
          <p className="run-panel__result-status">
            {result.status === 'SUCCESS' ? '✅ Success' : '❌ Failed'}
          </p>

          <p className="run-panel__result-label">Output</p>
          <p className="run-panel__result-output">{result.output}</p>

          <p className="run-panel__result-label">Nodes executed</p>
          <p className="run-panel__result-nodes">
            {result.execution?.executedNodes?.join(' → ') || '—'}
          </p>

          {result.notification && (
            <div className="run-panel__notification">
              🔔 Notification created: “{result.notification.message}”
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default RunWorkflowPanel;
