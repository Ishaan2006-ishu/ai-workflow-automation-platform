// src/components/NodePanel.jsx

import "./NodePanel.css";

/**
 * Node definitions used to render the sidebar.
 */
const nodeTypeOptions = [
  {
    id: "start",
    icon: "▶",
    accentColor: "var(--accent-start)",
    title: "Start",
    subtitle: "Entry Point",
  },
  {
    id: "ai",
    icon: "🤖",
    accentColor: "var(--accent-ai)",
    title: "AI",
    subtitle: "Run Prompt",
  },
  {
    id: "condition",
    icon: "◇",
    accentColor: "var(--accent-condition)",
    title: "Condition",
    subtitle: "Branch Logic",
  },
  {
    id: "notification",
    icon: "🔔",
    accentColor: "var(--accent-notification)",
    title: "Notification",
    subtitle: "Send Alert",
  },
];

function NodePanel({ onAddNode }) {
  return (
    <aside className="node-panel">
      <h2 className="node-panel__title">Nodes</h2>

      <div className="node-panel__list">
        {nodeTypeOptions.map((option) => (
          <div
            key={option.id}
            className="node-card"
            style={{ "--accent-color": option.accentColor }}

            // ⭐ NEW
            onClick={() => onAddNode(option.id)}
          >
            <span className="node-card__icon">
              {option.icon}
            </span>

            <div className="node-card__text">
              <p className="node-card__title">
                {option.title}
              </p>

              <p className="node-card__subtitle">
                {option.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

export default NodePanel;