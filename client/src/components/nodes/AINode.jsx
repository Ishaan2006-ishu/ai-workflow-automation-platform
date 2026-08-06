import { Handle, Position } from "@xyflow/react";

function AINode({ data }) {
  return (
    <div
      style={{
        padding: "12px",
        border: "2px solid #8b5cf6",
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

export default AINode;