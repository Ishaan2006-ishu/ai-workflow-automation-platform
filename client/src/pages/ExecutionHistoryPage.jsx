import React, { useEffect, useState } from "react";
import { getExecutions } from "../api/workflowApi";

function ExecutionHistoryPage() {
  // ============================================================
  // EXECUTION HISTORY STATE
  // ============================================================

  const [executions, setExecutions] = useState([]);

  // ============================================================
  // LOADING STATE
  // ============================================================

  const [isLoading, setIsLoading] = useState(true);

  // ============================================================
  // ERROR STATE
  // ============================================================

  const [error, setError] = useState("");


  // ============================================================
  // FETCH EXECUTIONS
  // ============================================================

  useEffect(() => {
    const fetchExecutions = async () => {
      try {
        const response = await getExecutions();

        console.log(
          "EXECUTION HISTORY RESPONSE:",
          response
        );

        setExecutions(response.data || []);
      } catch (err) {
        console.error(
          "[ExecutionHistoryPage] Fetch executions:",
          err
        );

        setError(
          err.message ||
            "Failed to load execution history."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchExecutions();
  }, []);


  // ============================================================
  // UI
  // ============================================================

  return (
    <div>
      <h1>Execution History</h1>


      {/* Loading */}

      {isLoading && (
        <p>
          Loading execution history...
        </p>
      )}


      {/* Error */}

      {!isLoading && error && (
        <p>
          {error}
        </p>
      )}


      {/* Empty */}

      {!isLoading &&
        !error &&
        executions.length === 0 && (
          <p>
            No executions yet.
          </p>
        )}


      {/* Execution List */}

      {!isLoading &&
        !error &&
        executions.map((execution) => (
          <div
            key={execution._id}
            style={{
              border: "1px solid #ccc",
              padding: "15px",
              marginBottom: "10px",
              borderRadius: "8px",
            }}
          >
            <h3>
              {execution.workflowId?.name ||
                "Unknown Workflow"}
            </h3>

            <p>
              <strong>Status:</strong>{" "}
              {execution.status}
            </p>

            <p>
              <strong>Nodes Executed:</strong>{" "}
              {execution.executedNodes?.length || 0}
            </p>

            <p>
              <strong>Duration:</strong>{" "}
              {execution.duration} ms
            </p>

            <p>
              <strong>Started:</strong>{" "}
              {new Date(
                execution.startedAt
              ).toLocaleString()}
            </p>
          </div>
        ))}
    </div>
  );
}

export default ExecutionHistoryPage;