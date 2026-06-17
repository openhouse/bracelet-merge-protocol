import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import type { MetricEvent, RunMetric, TurnMetric } from "./types.js";
import { aggregateRuns } from "./summarize.js";
export const stableTurnHeaders = [
  "event",
  "schemaVersion",
  "protocolName",
  "runId",
  "runIndex",
  "seed",
  "mergeId",
  "mergeIndex",
  "turnId",
  "turnIndex",
  "mode",
  "candidateBeadId",
  "targetName",
  "sourceName",
  "currentCycleSizeBefore",
  "currentCycleSizeAfter",
  "sourcePrefixLength",
  "allEdgeCount",
  "offeredEdgeCount",
  "prunedEdgeCount",
  "pruningRatio",
  "forced",
  "actualLlmTurn",
  "multiChoice",
  "choiceBits",
  "chosenEdgeIndex",
  "normalizedChosenPosition",
  "chosenEdgeKey",
  "oracleEdgeKey",
  "oracleEdgeOffered",
  "correctEdgeIncluded",
  "chosenEdgeIsCorrect",
  "scoringAvailable",
  "invalidEdgesOfferedCount",
  "duplicateEdgesOfferedCount",
  "frontierViolations",
  "hypothesisCountBefore",
  "hypothesisCountAfter",
  "cyclicallySortedAfterTurn",
  "braceletIntegrityOk",
  "promptCharEstimate",
  "promptTokenEstimate",
  "parseSuccess",
  "offMenu",
  "retryCount",
];
const ensure = (p: string) => mkdirSync(dirname(p), { recursive: true });
export const writeJsonl = (path: string, events: readonly MetricEvent[]): void => {
  ensure(path);
  writeFileSync(path, events.map((e) => JSON.stringify(e)).join("\n") + "\n");
};
const csvCell = (v: unknown): string => {
  const s = typeof v === "string" ? v : JSON.stringify(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
};
export const turnsToCsv = (turns: readonly TurnMetric[]): string =>
  [
    stableTurnHeaders.join(","),
    ...turns.map((t) =>
      stableTurnHeaders.map((h) => csvCell((t as unknown as Record<string, unknown>)[h])).join(","),
    ),
  ].join("\n") + "\n";
export const writeTurnsCsv = (path: string, turns: readonly TurnMetric[]): void => {
  ensure(path);
  writeFileSync(path, turnsToCsv(turns));
};
export const summaryJson = (summaries: readonly RunMetric[]): string =>
  JSON.stringify(
    {
      schemaVersion: 1,
      generatedAt: new Date(0).toISOString(),
      summaries,
      aggregate: aggregateRuns(summaries),
    },
    null,
    2,
  );
export const writeSummaryJson = (path: string, summaries: readonly RunMetric[]): void => {
  ensure(path);
  writeFileSync(path, summaryJson(summaries));
};
