export type Brand<T, Name extends string> = T & { readonly __brand: Name };
export type BeadId = Brand<string, "BeadId">;
export type BeadValue = Brand<string, "BeadValue">;
export type BraceletName = Brand<string, "BraceletName">;
export type EdgeId = Brand<string, "EdgeId">;
export type RunId = Brand<string, "RunId">;
export type MergeId = Brand<string, "MergeId">;
export type TurnId = Brand<string, "TurnId">;
export type Edge = { readonly a: BeadId; readonly b: BeadId };
export type InsertionEdge = Edge & {
  readonly id: EdgeId;
  readonly key: string;
  readonly index: number;
};
export type Bracelet = {
  readonly name: BraceletName;
  readonly ids: readonly BeadId[];
  readonly depth: number;
};
export type HiddenValues = {
  readonly valueById: ReadonlyMap<BeadId, BeadValue>;
  readonly rankById: ReadonlyMap<BeadId, number>;
};
export type MergeMode = "frontier" | "all";
export type HostPolicy = "larger" | "first";
export type TurnContext = {
  readonly runId: RunId;
  readonly runIndex: number;
  readonly seed: string;
  readonly mergeId: MergeId;
  readonly mergeIndex: number;
  readonly turnId: TurnId;
  readonly turnIndex: number;
  readonly mode: MergeMode;
  readonly targetName: BraceletName;
  readonly sourceName: BraceletName;
};
export type JudgeRequest = {
  readonly bead: BeadId;
  readonly offeredEdges: readonly InsertionEdge[];
  readonly currentCycle: readonly BeadId[];
  readonly sourceCycle: readonly BeadId[];
  readonly sourcePrefix: readonly BeadId[];
  readonly turnContext: TurnContext;
};
export type JudgeDecision = {
  readonly chosenEdge: InsertionEdge;
  readonly confidence?: number;
  readonly secondChoiceEdgeId?: EdgeId;
  readonly reason?: string;
  readonly rawResponse?: unknown;
};
export interface Judge {
  chooseEdge(request: JudgeRequest): Promise<JudgeDecision>;
}
export type AuditOracle = {
  correctEdge(currentCycle: readonly BeadId[], bead: BeadId): Edge;
};
