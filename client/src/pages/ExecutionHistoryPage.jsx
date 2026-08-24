// pages/ExecutionHistoryPage.jsx
// -------------------------------
// Execution History page: shows every past workflow run for the
// current user (most recent first) plus the notifications those runs
// generated.
// Rendered at: /history (private route — requires authentication)

import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { getExecutionHistory } from '../api/workflowApi';
import { getNotifications } from '../api/notificationApi';
import './ExecutionHistoryPage.css';

function formatDateTime(isoString) {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleString();
}

function formatDuration(ms) {
  if (typeof ms !== 'number') return '—';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function formatDisplayValue(value) {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (Array.isArray(value)) return value.map(formatDisplayValue).join(' → ');
  if (typeof value === 'object') {
    if (typeof value.message === 'string') return value.message;
    if (typeof value.output === 'string') return value.output;
    return JSON.stringify(value);
  }
  return String(value);
}

function ExecutionHistoryPage() {
  const [executions, setExecutions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError('');

      try {
        // Fetched independently and in parallel: a failure to load
        // notifications shouldn't block the (more important)
        // execution history table from rendering, and vice versa.
        const [historyRes, notificationsRes] = await Promise.allSettled([
          getExecutionHistory(),
          getNotifications(),
        ]);

        if (historyRes.status === 'fulfilled') {
          setExecutions(historyRes.value.data || []);
        } else {
          setError(historyRes.reason?.message || 'Failed to load execution history.');
        }

        if (notificationsRes.status === 'fulfilled') {
          setNotifications(notificationsRes.value.data || []);
        }
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="history-shell">
      <Navbar />

      <div className="history-page">
        <section className="history-section">
          <h1 className="history-title">Execution History</h1>
          <p className="history-subtitle">Every workflow run, most recent first.</p>

          {isLoading && <p className="history-status">Loading execution history…</p>}
          {!isLoading && error && <p className="history-status history-status--error">{error}</p>}

          {!isLoading && !error && executions.length === 0 && (
            <div className="history-empty">
              <p>No executions yet.</p>
              <p className="history-empty__hint">
                Open a workflow and click "Run Workflow" to see it here.
              </p>
            </div>
          )}

          {!isLoading && !error && executions.length > 0 && (
            <div className="history-table-wrap">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Workflow</th>
                    <th>Status</th>
                    <th>Nodes Executed</th>
                    <th>Output</th>
                    <th>Started</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {executions.map((execution) => (
                    <tr key={execution._id}>
                      <td className="history-table__workflow">
                        {formatDisplayValue(execution.workflowName)}
                      </td>
                      <td>
                        <span
                          className={`history-badge history-badge--${execution.status?.toLowerCase()}`}
                        >
                          {execution.status === 'SUCCESS' ? '✅ Success' : '❌ Failed'}
                        </span>
                      </td>
                      <td className="history-table__nodes">
                        {formatDisplayValue(execution.executedNodes)}
                      </td>
                      <td className="history-table__output">
                        {formatDisplayValue(execution.output)}
                      </td>
                      <td>{formatDateTime(execution.startTime)}</td>
                      <td>{formatDuration(execution.duration)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="history-section">
          <h2 className="history-notifications-title">Notifications</h2>

          {!isLoading && notifications.length === 0 && (
            <p className="history-status">No notifications yet.</p>
          )}

          {!isLoading && notifications.length > 0 && (
            <ul className="history-notifications-list">
              {notifications.map((notification) => (
                <li key={notification._id} className="history-notification-item">
                  <span className="history-notification-item__icon">🔔</span>
                  <div>
                    <p className="history-notification-item__message">
                      {formatDisplayValue(notification.message)}
                    </p>
                    <p className="history-notification-item__time">
                      {formatDateTime(notification.createdAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

export default ExecutionHistoryPage;
