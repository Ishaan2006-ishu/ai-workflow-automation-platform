/**
 * aiNode.js
 *
 * AI Node:
 * Takes the workflow user's runtime input + the node prompt
 * and sends them to Gemini.
 */

const {
  geminiClient,
  GEMINI_MODEL,
} = require("../../config/geminiConfig");


async function executeAiNode(
  node,
  previousOutput,
  workflowInput
) {

  // ==========================================================
  // VALIDATE NODE
  // ==========================================================

  if (!node || node.type !== "ai") {
    throw new Error(
      "AI Node Error: Invalid AI node."
    );
  }


  // ==========================================================
  // GET NODE PROMPT
  // ==========================================================

  const prompt =
    node.data &&
    node.data.prompt;


  if (
    !prompt ||
    typeof prompt !== "string" ||
    prompt.trim().length === 0
  ) {
    throw new Error(
      `AI Node Error: Node "${node.id}" has no valid 'prompt' in node.data.`
    );
  }


  // ==========================================================
  // BUILD AI INPUT
  // ==========================================================

  const userInput =
    typeof workflowInput === "string"
      ? workflowInput
      : "";


  const fullPrompt = `
${prompt}

User Input:
${userInput}
`;


  console.log(
    `[AI Node] Processing input for node ${node.id}`
  );


  // ==========================================================
  // CALL GEMINI
  // ==========================================================

  let response;

  try {

    response =
      await geminiClient.models.generateContent({
        model: GEMINI_MODEL,
        contents: fullPrompt,
      });

  } catch (error) {

    throw new Error(
      `AI Node Error: Gemini request failed for node "${node.id}". Reason: ${error.message}`
    );
  }


  // ==========================================================
  // GET AI OUTPUT
  // ==========================================================

  const generatedText =
    response &&
    response.text;


  if (
    !generatedText ||
    typeof generatedText !== "string" ||
    generatedText.trim().length === 0
  ) {
    throw new Error(
      `AI Node Error: Gemini returned no usable text for node "${node.id}".`
    );
  }


  // ==========================================================
  // RETURN RESULT
  // ==========================================================

  return {

    nodeId: node.id,

    type: "ai",

    message:
      "AI node executed successfully.",

    output:
      generatedText.trim(),

  };
}


module.exports = {
  executeAiNode,
};