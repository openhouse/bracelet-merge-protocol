import type { HiddenValues, JudgeRequest } from "../domain/types.js";
import {
  defaultJudgeInstructions,
  defaultJudgeTemplateName,
  defaultJudgeTemplateVersion,
  defaultOrderDescription,
} from "./defaultTemplates.js";
import type { JudgePromptContext } from "./types.js";

export function optionLabel(index: number): string {
  let n = index + 1;
  let label = "";
  while (n > 0) {
    n--;
    label = String.fromCharCode(65 + (n % 26)) + label;
    n = Math.floor(n / 26);
  }
  return label;
}

export function buildJudgePromptContext(args: {
  request: JudgeRequest;
  hiddenValues?: HiddenValues;
  includeValues?: boolean;
  templateName?: string;
  templateVersion?: string;
}): JudgePromptContext {
  const beadView = (id: Parameters<HiddenValues["valueById"]["get"]>[0]) => {
    const v = args.includeValues ? args.hiddenValues?.valueById.get(id) : undefined;
    return v ? { id, value: v } : { id };
  };
  return {
    protocolName: "Bracelet Merge Protocol",
    templateName: args.templateName ?? defaultJudgeTemplateName,
    templateVersion: args.templateVersion ?? defaultJudgeTemplateVersion,
    runId: args.request.turnContext.runId,
    runIndex: args.request.turnContext.runIndex,
    mergeId: args.request.turnContext.mergeId,
    mergeIndex: args.request.turnContext.mergeIndex,
    turnId: args.request.turnContext.turnId,
    turnIndex: args.request.turnContext.turnIndex,
    mode: args.request.turnContext.mode,
    hiddenValuesIncluded: Boolean(args.includeValues),
    candidate: beadView(args.request.bead),
    offeredEdges: args.request.offeredEdges.map((edge, index) => ({
      id: edge.id,
      key: edge.key,
      label: optionLabel(index),
      left: beadView(edge.a),
      right: beadView(edge.b),
    })),
    orderDescription: defaultOrderDescription,
    judgeInstructions: defaultJudgeInstructions,
    responseFormat: "json",
  };
}
