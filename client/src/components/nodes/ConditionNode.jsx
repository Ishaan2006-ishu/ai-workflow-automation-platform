import {
  Handle,
  Position,
} from "@xyflow/react";


function ConditionNode({
  id,
  data,
}) {

  // ==========================================================
  // CONDITION CHANGE
  // ==========================================================

  const handleConditionChange = (
    event
  ) => {

    const newCondition =
      event.target.value;


    // Send the new condition
    // back to WorkflowBuilderPage

    if (data.onChange) {

      data.onChange(
        id,
        newCondition
      );

    }
  };


  return (

    <div
      style={{
        padding: "12px",
        border: "2px solid #f59e0b",
        borderRadius: "8px",
        background: "white",
        minWidth: "180px",
        textAlign: "center",
      }}
    >

      {/* ====================================================
          INPUT
          ==================================================== */}

      <Handle
        type="target"
        position={Position.Top}
      />


      {/* ====================================================
          NODE TITLE
          ==================================================== */}

      <strong>
        {data.label}
      </strong>


      {/* ====================================================
          CONDITION SELECTOR
          ==================================================== */}

      <select
        value={
          data.condition ||
          "contains_positive"
        }
        onChange={
          handleConditionChange
        }
        style={{
          marginTop: "10px",
          width: "100%",
          padding: "6px",
        }}
      >

        <option value="contains_positive">
          Contains "positive"
        </option>

      </select>


      {/* ====================================================
          TRUE OUTPUT
          ==================================================== */}

      <Handle
        type="source"
        position={Position.Bottom}
        id="true"
        style={{
          left: "30%",
        }}
      />


      {/* ====================================================
          FALSE OUTPUT
          ==================================================== */}

      <Handle
        type="source"
        position={Position.Bottom}
        id="false"
        style={{
          left: "70%",
        }}
      />

    </div>
  );
}


export default ConditionNode;