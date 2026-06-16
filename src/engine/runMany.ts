import { makeRunSeed } from "../domain/rng.js";
import { aggregateRuns } from "../metrics/summarize.js";
import type { AggregateMetric, MetricEvent, RunMetric, TurnMetric } from "../metrics/types.js";
import { runOnce, type RunOnceOptions, type RunOnceResult } from "./runOnce.js";
export type RunManyResult = {
  runs: RunOnceResult[];
  turns: TurnMetric[];
  summaries: RunMetric[];
  events: MetricEvent[];
  aggregate: AggregateMetric;
};
export async function runMany(
  options: RunOnceOptions & { runs?: number } = {},
): Promise<RunManyResult> {
  const count = options.runs ?? 1;
  const runs: RunOnceResult[] = [];
  for (let i = 0; i < count; i++)
    runs.push(
      await runOnce({
        ...options,
        seed:
          count === 1 ? (options.seed ?? "ring-demo") : makeRunSeed(options.seed ?? "ring-demo", i),
        runIndex: i,
      }),
    );
  const summaries = runs.map((r) => r.summary);
  return {
    runs,
    summaries,
    turns: runs.flatMap((r) => r.turns),
    events: runs.flatMap((r) => r.events),
    aggregate: aggregateRuns(summaries),
  };
}
