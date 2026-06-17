import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { BlindDealer } from "../src/dealer/BlindDealer.js";
import { validEdgesForDealer } from "../src/dealer/validEdges.js";
import { makeBeadIds } from "../src/domain/ids.js";

describe("dealer blindness", () => {
  it("dealer source files do not reference hidden value or oracle symbols", () => {
    const forbidden = [
      "OracleJudge",
      "HiddenValues",
      "valueById",
      "rankById",
      "BeadValue",
      "studyValue",
      "studyRank",
      "sortedStudyReading",
      "canonicalSortedValues",
      "../domain/values",
      "../domain/sortedness",
      "../prompt/",
      "handlebars",
    ];
    for (const file of ["BlindDealer.ts", "frontier.ts", "hypotheses.ts", "validEdges.ts"]) {
      const text = readFileSync(join(process.cwd(), "src", "dealer", file), "utf8");
      for (const token of forbidden) expect(text, `${file} contains ${token}`).not.toContain(token);
    }
  });

  it("validEdgesForDealer runs with only bead ids and topology", () => {
    const ids = makeBeadIds(5);
    const result = validEdgesForDealer({
      mode: "frontier",
      currentCycle: ids.slice(0, 3),
      nextBead: ids[3]!,
      targetCycle: ids.slice(0, 3),
      sourceCycle: ids.slice(3, 5),
      sourcePrefixAfterInsertion: [ids[3]!],
    });
    expect(result.offeredEdges.length).toBeGreaterThan(0);
  });

  it("BlindDealer constructor does not store hidden value fields", () => {
    const ids = makeBeadIds(4);
    const dealer = new BlindDealer({
      beadIds: ids,
      initialBracelets: [],
      mode: "frontier",
      hostPolicy: "larger",
    });
    expect("hiddenValues" in dealer).toBe(false);
    expect("valueById" in dealer).toBe(false);
    expect("rankById" in dealer).toBe(false);
  });
});
