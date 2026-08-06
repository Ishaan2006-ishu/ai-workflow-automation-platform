import { Handle, Position } from "@xyflow/react";

function ConditionNode({ data }) {
  return (
    <div
      style={{
        padding: "12px",
        border: "2px solid #f59e0b",
        borderRadius: "8px",
        background: "white",
        minWidth: "120px",
        textAlign: "center",
      }}
    >
      <Handle type="target" position={Position.Top} />

      <strong>{data.label}</strong>

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

export default ConditionNode;