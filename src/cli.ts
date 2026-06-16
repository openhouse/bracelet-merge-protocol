#!/usr/bin/env node
import { Command } from "commander";
import { writeJsonl, writeSummaryJson, writeTurnsCsv } from "./metrics/sinks.js";
import { runMany } from "./engine/runMany.js";
import { parseValues } from "./domain/values.js";
import { formatRunSummary } from "./output/format.js";
import type { HostPolicy, MergeMode } from "./domain/types.js";
export async function main(argv = process.argv): Promise<void> {
  const program = new Command();
  program
    .name("bracelet-merge-protocol")
    .description("Bracelet Merge Protocol experiments")
    .option("--seed <text>", "seed", "ring-demo")
    .option("--runs <number>", "runs", (v) => Number(v), 1)
    .option("--letters <text>")
    .option("--values <text>")
    .option("--bag <text>")
    .option("--count <number>", "count", (v) => Number(v), 12)
    .option("--order <text>")
    .option("--fixture <name>")
    .option("--chunk-size <number>", "chunk size", (v) => Number(v), 3)
    .option("--mode <mode>", "frontier|all", "frontier")
    .option("--host-policy <policy>", "larger|first", "larger")
    .option("--hide-values")
    .option("--blind")
    .option("--no-audit")
    .option("--compact")
    .option("--summary-only")
    .option("--quiet")
    .option("--metrics", "metrics", true)
    .option("--no-metrics")
    .option("--turn-metrics", "turn metrics", true)
    .option("--no-turn-metrics")
    .option("--metrics-jsonl <path>")
    .option("--jsonl <path>")
    .option("--metrics-csv <path>")
    .option("--turns-csv <path>")
    .option("--summary-json <path>");
  program.parse(argv);
  const opts = program.opts<Record<string, unknown>>();
  try {
    const fixture =
      opts.fixture === "canonical" || opts.fixture === "desk" ? opts.fixture : undefined;
    if (opts.fixture && !fixture) throw new Error("Invalid fixture: expected canonical or desk");
    const chunkSize = opts.chunkSize as number;
    if (!Number.isInteger(chunkSize) || chunkSize < 1 || chunkSize > 3)
      throw new Error("Invalid chunk size: expected 1, 2, or 3");
    const raw = (opts.bag ?? opts.values ?? opts.letters) as string | undefined;
    const result = await runMany({
      seed: opts.seed as string,
      runs: opts.runs as number,
      count: opts.count as number,
      values: raw ? parseValues(raw) : undefined,
      fixture,
      chunkSize,
      mode: opts.mode as MergeMode,
      hostPolicy: opts.hostPolicy as HostPolicy,
      hideValues: Boolean(opts.hideValues ?? opts.blind),
      audit: opts.audit as boolean | undefined,
    });
    if (opts.metricsJsonl || opts.jsonl)
      writeJsonl((opts.metricsJsonl ?? opts.jsonl) as string, result.events);
    if (opts.metricsCsv || opts.turnsCsv)
      writeTurnsCsv((opts.metricsCsv ?? opts.turnsCsv) as string, result.turns);
    if (opts.summaryJson) writeSummaryJson(opts.summaryJson as string, result.summaries);
    if (!opts.quiet) console.log(formatRunSummary(result, Boolean(opts.hideValues ?? opts.blind)));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
if (import.meta.url === `file://${process.argv[1]}`) void main();
