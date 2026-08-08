import { Handle, Position } from "@xyflow/react";

function ConditionNode({ data }) {
  return (
    <div
      style={{
        padding: "12px",
        border: "2px solid #f59e0b",
        borderRadius: "8px",
        background: "white",
        minWidth: "140px",
        textAlign: "center",
      }}
    >
      {/* Input */}
      <Handle
        type="target"
        position={Position.Top}
      />

      <strong>{data.label}</strong>

      {/* TRUE output */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="true"
        style={{ left: "30%" }}
      />

      {/* FALSE output */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="false"
        style={{ left: "70%" }}
      />
    </div>
  );
}

export default ConditionNode;