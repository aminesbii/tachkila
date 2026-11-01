import { describe, expect, it } from "vitest";

import { countsByPosition, freeAgentsUsed, generatePool, shuffle } from "@/lib/pool";
import { playersByPosition } from "@/data/players";
import {
  FORMATION_DEFS,
  GAME_PLAYER_COUNTS,
  MAX_GAME_PLAYERS,
  MIN_GAME_PLAYERS,
  poolBreakdown,
  slotRows,
  totalSlots,
} from "@/lib/formations";
import { serializeRoom, teamScore, STARTING_BANK } from "@/lib/game";
import { rankScores, scoreRoom } from "@/lib/scoring";
import { POSITIONS } from "@/lib/types";
import type { Formation, PoolEntry, RoomDoc } from "@/lib/types";

const DEFAULT_FORMATION: Formation = { GK: 1, DEF: 4, MID: 4, FWD: 2 };

function seededRng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

describe("generatePool", () => {
  it("draws slots × game players for every position", () => {
    const { entries, counts } = generatePool(DEFAULT_FORMATION, 4, seededRng(7));

    expect(counts).toEqual({ GK: 4, DEF: 16, MID: 16, FWD: 8 });
    expect(entries).toHaveLength(totalSlots(DEFAULT_FORMATION) * 4);
    expect(countsByPosition(entries)).toEqual(counts);
  });

  it("covers every formation and every allowed game player count", () => {
    for (const def of FORMATION_DEFS) {
      for (const count of GAME_PLAYER_COUNTS) {
        const { entries, counts } = generatePool(def.counts, count, seededRng(def.key.length * 31 + count));
        const expected = poolBreakdown(def.counts, count);
        expect(counts, `${def.key} × ${count}`).toEqual(expected);
        expect(entries, `${def.key} × ${count}`).toHaveLength(totalSlots(def.counts) * count);
      }
    }
  });

  it("never repeats a footballer inside one pool", () => {
    for (const count of GAME_PLAYER_COUNTS) {
      const { entries } = generatePool({ GK: 1, DEF: 5, MID: 5, FWD: 3 }, count, seededRng(count * 13));
      const ids = entries.map((e) => e.playerId);
      expect(new Set(ids).size, `ids unique for ${count}`).toBe(ids.length);
    }
    expect(new Set(playersByPosition("GK").map((p) => p.id)).size).toBe(playersByPosition("GK").length);
  });

  it("auctions goalkeepers, then defenders, midfielders and forwards", () => {
    const formation: Formation = { GK: 1, DEF: 3, MID: 5, FWD: 2 };
    const gamePlayers = 4;
    const { entries } = generatePool(formation, gamePlayers, seededRng(3));
    const positions = entries.map((e) => e.position);

    const firstOf = (pos: (typeof POSITIONS)[number]) => positions.indexOf(pos);
    expect(firstOf("GK")).toBeLessThan(firstOf("DEF"));
    expect(firstOf("DEF")).toBeLessThan(firstOf("MID"));
    expect(firstOf("MID")).toBeLessThan(firstOf("FWD"));

    const expected = slotRows(formation).flatMap((row) => row.flatMap(() => Array(gamePlayers).fill(row[0])));
    expect(positions).toEqual(expected);
  });

  it("goes left to right: each block of game players is one pitch row", () => {
    const gamePlayers = 4;
    const { entries } = generatePool({ GK: 1, DEF: 4, MID: 4, FWD: 2 }, gamePlayers, seededRng(99));

    let cursor = 0;
    for (const row of slotRows(DEFAULT_FORMATION)) {
      for (let slot = 0; slot < row.length; slot++) {
        const block = entries.slice(cursor, cursor + gamePlayers);
        expect(block, `row ${row[0]} slot ${slot}`).toHaveLength(gamePlayers);
        expect(block.every((e) => e.position === row[0])).toBe(true);
        expect(new Set(block.map((e) => e.playerId)).size).toBe(gamePlayers);
        cursor += gamePlayers;
      }
    }
    expect(cursor).toBe(entries.length);
  });

  it("gives every room a different random pool", () => {
    const names = Array.from({ length: 12 }, (_, seed) =>
      generatePool(DEFAULT_FORMATION, 4, seededRng(seed + 1))
        .entries.map((e) => e.playerId)
        .join("|")
    );
    expect(new Set(names).size).toBe(names.length);
  });

  it("is reproducible for the same rng", () => {
    const a = generatePool(DEFAULT_FORMATION, 5, seededRng(42));
    const b = generatePool(DEFAULT_FORMATION, 5, seededRng(42));
    expect(a.entries).toEqual(b.entries);
  });

  it("uses fresh randomness by default", () => {
    const a = generatePool(DEFAULT_FORMATION, 6).entries.map((e) => e.playerId);
    const b = generatePool(DEFAULT_FORMATION, 6).entries.map((e) => e.playerId);
    expect(a).not.toEqual(b);
  });

  it("is fully covered by the seed data for every formation and 6 game players", () => {
    for (const def of FORMATION_DEFS) {
      const { entries } = generatePool(def.counts, MAX_GAME_PLAYERS, seededRng(def.key.length));
      expect(freeAgentsUsed(entries), def.key).toBe(0);
      for (const entry of entries) {
        expect(entry.pts, `${def.key} ${entry.name}`).toBeGreaterThanOrEqual(1);
        expect(entry.pts, `${def.key} ${entry.name}`).toBeLessThanOrEqual(4);
        expect(entry.name.trim().length, `${def.key} ${entry.playerId}`).toBeGreaterThan(0);
      }
    }
    for (const pos of POSITIONS) {
      const needed = MAX_GAME_PLAYERS * Math.max(...FORMATION_DEFS.map((f) => f.counts[pos]));
      expect(playersByPosition(pos).length, `${pos} stock`).toBeGreaterThanOrEqual(needed);
    }
  });

  it("numbers entries in auction order with unique ids", () => {
    const { entries } = generatePool(DEFAULT_FORMATION, 4);
    const ids = entries.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(entries.map((e) => e.order)).toEqual(entries.map((_, i) => i));
  });
});

