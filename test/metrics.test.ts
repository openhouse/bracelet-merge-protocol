import { describe, expect, it } from "vitest";
import { runOnce } from "../src/index.js";
import { turnsToCsv, summaryJson } from "../src/metrics/sinks.js";

describe("metrics", () => {
  it("distinguishes frontier leakage from all-mode baseline burden", async () => {
    const frontier = await runOnce({ fixture: "canonical", mode: "frontier" });
    const all = await runOnce({ fixture: "canonical", mode: "all" });
    expect(frontier.summary.finalSorted).toBe(true);
    expect(frontier.summary.invalidEdgesOffered).toBe(0);
    expect(all.summary.meanOfferedEdges).toBeGreaterThanOrEqual(frontier.summary.meanOfferedEdges);
    expect(all.summary.maxOfferedEdges).toBeGreaterThanOrEqual(frontier.summary.maxOfferedEdges);
    expect(all.summary.invalidEdgesOffered).toBeGreaterThanOrEqual(0);
  });

  it("writes stable CSV and summary JSON", async () => {
    const run = await runOnce({ fixture: "canonical" });
    expect(turnsToCsv(run.turns).split("\n")[0]).toContain("scoringAvailable");
    expect(JSON.parse(summaryJson([run.summary])).aggregate.runCount).toBe(1);
  });
});
