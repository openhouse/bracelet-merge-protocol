import { makeInitialBracelets } from "../domain/schedule.js";
import type { BeadId, Bracelet, HostPolicy, MergeMode } from "../domain/types.js";
import { validEdgesForDealer, type DealerValidEdgesResult } from "./validEdges.js";
export { makeInitialBracelets };
export class BlindDealer {
  readonly beadIds: readonly BeadId[];
  readonly initialBracelets: readonly Bracelet[];
  readonly mode: MergeMode;
  readonly hostPolicy: HostPolicy;
  constructor(args: {
    beadIds: readonly BeadId[];
    initialBracelets: readonly Bracelet[];
    mode: MergeMode;
    hostPolicy: HostPolicy;
  }) {
    this.beadIds = args.beadIds;
    this.initialBracelets = args.initialBracelets;
    this.mode = args.mode;
    this.hostPolicy = args.hostPolicy;
  }
  validEdgesForTurn(
    args: Omit<Parameters<typeof validEdgesForDealer>[0], "mode">,
  ): DealerValidEdgesResult {
    return validEdgesForDealer({ ...args, mode: this.mode });
  }
}
