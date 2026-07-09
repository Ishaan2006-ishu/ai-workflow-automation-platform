// src/components/NodePanel.jsx

import './NodePanel.css';

/**
 * nodeTypeOptions
 *
 * Reusable data source for the panel — the four cards are rendered
 * by mapping over this array, so no card's JSX is hand-duplicated.
 *
 * Each entry carries just enough to render one card:
 * - icon: a small placeholder glyph (no icon library added)
 * - accentColor: drives the icon badge color via a CSS variable
 * - title / subtitle: one line each, per the "no paragraphs" rule
 *
 * Extending later (drag-and-drop, click-to-add) means adding
 * behavior that reads `option.id`, not restructuring this list.
 */
const nodeTypeOptions = [
  {
    id: 'start-node',
    icon: '▶',
    accentColor: 'var(--accent-start)',
    title: 'Start',
    subtitle: 'Entry Point',
  },
  {
    id: 'ai-node',
    icon: '🤖',
    accentColor: 'var(--accent-ai)',
    title: 'AI',
    subtitle: 'Run Prompt',
  },
  {
    id: 'condition-node',
    icon: '◇',
    accentColor: 'var(--accent-condition)',
    title: 'Condition',
    subtitle: 'Branch Logic',
  },
  {
    id: 'notification-node',
    icon: '🔔',
    accentColor: 'var(--accent-notification)',
    title: 'Notification',
    subtitle: 'Send Alert',
  },
];

/**
 * NodePanel
 *
 * Left-sidebar "toolbox" of available node types, styled after the
 * node palettes in tools like n8n and Zapier: a fixed-width panel of
 * small, scannable cards rather than a plain list.
 *
 * Still presentation-only — no backend calls, no workflow execution,
 * no drag-and-drop wiring yet. `cursor: pointer` and the hover state
 * are visual affordances that signal "this will be actionable,"
 * ahead of that behavior being added.
 */
function NodePanel() {
  return (
    <aside className="node-panel">
      <h2 className="node-panel__title">Nodes</h2>

      <div className="node-panel__list">
        {nodeTypeOptions.map((option) => (
          <div
            key={option.id}
            className="node-card"
            // Sets the CSS variable the card's icon badge reads for its
            // color — keeps per-node coloring data-driven instead of
            // writing a separate CSS class per node type.
            style={{ '--accent-color': option.accentColor }}
          >
            <span className="node-card__icon" aria-hidden="true">
              {option.icon}
            </span>

            <div className="node-card__text">
              <p className="node-card__title">{option.title}</p>
              <p className="node-card__subtitle">{option.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

export default NodePanel;