describe("shuffle", () => {
  it("keeps every element exactly once", () => {
    const input = Array.from({ length: 50 }, (_, i) => i);
    const out = shuffle(input, seededRng(5));
    expect([...out].sort((a, b) => a - b)).toEqual(input);
  });
});

function makeRoom(overrides: Partial<RoomDoc> = {}): RoomDoc {
  const pool: PoolEntry[] = [
    { id: "GK-0", playerId: "p1", name: "Chmakh", position: "GK", pts: 1, nationality: "Tunisia", status: "auction", order: 0 },
    { id: "GK-1", playerId: "p2", name: "David Raya", position: "GK", pts: 4, nationality: "Spain", status: "upcoming", order: 1 },
    { id: "FWD-0", playerId: "p3", name: "Mbappé", position: "FWD", pts: 4, nationality: "France", status: "sold", winnerSeat: 1, winningBid: 20, order: 2 },
  ];
  return {
    updatedAt: new Date(),
    formation: DEFAULT_FORMATION,
    status: "auction",
    currentIndex: 0,
    pool,
    participants: [
      { id: "a", seat: 1, name: "Amine", bankPoints: 80, roster: ["FWD-0"] },
      { id: "b", seat: 2, name: "Yassine", bankPoints: STARTING_BANK, roster: [] },
    ],
    ...overrides,
  };
}

describe("serializeRoom", () => {
  it("keeps the host out of the game players", () => {
    const pub = serializeRoom(makeRoom(), "K7F2Q");
    expect(pub.code).toBe("K7F2Q");
    expect(pub.participants).toHaveLength(2);
    expect(pub.participants.map((p) => p.name)).toEqual(["Amine", "Yassine"]);
    expect(pub.slotsPerTeam).toBe(totalSlots(DEFAULT_FORMATION));
    expect(pub.startingBank).toBe(STARTING_BANK);
    expect(pub).not.toHaveProperty("hostToken");
    expect(pub).not.toHaveProperty("_id");
  });

  it("gives the host the full information and never leaks room internals", () => {
    const pub = serializeRoom(makeRoom(), "K7F2Q");
    expect(pub.currentEntryId).toBe("GK-0");
    expect(pub.pool.find((e) => e.id === "GK-0")?.pts).toBe(1);
    expect(pub.totalEntries).toBe(3);
    expect(pub.updatedAt).toBeTypeOf("number");
    for (const p of pub.participants) {
      expect(p).not.toHaveProperty("token");
    }
    expect(JSON.stringify(pub)).not.toContain("hostToken");
  });
});

describe("scoring", () => {
  it("sums only sold footballers per game player", () => {
    const room = makeRoom();
    expect(teamScore(room, 1)).toBe(4);
    expect(teamScore(room, 2)).toBe(0);

    const scores = scoreRoom(room);
    expect(scores.map((s) => s.seat)).toEqual([1, 2]);
    expect(scores[0]).toMatchObject({ score: 4, bankPoints: 80, acquired: 1, maxSlots: 11 });
  });

  it("ranks by points, then remaining bank, then seat", () => {
    const room = makeRoom();
    const ranked = rankScores(scoreRoom(room));
    expect(ranked[0].seat).toBe(1);

    const tie = makeRoom({
      participants: [
        { id: "a", seat: 1, name: "Amine", bankPoints: 90, roster: ["FWD-0"] },
        { id: "b", seat: 2, name: "Yassine", bankPoints: 99, roster: ["FWD-0"] },
      ],
    });
    expect(rankScores(scoreRoom(tie))[0].seat).toBe(2);
  });

  it("leaves out game players who never bid", () => {
    const room = makeRoom();
    const ranked = rankScores(scoreRoom(room));
    expect(ranked.map((s) => s.seat)).toEqual([1]);
  });
});

describe("game player count limits", () => {
  it("allows 2 to 6 game players", () => {
    expect(MIN_GAME_PLAYERS).toBe(2);
    expect(MAX_GAME_PLAYERS).toBe(6);
    expect(GAME_PLAYER_COUNTS).toEqual([2, 3, 4, 5, 6]);
  });
});
