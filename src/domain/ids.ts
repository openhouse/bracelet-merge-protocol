import type { BeadId, BraceletName, EdgeId, MergeId, RunId, TurnId } from "./types.js";
export const beadId = (s: string): BeadId => s as BeadId;
export const braceletName = (s: string): BraceletName => s as BraceletName;
export const edgeId = (s: string): EdgeId => s as EdgeId;
export const runId = (s: string): RunId => s as RunId;
export const mergeId = (s: string): MergeId => s as MergeId;
export const turnId = (s: string): TurnId => s as TurnId;
export const makeBeadIds = (count: number): BeadId[] =>
  Array.from({ length: count }, (_, i) => beadId(`p${String(i + 1).padStart(2, "0")}`));
