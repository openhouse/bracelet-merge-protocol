import {
  edgeKey,
  insertBetween,
  withEdgeIds,
  currentEdges,
  assertCycleIntegrity,
} from "./cycle.js";
import { turnId as makeTurnId, braceletName } from "./ids.js";
import type {
  AuditOracle,
  BeadId,
  Bracelet,
  HiddenValues,
  Judge,
  MergeMode,
  TurnContext,
} from "./types.js";
import { OffMenuJudgeDecisionError } from "./errors.js";
import { BlindDealer } from "../dealer/BlindDealer.js";
import type { TurnMetric } from "../metrics/types.js";
import { protocolName } from "../metrics/types.js";
import { estimateTokens } from "../metrics/tokenEstimate.js";
import { isCyclicallySortedUnoriented } from "./sortedness.js";
import { buildJudgePromptContext } from "../prompt/context.js";
import { renderJudgePrompt } from "../prompt/render.js";
import { buildJudgePromptTraceEvent } from "../prompt/events.js";
import type { JudgePromptTraceEvent } from "../prompt/types.js";
export type MergeResult = {
  bracelet: Bracelet;
  turns: TurnMetric[];
  promptEvents: JudgePromptTraceEvent[];
};
export async function mergeBracelets(args: {
  target: Bracelet;
  source: Bracelet;
  judge: Judge;
  mode: MergeMode;
  runContext: Omit<TurnContext, "turnId" | "turnIndex" | "targetName" | "sourceName">;
  mergeIndex: number;
  hideValues?: boolean | undefined;
  hiddenValues?: HiddenValues | undefined;
  auditOracle?: AuditOracle | undefined;
  judgePrompt?:
    | { includeValues?: boolean; template: string; templateName: string; templateVersion: string }
    | undefined;
}): Promise<MergeResult> {
  const dealer = new BlindDealer({
    beadIds: [...args.target.ids, ...args.source.ids],
    initialBracelets: [args.target, args.source],
    mode: args.mode,
    hostPolicy: "larger",
  });
  let currentCycle: BeadId[] = [...args.target.ids];
  const turns: TurnMetric[] = [];
  const promptEvents: JudgePromptTraceEvent[] = [];
  for (let i = 0; i < args.source.ids.length; i++) {
    const bead = args.source.ids[i]!;
    const before = [...currentCycle];
    const sourcePrefix = args.source.ids.slice(0, i + 1);
    const turnContext: TurnContext = {
      ...args.runContext,
      mergeIndex: args.mergeIndex,
      turnId: makeTurnId(`T${String(turns.length + 1).padStart(4, "0")}`),
      turnIndex: i,
      targetName: args.target.name,
      sourceName: args.source.name,
    };
    const dealerResult = dealer.validEdgesForTurn({
      currentCycle,
      nextBead: bead,
      targetCycle: args.target.ids,
      sourceCycle: args.source.ids,
      sourcePrefixAfterInsertion: sourcePrefix,
    });
    const judgeRequest = {
      bead,
      offeredEdges: dealerResult.offeredEdges,
      currentCycle: before,
      sourceCycle: args.source.ids,
      sourcePrefix,
      turnContext,
    };
    const promptContext = args.judgePrompt
      ? buildJudgePromptContext({
          request: judgeRequest,
          ...(args.hiddenValues ? { hiddenValues: args.hiddenValues } : {}),
          ...(args.judgePrompt.includeValues === undefined
            ? {}
            : { includeValues: args.judgePrompt.includeValues }),
          templateName: args.judgePrompt.templateName,
          templateVersion: args.judgePrompt.templateVersion,
        })
      : undefined;
    const renderedPrompt = promptContext
      ? renderJudgePrompt(promptContext, args.judgePrompt!.template)
      : undefined;
    const decision = await args.judge.chooseEdge(judgeRequest);
    if (!dealerResult.offeredEdges.some((e) => e.key === decision.chosenEdge.key))
      throw new OffMenuJudgeDecisionError();
    currentCycle = insertBetween(currentCycle, decision.chosenEdge, bead);
    assertCycleIntegrity(currentCycle);
    const oracle = args.auditOracle?.correctEdge(before, bead);
    const oracleKey = oracle ? edgeKey(oracle.a, oracle.b) : undefined;
    const chosenIndex = dealerResult.offeredEdges.findIndex(
      (e) => e.key === decision.chosenEdge.key,
    );
    const offered = dealerResult.offeredEdges.length;
    const base: TurnMetric = {
      event: "turn",
      schemaVersion: 1,
      protocolName,
      runId: args.runContext.runId,
      runIndex: args.runContext.runIndex,
      seed: args.runContext.seed,
      mergeId: args.runContext.mergeId,
      mergeIndex: args.mergeIndex,
      turnId: turnContext.turnId,
      turnIndex: i,
      mode: args.mode,
      candidateBeadId: bead,
      targetName: args.target.name,
      sourceName: args.source.name,
      currentCycleSizeBefore: before.length,
      currentCycleSizeAfter: currentCycle.length,
      sourcePrefixLength: sourcePrefix.length,
      allEdgeCount: withEdgeIds(currentEdges(before)).length,
      offeredEdgeCount: offered,
      prunedEdgeCount: dealerResult.prunedEdges.length,
      pruningRatio: dealerResult.allEdges.length
        ? dealerResult.prunedEdges.length / dealerResult.allEdges.length
        : 0,
      forced: offered === 1,
      actualLlmTurn: false,
      multiChoice: offered > 1,
      choiceBits: Math.log2(offered),
      chosenEdgeIndex: chosenIndex,
      normalizedChosenPosition: offered <= 1 ? 0 : chosenIndex / (offered - 1),
      chosenEdgeKey: decision.chosenEdge.key,
      chosenEdge: { a: decision.chosenEdge.a, b: decision.chosenEdge.b },
      oracleEdgeKey: oracleKey,
      oracleEdge: oracle,
      oracleEdgeOffered: oracleKey
        ? dealerResult.offeredEdges.some((e) => e.key === oracleKey)
        : undefined,
      correctEdgeIncluded: oracleKey
        ? dealerResult.offeredEdges.some((e) => e.key === oracleKey)
        : undefined,
      chosenEdgeIsCorrect: oracleKey ? decision.chosenEdge.key === oracleKey : undefined,
      scoringAvailable: Boolean(oracleKey),
      invalidEdgesOfferedCount: dealerResult.invalidEdgesOfferedCount,
      duplicateEdgesOfferedCount: dealerResult.duplicateEdgeCount,
      frontierViolations: dealerResult.frontierViolations,
      hypothesisCountBefore: dealerResult.hypothesisCountBefore,
      hypothesisCountAfter: dealerResult.hypothesisCountAfter,
      cyclicallySortedAfterTurn: args.hiddenValues
        ? isCyclicallySortedUnoriented(currentCycle, args.hiddenValues.rankById)
        : true,
      braceletIntegrityOk: true,
      promptCharEstimate: JSON.stringify({ bead, offeredEdges: dealerResult.offeredEdges }).length,
      promptTokenEstimate: estimateTokens(
        JSON.stringify({ bead, offeredEdges: dealerResult.offeredEdges }),
      ),
      parseSuccess: true,
      offMenu: false,
      retryCount: 0,
      judgeConfidence: decision.confidence,
      judgeSecondChoiceEdgeId: decision.secondChoiceEdgeId,
    };
    if (!args.hideValues && args.hiddenValues) {
      const v = args.hiddenValues.valueById,
        r = args.hiddenValues.rankById;
      Object.assign(base, {
        studyValue: v.get(bead),
        studyRank: r.get(bead),
        studyCurrentValuesBefore: before.map((id) => v.get(id)!),
        studyCurrentValuesAfter: currentCycle.map((id) => v.get(id)!),
        studyChosenEdgeValues: [v.get(decision.chosenEdge.a)!, v.get(decision.chosenEdge.b)!],
        ...(oracle ? { studyOracleEdgeValues: [v.get(oracle.a)!, v.get(oracle.b)!] } : {}),
      });
    }
    turns.push(base);
    if (promptContext && renderedPrompt)
      promptEvents.push(
        buildJudgePromptTraceEvent({
          context: promptContext,
          renderedPrompt,
          decision,
          turn: base,
          offeredEdges: dealerResult.offeredEdges,
        }),
      );
  }
  return {
    bracelet: {
      name: braceletName(`M${String(args.mergeIndex + 1).padStart(3, "0")}`),
      ids: currentCycle,
      depth: Math.max(args.target.depth, args.source.depth) + 1,
    },
    turns,
    promptEvents,
  };
}
