import { describe, expect, it } from "vitest";
import { currentEdges, edgeKey, insertBetween, sameUnorientedCycle } from "../src/domain/cycle.js";
import { makeBeadIds } from "../src/domain/ids.js";
import { braceletEquivalent, canonicalBraceletKey } from "../src/domain/bracelet.js";
import {
  targetOrderOk,
  sourcePrefixOk,
  topologicalEmbeddingExists,
  validEdgesForNextBead,
} from "../src/domain/topology.js";
import { makeHiddenValues, parseValues } from "../src/domain/values.js";
import { isCyclicallySortedUnoriented } from "../src/domain/sortedness.js";
import { OracleJudge } from "../src/judge/OracleJudge.js";
import { runMany, runOnce } from "../src/index.js";
import { summaryJson, turnsToCsv } from "../src/metrics/sinks.js";
const ids = makeBeadIds(6);
describe("cycle", () => {
  it("handles edges and symmetry", () => {
    expect(currentEdges([ids[0]!]).length).toBe(1);
    expect(currentEdges(ids.slice(0, 2))).toHaveLength(1);
    expect(currentEdges(ids.slice(0, 3))).toHaveLength(3);
    expect(currentEdges(ids.slice(0, 4))).toHaveLength(4);
    expect(edgeKey(ids[0]!, ids[1]!)).toBe(edgeKey(ids[1]!, ids[0]!));
    expect(insertBetween([ids[0]!], { a: ids[0]!, b: ids[0]! }, ids[1]!)).toHaveLength(2);
    expect(sameUnorientedCycle(ids.slice(0, 4), [ids[2]!, ids[3]!, ids[0]!, ids[1]!])).toBe(true);
    expect(sameUnorientedCycle(ids.slice(0, 4), [ids[0]!, ids[2]!, ids[1]!, ids[3]!])).toBe(false);
  });
});
describe("bracelet", () => {
  it("canonicalizes", () => {
    const a = ids.slice(0, 4);
    const b = [a[2]!, a[1]!, a[0]!, a[3]!];
    expect(braceletEquivalent(a, b)).toBe(true);
    expect(canonicalBraceletKey(a)).toBe(canonicalBraceletKey(b));
  });
});
describe("topology", () => {
  it("checks embeddings", () => {
    const t = ids.slice(0, 4);
    expect(targetOrderOk(t, t)).toBe(true);
    expect(targetOrderOk([t[0]!, t[2]!, t[1]!, t[3]!], t)).toBe(false);
    expect(sourcePrefixOk(t, t.slice(0, 3))).toBe(true);
    expect(sourcePrefixOk([t[0]!, t[2]!, t[1]!, t[3]!], t)).toBe(false);
    expect(topologicalEmbeddingExists(t, t, [])).toBe(true);
    expect(
      validEdgesForNextBead({
        currentCycle: ids.slice(0, 3),
        nextBead: ids[3]!,
        targetCycle: ids.slice(0, 3),
        sourcePrefixAfterInsertion: [ids[3]!],
      }).length,
    ).toBeGreaterThan(0);
  });
});
describe("sortedness and oracle", () => {
  it("sorts cyclically and chooses", async () => {
    const hidden = makeHiddenValues(ids.slice(0, 4), parseValues("A,B,C,D"));
    expect(
      isCyclicallySortedUnoriented([ids[2]!, ids[3]!, ids[0]!, ids[1]!], hidden.rankById),
    ).toBe(true);
    expect(
      isCyclicallySortedUnoriented([ids[0]!, ids[2]!, ids[1]!, ids[3]!], hidden.rankById),
    ).toBe(false);
    const judge = new OracleJudge(hidden);
    const offeredEdges = currentEdges([ids[0]!, ids[2]!, ids[3]!]).map((e, i) => ({
      ...e,
      key: edgeKey(e.a, e.b),
      id: `e${i}` as never,
      index: i,
    }));
    const d = await judge.chooseEdge({
      bead: ids[1]!,
      offeredEdges,
      currentCycle: [ids[0]!, ids[2]!, ids[3]!],
      sourceCycle: [ids[1]!],
      sourcePrefix: [ids[1]!],
      turnContext: {
        runId: "r" as never,
        runIndex: 0,
        seed: "s",
        mergeId: "m" as never,
        mergeIndex: 0,
        turnId: "t" as never,
        turnIndex: 0,
        mode: "frontier",
        targetName: "b" as never,
        sourceName: "c" as never,
      },
    });
    expect(d.reason).toBe("oracle");
  });
});
describe("runs and metrics", () => {
  it("runs fixtures and hides values", async () => {
    const c = await runOnce({ fixture: "canonical", hideValues: false });
    expect(c.summary.finalSorted).toBe(true);
    expect(c.summary.correctEdgeInclusionRate).toBe(1);
    const d = await runOnce({ fixture: "desk", hideValues: true });
    expect(JSON.stringify(d.events)).not.toContain("studyValue");
    const many = await runMany({ runs: 2, count: 8, seed: "x" });
    expect(many.aggregate.runCount).toBe(2);
    expect(turnsToCsv(c.turns).split("\n")[0]).toContain("choiceBits");
    expect(JSON.parse(summaryJson([c.summary])).aggregate.runCount).toBe(1);
  });
});
