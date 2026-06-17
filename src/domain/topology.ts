import {
  currentEdges,
  insertBetween,
  restrictedCycle,
  sameUnorientedCycle,
  withEdgeIds,
} from "./cycle.js";
import type { BeadId, InsertionEdge } from "./types.js";
export const targetOrderOk = (
  candidateCycle: readonly BeadId[],
  targetCycle: readonly BeadId[],
): boolean =>
  sameUnorientedCycle(restrictedCycle(candidateCycle, new Set(targetCycle)), targetCycle);
/**
 * Source-prefix invariant: after inserting the next source bead, restricting the
 * merged bracelet to the already-threaded source prefix must be the same
 * unoriented bracelet as the stored source prefix. Prefix lengths 0..3 are
 * intentionally unconstraining: every cycle of at most three distinct beads is
 * equivalent up to rotation/reflection, so there is no crossing/order witness
 * yet in the physical bracelet model.
 */
export const sourcePrefixOk = (
  candidateCycle: readonly BeadId[],
  sourcePrefix: readonly BeadId[],
): boolean =>
  sourcePrefix.length <= 3 ||
  sameUnorientedCycle(restrictedCycle(candidateCycle, new Set(sourcePrefix)), sourcePrefix);
export const topologicalEmbeddingExists = (
  candidateCycle: readonly BeadId[],
  targetCycle: readonly BeadId[],
  sourcePrefix: readonly BeadId[],
): boolean =>
  targetOrderOk(candidateCycle, targetCycle) && sourcePrefixOk(candidateCycle, sourcePrefix);
export function validEdgesForNextBead(args: {
  currentCycle: readonly BeadId[];
  nextBead: BeadId;
  targetCycle: readonly BeadId[];
  sourcePrefixAfterInsertion: readonly BeadId[];
}): InsertionEdge[] {
  const seen = new Set<string>();
  return withEdgeIds(currentEdges(args.currentCycle)).filter((edge) => {
    if (seen.has(edge.key)) return false;
    seen.add(edge.key);
    const candidate = insertBetween(args.currentCycle, edge, args.nextBead);
    return topologicalEmbeddingExists(candidate, args.targetCycle, args.sourcePrefixAfterInsertion);
  });
}
