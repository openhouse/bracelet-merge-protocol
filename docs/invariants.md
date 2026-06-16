# Invariants

- A bracelet is an unoriented cyclic order.
- Rotation/reflection are equivalent.
- Size <= 3 is sorted by definition.
- An insertion edge is an unordered adjacency.
- Dealer-valid edges are topological, not value-based.
- Dealer failure means oracle edge was not offered.
- Judge failure means oracle edge was offered but not chosen.
- Under OracleJudge, expected judgeAccuracy is 1.
- Final result is checked up to rotation/reflection.
- This is a prototype, not a proof.
