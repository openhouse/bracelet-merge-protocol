import type { Judge, JudgeDecision, JudgeRequest } from "../domain/types.js";
export class CallbackJudge implements Judge {
  constructor(private readonly callback?: (request: JudgeRequest) => Promise<JudgeDecision>) {}
  async chooseEdge(request: JudgeRequest): Promise<JudgeDecision> {
    if (!this.callback) throw new Error("CallbackJudge is not configured");
    return this.callback(request);
  }
}
