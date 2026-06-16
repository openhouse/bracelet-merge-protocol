# Bracelet Merge Protocol

_A blind-dealer / sighted-judge protocol for merging sorted rigid circular bracelets._

## What this is

This is an executable research prototype for studying a blind-dealer / sighted-judge protocol for merging sorted bracelets. It is both a small native ESM TypeScript library and a CLI for experiments, traces, and metrics.

## Mathematical model: bracelets as unoriented cyclic orders

A bracelet is an unoriented cyclic order: no privileged first bead, no privileged direction, and equivalence under rotation and reflection.

## Physical metaphor: rigid circular bracelets with beads

The carrier remains conceptually closed while the Dealer records a virtual merged topology.

## Roles: Dealer, Judge, Audit

The blind Dealer sees bead IDs and topology only. The sighted Judge sees hidden values and chooses one offered insertion edge. Audit code may verify sortedness and emit study fields when values are not hidden.

## What is an insertion edge?

An insertion edge is an unordered adjacency between two beads. A one-bead bracelet has a self-edge; a two-bead bracelet has one physical edge.

## What is a turn?

A turn presents one Source bead and the Dealer-offered insertion edges to the Judge, records the choice, and updates the virtual bracelet.

## What is a merge?

A merge inserts Source beads, in stored Source order, into the Target bracelet until one merged bracelet remains.

## Algorithm sketch

1. Assign opaque IDs (`p01`, `p02`, ...).
2. Load initial bracelets of size at most three.
3. Repeatedly merge the two smallest bracelets.
4. For every Source bead, offer topology-valid edges.
5. Audit final sortedness up to rotation/reflection.

## Merge modes: frontier and all

`frontier` offers topological-embedding-preserving edges. `all` offers every current edge as a baseline for Judge burden.

## Blindness boundary

Dealer modules do not import hidden values, ranks, rank maps, value maps, or `OracleJudge`. The OracleJudge and audit/metrics study fields live outside the Dealer boundary.

## Related work / positioning

The project is adjacent to comparison sorting, merge sort, insertion sort, cyclic orders, circular permutations, necklaces and bracelets, noncrossing constraints, active ranking, and LLM-as-judge evaluation. It does not claim circular sorting is new.

## Install

```bash
npm install
npm run build
```

## CLI examples

```bash
npm run cli -- --fixture=canonical --metrics
npm run cli -- --fixture=desk --hide-values --summary-only
npm run cli -- --bag Q,B,M,H,Z,D,R,G,L,T,A,K --summary-only
npm run cli -- --runs=10 --summary-only --metrics-jsonl=out/events.jsonl --metrics-csv=out/turns.csv --summary-json=out/summary.json
```

## Library usage

```ts
import { runOnce } from "bracelet-merge-protocol";

const result = await runOnce({ fixture: "canonical", mode: "frontier" });
console.log(result.summary.finalSorted);
```

## Metrics glossary

Priority Dealer metrics include correct edge inclusion, invalid edge leakage, and offered-edge burden. Turn, merge, run, and aggregate events are emitted with `schemaVersion = 1`.

## Future LLM judge

The async Judge interface is ready for network calls, retries, parsing, confidence, and raw response logging; no real LLM API is implemented in v1.

## Status

Private experimental research prototype, not a proof and not a production sorting package.
