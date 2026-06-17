import type {
  BeadId,
  BeadValue,
  EdgeId,
  MergeId,
  MergeMode,
  RunId,
  TurnId,
} from "../domain/types.js";

export type PromptBeadView = {
  readonly id: BeadId;
  readonly value?: BeadValue | "[hidden]";
};

export type PromptEdgeView = {
  readonly id: EdgeId;
  readonly key: string;
  readonly label: string;
  readonly left: PromptBeadView;
  readonly right: PromptBeadView;
};

export type JudgePromptContext = {
  readonly protocolName: "Bracelet Merge Protocol";
  readonly templateName: string;
  readonly templateVersion: string;
  readonly runId: RunId;
  readonly runIndex: number;
  readonly mergeId: MergeId;
  readonly mergeIndex: number;
  readonly turnId: TurnId;
  readonly turnIndex: number;
  readonly mode: MergeMode;
  readonly hiddenValuesIncluded: boolean;
  readonly candidate: PromptBeadView;
  readonly offeredEdges: readonly PromptEdgeView[];
  readonly orderDescription: string;
  readonly judgeInstructions: string;
  readonly responseFormat: "json";
};

export type JudgePromptTraceEvent = {
  readonly event: "judgePrompt";
  readonly schemaVersion: 1;
  readonly protocolName: "Bracelet Merge Protocol";
  readonly templateName: string;
  readonly templateVersion: string;
  readonly runId: RunId;
  readonly runIndex: number;
  readonly mergeId: MergeId;
  readonly mergeIndex: number;
  readonly turnId: TurnId;
  readonly turnIndex: number;
  readonly mode: MergeMode;
  readonly hiddenValuesIncluded: boolean;
  readonly promptContext: JudgePromptContext;
  readonly renderedPrompt: string;
  readonly judgeResponse: {
    readonly chosenEdgeId?: EdgeId;
    readonly chosenEdgeKey: string;
    readonly chosenLabel?: string;
    readonly confidence?: number;
    readonly reason?: string;
    readonly rawResponse?: unknown;
  };
  readonly audit?: {
    readonly scoringAvailable: boolean;
    readonly oracleEdgeId?: EdgeId;
    readonly oracleEdgeKey?: string;
    readonly oracleLabel?: string;
    readonly oracleEdgeOffered?: boolean;
    readonly chosenEdgeIsCorrect?: boolean;
  };
  readonly dealerMetrics: {
    readonly allEdgeCount: number;
    readonly offeredEdgeCount: number;
    readonly prunedEdgeCount: number;
    readonly pruningRatio: number;
    readonly choiceBits: number;
    readonly chosenEdgeIndex: number;
    readonly normalizedChosenPosition: number;
    readonly firstChoice: boolean;
    readonly lastChoice: boolean;
    readonly promptCharEstimate: number;
    readonly promptTokenEstimate: number;
  };
};
