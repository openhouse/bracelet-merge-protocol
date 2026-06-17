import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { main } from "../src/cli.js";
import { runOnce } from "../src/engine/runOnce.js";
import { optionLabel } from "../src/prompt/context.js";

async function capture(
  args: string[],
): Promise<{ out: string; err: string; code: number | undefined }> {
  const logs: string[] = [];
  const errs: string[] = [];
  const oldLog = console.log;
  const oldErr = console.error;
  const oldCode = process.exitCode;
  process.exitCode = undefined;
  console.log = (msg?: unknown) => logs.push(String(msg));
  console.error = (msg?: unknown) => errs.push(String(msg));
  try {
    await main(args);
    return { out: logs.join("\n"), err: errs.join("\n"), code: process.exitCode };
  } finally {
    console.log = oldLog;
    console.error = oldErr;
    process.exitCode = oldCode;
  }
}

describe("judge prompt trace", () => {
  it("labels options stably", () => {
    expect([0, 1, 25, 26, 27].map(optionLabel)).toEqual(["A", "B", "Z", "AA", "AB"]);
  });

  it("builds ID-only prompt events with all and only offered edges", async () => {
    const result = await runOnce({ fixture: "canonical", judgePromptTrace: true });
    const event = result.promptEvents[0]!;
    const turn = result.turns[0]!;
    expect(event.promptContext.candidate.id).toBe(turn.candidateBeadId);
    expect(event.promptContext.offeredEdges).toHaveLength(turn.offeredEdgeCount);
    expect(event.promptContext.offeredEdges.map((e) => e.key)).toEqual(
      expect.arrayContaining([turn.chosenEdgeKey]),
    );
    expect(event.renderedPrompt).toContain("Respond with JSON only");
    expect(event.renderedPrompt).not.toContain("studyValue");
    expect(event.renderedPrompt).not.toContain("oracleEdgeKey");
    expect(event.renderedPrompt).not.toContain("studyCurrentValuesBefore");
    expect(event.promptContext.candidate.value).toBeUndefined();
    expect(event.promptContext.offeredEdges[0]!.left.value).toBeUndefined();
  });

  it("includes local values only when explicitly enabled", async () => {
    const idOnly = await runOnce({ fixture: "canonical", judgePromptTrace: true });
    const valued = await runOnce({
      fixture: "canonical",
      judgePromptTrace: true,
      judgePromptValues: true,
    });
    expect(idOnly.promptEvents[0]!.renderedPrompt).not.toContain("value=");
    expect(valued.promptEvents[0]!.renderedPrompt).toContain("- value:");
    expect(valued.promptEvents[0]!.renderedPrompt).toContain("value=");
  });

  it("CLI writes JSONL and Markdown and supports custom templates", async () => {
    const dir = mkdtempSync(join(tmpdir(), "bmp-prompt-"));
    const jsonl = join(dir, "prompts.jsonl");
    const md = join(dir, "prompts.md");
    const template = join(dir, "template.hbs");
    writeFileSync(
      template,
      "CUSTOM {{candidate.id}} {{#each offeredEdges}}{{label}}={{key}} {{/each}}",
    );
    const result = await capture([
      "--fixture",
      "canonical",
      "--judge-prompt-trace",
      "--judge-template",
      template,
      "--judge-prompt-values",
      "--judge-prompt-jsonl",
      jsonl,
      "--judge-prompt-md",
      md,
      "--summary-only",
    ]);
    expect(result.code).toBeUndefined();
    expect(result.out).toContain("Dealer → Judge");
    expect(result.out).toContain("Judge → Dealer");
    expect(result.out).toContain("CUSTOM");
    expect(JSON.parse(readFileSync(jsonl, "utf8").trim().split("\n")[0]!).event).toBe(
      "judgePrompt",
    );
    expect(readFileSync(md, "utf8")).toContain("Dealer → Judge");
  });

  it("rejects prompt values with hidden modes", async () => {
    for (const flag of ["--hide-values", "--blind", "--no-audit"]) {
      const result = await capture(["--fixture", "canonical", "--judge-prompt-values", flag]);
      expect(result.code).toBe(1);
      expect(result.err).toContain(
        "--judge-prompt-values cannot be combined with --hide-values, --blind, or --no-audit.",
      );
    }
  });
});
