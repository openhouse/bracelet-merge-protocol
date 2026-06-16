import { currentEdges, withEdgeIds } from "../domain/cycle.js";
import { validEdgesForNextBead } from "../domain/topology.js";
import type { BeadId, InsertionEdge, MergeMode } from "../domain/types.js";
import type { HypothesisState } from "./hypotheses.js";
export type DealerValidEdgesResult = {
  allEdges: InsertionEdge[];
  offeredEdges: InsertionEdge[];
  prunedEdges: InsertionEdge[];
  duplicateEdgeCount: number;
  invalidEdgesOfferedCount: number;
  frontierViolations: number;
  hypothesisCountBefore: number;
  hypothesisCountAfter: number;
};
export function validEdgesForDealer(args: {
  mode: MergeMode;
  currentCycle: readonly BeadId[];
  nextBead: BeadId;
  targetCycle: readonly BeadId[];
  sourceCycle: readonly BeadId[];
  sourcePrefixAfterInsertion: readonly BeadId[];
  hypotheses?: HypothesisState;
}): DealerValidEdgesResult {
  const allEdges = withEdgeIds(currentEdges(args.currentCycle));
  const offeredEdges = args.mode === "all" ? allEdges : validEdgesForNextBead(args);
  const offered = new Set(offeredEdges.map((e) => e.key));
  const valid = new Set(validEdgesForNextBead(args).map((e) => e.key));
  const keys = offeredEdges.map((e) => e.key);
  return {
    allEdges,
    offeredEdges,
    prunedEdges: allEdges.filter((e) => !offered.has(e.key)),
    duplicateEdgeCount: keys.length - new Set(keys).size,
    invalidEdgesOfferedCount: offeredEdges.filter((e) => !valid.has(e.key)).length,
    frontierViolations:
      args.mode === "frontier" ? offeredEdges.filter((e) => !valid.has(e.key)).length : 0,
    hypothesisCountBefore: args.hypotheses?.count ?? 1,
    hypothesisCountAfter: Math.max(1, offeredEdges.length),
  };
}
