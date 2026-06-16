import type { BeadId, BeadValue, HiddenValues } from "./types.js";
export const DEFAULT_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
export const parseValues = (raw: string): BeadValue[] =>
  raw
    .split(/[,,\s]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s as BeadValue);
export function assertDistinctValues(values: readonly BeadValue[]): void {
  if (new Set(values).size !== values.length) throw new Error("Duplicate values are not supported");
}
export const makeRankByValue = (order: readonly BeadValue[]): ReadonlyMap<BeadValue, number> =>
  new Map(order.map((v, i) => [v, i]));
export function makeHiddenValues(
  ids: readonly BeadId[],
  values: readonly BeadValue[],
  order: readonly BeadValue[] = [...values].sort(),
): HiddenValues {
  assertDistinctValues(values);
  const ranks = makeRankByValue(order);
  return {
    valueById: new Map(ids.map((id, i) => [id, values[i]!])),
    rankById: new Map(ids.map((id, i) => [id, ranks.get(values[i]!) ?? i])),
  };
}
