import { Handle, Position, useReactFlow } from "@xyflow/react";

function AINode({ id, data }) {

  const { updateNodeData } = useReactFlow();

  const handlePromptChange = (event) => {

    const prompt = event.target.value;

    updateNodeData(id, {
      prompt,
    });
  };

  return (
    <div
      style={{
        padding: "12px",
        border: "2px solid #8b5cf6",
        borderRadius: "8px",
        background: "white",
        minWidth: "220px",
        textAlign: "center",
      }}
    >

      {/* Input connection */}
      <Handle
        type="target"
        position={Position.Top}
      />


      {/* Node title */}
      <strong>
        {data.label}
      </strong>


      {/* Prompt */}
      <div
        style={{
          marginTop: "10px",
          textAlign: "left",
        }}
      >

        <label>
          Prompt
        </label>

        <textarea
          value={data.prompt || ""}
          onChange={handlePromptChange}
          placeholder="Enter AI prompt..."
          rows={4}
          style={{
            width: "100%",
            marginTop: "5px",
            boxSizing: "border-box",
            resize: "vertical",
          }}
        />

      </div>


      {/* Output connection */}
      <Handle
        type="source"
        position={Position.Bottom}
      />

    </div>
  );
}

export default AINode;