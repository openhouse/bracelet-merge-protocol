import type { BeadId } from "./types.js";
import { reverseCycle, rotate, sameUnorientedCycle } from "./cycle.js";
export const rotations = (cycle: readonly BeadId[]): BeadId[][] =>
  cycle.map((_, i) => rotate(cycle, i));
export const reflections = (cycle: readonly BeadId[]): BeadId[][] => rotations(reverseCycle(cycle));
export const braceletClass = (cycle: readonly BeadId[]): BeadId[][] => [
  ...rotations(cycle),
  ...reflections(cycle),
];
export const braceletEquivalent = (a: readonly BeadId[], b: readonly BeadId[]): boolean =>
  sameUnorientedCycle(a, b);
export function canonicalBraceletKey(cycle: readonly BeadId[]): string {
  if (cycle.length === 0) return "";
  return braceletClass(cycle)
    .map((c) => c.join("|"))
    .sort()[0]!;
}
