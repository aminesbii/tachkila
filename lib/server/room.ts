import { randomUUID } from "node:crypto";

import { getFormation } from "@/lib/formations";
import { isHostToken, nextUpcomingIndex } from "@/lib/game";
import { getRoomsCollection } from "@/lib/mongodb";
import { generatePool } from "@/lib/pool";
import type { Formation, Participant, PoolEntry, RoomDoc, RoomStatus } from "@/lib/types";

export class GameError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

export const STARTING_BANK = 100;
const MAX_PARTICIPANTS = 4;
const ROOM_CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const ROOM_CODE_LENGTH = 5;

export function sanitizeName(raw: string): string {
  const name = raw.trim().replace(/[\u0000-\u001f\u007f]/g, "");
  if (name.length < 1 || name.length > 24) {
    throw new GameError("invalid_name", "Name must be 1–24 characters.");
  }
  return name;
}

function generateRoomCode(): string {
  let code = "";
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    code += ROOM_CODE_ALPHABET[Math.floor(Math.random() * ROOM_CODE_ALPHABET.length)];
  }
  return code;
}

function makeParticipant(seat: number, name: string, isHost: boolean): Participant {
  return {
    id: randomUUID(),
    seat,
    name,
    isHost,
    token: randomUUID(),
    bankPoints: STARTING_BANK,
    roster: [],
  };
}

export async function createRoom(input: {
  name: string;
  formationKey: string;
  blindMode: boolean;
}): Promise<{ code: string; participant: Participant }> {
  const name = sanitizeName(input.name);
  const formationDef = getFormation(input.formationKey);
  if (!formationDef) {
    throw new GameError("invalid_formation", "Unknown formation.");
  }
  const formation: Formation = { ...formationDef.counts };

  const rooms = await getRoomsCollection();

  for (let attempt = 0; attempt < 10; attempt++) {
    const code = generateRoomCode();
    const exists = await rooms.findOne({ _id: code }, { projection: { _id: 1 } });
    if (exists) continue;

    const host = makeParticipant(1, name, true);
    const { entries } = generatePool(formation, code);
    const now = new Date();

    try {
      await rooms.insertOne({
        _id: code,
        createdAt: now,
        updatedAt: now,
        hostParticipantId: host.id,
        formation,
        blindMode: Boolean(input.blindMode),
        status: "lobby",
        currentIndex: -1,
        pool: entries,
        participants: [host],
      });
      return { code, participant: host };
    } catch (err) {
      const anyErr = err as { code?: number };
      if (anyErr.code === 11000) continue;
      throw err;
    }
  }

  throw new GameError("code_exhausted", "Could not allocate a room code. Please retry.");
}

export async function joinRoom(input: {
  code: string;
  name: string;
}): Promise<{ participant: Participant }> {
  const name = sanitizeName(input.name);
  const code = input.code.trim().toUpperCase();
  if (!new RegExp(`^[${ROOM_CODE_ALPHABET}]{${ROOM_CODE_LENGTH}}$`).test(code)) {
    throw new GameError("invalid_code", "That room code doesn't look right.");
  }

  const rooms = await getRoomsCollection();
  const room = await rooms.findOne({ _id: code });
  if (!room) {
    throw new GameError("not_found", "Room not found. Check the code and try again.");
  }
  if (room.status !== "lobby") {
    throw new GameError("room_started", "This room is already in progress.");
  }
  if (room.participants.length >= MAX_PARTICIPANTS) {
    throw new GameError("room_full", "This room is full (4 players).");
  }

  const takenSeats = new Set(room.participants.map((p) => p.seat));
  let seat = 1;
  while (takenSeats.has(seat)) seat += 1;

  const participant = makeParticipant(seat, name, false);

  await rooms.updateOne(
    { _id: code },
    { $set: { updatedAt: new Date() }, $push: { participants: participant } }
  );

  return { participant };
}

async function loadRoom(code: string): Promise<RoomDoc> {
  const rooms = await getRoomsCollection();
  const room = await rooms.findOne({ _id: code });
  if (!room) throw new GameError("not_found", "Room not found.");
  return room;
}

function requireHost(room: RoomDoc, token: string | null | undefined): void {
  if (!isHostToken(room, token)) {
    throw new GameError("forbidden", "Only the host can do that.");
  }
}

function forceEntry(doc: RoomDoc, entryId: string): PoolEntry {
  const entry = doc.pool.find((e) => e.id === entryId);
  if (!entry) throw new GameError("bad_entry", "Unknown auction entry.");
  return entry;
}

