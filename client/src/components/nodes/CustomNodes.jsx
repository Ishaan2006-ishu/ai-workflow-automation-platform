// src/components/nodes/CustomNodes.jsx

// -----------------------------------------------------------------
// WHY THIS FILE EXISTS
// -----------------------------------------------------------------
// React Flow renders plain default boxes unless you register custom
// node components. This file provides one small component per MVP
// node type (start, ai, condition, notification), each showing:
//   - a colored header matching the NodePanel's accent color scheme
//     (so a node looks the same in the palette and on the canvas)
//   - a one-line summary of its current configuration, so the canvas
//     is readable without opening the config panel for every node
//   - the correct connection Handles for that node type
//
// THE ONE HANDLE THAT MATTERS MOST: the Condition node exposes TWO
// separate SOURCE handles, id="true" and id="false". When the user
// drags a connection from one of them, React Flow automatically
// stamps the resulting edge with `sourceHandle: "true"` or
// `sourceHandle: "false"` — that's the exact field the backend engine
// (workflowEngine.js's findNextNode) reads to decide which branch to
// follow at execution time. Without two distinct handles here, real
// conditional branching would be impossible to build in the UI at
// all, regardless of how correct the backend logic is.
// -----------------------------------------------------------------

import { Handle, Position } from '@xyflow/react';
import './CustomNodes.css';

const NODE_META = {
  start: { icon: '▶', accent: 'var(--accent-start)', title: 'Start' },
  ai: { icon: '🤖', accent: 'var(--accent-ai)', title: 'AI' },
  condition: { icon: '◇', accent: 'var(--accent-condition)', title: 'Condition' },
  notification: { icon: '🔔', accent: 'var(--accent-notification)', title: 'Notification' },
};

/**
 * NodeShell
 *
 * Shared visual frame every custom node renders inside — keeps the
 * header/icon/title styling in exactly one place instead of repeating
 * it across four near-identical components.
 */
function NodeShell({ type, subtitle, selected, children }) {
  const meta = NODE_META[type];

  return (
    <div
      className={`flow-node${selected ? ' flow-node--selected' : ''}`}
      style={{ '--node-accent': meta.accent }}
    >
      <div className="flow-node__header">
        <span className="flow-node__icon">{meta.icon}</span>
        <span className="flow-node__title">{meta.title}</span>
      </div>
      {subtitle && <div className="flow-node__subtitle">{subtitle}</div>}
      {children}
    </div>
  );
}

export function StartFlowNode({ selected }) {
  return (
    <NodeShell type="start" subtitle="Entry point" selected={selected}>
      <Handle type="source" position={Position.Bottom} />
    </NodeShell>
  );
}

export function AiFlowNode({ data, selected }) {
  const prompt = data?.prompt?.trim();
  const subtitle = prompt
    ? prompt.length > 46
      ? `${prompt.slice(0, 46)}…`
      : prompt
    : 'Click to set a prompt';

  return (
    <NodeShell type="ai" subtitle={subtitle} selected={selected}>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </NodeShell>
  );
}

export function ConditionFlowNode({ data, selected }) {
  const conditionLabel =
    data?.condition === 'contains_negative' ? 'Contains "negative"' : 'Contains "positive"';

  return (
    <NodeShell type="condition" subtitle={conditionLabel} selected={selected}>
      <Handle type="target" position={Position.Top} />

      {/* Two distinct SOURCE handles — this is what makes real
          branching possible. Positioned left/right along the bottom
          edge so both connection points are easy to grab separately,
          each labeled so it's unambiguous which is which. */}
      <div className="flow-node__branch-labels">
        <span className="flow-node__branch-label flow-node__branch-label--true">True</span>
        <span className="flow-node__branch-label flow-node__branch-label--false">False</span>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="true"
        style={{ left: '30%' }}
        className="flow-handle--true"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="false"
        style={{ left: '70%' }}
        className="flow-handle--false"
      />
    </NodeShell>
  );
}

export function NotificationFlowNode({ data, selected }) {
  const message = data?.message?.trim();
  const subtitle = message
    ? message.length > 46
      ? `${message.slice(0, 46)}…`
      : message
    : 'Uses AI output as message';

  return (
    <NodeShell type="notification" subtitle={subtitle} selected={selected}>
      <Handle type="target" position={Position.Top} />
      {/* Notification is a terminal action for this MVP — no source
          handle, matching the engine: notificationNode.js never
          produces content another node would consume. */}
    </NodeShell>
  );
}

/**
 * nodeTypes
 *
 * Passed directly to <ReactFlow nodeTypes={nodeTypes} />. The keys
 * MUST match the `type` string stored on each node object — which is
 * also the exact string the backend engine's nodeExecutor.js switches
 * on ("start" | "ai" | "condition" | "notification"). Reusing the same
 * strings on both sides means a node's type never needs translating
 * between the UI and the engine.
 */
