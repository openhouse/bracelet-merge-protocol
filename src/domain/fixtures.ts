import { beadId, braceletName, makeBeadIds } from "./ids.js";
import type { BeadValue, Bracelet } from "./types.js";
import { parseValues } from "./values.js";
export const canonicalFixture = {
  values: parseValues("Q,B,M,H,Z,D,R,G,L,T,A,K"),
  expected: parseValues("A,B,D,G,H,K,L,M,Q,R,T,Z"),
};
export const deskFixture = {
  values: parseValues("J,C,Q,A,W,F,L,B,I,G,O,D"),
  expected: parseValues("A,B,C,D,F,G,I,J,L,O,Q,W"),
  bracelets: [
    ["p01", "p02", "p03"],
    ["p04", "p05", "p06"],
    ["p07", "p08", "p09"],
    ["p10", "p11", "p12"],
  ].map(
    (ids, i): Bracelet => ({
      name: braceletName(`B${String(i + 1).padStart(3, "0")}`),
      ids: ids.map(beadId),
      depth: 0,
    }),
  ),
};
export function fixtureValues(name: "canonical" | "desk"): readonly BeadValue[] {
  return name === "canonical" ? canonicalFixture.values : deskFixture.values;
}
export const fixtureIds = (): ReturnType<typeof makeBeadIds> => makeBeadIds(12);
