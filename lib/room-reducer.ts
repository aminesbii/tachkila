/**
 * The whole game runs in this file. Every rule is a pure function from one room
 * state to the next, which is what lets the app run entirely inside the phone
 * with no server, no database and no network.
 */
import {
  getFormation,
  isValidGamePlayerCount,
  MAX_GAME_PLAYERS,
  MIN_GAME_PLAYERS,
  totalSlots,
} from "@/lib/formations";
import { nextUpcomingIndex, STARTING_BANK } from "@/lib/game";
import { generatePool } from "@/lib/pool";
import { POSITION_LABEL } from "@/lib/types";
import type { Formation, GamePlayer, PoolEntry, RoomDoc, RoomStatus } from "@/lib/types";

export class GameError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = "GameError";
    this.code = code;
  }
}

export function isGameError(err: unknown): err is GameError {
  return err instanceof GameError;
}

let idSequence = 0;

/** No `crypto.randomUUID` here on purpose: it needs a secure context, this app also runs from a file. */
function newId(prefix: string): string {
  idSequence += 1;
  return `${prefix}-${Date.now().toString(36)}-${idSequence.toString(36)}`;
}

export function sanitizeName(raw: string): string {
  const name = String(raw ?? "").trim().replace(/[\u0000-\u001f\u007f]/g, "");
  if (name.length < 1 || name.length > 24) {
    throw new GameError("invalid_name", "Name must be 1–24 characters.");
  }
  return name;
}

function resolveFormation(formationKey: string): Formation {
  const def = getFormation(formationKey);
  if (!def) throw new GameError("invalid_formation", "Unknown formation.");
  return { ...def.counts };
}

function resolveGamePlayers(names: string[]): GamePlayer[] {
  if (!Array.isArray(names) || !isValidGamePlayerCount(names.length)) {
    throw new GameError(
      "invalid_players",
      `Set between ${MIN_GAME_PLAYERS} and ${MAX_GAME_PLAYERS} game players.`
    );
  }
  const cleaned = names.map((n) => sanitizeName(n));
  const unique = new Set(cleaned.map((n) => n.toLowerCase()));
  if (unique.size !== cleaned.length) {
    throw new GameError("invalid_players", "Every game player needs a different name.");
  }
  return cleaned.map((name, i) => ({
    id: newId("p"),
    seat: i + 1,
    name,
    bankPoints: STARTING_BANK,
    roster: [],
  }));
}

/** Immutably apply a patch and stamp the change, so React and the autosave both notice. */
function commit(doc: RoomDoc, patch: Partial<Omit<RoomDoc, "updatedAt">>): RoomDoc {
  return { ...doc, ...patch, updatedAt: new Date() };
}

function advanceState(
  pool: readonly PoolEntry[],
  currentIndex: number
): { status: RoomStatus; currentIndex: number } {
  const next = nextUpcomingIndex(pool, currentIndex);
  if (next < 0) return { status: "finished", currentIndex: -1 };
  return { status: "auction", currentIndex: next };
}

function setEntryStatus(
  pool: readonly PoolEntry[],
  entryId: string,
  patch: Partial<PoolEntry>
): PoolEntry[] {
  return pool.map((e) => (e.id === entryId ? { ...e, ...patch } : e));
}

/** Opens a fresh game: brand new random pool, everyone on 100 bank points. */
export function createRoom(input: { formationKey: string; playerNames: string[] }): RoomDoc {
  const formation = resolveFormation(input.formationKey);
  const participants = resolveGamePlayers(input.playerNames);
  const { entries } = generatePool(formation, participants.length);

  return {
    formation,
    status: "lobby",
    currentIndex: -1,
    pool: entries,
    participants,
    updatedAt: new Date(),
  };
}

/** Formation + game players can only change in the lobby, and the pool is redrawn. */
export function updateRoomSettings(
  doc: RoomDoc,
  input: { formationKey: string; playerNames: string[] }
): RoomDoc {
  if (doc.status !== "lobby") {
    throw new GameError("bad_state", "Settings can only change before the auction starts.");
  }
  const formation = resolveFormation(input.formationKey);
  const participants = resolveGamePlayers(input.playerNames);
  const { entries } = generatePool(formation, participants.length);

  return commit(doc, {
    formation,
    participants,
    pool: entries,
    currentIndex: -1,
    status: "lobby",
  });
}

