import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseValues } from "../src/domain/values.js";
import { main } from "../src/cli.js";

describe("cli", () => {
  it("parses compact, comma-separated, and space-separated values", () => {
    expect(parseValues("ABCDFHJLMRTX")).toEqual(parseValues("A,B,C,D,F,H,J,L,M,R,T,X"));
    expect(parseValues("A B C D F H J L M R T X")).toEqual(parseValues("A,B,C,D,F,H,J,L,M,R,T,X"));
  });

  it("rejects duplicate values clearly", async () => {
    const old = process.exitCode;
    process.exitCode = undefined;
    await main(["--letters", "AABC", "--quiet"]);
    expect(process.exitCode).toBe(1);
    process.exitCode = old;
  });

  it("--order changes ranking behavior independently of bag order", async () => {
    const dir = mkdtempSync(join(tmpdir(), "bmp-order-"));
    const summary = join(dir, "summary.json");
    await main([
      "--bag",
      "Q,B,M,H,Z,D,R,G,L,T,A,K",
      "--order",
      "A,B,D,G,H,K,L,M,Q,R,T,Z",
      "--summary-json",
      summary,
      "--quiet",
    ]);
    const parsed = JSON.parse(readFileSync(summary, "utf8"));
    expect(parsed.aggregate.finalSorted).toBe(true);
  });

  it("hide-values, blind, and no-audit sanitize stdout and file outputs", async () => {
    const dir = mkdtempSync(join(tmpdir(), "bmp-"));
    const jsonl = join(dir, "events.jsonl");
    const csv = join(dir, "turns.csv");
    const summary = join(dir, "summary.json");
    await main([
      "--fixture",
      "canonical",
      "--hide-values",
      "--blind",
      "--no-audit",
      "--metrics-jsonl",
      jsonl,
      "--metrics-csv",
      csv,
      "--summary-json",
      summary,
      "--quiet",
    ]);
    const combined = [
      readFileSync(jsonl, "utf8"),
      readFileSync(csv, "utf8"),
      readFileSync(summary, "utf8"),
    ].join("\n");
    expect(combined).not.toContain("studyValue");
    expect(combined).not.toContain("studyRank");
    expect(combined).not.toContain("canonicalSortedValues");
  });
});
