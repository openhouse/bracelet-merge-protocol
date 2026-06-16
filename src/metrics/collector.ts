import type { MetricEvent, RunMetric, TurnMetric } from "./types.js";
export class MetricCollector {
  readonly events: MetricEvent[] = [];
  add(event: MetricEvent): void {
    this.events.push(event);
  }
  get turns(): TurnMetric[] {
    return this.events.filter((e): e is TurnMetric => e.event === "turn");
  }
  get runs(): RunMetric[] {
    return this.events.filter((e): e is RunMetric => e.event === "run");
  }
}
