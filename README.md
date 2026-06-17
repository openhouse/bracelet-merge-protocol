# Bracelet Merge Protocol

_A blind-dealer / sighted-judge protocol for merging sorted rigid circular bracelets._

## What this is

This is an executable research prototype for studying a blind-dealer / sighted-judge protocol for merging sorted bracelets. It is both a small native ESM TypeScript library and a CLI for experiments, traces, and metrics.

## Mathematical model: bracelets as unoriented cyclic orders

A bracelet is an unoriented cyclic order: no privileged first bead, no privileged direction, and equivalence under rotation and reflection.

## Physical metaphor: rigid circular bracelets with beads

The carrier remains conceptually closed while the Dealer records a virtual merged topology.

## Roles: Dealer, Judge, Audit

The blind Dealer sees bead IDs and topology only. The sighted Judge sees hidden values and chooses one offered insertion edge. Audit code may verify sortedness and emit study fields when values are not hidden. The active Judge chooses an edge; a separate optional audit oracle scores whether that edge was correct. If no audit oracle is present, correctness scoring is marked unavailable rather than self-certified.

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

`frontier` offers only edges that preserve both the Target bracelet cyclic order and the already-threaded Source-prefix cyclic order. Source prefixes of length 0, 1, 2, or 3 are intentionally unconstraining because all such bracelets are equivalent up to rotation/reflection. `all` offers every current edge as a baseline for Judge burden, so invalid-frontier edges in `all` are expected baseline burden rather than Dealer leakage.

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
bracelet-merge --fixture=canonical --metrics
bracelet-merge --fixture=desk --hide-values --summary-only
bracelet-merge --bag Q,B,M,H,Z,D,R,G,L,T,A,K --order A,B,D,G,H,K,L,M,Q,R,T,Z --summary-only
bracelet-merge --runs=10 --summary-only --metrics-jsonl=out/events.jsonl --metrics-csv=out/turns.csv --summary-json=out/summary.json
```

## Library usage

```ts
import { runOnce } from "bracelet-merge-protocol";

const result = await runOnce({ fixture: "canonical", mode: "frontier" });
console.log(result.summary.finalSorted);
```

## Metrics glossary

Priority Dealer metrics include correct edge inclusion, invalid edge leakage, and offered-edge burden. Turn, merge, run, and aggregate events are emitted with `schemaVersion = 1`.

## Hide-values / no-audit semantics

`--hide-values` hides value-derived study fields in console and output files. `--blind` is an alias. `--no-audit` disables audit scoring and also uses hidden-value output sanitization. Programmatic `runOnce` results still include `hiddenValues` and `sortedValues`; hide-values is an output-sanitization mode for CLI/reporting surfaces.

## Future LLM judge

The async Judge interface is ready for network calls, retries, parsing, confidence, and raw response logging; no real LLM API is implemented in v1.

## Status

Private experimental research prototype, not a proof and not a production sorting package.
