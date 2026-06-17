import { describe, expect, it } from "vitest";
import { canonicalFixture, deskFixture } from "../src/domain/fixtures.js";
import { runOnce } from "../src/index.js";

describe("fixtures", () => {
  it("canonical fixture has exact canonical sorted values", async () => {
    const run = await runOnce({ fixture: "canonical" });
    expect(run.sortedValues).toEqual(canonicalFixture.expected);
  });

  it("desk fixture has exact canonical sorted values", async () => {
    const run = await runOnce({ fixture: "desk" });
    expect(run.sortedValues).toEqual(deskFixture.expected);
  });
});
