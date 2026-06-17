export const defaultJudgeTemplateName = "default-judge-local-insertion";
export const defaultJudgeTemplateVersion = "1.0.0";
export const defaultOrderDescription =
  "Use the configured total order of bead values with cyclic wraparound. Choose the insertion edge whose endpoints correctly bracket the candidate value in that cyclic order.";
export const defaultJudgeInstructions =
  "Choose exactly one offered insertion edge. Respond with JSON only.";
export const defaultJudgePromptTemplate = `You are the Judge in the Bracelet Merge Protocol.

The Dealer is blind to bead values. The Dealer has already filtered the insertion edges according to the selected protocol mode.

You can see the local bead values shown below when values are included, but you cannot see the full bracelet topology.

Your task:
Choose the best insertion edge for the candidate bead according to the cyclic value order.

Protocol mode:
{{mode}}

Ordering rule:
{{orderDescription}}

Candidate bead:
- id: {{candidate.id}}
{{#if candidate.value}}
- value: {{candidate.value}}
{{/if}}

Offered insertion edges:
{{#each offeredEdges}}
{{label}}.
  edge id: {{id}}
  edge key: {{key}}
  endpoints:
    - {{left.id}}{{#if left.value}} value={{left.value}}{{/if}}
    - {{right.id}}{{#if right.value}} value={{right.value}}{{/if}}
{{/each}}

Respond with JSON only:

{
  "chosenLabel": "<one of the option labels>",
  "chosenEdgeId": "<one of the offered edge ids>",
  "chosenEdgeKey": "<one of the offered edge keys>",
  "confidence": <number from 0 to 1>,
  "reason": "<brief reason>"
}`;
