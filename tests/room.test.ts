import { describe, expect, it } from "vitest";

import {
  GameError,
  assignPlayer,
  createRoom,
  markUnsold,
  resetRoom,
  startAuction,
  updateRoomSettings,
} from "@/engine/room-reducer";
import { poolSize, totalSlots } from "@/engine/formations";

const NAMES = ["Amine", "Yassine", "Sami", "Nour"];

function newRoom(playerNames: string[] = NAMES, formationKey = "4-4-2") {
  return createRoom({ formationKey, playerNames });
}

function currentEntry(doc: ReturnType<typeof newRoom>) {
  return doc.pool[doc.currentIndex];
}

function expectGameError(fn: () => unknown, code: string) {
  try {
    fn();
  } catch (err) {
    expect(err).toBeInstanceOf(GameError);
    expect((err as GameError).code).toBe(code);
    return;
  }
  throw new Error(`expected a GameError with code "${code}", but nothing was thrown`);
}

describe("createRoom", () => {
  it("puts only the game players in the room — the host is nobody", () => {
    const doc = newRoom();

    expect(doc.participants).toHaveLength(4);
    expect(doc.participants.map((p) => p.name)).toEqual(NAMES);
    expect(doc.participants.every((p) => p.bankPoints === 100)).toBe(true);
    expect(doc.status).toBe("lobby");
    expect(doc.currentIndex).toBe(-1);
  });

  it("draws slots × game players for every position, in auction order", () => {
    const doc = newRoom();

    expect(doc.pool).toHaveLength(poolSize(doc.formation, NAMES.length));
    expect(doc.formation).toEqual({ GK: 1, DEF: 4, MID: 4, FWD: 2 });
    expect(doc.pool.map((e) => e.position).join(" ")).toBe(
      ["GK", ...Array(4).fill("DEF"), ...Array(4).fill("MID"), ...Array(2).fill("FWD")]
        .flatMap((pos) => Array(NAMES.length).fill(pos))
        .join(" ")
    );
  });

  it("gives every room a different random pool", () => {
    const pools = Array.from({ length: 6 }, () =>
      newRoom().pool.map((e) => e.playerId).join("|")
    );
    expect(new Set(pools).size).toBe(pools.length);
  });

  it("keeps 2 to 6 game players and rejects broken names", () => {
    expectGameError(() => newRoom(["Solo"]), "invalid_players");
    expectGameError(() => newRoom(["a", "b", "c", "d", "e", "f", "g"]), "invalid_players");
    expectGameError(() => newRoom(["Amine", "amine"]), "invalid_players");
    expectGameError(() => newRoom(NAMES, "9-9-9"), "invalid_formation");

    for (const count of [2, 3, 4, 5, 6]) {
      const names = Array.from({ length: count }, (_, i) => `P${i + 1}`);
      const doc = newRoom(names);
      expect(doc.participants).toHaveLength(count);
      expect(doc.pool).toHaveLength(poolSize(doc.formation, count));
    }
  });
});

