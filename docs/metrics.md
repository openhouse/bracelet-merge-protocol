# Metrics

## Events

Turn events record one Judge choice. Merge events summarize a Source-to-Target merge. Run events summarize one full experiment. Summary JSON contains `{ schemaVersion, generatedAt, summaries, aggregate }`.

## Dealer-blind metrics

Dealer-blind metrics include offered edge counts, pruned edge counts, pruning ratio, duplicate offered edges, invalid topology leakage, frontier violations, and hypothesis counts.

## Audit-only metrics

Audit-only metrics include oracle edge inclusion, chosen-edge correctness, cyclic sortedness after a turn, and optional study values/ranks. These fields are removed when `hideValues` is true.

## Future LLM-readiness metrics

The schema includes prompt estimates, parse success, off-menu choice, retry count, confidence, second choice, and confidence margin.

## Priority Dealer metrics

1. `oracleEdgeOfferedRate` / `correctEdgeInclusionRate`.
2. `invalidEdgesOffered` / invalid edge leakage.
3. `totalOfferedEdges`, `meanOfferedEdges`, and `maxOfferedEdges`.