export function startAuction(doc: RoomDoc): RoomDoc {
  if (doc.status !== "lobby") throw new GameError("bad_state", "The auction has already started.");

  const first = doc.pool[0];
  if (!first) throw new GameError("bad_state", "The player pool is empty.");

  return commit(doc, {
    status: "auction",
    currentIndex: 0,
    pool: setEntryStatus(doc.pool, first.id, { status: "auction" }),
  });
}

/** The only way a footballer changes hands: manual final bid, one named winner. */
export function assignPlayer(
  doc: RoomDoc,
  input: { entryId: string; seat: number; bid: number }
): RoomDoc {
  if (doc.status !== "auction") throw new GameError("bad_state", "No auction in progress.");

  const entry = doc.pool.find((e) => e.id === input.entryId);
  if (!entry) throw new GameError("bad_entry", "Unknown auction entry.");
  if (entry.status !== "auction") throw new GameError("bad_entry", "This player is not up for auction.");
  if (entry.id !== doc.pool[doc.currentIndex]?.id) {
    throw new GameError("bad_entry", "This player is not the current auction.");
  }

  const winner = doc.participants.find((p) => p.seat === input.seat);
  if (!winner) throw new GameError("bad_seat", "No game player in that seat.");
  if (winner.roster.length >= totalSlots(doc.formation)) {
    throw new GameError("roster_full", `${winner.name} already has a full squad.`);
  }

  const takenAtPosition = winner.roster.filter(
    (id) => doc.pool.find((e) => e.id === id)?.position === entry.position
  ).length;
  if (takenAtPosition >= doc.formation[entry.position]) {
    throw new GameError(
      "slot_filled",
      `${winner.name} already signed every ${POSITION_LABEL[entry.position]} slot of the ${doc.formation.DEF}-${doc.formation.MID}-${doc.formation.FWD}.`
    );
  }

  const bid = Math.round(input.bid);
  if (!Number.isInteger(bid) || bid < 0) {
    throw new GameError("bad_bid", "Bid must be a whole number ≥ 0.");
  }
  if (bid > winner.bankPoints) {
    throw new GameError("insufficient", `${winner.name} only has ${winner.bankPoints} bank points.`);
  }

  const next = advanceState(doc.pool, doc.currentIndex);
  const nextEntryId = next.currentIndex >= 0 ? doc.pool[next.currentIndex].id : null;

  return commit(doc, {
    pool: doc.pool.map((e) => {
      if (e.id === entry.id) {
        return { ...e, status: "sold" as const, winnerSeat: input.seat, winningBid: bid };
      }
      if (nextEntryId !== null && e.id === nextEntryId) return { ...e, status: "auction" as const };
      return e;
    }),
    participants: doc.participants.map((p) =>
      p.seat === input.seat
        ? { ...p, bankPoints: p.bankPoints - bid, roster: [...p.roster, entry.id] }
        : p
    ),
    currentIndex: next.currentIndex,
    status: next.status,
  });
}

/** Nobody wanted him: he leaves the draft and the auction moves on. */
export function markUnsold(doc: RoomDoc): RoomDoc {
  if (doc.status !== "auction") throw new GameError("bad_state", "No auction in progress.");

  const entry = doc.pool[doc.currentIndex];
  if (!entry || entry.status !== "auction") {
    throw new GameError("bad_entry", "There is no player currently up for auction.");
  }

  const next = advanceState(doc.pool, doc.currentIndex);
  const nextEntryId = next.currentIndex >= 0 ? doc.pool[next.currentIndex].id : null;

  return commit(doc, {
    pool: doc.pool.map((e) => {
      if (e.id === entry.id) return { ...e, status: "unsold" as const };
      if (nextEntryId !== null && e.id === nextEntryId) return { ...e, status: "auction" as const };
      return e;
    }),
    currentIndex: next.currentIndex,
    status: next.status,
  });
}

/** Clears every sale and draws a brand new random pool, keeping formation and game players. */
export function resetRoom(doc: RoomDoc): RoomDoc {
  const participants = doc.participants.map((p) => ({
    ...p,
    bankPoints: STARTING_BANK,
    roster: [],
  }));
  const { entries } = generatePool(doc.formation, participants.length);

  return commit(doc, {
    status: "lobby",
    currentIndex: -1,
    pool: entries,
    participants,
  });
}
