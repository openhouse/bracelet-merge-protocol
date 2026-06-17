import { describe, expect, it } from "vitest";
import { CallbackJudge } from "../src/judge/CallbackJudge.js";
import { OracleJudge } from "../src/judge/OracleJudge.js";
import { makeBeadIds } from "../src/domain/ids.js";
import { makeHiddenValues, parseValues } from "../src/domain/values.js";
import { runOnce } from "../src/index.js";

describe("merge", () => {
  it("OracleJudge as judge and audit oracle produces correctness metrics", async () => {
    const run = await runOnce({ fixture: "canonical" });
    expect(run.summary.scoredTurnCount).toBe(run.summary.turnCount);
    expect(run.summary.judgeAccuracy).toBe(1);
    expect(run.turns.every((turn) => turn.scoringAvailable && turn.chosenEdgeIsCorrect)).toBe(true);
  });

  it("callback judge without audit oracle does not self-certify correctness", async () => {
    const ids = makeBeadIds(12);
    const hidden = makeHiddenValues(ids, parseValues("Q,B,M,H,Z,D,R,G,L,T,A,K"));
    const oracle = new OracleJudge(hidden);
    const judge = new CallbackJudge((request) => oracle.chooseEdge(request));
    const run = await runOnce({ fixture: "canonical", judge });
    expect(run.summary.scoredTurnCount).toBe(0);
    expect(run.summary.judgeAccuracy).toBeNull();
    expect(
      run.turns.every((turn) => !turn.scoringAvailable && turn.chosenEdgeIsCorrect === undefined),
    ).toBe(true);
  });
});