describe("auction flow", () => {
  it("sells to a game player, deducts the final bid and moves on", () => {
    const started = startAuction(newRoom());

    expect(started.status).toBe("auction");
    expect(started.currentIndex).toBe(0);
    expect(currentEntry(started).position).toBe("GK");
    expect(currentEntry(started).status).toBe("auction");

    const first = currentEntry(started);
    const sold = assignPlayer(started, { entryId: first.id, seat: 2, bid: 30 });

    expect(sold.participants[1].roster).toEqual([first.id]);
    expect(sold.participants[1].bankPoints).toBe(70);
    expect(sold.participants[0].roster).toEqual([]);
    expect(sold.pool[0].status).toBe("sold");
    expect(sold.pool[0].winnerSeat).toBe(2);
    expect(sold.pool[0].winningBid).toBe(30);
    expect(sold.currentIndex).toBe(1);
    expect(currentEntry(sold).status).toBe("auction");
  });

  it("walks the whole pool in position order and finishes", () => {
    let doc = startAuction(newRoom(["Amine", "Yassine"]));
    const slots = totalSlots(doc.formation);
    const order = doc.pool.map((e) => e.position);

    let guard = 0;
    while (guard++ < 500 && doc.status !== "finished") {
      const entry = doc.pool[doc.currentIndex]!;
      const player = doc.participants.find(
        (p) =>
          p.roster.filter(
            (id) => doc.pool.find((e) => e.id === id)?.position === entry.position
          ).length < doc.formation[entry.position]
      )!;
      doc = assignPlayer(doc, { entryId: entry.id, seat: player.seat, bid: 1 });
    }

    expect(doc.status).toBe("finished");
    expect(doc.currentIndex).toBe(-1);
    expect(doc.pool.every((e) => e.status === "sold")).toBe(true);
    for (const p of doc.participants) {
      expect(p.roster).toHaveLength(slots);
      expect(p.bankPoints).toBe(100 - slots);
    }
    expect(doc.pool.map((e) => e.position)).toEqual(order);
  });

  it("passes unsold footballers without paying anyone", () => {
    const started = startAuction(newRoom());
    const first = currentEntry(started);

    const passed = markUnsold(started);

    expect(passed.pool[0].status).toBe("unsold");
    expect(passed.pool[0].winnerSeat).toBeUndefined();
    expect(passed.participants.every((p) => p.bankPoints === 100)).toBe(true);
    expect(passed.currentIndex).toBe(1);
    expect(currentEntry(passed).id).not.toBe(first.id);
  });

  it("keeps one footballer per position slot for every game player", () => {
    const started = startAuction(newRoom());
    const first = currentEntry(started);
    expect(first.position).toBe("GK");
    const afterFirst = assignPlayer(started, { entryId: first.id, seat: 1, bid: 5 });

    const second = afterFirst.pool[afterFirst.currentIndex]!;
    expect(second.position).toBe("GK");

    expectGameError(
      () => assignPlayer(afterFirst, { entryId: second.id, seat: 1, bid: 5 }),
      "slot_filled"
    );
    expect(afterFirst.participants[0].roster).toEqual([first.id]);

    const afterSecond = assignPlayer(afterFirst, { entryId: second.id, seat: 2, bid: 5 });
    expect(afterSecond.participants[0].roster).toEqual([first.id]);
    expect(afterSecond.participants[1].roster).toEqual([second.id]);
  });

  it("rejects bids the winner cannot pay and sales of a full squad", () => {
    const doc = startAuction(newRoom());
    const entry = currentEntry(doc);

    expectGameError(() => assignPlayer(doc, { entryId: entry.id, seat: 1, bid: 101 }), "insufficient");
    expectGameError(() => assignPlayer(doc, { entryId: entry.id, seat: 9, bid: 5 }), "bad_seat");
    expectGameError(() => assignPlayer(doc, { entryId: entry.id, seat: 1, bid: -1 }), "bad_bid");
    expectGameError(
      () => assignPlayer(doc, { entryId: doc.pool[1].id, seat: 1, bid: 5 }),
      "bad_entry"
    );
    expect(doc.currentIndex).toBe(0);
  });

  it("refuses a free signing and accepts the smallest bid", () => {
    const doc = startAuction(newRoom());
    const entry = currentEntry(doc);

    expectGameError(() => assignPlayer(doc, { entryId: entry.id, seat: 1, bid: 0 }), "bad_bid");
    expect(doc.participants[0].bankPoints).toBe(100);
    expect(doc.participants[0].roster).toEqual([]);

    const sold = assignPlayer(doc, { entryId: entry.id, seat: 1, bid: 1 });
    const winner = sold.participants.find((p) => p.seat === 1)!;
    expect(winner.bankPoints).toBe(99);
    expect(winner.roster).toEqual([entry.id]);
    expect(sold.pool.find((e) => e.id === entry.id)?.winningBid).toBe(1);
  });

  it("locks the auction once it has started", () => {
    const doc = startAuction(newRoom());

    expectGameError(() => startAuction(doc), "bad_state");
    expectGameError(
      () => updateRoomSettings(doc, { formationKey: "3-5-2", playerNames: NAMES }),
      "bad_state"
    );
  });
});

describe("lobby settings", () => {
  it("redraws formation, game player count and pool", () => {
    const doc = updateRoomSettings(newRoom(), {
      formationKey: "3-5-2",
      playerNames: ["A", "B", "C"],
    });

    expect(doc.formation).toEqual({ GK: 1, DEF: 3, MID: 5, FWD: 2 });
    expect(doc.participants).toHaveLength(3);
    expect(doc.participants.map((p) => p.name)).toEqual(["A", "B", "C"]);
    expect(doc.pool).toHaveLength(poolSize(doc.formation, 3));
    expect(doc.pool.every((e) => e.status === "upcoming")).toBe(true);
    expect(doc.status).toBe("lobby");
  });
});

describe("reset", () => {
  it("clears the sales and draws a brand new random pool", () => {
    const started = startAuction(newRoom());
    const entry = currentEntry(started);
    const sold = assignPlayer(started, { entryId: entry.id, seat: 1, bid: 40 });

    const reset = resetRoom(sold);

    expect(reset.status).toBe("lobby");
    expect(reset.currentIndex).toBe(-1);
    expect(
      reset.participants.every((p) => p.bankPoints === 100 && p.roster.length === 0)
    ).toBe(true);
    expect(reset.pool.every((e) => e.status === "upcoming" && !e.winnerSeat)).toBe(true);
    expect(reset.pool).toHaveLength(sold.pool.length);
    expect(reset.pool.map((e) => e.position)).toEqual(sold.pool.map((e) => e.position));
    expect(new Set(reset.pool.map((e) => e.playerId)).size).toBe(reset.pool.length);
    expect(reset.pool.every((e) => e.order >= 0)).toBe(true);
  });
});
