import type { TurnMetric } from "../metrics/types.js";
export const formatTraceLine = (t: TurnMetric): string =>
  `${t.turnId} bead=${t.candidateBeadId} offered=${t.offeredEdgeCount} chosen=${t.chosenEdgeKey}`;
