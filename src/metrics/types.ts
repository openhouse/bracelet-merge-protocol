import type {
  BeadId,
  BeadValue,
  BraceletName,
  Edge,
  EdgeId,
  MergeId,
  MergeMode,
  RunId,
  TurnId,
} from "../domain/types.js";
export const schemaVersion = 1;
export const protocolName = "Bracelet Merge Protocol";
export type TurnMetric = {
  event: "turn";
  schemaVersion: 1;
  protocolName: string;
  runId: RunId;
  runIndex: number;
  seed: string;
  mergeId: MergeId;
  mergeIndex: number;
  turnId: TurnId;
  turnIndex: number;
  mode: MergeMode;
  candidateBeadId: BeadId;
  targetName: BraceletName;
  sourceName: BraceletName;
  currentCycleSizeBefore: number;
  currentCycleSizeAfter: number;
  sourcePrefixLength: number;
  allEdgeCount: number;
  offeredEdgeCount: number;
  prunedEdgeCount: number;
  pruningRatio: number;
  forced: boolean;
  actualLlmTurn: boolean;
  multiChoice: boolean;
  choiceBits: number;
  chosenEdgeIndex: number;
  normalizedChosenPosition: number;
  chosenEdgeKey: string;
  chosenEdge: Edge;
  oracleEdgeKey?: string | undefined;
  oracleEdge?: Edge | undefined;
  oracleEdgeOffered?: boolean | undefined;
  correctEdgeIncluded?: boolean | undefined;
  chosenEdgeIsCorrect?: boolean | undefined;
  scoringAvailable: boolean;
  invalidEdgesOfferedCount: number;
  duplicateEdgesOfferedCount: number;
  frontierViolations: number;
  hypothesisCountBefore: number;
  hypothesisCountAfter: number;
  cyclicallySortedAfterTurn: boolean;
  braceletIntegrityOk: boolean;
  promptCharEstimate: number;
  promptTokenEstimate: number;
  parseSuccess: boolean;
  offMenu: boolean;
  retryCount: number;
  judgeConfidence?: number | undefined;
  judgeSecondChoiceEdgeId?: EdgeId | undefined;
  judgeConfidenceMargin?: number | undefined;
  studyValue?: BeadValue | undefined;
  studyRank?: number | undefined;
  studyCurrentValuesBefore?: BeadValue[] | undefined;
  studyCurrentValuesAfter?: BeadValue[] | undefined;
  studyChosenEdgeValues?: BeadValue[] | undefined;
  studyOracleEdgeValues?: BeadValue[] | undefined;
};
export type MergeMetric = {
  event: "merge";
  schemaVersion: 1;
  runId: RunId;
  mergeId: MergeId;
  mergeIndex: number;
  turnCount: number;
  finalSize: number;
};
export type RunMetric = {
  event: "run";
  schemaVersion: 1;
  runId: RunId;
  runIndex: number;
  seed: string;
  finalSorted: boolean;
  turnCount: number;
  mergeCount: number;
  correctEdgeInclusionRate: number;
  judgeAccuracy: number | null;
  scoredTurnCount: number;
  invalidEdgesOffered: number;
  duplicateEdgesOffered: number;
  braceletIntegrityFailures: number;
  totalOfferedEdges: number;
  meanOfferedEdges: number;
  maxOfferedEdges: number;
};
export type AggregateMetric = Omit<
  RunMetric,
  "event" | "runId" | "runIndex" | "seed" | "schemaVersion"
> & { runCount: number };
export type MetricEvent = TurnMetric | MergeMetric | RunMetric;
