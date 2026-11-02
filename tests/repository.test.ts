import { beforeEach, describe, expect, it } from "vitest";

import { ROOM_SCHEMA_VERSION } from "@/engine/types";
import type { KeyValueStore } from "@/storage/types";
import { createRoomRepository, normalizeCode, type RoomRepository } from "@/storage/room-repository";

/**
 * The repository only ever touches a key/value store, so a tiny in-memory
 * stand-in is enough to prove a game is created, edited and survives a reload
 * with no server and no database.
 */
function createMemoryStore(): KeyValueStore & { map: Map<string, string> } {
  const map = new Map<string, string>();
  return {
    map,
    getItem: async (key) => map.get(key) ?? null,
    setItem: async (key, value) => void map.set(key, value),
    removeItem: async (key) => void map.delete(key),
    getAllKeys: async () => [...map.keys()],
    multiRemove: async (keys) => {
      for (const key of keys) map.delete(key);
    },
  };
}

const NAMES = ["Amine", "Yassine", "Sami", "Nour"];

let store: ReturnType<typeof createMemoryStore>;
let repo: RoomRepository;

beforeEach(() => {
  store = createMemoryStore();
  repo = createRoomRepository(store);
});

describe("create", () => {
  it("creates a readable code and a random pool straight away", async () => {
    const { code, doc } = await repo.create({ formationKey: "4-4-2", playerNames: NAMES });

    expect(code).toMatch(/^[A-HJ-KM-NP-Z2-9]{5}$/);
    expect(doc.schemaVersion).toBe(ROOM_SCHEMA_VERSION);
    expect(doc.revision).toBe(0);
    expect(doc.status).toBe("lobby");
    expect(doc.participants).toHaveLength(4);
    expect(doc.participants.every((p) => p.bankPoints === 100)).toBe(true);
    expect(doc.pool).toHaveLength(44);
    expect(doc.createdAt).toBeTypeOf("number");
    expect(doc.updatedAt).toBeTypeOf("number");
  });

  it("gives two games two different pools and codes", async () => {
    const a = await repo.create({ formationKey: "4-4-2", playerNames: NAMES });
    const b = await repo.create({ formationKey: "4-4-2", playerNames: NAMES });

    expect(a.code).not.toBe(b.code);
    expect(a.doc.pool.map((e) => e.playerId).join("|")).not.toBe(
      b.doc.pool.map((e) => e.playerId).join("|")
    );
  });

  it("rejects broken setup the same way the reducer does", async () => {
    await expect(
      repo.create({ formationKey: "4-4-2", playerNames: ["Solo"] })
    ).rejects.toThrowError(/between 2 and 6/i);
    await expect(
      repo.create({ formationKey: "9-9-9", playerNames: NAMES })
    ).rejects.toThrowError(/Unknown formation/i);
  });
});

describe("loading", () => {
  it("finds a game by code in any casing", async () => {
    const { code, doc } = await repo.create({ formationKey: "4-4-2", playerNames: NAMES });

    expect(normalizeCode(`  ${code.toLowerCase()} `)).toBe(code);
    const loaded = await repo.load(code.toLowerCase());
    expect(loaded?.pool).toEqual(doc.pool);
  });

  it("returns null for a game that was never saved", async () => {
    expect(await repo.load("QQQQQ")).toBeNull();
  });
});

describe("host actions", () => {
  it("start → assign → reload keeps the same state", async () => {
    const { code } = await repo.create({ formationKey: "4-4-2", playerNames: NAMES });

    const started = await repo.start(code);
    expect(started.status).toBe("auction");

    const entry = started.pool[started.currentIndex];
    const sold = await repo.assign(code, { entryId: entry.id, seat: 3, bid: 25 });

    expect(sold.participants[2].roster).toEqual([entry.id]);
    expect(sold.participants[2].bankPoints).toBe(75);
    expect(sold.revision).toBeGreaterThan(started.revision);

    // A fresh read — what the app does after a reload — sees the sale.
    const reloaded = await repo.load(code);
    expect(reloaded?.participants[2].roster).toEqual([entry.id]);
    expect(reloaded?.participants[2].bankPoints).toBe(75);
    expect(reloaded?.pool.find((e) => e.id === entry.id)?.winnerSeat).toBe(3);
    expect(reloaded?.currentIndex).toBe(started.currentIndex + 1);
  });

  it("refuses a sale nobody can pay for and keeps the saved state", async () => {
    const { code } = await repo.create({ formationKey: "4-4-2", playerNames: NAMES });
    const started = await repo.start(code);
    const entry = started.pool[started.currentIndex];

    await expect(repo.assign(code, { entryId: entry.id, seat: 1, bid: 999 })).rejects.toThrowError(
      /only has 100 bank points/i
    );
    expect((await repo.load(code))?.currentIndex).toBe(0);
  });

  it("reset sends everybody back to the lobby with a new pool", async () => {
    const { code } = await repo.create({ formationKey: "4-4-2", playerNames: NAMES });
    const started = await repo.start(code);
    await repo.assign(code, { entryId: started.pool[0].id, seat: 1, bid: 10 });

    const reset = await repo.reset(code);

    expect(reset.status).toBe("lobby");
    expect(reset.currentIndex).toBe(-1);
    expect(reset.participants.every((p) => p.bankPoints === 100 && p.roster.length === 0)).toBe(true);
    expect(reset.pool.every((e) => e.status === "upcoming")).toBe(true);
  });
});

