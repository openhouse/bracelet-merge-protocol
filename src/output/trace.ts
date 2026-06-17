import type { RunManyResult } from "../engine/runMany.js";

const fmtEdge = (edge?: { a: string; b: string }): string => (edge ? `${edge.a}-${edge.b}` : "n/a");

export function formatTurnTrace(result: RunManyResult, hideValues = false): string {
  const lines = ["Turn trace"];
  for (const turn of result.turns) {
    lines.push(
      `${turn.runId}/${turn.mergeId}/${turn.turnId} bead=${turn.candidateBeadId}${
        !hideValues && turn.studyValue ? ` value=${turn.studyValue}` : ""
      } beforeSize=${turn.currentCycleSizeBefore} afterSize=${turn.currentCycleSizeAfter}`,
      `  offeredEdgeCount=${turn.offeredEdgeCount} prunedEdgeCount=${turn.prunedEdgeCount} pruningRatio=${turn.pruningRatio} choiceBits=${turn.choiceBits}`,
      `  chosen=${fmtEdge(turn.chosenEdge)} oracleEdgeOffered=${turn.oracleEdgeOffered ?? "unscored"} chosenEdgeIsCorrect=${turn.chosenEdgeIsCorrect ?? "unscored"}`,
    );
  }
  return lines.join("\n");
}