export async function startAuction(code: string, token: string | null | undefined): Promise<void> {
  const rooms = await getRoomsCollection();
  const room = await loadRoom(code);
  requireHost(room, token);
  if (room.status !== "lobby") throw new GameError("bad_state", "Room is not in the lobby.");

  const firstId = room.pool[0]?.id;
  if (!firstId) throw new GameError("bad_state", "The player pool is empty.");

  const res = await rooms.updateOne(
    { _id: code, updatedAt: room.updatedAt },
    {
      $set: {
        status: "auction",
        currentIndex: 0,
        "pool.$[e].status": "auction",
        updatedAt: new Date(),
      },
    },
    { arrayFilters: [{ "e.id": firstId }] }
  );
  if (res.matchedCount === 0) throw new GameError("conflict", "Room state changed; please retry.");
}

function advanceState(
  entries: PoolEntry[],
  currentIndex: number
): { status: RoomStatus; currentIndex: number } {
  const next = nextUpcomingIndex({ pool: entries } as RoomDoc, currentIndex);
  if (next < 0) return { status: "finished", currentIndex: -1 };
  return { status: "auction", currentIndex: next };
}

export async function assignPlayer(
  code: string,
  token: string | null | undefined,
  input: { entryId: string; seat: number; bid: number }
): Promise<void> {
  const rooms = await getRoomsCollection();
  const room = await loadRoom(code);
  requireHost(room, token);
  if (room.status !== "auction") throw new GameError("bad_state", "No auction in progress.");

  const entry = forceEntry(room, input.entryId);
  if (entry.status !== "auction") throw new GameError("bad_entry", "This player is not up for auction.");
  if (entry.id !== room.pool[room.currentIndex]?.id) {
    throw new GameError("bad_entry", "This player is not the current auction.");
  }

  const winner = room.participants.find((p) => p.seat === input.seat);
  if (!winner) throw new GameError("bad_seat", "No player in that seat.");
  if (winner.roster.length >= Object.values(room.formation).reduce((a, b) => a + b, 0)) {
    throw new GameError("roster_full", `${winner.name} already has a full squad.`);
  }

  const bid = Math.round(input.bid);
  if (!Number.isInteger(bid) || bid < 0) throw new GameError("bad_bid", "Bid must be a whole number ≥ 0.");
  if (bid > winner.bankPoints) {
    throw new GameError("insufficient", `${winner.name} only has ${winner.bankPoints} bank points.`);
  }

  const newBank = winner.bankPoints - bid;
  const newRoster = [...winner.roster, entry.id];
  const next = advanceState(room.pool, room.currentIndex);

  const res = await rooms.updateOne(
    { _id: code, updatedAt: room.updatedAt },
    {
      $set: {
        "pool.$[e].status": "sold",
        "pool.$[e].winnerSeat": input.seat,
        "pool.$[e].winningBid": bid,
        "participants.$[p].bankPoints": newBank,
        "participants.$[p].roster": newRoster,
        currentIndex: next.currentIndex,
        status: next.status,
        "pool.$[n].status": "auction",
        updatedAt: new Date(),
      },
    },
    {
      arrayFilters: [
        { "e.id": entry.id },
        { "p.seat": input.seat },
        next.currentIndex >= 0 ? { "n.id": room.pool[next.currentIndex].id } : { "n.id": "__none__" },
      ],
    }
  );
  if (res.matchedCount === 0) throw new GameError("conflict", "Room state changed; please retry.");
}

export async function markUnsold(code: string, token: string | null | undefined): Promise<void> {
  const rooms = await getRoomsCollection();
  const room = await loadRoom(code);
  requireHost(room, token);
  if (room.status !== "auction") throw new GameError("bad_state", "No auction in progress.");

  const entry = room.pool[room.currentIndex];
  if (!entry || entry.status !== "auction") {
    throw new GameError("bad_entry", "There is no player currently up for auction.");
  }

  const next = advanceState(room.pool, room.currentIndex);

  const res = await rooms.updateOne(
    { _id: code, updatedAt: room.updatedAt },
    {
      $set: {
        "pool.$[e].status": "unsold",
        currentIndex: next.currentIndex,
        status: next.status,
        "pool.$[n].status": "auction",
        updatedAt: new Date(),
      },
    },
    {
      arrayFilters: [
        { "e.id": entry.id },
        next.currentIndex >= 0 ? { "n.id": room.pool[next.currentIndex].id } : { "n.id": "__none__" },
      ],
    }
  );
  if (res.matchedCount === 0) throw new GameError("conflict", "Room state changed; please retry.");
}

export async function resetRoom(code: string, token: string | null | undefined): Promise<void> {
  const rooms = await getRoomsCollection();
  const room = await loadRoom(code);
  requireHost(room, token);

  for (let i = 0; i < room.pool.length; i++) {
    room.pool[i].status = "upcoming";
  }
  for (const p of room.participants) {
    p.bankPoints = STARTING_BANK;
    p.roster = [];
  }
  room.status = "lobby";
  room.currentIndex = -1;

  await rooms.updateOne(
    { _id: code },
    {
      $set: {
        status: room.status,
        currentIndex: room.currentIndex,
        pool: room.pool,
        participants: room.participants,
        updatedAt: new Date(),
      },
    }
  );
}