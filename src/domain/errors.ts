export class DealerDidNotOfferOracleEdgeError extends Error {
  constructor(message = "Dealer did not offer the oracle edge") {
    super(message);
    this.name = "DealerDidNotOfferOracleEdgeError";
  }
}
export class OffMenuJudgeDecisionError extends Error {
  constructor(message = "Judge chose an edge that was not offered") {
    super(message);
    this.name = "OffMenuJudgeDecisionError";
  }
}
