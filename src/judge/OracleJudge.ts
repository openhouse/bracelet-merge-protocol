import { edgeKey } from "../domain/cycle.js";
import { DealerDidNotOfferOracleEdgeError } from "../domain/errors.js";
import { isCyclicallySortedUnoriented } from "../domain/sortedness.js";
import type {
  BeadId,
  BeadValue,
  Edge,
  HiddenValues,
  Judge,
  JudgeDecision,
  JudgeRequest,
} from "../domain/types.js";
export class OracleJudge implements Judge {
  readonly valueById: ReadonlyMap<BeadId, BeadValue>;
  readonly rankById: ReadonlyMap<BeadId, number>;
  constructor(hidden: HiddenValues) {
    this.valueById = hidden.valueById;
    this.rankById = hidden.rankById;
  }
  rank(id: BeadId): number {
    const r = this.rankById.get(id);
    if (r === undefined) throw new Error(`Missing rank for ${id}`);
    return r;
  }
  value(id: BeadId): BeadValue {
    const v = this.valueById.get(id);
    if (v === undefined) throw new Error(`Missing value for ${id}`);
    return v;
  }
  values(ids: readonly BeadId[]): BeadValue[] {
    return ids.map((id) => this.value(id));
  }
  isSortedBracelet(cycle: readonly BeadId[]): boolean {
    return isCyclicallySortedUnoriented(cycle, this.rankById);
  }
  correctEdge(currentCycle: readonly BeadId[], bead: BeadId): Edge {
    const sorted = [...currentCycle, bead].sort((a, b) => this.rank(a) - this.rank(b));
    const i = sorted.indexOf(bead);
    const left = sorted[(i - 1 + sorted.length) % sorted.length]!;
    const right = sorted[(i + 1) % sorted.length]!;
    return { a: left, b: right };
  }
  isCorrectEdge(currentCycle: readonly BeadId[], bead: BeadId, edge: Edge): boolean {
    const c = this.correctEdge(currentCycle, bead);
    return edgeKey(c.a, c.b) === edgeKey(edge.a, edge.b);
  }
  async chooseEdge(request: JudgeRequest): Promise<JudgeDecision> {
    const correct = this.correctEdge(request.currentCycle, request.bead);
    const chosen = request.offeredEdges.find(
      (e) => edgeKey(e.a, e.b) === edgeKey(correct.a, correct.b),
    );
    if (!chosen) throw new DealerDidNotOfferOracleEdgeError();
    return { chosenEdge: chosen, confidence: 1, reason: "oracle" };
  }
}
