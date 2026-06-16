import type { BeadId, BeadValue } from "./types.js";
import { reverseCycle } from "./cycle.js";
const ranksOf = (cycle: readonly BeadId[], rankById: ReadonlyMap<BeadId, number>): number[] =>
  cycle.map((id) => {
    const r = rankById.get(id);
    if (r === undefined) throw new Error(`Missing rank for ${id}`);
    return r;
  });
export function countCyclicDrops(ranks: readonly number[]): number {
  if (ranks.length <= 1) return 0;
  let drops = 0;
  for (let i = 0; i < ranks.length; i++) if (ranks[i]! > ranks[(i + 1) % ranks.length]!) drops++;
  return drops;
}
export const isCyclicallySortedDirected = (
  cycle: readonly BeadId[],
  rankById: ReadonlyMap<BeadId, number>,
): boolean => cycle.length <= 3 || countCyclicDrops(ranksOf(cycle, rankById)) <= 1;
export const isCyclicallySortedUnoriented = (
  cycle: readonly BeadId[],
  rankById: ReadonlyMap<BeadId, number>,
): boolean =>
  cycle.length <= 3 ||
  isCyclicallySortedDirected(cycle, rankById) ||
  isCyclicallySortedDirected(reverseCycle(cycle), rankById);
export const canonicalSortedIds = (
  ids: readonly BeadId[],
  rankById: ReadonlyMap<BeadId, number>,
): BeadId[] => [...ids].sort((a, b) => (rankById.get(a) ?? 0) - (rankById.get(b) ?? 0));
export const canonicalSortedValues = (
  ids: readonly BeadId[],
  valueById: ReadonlyMap<BeadId, BeadValue>,
  rankById: ReadonlyMap<BeadId, number>,
): BeadValue[] => canonicalSortedIds(ids, rankById).map((id) => valueById.get(id)!);
export const sortedStudyReading = canonicalSortedIds;
