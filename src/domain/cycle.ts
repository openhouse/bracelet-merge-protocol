import { edgeId } from "./ids.js";
import type { BeadId, Edge, InsertionEdge } from "./types.js";
export const edgeKey = (a: BeadId, b: BeadId): string => [a, b].sort().join("--");
export const makeEdge = (a: BeadId, b: BeadId): Edge => ({ a, b });
export function assertCycleIntegrity(cycle: readonly BeadId[]): void {
  if (new Set(cycle).size !== cycle.length) throw new Error("Cycle contains duplicate bead IDs");
}
export function currentEdges(cycle: readonly BeadId[]): Edge[] {
  assertCycleIntegrity(cycle);
  if (cycle.length === 0) throw new Error("Cannot enumerate edges of empty cycle");
  if (cycle.length === 1) return [{ a: cycle[0]!, b: cycle[0]! }];
  if (cycle.length === 2) return [{ a: cycle[0]!, b: cycle[1]! }];
  return cycle.map((a, i) => ({ a, b: cycle[(i + 1) % cycle.length]! }));
}
export const withEdgeIds = (edges: readonly Edge[]): InsertionEdge[] =>
  edges.map((e, i) => ({
    ...e,
    key: edgeKey(e.a, e.b),
    id: edgeId(`e${String(i + 1).padStart(3, "0")}:${edgeKey(e.a, e.b)}`),
    index: i,
  }));
export function insertBetween(cycle: readonly BeadId[], edge: Edge, bead: BeadId): BeadId[] {
  assertCycleIntegrity(cycle);
  if (cycle.includes(bead)) throw new Error(`Duplicate bead ${bead}`);
  if (cycle.length === 1 && edge.a === cycle[0] && edge.b === cycle[0]) return [cycle[0]!, bead];
  for (let i = 0; i < cycle.length; i++) {
    const a = cycle[i]!;
    const b = cycle[(i + 1) % cycle.length]!;
    if (edgeKey(a, b) === edgeKey(edge.a, edge.b)) {
      const out = [...cycle];
      out.splice(i + 1, 0, bead);
      return out;
    }
  }
  throw new Error(`Missing insertion edge ${edgeKey(edge.a, edge.b)}`);
}
export const rotate = (cycle: readonly BeadId[], startIndex: number): BeadId[] =>
  cycle.map((_, i) => cycle[(startIndex + i) % cycle.length]!);
export const reverseCycle = (cycle: readonly BeadId[]): BeadId[] => [...cycle].reverse();
export function isRotationOf(a: readonly BeadId[], b: readonly BeadId[]): boolean {
  return (
    a.length === b.length &&
    (a.length === 0 || a.some((_, i) => rotate(a, i).join("|") === b.join("|")))
  );
}
export const sameUnorientedCycle = (a: readonly BeadId[], b: readonly BeadId[]): boolean =>
  isRotationOf(a, b) || isRotationOf(reverseCycle(a), b);
export const restrictedCycle = (
  orientedCycle: readonly BeadId[],
  allowedSet: ReadonlySet<BeadId>,
): BeadId[] => orientedCycle.filter((id) => allowedSet.has(id));
