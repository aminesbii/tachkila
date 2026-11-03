import { describe, expect, it } from "vitest";

import { PLAYER_IMAGES } from "@/data/player-images";
import { playersByPosition } from "@/data/players";
import { POSITIONS } from "@/engine/types";
import { initials, monogram, playerPhoto } from "@/lib/display";

describe("player portraits", () => {
  it("keys every portrait by a name that is still in the seed list", () => {
    const seeded = new Set(
      POSITIONS.flatMap((position) => playersByPosition(position)).map((player) => player.name)
    );
    for (const name of Object.keys(PLAYER_IMAGES)) {
      expect(seeded.has(name), name).toBe(true);
    }
  });

  it("serves https links only", () => {
    for (const [name, url] of Object.entries(PLAYER_IMAGES)) {
      expect(url.startsWith("https://"), name).toBe(true);
    }
  });
});

describe("monogram", () => {
  it("keeps the first two letters of the name", () => {
    expect(monogram("Ali Boumnijel")).toBe("AL");
    expect(monogram("Higuita")).toBe("HI");
    expect(monogram("  mouhib   chmakh ")).toBe("MO");
  });

  it("never returns an empty label", () => {
    expect(monogram("")).toBe("?");
  });

  it("is not the same as the manager initials", () => {
    expect(initials("Ali Boumnijel")).toBe("AB");
  });
});

describe("playerPhoto", () => {
  it("prefers the link stored on the pool entry", () => {
    expect(playerPhoto({ name: "Whoever", imageUrl: "https://example.com/a.jpg" })).toBe(
      "https://example.com/a.jpg"
    );
  });

  it("falls back to the portrait list for older saved games", () => {
    const name = Object.keys(PLAYER_IMAGES)[0];
    expect(playerPhoto({ name })).toBe(PLAYER_IMAGES[name]);
  });

  it("returns nothing when there is no picture at all", () => {
    expect(playerPhoto({ name: "Mouhib Chmakh" })).toBeUndefined();
  });
});
