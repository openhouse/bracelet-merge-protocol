import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import type { InsertionEdge, JudgeDecision } from "../domain/types.js";
import type { TurnMetric } from "../metrics/types.js";
import type { JudgePromptContext, JudgePromptTraceEvent } from "./types.js";

export function buildJudgePromptTraceEvent(args: {
  context: JudgePromptContext;
  renderedPrompt: string;
  decision: JudgeDecision;
  turn: TurnMetric;
  offeredEdges: readonly InsertionEdge[];
}): JudgePromptTraceEvent {
  const chosen = args.context.offeredEdges.find((e) => e.key === args.decision.chosenEdge.key);
  const oracle = args.context.offeredEdges.find((e) => e.key === args.turn.oracleEdgeKey);
  const judgeResponse: JudgePromptTraceEvent["judgeResponse"] = {
    chosenEdgeId: args.decision.chosenEdge.id,
    chosenEdgeKey: args.decision.chosenEdge.key,
    ...(chosen ? { chosenLabel: chosen.label } : {}),
    ...(args.decision.confidence === undefined ? {} : { confidence: args.decision.confidence }),
    reason: args.decision.reason ?? "oracle",
    ...(args.decision.rawResponse === undefined ? {} : { rawResponse: args.decision.rawResponse }),
  };
  const audit: NonNullable<JudgePromptTraceEvent["audit"]> = {
    scoringAvailable: args.turn.scoringAvailable,
    ...(oracle ? { oracleEdgeId: oracle.id, oracleLabel: oracle.label } : {}),
    ...(args.turn.oracleEdgeKey ? { oracleEdgeKey: args.turn.oracleEdgeKey } : {}),
    ...(args.turn.oracleEdgeOffered === undefined
      ? {}
      : { oracleEdgeOffered: args.turn.oracleEdgeOffered }),
    ...(args.turn.chosenEdgeIsCorrect === undefined
      ? {}
      : { chosenEdgeIsCorrect: args.turn.chosenEdgeIsCorrect }),
  };
  return {
    event: "judgePrompt",
    schemaVersion: 1,
    protocolName: "Bracelet Merge Protocol",
    templateName: args.context.templateName,
    templateVersion: args.context.templateVersion,
    runId: args.context.runId,
    runIndex: args.context.runIndex,
    mergeId: args.context.mergeId,
    mergeIndex: args.context.mergeIndex,
    turnId: args.context.turnId,
    turnIndex: args.context.turnIndex,
    mode: args.context.mode,
    hiddenValuesIncluded: args.context.hiddenValuesIncluded,
    promptContext: args.context,
    renderedPrompt: args.renderedPrompt,
    judgeResponse,
    audit,
    dealerMetrics: {
      allEdgeCount: args.turn.allEdgeCount,
      offeredEdgeCount: args.turn.offeredEdgeCount,
      prunedEdgeCount: args.turn.prunedEdgeCount,
      pruningRatio: args.turn.pruningRatio,
      choiceBits: args.turn.choiceBits,
      chosenEdgeIndex: args.turn.chosenEdgeIndex,
      normalizedChosenPosition: args.turn.normalizedChosenPosition,
      firstChoice: args.turn.chosenEdgeIndex === 0,
      lastChoice: args.turn.chosenEdgeIndex === args.offeredEdges.length - 1,
      promptCharEstimate: args.renderedPrompt.length,
      promptTokenEstimate: Math.ceil(args.renderedPrompt.length / 4),
    },
  };
}

export function formatJudgePromptDialog(event: JudgePromptTraceEvent): string {
  const lines = [
    "────────────────────────────────────────",
    `Run ${event.runId} / Merge ${event.mergeId} / Turn ${event.turnId}`,
    "",
    "Dealer → Judge",
    "",
    event.renderedPrompt,
    "",
    "Judge → Dealer",
    "",
    JSON.stringify(event.judgeResponse, null, 2),
    "",
    "Audit → Researcher",
    "",
  ];
  if (event.audit)
    for (const [k, v] of Object.entries(event.audit)) if (v !== undefined) lines.push(`${k}: ${v}`);
  lines.push("", "Dealer metrics", "");
  for (const k of ["offeredEdgeCount", "prunedEdgeCount", "pruningRatio", "choiceBits"] as const)
    lines.push(`${k}: ${event.dealerMetrics[k]}`);
  lines.push("────────────────────────────────────────");
  return lines.join("\n");
}

export function writePromptJsonl(path: string, events: readonly JudgePromptTraceEvent[]): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${events.map((e) => JSON.stringify(e)).join("\n")}\n`);
}
export function writePromptMarkdown(path: string, events: readonly JudgePromptTraceEvent[]): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, events.map(formatJudgePromptDialog).join("\n\n"));
}
