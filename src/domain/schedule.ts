import { braceletName } from "./ids.js";
import type { BeadId, Bracelet, HostPolicy } from "./types.js";
export function makeInitialBracelets(ids: readonly BeadId[], chunkSize: number): Bracelet[] {
  if (!Number.isInteger(chunkSize) || chunkSize < 1 || chunkSize > 3)
    throw new Error("Invalid chunk size: expected 1, 2, or 3");
  const out: Bracelet[] = [];
  for (let i = 0; i < ids.length; i += chunkSize)
    out.push({
      name: braceletName(`B${String(out.length + 1).padStart(3, "0")}`),
      ids: ids.slice(i, i + chunkSize),
      depth: 0,
    });
  return out;
}
export function chooseNextMerge(
  bracelets: readonly Bracelet[],
  hostPolicy: HostPolicy,
): { target: Bracelet; source: Bracelet; remaining: Bracelet[] } {
  const sorted = [...bracelets].sort(
    (a, b) => a.ids.length - b.ids.length || String(a.name).localeCompare(String(b.name)),
  );
  const first = sorted[0]!,
    second = sorted[1]!;
  const remaining = sorted.slice(2);
  if (hostPolicy === "first") return { target: first, source: second, remaining };
  return second.ids.length >= first.ids.length
    ? { target: second, source: first, remaining }
    : { target: first, source: second, remaining };
}
export const replaceMergedBracelets = (
  remaining: readonly Bracelet[],
  merged: Bracelet,
): Bracelet[] =>
  [...remaining, merged].sort(
    (a, b) => a.ids.length - b.ids.length || String(a.name).localeCompare(String(b.name)),
  );
