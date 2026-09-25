import { describe, expect, it } from "vitest";

import { generatePool } from "@/lib/pool";
import { FORMATION_DEFS } from "@/lib/formations";
import type { Formation, RoomDoc } from "@/lib/types";
import { serializeRoom } from "@/lib/game";
import { scoreRoom, rankScores } from "@/lib/scoring";

describe("generatePool", () => {
  it("builds position count × 4 for the default formation", () => {
    const formation: Formation = { GK: 1, DEF: 4, MID: 4, FWD: 2 };
    const { entries, counts } = generatePool(formation, "ABC12");

    expect(counts).toEqual({ GK: 4, DEF: 16, MID: 16, FWD: 8 });
    expect(entries).toHaveLength(44);
  });

  it("covers every supported formation with the real player seed", () => {
    for (const def of FORMATION_DEFS) {
      const { entries, counts } = generatePool(def.counts, `seed-${def.key}`);
      const expected: Formation = {
        GK: def.counts.GK * 4,
        DEF: def.counts.DEF * 4,
        MID: def.counts.MID * 4,
        FWD: def.counts.FWD * 4,
      };
      expect(counts, def.key).toEqual(expected);
      expect(entries.filter((e) => e.playerId.startsWith("fake-")), def.key).toHaveLength(0);
    }
  });

  it("assigns sequential unique order ids", () => {
    const { entries } = generatePool({ GK: 1, DEF: 3, MID: 4, FWD: 2 });
    const ids = entries.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(entries.map((e) => e.order)).toEqual(entries.map((_, i) => i));
  });

  it("is deterministic for a given seed", () => {
    const a = generatePool({ GK: 1, DEF: 4, MID: 4, FWD: 2 }, "SAME");
    const b = generatePool({ GK: 1, DEF: 4, MID: 4, FWD: 2 }, "SAME");
    expect(a.entries.map((e) => e.id)).toEqual(b.entries.map((e) => e.id));
  });
});

describe("scoreRoom & rankScores", () => {
  it("sums only sold roster points and ranks by score then bank", () => {
    const pool = [
      { id: "GK-0", position: "GK" as const, pts: 1, status: "sold" as const, order: 0 },
      { id: "GK-1", position: "GK" as const, pts: 4, status: "sold" as const, order: 1 },
      { id: "GK-2", position: "GK" as const, pts: 2, status: "unsold" as const, order: 2 },
    ];
    const doc = {
      formation: { GK: 1, DEF: 4, MID: 4, FWD: 2 },
      pool,
      participants: [
        { id: "a", seat: 1, name: "A", isHost: true, token: "t1", bankPoints: 80, roster: ["GK-0", "GK-1"] },
        { id: "b", seat: 2, name: "B", isHost: false, token: "t2", bankPoints: 95, roster: ["GK-2"] },
      ],
    } as unknown as RoomDoc;

    const scores = scoreRoom(doc);
    expect(scores.find((s) => s.seat === 1)?.score).toBe(5);
    expect(scores.find((s) => s.seat === 2)?.score).toBe(0);

    const ranked = rankScores(scores);
    expect(ranked[0].seat).toBe(1);
  });

  it("breaks ties on remaining bank points", () => {
    const pool = [
      { id: "GK-0", position: "GK" as const, pts: 3, status: "sold" as const, order: 0 },
      { id: "GK-1", position: "GK" as const, pts: 3, status: "sold" as const, order: 1 },
    ];
    const doc = {
      formation: { GK: 1, DEF: 4, MID: 4, FWD: 2 },
      pool,
      participants: [
        { id: "a", seat: 1, name: "A", isHost: true, token: "t1", bankPoints: 90, roster: ["GK-0"] },
        { id: "b", seat: 2, name: "B", isHost: false, token: "t2", bankPoints: 99, roster: ["GK-1"] },
      ],
    } as unknown as RoomDoc;

    const ranked = rankScores(scoreRoom(doc));
    expect(ranked[0].seat).toBe(2);
  });
});

describe("serializeRoom (blind mode)", () => {
  function room(blindMode: boolean): RoomDoc {
    return {
      _id: "ABC12",
      createdAt: new Date(),
      updatedAt: new Date(),
      hostParticipantId: "host",
      formation: { GK: 1, DEF: 4, MID: 4, FWD: 2 },
      blindMode,
      status: "auction",
      currentIndex: 0,
      pool: [
        { id: "GK-0", playerId: "p1", name: "Chmakh", position: "GK", pts: 1, nationality: "Tunisia", status: "auction", order: 0 },
        { id: "MID-0", playerId: "p2", name: "Rodri", position: "MID", pts: 4, nationality: "Spain", status: "upcoming", order: 1 },
        { id: "FWD-0", playerId: "p3", name: "Mbappé", position: "FWD", pts: 4, nationality: "France", status: "sold", winnerSeat: 1, winningBid: 20, order: 2 },
      ],
      participants: [
        { id: "host", seat: 1, name: "Amine", isHost: true, token: "host-token", bankPoints: 80, roster: ["FWD-0"] },
        { id: "guest", seat: 2, name: "Yassine", isHost: false, token: "guest-token", bankPoints: 100, roster: [] },
      ],
    };
  }

  it("hides unsold points from participants in blind mode", () => {
    const pub = serializeRoom(room(true), "guest-token");
    expect(pub.pool.find((e) => e.id === "GK-0")?.pts).toBeNull();
    expect(pub.pool.find((e) => e.id === "FWD-0")?.pts).toBe(4);
    expect(pub.viewer.isHost).toBe(false);
    expect(pub.viewer.seat).toBe(2);
  });

  it("shows points to non-hosts when blind mode is off", () => {
    const pub = serializeRoom(room(false), "guest-token");
    expect(pub.pool.find((e) => e.id === "GK-0")?.pts).toBe(1);
  });

  it("always shows points to the host and never leaks tokens", () => {
    const pub = serializeRoom(room(true), "host-token");
    expect(pub.pool.find((e) => e.id === "GK-0")?.pts).toBe(1);
    for (const p of pub.participants) {
      expect(p).not.toHaveProperty("token");
    }
    expect(pub.viewer.isHost).toBe(true);
  });

  it("treats anonymous viewers as non-hosts", () => {
    const pub = serializeRoom(room(true), null);
    expect(pub.viewer.isHost).toBe(false);
    expect(pub.viewer.seat).toBeNull();
    expect(pub.pool.find((e) => e.id === "GK-0")?.pts).toBeNull();
  });
});