describe("undo", () => {
  it("steps back one action at a time and stops at the beginning", async () => {
    const { code } = await repo.create({ formationKey: "4-4-2", playerNames: NAMES });
    expect(await repo.canUndo(code)).toBe(false);

    const started = await repo.start(code);
    expect(await repo.canUndo(code)).toBe(true);

    const entry = started.pool[started.currentIndex];
    await repo.assign(code, { entryId: entry.id, seat: 1, bid: 30 });
    expect(await repo.canUndo(code)).toBe(true);

    const back = await repo.undo(code);
    expect(back?.status).toBe("auction");
    expect(back?.participants[0].bankPoints).toBe(100);
    expect(back?.pool[0].status).toBe("auction");

    const toLobby = await repo.undo(code);
    expect(toLobby?.status).toBe("lobby");
    expect(toLobby?.currentIndex).toBe(-1);

    expect(await repo.canUndo(code)).toBe(false);
    expect(await repo.undo(code)).toBeNull();
  });
});

describe("list", () => {
  it("lists saved games newest first with their managers", async () => {
    const first = await repo.create({ formationKey: "4-4-2", playerNames: ["A", "B"] });
    const second = await repo.create({ formationKey: "3-5-2", playerNames: NAMES });

    const games = await repo.list();
    expect(games.map((game) => game.code)).toEqual([second.code, first.code]);
    expect(games[0].formationLabel).toBe("3-5-2");
    expect(games[0].playerNames).toEqual(NAMES);
    expect(games[0].status).toBe("lobby");
    expect(games[0].currentName).toBeNull();
  });

  it("drops games that were deleted", async () => {
    const { code } = await repo.create({ formationKey: "4-4-2", playerNames: NAMES });
    await repo.remove(code);

    expect(await repo.list()).toHaveLength(0);
    expect(await repo.load(code)).toBeNull();
  });

  it("clears every saved game", async () => {
    await repo.create({ formationKey: "4-4-2", playerNames: NAMES });
    await repo.create({ formationKey: "3-5-2", playerNames: NAMES });

    await repo.clear();

    expect(await repo.list()).toHaveLength(0);
    expect([...store.map.keys()]).toHaveLength(0);
  });
});

describe("migration", () => {
  it("upgrades an old document that stored a Date and had no revision", async () => {
    const { code } = await repo.create({ formationKey: "4-4-2", playerNames: NAMES });
    const key = `tachkila.room.v2.${code}`;
    const current = JSON.parse(store.map.get(key) ?? "{}") as Record<string, unknown>;

    const legacy = {
      formation: current.formation,
      status: "auction",
      currentIndex: 0,
      pool: (current.pool as Record<string, unknown>[]).map((entry, index) =>
        index === 0 ? { ...entry, status: "auction" } : entry
      ),
      participants: current.participants,
      updatedAt: new Date(1_700_000_000_000).toISOString(),
    };
    store.map.set(key, JSON.stringify(legacy));

    const loaded = await repo.load(code);
    expect(loaded?.schemaVersion).toBe(ROOM_SCHEMA_VERSION);
    expect(loaded?.revision).toBe(0);
    expect(loaded?.updatedAt).toBe(1_700_000_000_000);
    expect(loaded?.createdAt).toBe(1_700_000_000_000);
    expect(loaded?.status).toBe("auction");
  });
});
