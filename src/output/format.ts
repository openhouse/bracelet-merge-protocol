import type { RunManyResult } from "../engine/runMany.js";
export function formatRunSummary(result: RunManyResult, hideValues = false): string {
  const lines = [
    `Bracelet Merge Protocol`,
    `runs=${result.summaries.length} finalSorted=${result.aggregate.finalSorted} turns=${result.aggregate.turnCount} merges=${result.aggregate.mergeCount}`,
    `correctEdgeInclusionRate=${result.aggregate.correctEdgeInclusionRate} judgeAccuracy=${result.aggregate.judgeAccuracy} invalidEdgesOffered=${result.aggregate.invalidEdgesOffered}`,
  ];
  if (!hideValues && result.runs[0])
    lines.push(`canonicalSortedValues=${result.runs[0].sortedValues.join(",")}`);
  return lines.join("\n");
}
