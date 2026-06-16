import type { AggregateMetric, RunMetric, TurnMetric } from "./types.js";
export function summarizeRun(
  turns: readonly TurnMetric[],
  base: {
    runId: RunMetric["runId"];
    runIndex: number;
    seed: string;
    finalSorted: boolean;
    mergeCount: number;
  },
): RunMetric {
  const turnCount = turns.length;
  const sum = (f: (t: TurnMetric) => number) => turns.reduce((a, t) => a + f(t), 0);
  return {
    event: "run",
    schemaVersion: 1,
    ...base,
    turnCount,
    correctEdgeInclusionRate: turnCount ? sum((t) => Number(t.correctEdgeIncluded)) / turnCount : 1,
    judgeAccuracy: turnCount ? sum((t) => Number(t.chosenEdgeIsCorrect)) / turnCount : 1,
    invalidEdgesOffered: sum((t) => t.invalidEdgesOfferedCount),
    duplicateEdgesOffered: sum((t) => t.duplicateEdgesOfferedCount),
    braceletIntegrityFailures: sum((t) => Number(!t.braceletIntegrityOk)),
    totalOfferedEdges: sum((t) => t.offeredEdgeCount),
    meanOfferedEdges: turnCount ? sum((t) => t.offeredEdgeCount) / turnCount : 0,
    maxOfferedEdges: Math.max(0, ...turns.map((t) => t.offeredEdgeCount)),
  };
}
export function aggregateRuns(runs: readonly RunMetric[]): AggregateMetric {
  const n = runs.length || 1;
  const sum = (f: (r: RunMetric) => number) => runs.reduce((a, r) => a + f(r), 0);
  return {
    runCount: runs.length,
    finalSorted: runs.every((r) => r.finalSorted),
    turnCount: sum((r) => r.turnCount),
    mergeCount: sum((r) => r.mergeCount),
    correctEdgeInclusionRate: sum((r) => r.correctEdgeInclusionRate) / n,
    judgeAccuracy: sum((r) => r.judgeAccuracy) / n,
    invalidEdgesOffered: sum((r) => r.invalidEdgesOffered),
    duplicateEdgesOffered: sum((r) => r.duplicateEdgesOffered),
    braceletIntegrityFailures: sum((r) => r.braceletIntegrityFailures),
    totalOfferedEdges: sum((r) => r.totalOfferedEdges),
    meanOfferedEdges: sum((r) => r.meanOfferedEdges) / n,
    maxOfferedEdges: Math.max(0, ...runs.map((r) => r.maxOfferedEdges)),
  };
}
