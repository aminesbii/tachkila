/**
 * Rooms live in this browser's localStorage, on this phone, and nowhere else.
 * There is no server, no database and no network call anywhere in this file:
 * every action is `load room → pure reducer → save room`.
 */
import { serializeRoom } from "@/lib/game";
import {
  assignPlayer,
  createRoom,
  GameError,
  markUnsold,
  resetRoom,
  startAuction,
  updateRoomSettings,
} from "@/lib/room-reducer";
import type { RoomDoc, RoomStatus } from "@/lib/types";
import type { PublicRoom } from "@/lib/types";

const ROOM_PREFIX = "tachkila:room:";
const INDEX_KEY = "tachkila:rooms";

/** 5 characters, no 0/O or 1/I so codes can be read out loud around a table. */
const ROOM_CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const ROOM_CODE_LENGTH = 5;
const MAX_SAVED_ROOMS = 12;

export interface SavedRoomSummary {
  code: string;
  status: RoomStatus;
  updatedAt: number;
  playerNames: string[];
  formationLabel: string;
}

interface StoredRoom {
  code: string;
  doc: RoomDoc;
}

function storage(): Storage {
  if (typeof window === "undefined") {
    throw new GameError("no_storage", "Rooms are only available in the browser.");
  }
  return window.localStorage;
}

function roomKey(code: string): string {
  return `${ROOM_PREFIX}${code}`;
}

function readIndex(): SavedRoomSummary[] {
  try {
    const raw = storage().getItem(INDEX_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SavedRoomSummary[]) : [];
  } catch {
    return [];
  }
}

function writeIndex(rooms: SavedRoomSummary[]): void {
  storage().setItem(INDEX_KEY, JSON.stringify(rooms.slice(0, MAX_SAVED_ROOMS)));
}

function summaryOf(code: string, doc: RoomDoc): SavedRoomSummary {
  return {
    code,
    status: doc.status,
    updatedAt: doc.updatedAt.getTime(),
    playerNames: doc.participants.map((p) => p.name),
    formationLabel: `${doc.formation.DEF}-${doc.formation.MID}-${doc.formation.FWD}`,
  };
}

function readDoc(code: string): RoomDoc | null {
  try {
    const raw = storage().getItem(roomKey(code));
    if (!raw) return null;
    const stored = JSON.parse(raw) as StoredRoom;
    if (!stored?.doc?.pool) return null;
    // localStorage has no Date: JSON turns `updatedAt` into a string on the way out.
    return { ...stored.doc, updatedAt: new Date(stored.doc.updatedAt) };
  } catch {
    return null;
  }
}

function writeDoc(code: string, doc: RoomDoc): void {
  storage().setItem(roomKey(code), JSON.stringify({ code, doc } satisfies StoredRoom));
  const summary = summaryOf(code, doc);
  writeIndex([summary, ...readIndex().filter((r) => r.code !== code)]);
}

function requireDoc(code: string): RoomDoc {
  const doc = readDoc(code);
  if (!doc) {
    throw new GameError("not_found", "This room is not saved on this device.");
  }
  return doc;
}

function generateCode(): string {
  let code = "";
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    code += ROOM_CODE_ALPHABET[Math.floor(Math.random() * ROOM_CODE_ALPHABET.length)];
  }
  return code;
}

export function normalizeCode(raw: string): string {
  return raw.trim().toUpperCase();
}

/** Fresh room, fresh random pool, saved straight to this device. */
export function createLocalRoom(input: { formationKey: string; playerNames: string[] }): {
  code: string;
  room: PublicRoom;
} {
  const doc = createRoom(input);

  for (let attempt = 0; attempt < 10; attempt++) {
    const code = generateCode();
    if (readDoc(code)) continue;
    writeDoc(code, doc);
    return { code, room: serializeRoom(doc, code) };
  }

  throw new GameError("code_exhausted", "Could not find a free room code. Please retry.");
}

export function loadLocalRoom(code: string): PublicRoom {
  const normalized = normalizeCode(code);
  return serializeRoom(requireDoc(normalized), normalized);
}

/** Every host action is this: one pure step of the reducer, then save. */
export function updateLocalRoom(
  code: string,
  step: (doc: RoomDoc) => RoomDoc
): PublicRoom {
  const normalized = normalizeCode(code);
  const next = step(requireDoc(normalized));
  writeDoc(normalized, next);
  return serializeRoom(next, normalized);
}

export function updateLocalRoomSettings(
  code: string,
  input: { formationKey: string; playerNames: string[] }
): PublicRoom {
  return updateLocalRoom(code, (doc) => updateRoomSettings(doc, input));
}

export function startLocalAuction(code: string): PublicRoom {
  return updateLocalRoom(code, startAuction);
}

export function assignLocalPlayer(
  code: string,
  input: { entryId: string; seat: number; bid: number }
): PublicRoom {
  return updateLocalRoom(code, (doc) => assignPlayer(doc, input));
}

export function markLocalUnsold(code: string): PublicRoom {
  return updateLocalRoom(code, markUnsold);
}

export function resetLocalRoom(code: string): PublicRoom {
  return updateLocalRoom(code, resetRoom);
}

export function deleteLocalRoom(code: string): void {
  const normalized = normalizeCode(code);
  storage().removeItem(roomKey(normalized));
  writeIndex(readIndex().filter((r) => r.code !== normalized));
}

/** Newest first, so the home screen can offer to resume the last game. */
export function listLocalRooms(): SavedRoomSummary[] {
  return readIndex()
    .filter((room) => readDoc(room.code) !== null)
    .sort((a, b) => b.updatedAt - a.updatedAt);
}
