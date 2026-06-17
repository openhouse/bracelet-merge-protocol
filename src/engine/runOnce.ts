import {
  chooseNextMerge,
  makeInitialBracelets,
  replaceMergedBracelets,
} from "../domain/schedule.js";
import { makeBeadIds } from "../domain/ids.js";
import { mergeId, runId } from "../domain/ids.js";
import { DEFAULT_ALPHABET, makeHiddenValues } from "../domain/values.js";
import { makeSeededRng, shuffle } from "../domain/rng.js";
import { isCyclicallySortedUnoriented, canonicalSortedValues } from "../domain/sortedness.js";
import { OracleJudge } from "../judge/OracleJudge.js";
import { summarizeRun } from "../metrics/summarize.js";
import type {
  AuditOracle,
  BeadValue,
  Bracelet,
  HiddenValues,
  HostPolicy,
  Judge,
  MergeMode,
} from "../domain/types.js";
import type { MetricEvent, RunMetric, TurnMetric } from "../metrics/types.js";
import { loadJudgeTemplate } from "../prompt/render.js";
import type { JudgePromptTraceEvent } from "../prompt/types.js";
import { canonicalFixture, deskFixture } from "../domain/fixtures.js";
export type RunOnceOptions = {
  seed?: string;
  runIndex?: number;
  count?: number;
  values?: readonly BeadValue[] | undefined;
  fixture?: "canonical" | "desk" | undefined;
  chunkSize?: number;
  mode?: MergeMode;
  hostPolicy?: HostPolicy;
  hideValues?: boolean | undefined;
  audit?: boolean | undefined;
  judge?: Judge | undefined;
  auditOracle?: AuditOracle | undefined;
  order?: readonly BeadValue[] | undefined;
  judgePromptTrace?: boolean | undefined;
  judgePromptValues?: boolean | undefined;
  judgeTemplatePath?: string | undefined;
};
export type RunOnceResult = {
  finalBracelet: Bracelet;
  hiddenValues: HiddenValues;
  turns: TurnMetric[];
  summary: RunMetric;
  events: MetricEvent[];
  sortedValues: BeadValue[];
  promptEvents: JudgePromptTraceEvent[];
};
export async function runOnce(options: RunOnceOptions = {}): Promise<RunOnceResult> {
  const seed = options.seed ?? "ring-demo";
  const mode = options.mode ?? "frontier";
  const hostPolicy = options.hostPolicy ?? "larger";
  const chunkSize = options.chunkSize ?? 3;
  const values =
    options.fixture === "canonical"
      ? canonicalFixture.values
      : options.fixture === "desk"
        ? deskFixture.values
        : (options.values ??
          shuffle(
            (DEFAULT_ALPHABET.split("") as BeadValue[]).slice(0, options.count ?? 12),
            makeSeededRng(seed),
          ));
  const ids = makeBeadIds(values.length);
  const hiddenValues = makeHiddenValues(ids, values, options.order ?? [...values].sort());
  let bracelets =
    options.fixture === "desk" ? deskFixture.bracelets : makeInitialBracelets(ids, chunkSize);
  const defaultOracle = new OracleJudge(hiddenValues);
  const judge = options.judge ?? defaultOracle;
  const auditOracle =
    options.audit === false
      ? undefined
      : (options.auditOracle ?? (options.judge ? undefined : defaultOracle));
  const turns: TurnMetric[] = [];
  const events: MetricEvent[] = [];
  const promptEvents: JudgePromptTraceEvent[] = [];
  const promptTemplate = options.judgePromptTrace
    ? loadJudgeTemplate(options.judgeTemplatePath)
    : undefined;
  let mergeIndex = 0;
  while (bracelets.length > 1) {
    const pick = chooseNextMerge(bracelets, hostPolicy);
    const result = await (
      await import("../domain/merge.js")
    ).mergeBracelets({
      target: pick.target,
      source: pick.source,
      judge,
      mode,
      runContext: {
        runId: runId(`R${String((options.runIndex ?? 0) + 1).padStart(3, "0")}`),
        runIndex: options.runIndex ?? 0,
        seed,
        mergeId: mergeId(`M${String(mergeIndex + 1).padStart(3, "0")}`),
        mergeIndex,
        mode,
      },
      mergeIndex,
      hideValues: options.hideValues,
      hiddenValues,
      auditOracle,
      judgePrompt: promptTemplate
        ? {
            includeValues: Boolean(options.judgePromptValues),
            template: promptTemplate.template,
            templateName: promptTemplate.name,
            templateVersion: promptTemplate.version,
          }
        : undefined,
    });
    turns.push(...result.turns);
    promptEvents.push(...result.promptEvents);
    events.push(...result.turns, {
      event: "merge",
      schemaVersion: 1,
      runId: runId(`R${String((options.runIndex ?? 0) + 1).padStart(3, "0")}`),
      mergeId: mergeId(`M${String(mergeIndex + 1).padStart(3, "0")}`),
      mergeIndex,
      turnCount: result.turns.length,
      finalSize: result.bracelet.ids.length,
    });
    bracelets = replaceMergedBracelets(pick.remaining, result.bracelet);
    mergeIndex++;
  }
  const finalBracelet = bracelets[0]!;
  const finalSorted =
    options.audit === false
      ? true
      : isCyclicallySortedUnoriented(finalBracelet.ids, hiddenValues.rankById);
  const summary = summarizeRun(turns, {
    runId: runId(`R${String((options.runIndex ?? 0) + 1).padStart(3, "0")}`),
    runIndex: options.runIndex ?? 0,
    seed,
    finalSorted,
    mergeCount: mergeIndex,
  });
  events.push(summary);
  return {
    finalBracelet,
    hiddenValues,
    turns,
    summary,
    events,
    promptEvents,
    sortedValues: canonicalSortedValues(
      finalBracelet.ids,
      hiddenValues.valueById,
      hiddenValues.rankById,
    ),
  };
}
