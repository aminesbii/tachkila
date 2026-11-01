import { beforeEach, describe, expect, it } from "vitest";

import {
  assignLocalPlayer,
  createLocalRoom,
  deleteLocalRoom,
  listLocalRooms,
  loadLocalRoom,
  normalizeCode,
  resetLocalRoom,
  startLocalAuction,
} from "@/lib/room-store";

/**
 * The room store only ever touches `window.localStorage`, so a tiny in-memory
 * stand-in is enough to prove a room is created, edited and survives a reload
 * with no server and no database.
 */
function installFakeStorage(): Storage {
  const map = new Map<string, string>();
  const store: Storage = {
    get length() {
      return map.size;
    },
    key: (index) => [...map.keys()][index] ?? null,
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => void map.set(key, String(value)),
    removeItem: (key) => void map.delete(key),
    clear: () => map.clear(),
  };
  (globalThis as { window?: unknown }).window = { localStorage: store };
  return store;
}

const NAMES = ["Amine", "Yassine", "Sami", "Nour"];

beforeEach(() => {
  installFakeStorage();
});

describe("createLocalRoom", () => {
  it("creates a room code and a random pool straight away", () => {
    const { code, room } = createLocalRoom({
      formationKey: "4-4-2",
      playerNames: NAMES,
    });

    expect(code).toMatch(/^[A-HJ-NP-Z2-9]{5}$/);
    expect(room.code).toBe(code);
    expect(room.status).toBe("lobby");
    expect(room.participants).toHaveLength(4);
    expect(room.participants.every((p) => p.bankPoints === 100)).toBe(true);
    expect(room.pool).toHaveLength(44);
    expect(room.updatedAt).toBeTypeOf("number");
  });

  it("gives two rooms two different pools", () => {
    const a = createLocalRoom({ formationKey: "4-4-2", playerNames: NAMES });
    const b = createLocalRoom({ formationKey: "4-4-2", playerNames: NAMES });

    expect(a.code).not.toBe(b.code);
    expect(a.room.pool.map((e) => e.playerId).join("|")).not.toBe(
      b.room.pool.map((e) => e.playerId).join("|")
    );
  });

  it("rejects broken setup the same way the reducer does", () => {
    expect(() => createLocalRoom({ formationKey: "4-4-2", playerNames: ["Solo"] })).toThrowError(
      /between 2 and 6/i
    );
    expect(() =>
      createLocalRoom({ formationKey: "9-9-9", playerNames: NAMES })
    ).toThrowError(/Unknown formation/i);
  });
});

describe("loading a saved room", () => {
  it("finds it by code in any casing", () => {
    const { code, room } = createLocalRoom({ formationKey: "4-4-2", playerNames: NAMES });

    expect(normalizeCode(`  ${code.toLowerCase()} `)).toBe(code);
    expect(loadLocalRoom(code.toLowerCase()).pool).toEqual(room.pool);
  });

  it("throws a not_found GameError for a room that was never saved", () => {
    expect(() => loadLocalRoom("QQQQQ")).toThrowError(/not saved on this device/i);
  });
});

describe("host actions", () => {
  it("start → assign → reload keeps the same state", () => {
    const { code } = createLocalRoom({ formationKey: "4-4-2", playerNames: NAMES });

    const started = startLocalAuction(code);
    expect(started.status).toBe("auction");

    const entry = started.pool[started.currentIndex];
    const sold = assignLocalPlayer(code, { entryId: entry.id, seat: 3, bid: 25 });

    expect(sold.participants[2].roster).toEqual([entry.id]);
    expect(sold.participants[2].bankPoints).toBe(75);

    // A fresh read — what the app does after a page reload — sees the sale.
    const reloaded = loadLocalRoom(code);
    expect(reloaded.participants[2].roster).toEqual([entry.id]);
    expect(reloaded.participants[2].bankPoints).toBe(75);
    expect(reloaded.pool.find((e) => e.id === entry.id)?.winnerSeat).toBe(3);
    expect(reloaded.currentIndex).toBe(started.currentIndex + 1);
  });

  it("refuses a sale nobody can pay for", () => {
    const { code } = createLocalRoom({ formationKey: "4-4-2", playerNames: NAMES });
    const started = startLocalAuction(code);
    const entry = started.pool[started.currentIndex];

    expect(() => assignLocalPlayer(code, { entryId: entry.id, seat: 1, bid: 999 })).toThrowError(
      /only has 100 bank points/i
    );
    expect(loadLocalRoom(code).currentIndex).toBe(0);
  });

  it("reset sends everybody back to the lobby with a new pool", () => {
    const { code } = createLocalRoom({ formationKey: "4-4-2", playerNames: NAMES });
    const started = startLocalAuction(code);
    assignLocalPlayer(code, {
      entryId: started.pool[0].id,
      seat: 1,
      bid: 10,
    });

    const reset = resetLocalRoom(code);

    expect(reset.status).toBe("lobby");
    expect(reset.currentIndex).toBe(-1);
    expect(reset.participants.every((p) => p.bankPoints === 100 && p.roster.length === 0)).toBe(true);
    expect(reset.pool.every((e) => e.status === "upcoming")).toBe(true);
  });
});

describe("listLocalRooms", () => {
  it("lists saved rooms newest first with their players", () => {
    const first = createLocalRoom({ formationKey: "4-4-2", playerNames: ["A", "B"] });
    const second = createLocalRoom({ formationKey: "3-5-2", playerNames: NAMES });

    const rooms = listLocalRooms();
    expect(rooms.map((r) => r.code)).toEqual([second.code, first.code]);
    expect(rooms[0].formationLabel).toBe("3-5-2");
    expect(rooms[0].playerNames).toEqual(NAMES);
    expect(rooms[0].status).toBe("lobby");
  });

  it("drops rooms that were deleted", () => {
    const { code } = createLocalRoom({ formationKey: "4-4-2", playerNames: NAMES });
    deleteLocalRoom(code);

    expect(listLocalRooms()).toHaveLength(0);
    expect(() => loadLocalRoom(code)).toThrowError(/not saved on this device/i);
  });
});
