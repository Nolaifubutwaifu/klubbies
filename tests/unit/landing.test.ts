import { describe, expect, it } from "vitest";
import { landingPath } from "@/lib/auth/landing";

describe("where sign-in lands", () => {
  const club = (handle: string, declined = false) => ({ handle, declined });

  it("sends a one-club member straight to the club, however they signed in", () => {
    expect(landingPath([club("uq_vb")])).toBe("/c/uq_vb");
  });

  it("sends someone in several clubs to Your clubs", () => {
    expect(landingPath([club("uq_vb"), club("uqbvc")])).toBe("/clubs");
  });

  it("returns someone to the club whose link they came through, if they are on its list", () => {
    expect(landingPath([club("uq_vb"), club("uqbvc")], "UQBVC")).toBe("/c/uqbvc");
    expect(landingPath([club("uq_vb")], "someone_else")).toBe("/c/uq_vb");
  });

  it("ignores invitations they said Not me to", () => {
    expect(landingPath([club("uq_vb"), club("uqbvc", true)])).toBe("/c/uq_vb");
    expect(landingPath([club("uqbvc", true)], "uqbvc")).toBe("/clubs");
    expect(landingPath([])).toBe("/clubs");
  });
});
