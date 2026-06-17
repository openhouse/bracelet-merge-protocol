import { describe, expect, it } from "vitest";
import { insertBetween } from "../src/domain/cycle.js";
import { makeBeadIds } from "../src/domain/ids.js";
import {
  sourcePrefixOk,
  targetOrderOk,
  topologicalEmbeddingExists,
  validEdgesForNextBead,
} from "../src/domain/topology.js";

const id = makeBeadIds(8);

describe("topology", () => {
  it("requires target order and source-prefix order", () => {
    const candidate = [id[0]!, id[4]!, id[3]!, id[1]!, id[5]!, id[2]!, id[6]!];
    const target = [id[0]!, id[1]!, id[2]!];
    const sourcePrefix = [id[3]!, id[4]!, id[5]!, id[6]!];
    expect(targetOrderOk(candidate, target)).toBe(true);
    expect(sourcePrefixOk(candidate, sourcePrefix)).toBe(false);
    expect(topologicalEmbeddingExists(candidate, target, sourcePrefix)).toBe(false);
  });

  it("treats source prefixes of length 0 through 3 as intentionally unconstraining", () => {
    expect(sourcePrefixOk([id[2]!, id[0]!, id[1]!], [])).toBe(true);
    expect(sourcePrefixOk([id[2]!, id[0]!, id[1]!], [id[0]!])).toBe(true);
    expect(sourcePrefixOk([id[2]!, id[0]!, id[1]!], [id[0]!, id[1]!])).toBe(true);
    expect(sourcePrefixOk([id[2]!, id[0]!, id[1]!], [id[0]!, id[1]!, id[2]!])).toBe(true);
  });

  it("frontier rejects an edge that preserves target topology but breaks source-prefix topology", () => {
    const currentCycle = [id[0]!, id[4]!, id[3]!, id[1]!, id[2]!, id[6]!];
    const target = [id[0]!, id[1]!, id[2]!];
    const sourcePrefix = [id[3]!, id[4]!, id[5]!, id[6]!];
    const badEdge = { a: id[1]!, b: id[2]! };
    const candidate = insertBetween(currentCycle, badEdge, id[5]!);
    expect(targetOrderOk(candidate, target)).toBe(true);
    expect(sourcePrefixOk(candidate, sourcePrefix)).toBe(false);
    expect(
      validEdgesForNextBead({
        currentCycle,
        nextBead: id[5]!,
        targetCycle: target,
        sourcePrefixAfterInsertion: sourcePrefix,
      }).map((edge) => edge.key),
    ).not.toContain("p02--p03");
  });
});
