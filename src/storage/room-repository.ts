import {
  assignPlayer,
  createRoom,
  GameError,
  markUnsold,
  resetRoom,
  startAuction,
  updateRoomSettings,
} from "@/engine/room-reducer";
import { serializeRoom } from "@/engine/game";
import { getFormation } from "@/engine/formations";
import { ROOM_SCHEMA_VERSION } from "@/engine/types";
import type { GameSummary, RoomDoc } from "@/engine/types";
import type { KeyValueStore } from "@/storage/types";

const INDEX_KEY = "tachkila.index.v2";
const ROOM_PREFIX = "tachkila.room.v2.";
const UNDO_PREFIX = "tachkila.undo.v2.";

const MAX_SAVED_GAMES = 20;
const MAX_UNDO_STEPS = 12;

/** 5 characters, no 0/O or 1/I so codes are easy to read out loud. */
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 5;

export function normalizeCode(raw: string): string {
  return String(raw ?? "").trim().toUpperCase();
}

export interface CreateGameInput {
  formationKey: string;
  playerNames: string[];
}

export interface RoomRepository {
  create(input: CreateGameInput): Promise<{ code: string; doc: RoomDoc }>;
  load(code: string): Promise<RoomDoc | null>;
  list(): Promise<GameSummary[]>;
  update(code: string, step: (doc: RoomDoc) => RoomDoc): Promise<RoomDoc>;
  start(code: string): Promise<RoomDoc>;
  assign(code: string, input: { entryId: string; seat: number; bid: number }): Promise<RoomDoc>;
  pass(code: string): Promise<RoomDoc>;
  reset(code: string): Promise<RoomDoc>;
  updateSettings(code: string, input: CreateGameInput): Promise<RoomDoc>;
  undo(code: string): Promise<RoomDoc | null>;
  canUndo(code: string): Promise<boolean>;
  remove(code: string): Promise<void>;
  clear(): Promise<void>;
}

function toMillis(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (value instanceof Date) return value.getTime();
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

/** Accepts the current shape, and upgrades older saved documents in place. */
function parseDoc(raw: string | null): RoomDoc | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<RoomDoc> & Record<string, unknown>;
    if (!parsed || !parsed.pool || !parsed.participants || !parsed.formation) return null;
    if (!Array.isArray(parsed.pool) || !Array.isArray(parsed.participants)) return null;

    const createdAt = toMillis(parsed.createdAt) ?? toMillis(parsed.updatedAt) ?? Date.now();
    const updatedAt = toMillis(parsed.updatedAt) ?? createdAt;

    return {
      ...(parsed as RoomDoc),
      schemaVersion: ROOM_SCHEMA_VERSION,
      revision: typeof parsed.revision === "number" ? parsed.revision : 0,
      status: parsed.status ?? "lobby",
      currentIndex: typeof parsed.currentIndex === "number" ? parsed.currentIndex : -1,
      createdAt,
      updatedAt,
    };
  } catch {
    return null;
  }
}

function summaryOf(code: string, doc: RoomDoc): GameSummary {
  const formation = getFormation(`${doc.formation.DEF}-${doc.formation.MID}-${doc.formation.FWD}`);
  const current = doc.currentIndex >= 0 ? doc.pool[doc.currentIndex] : undefined;
  return {
    code,
    status: doc.status,
    formationLabel: formation?.label ?? `${doc.formation.DEF}-${doc.formation.MID}-${doc.formation.FWD}`,
    playerNames: doc.participants.map((p) => p.name),
    slotsPerTeam: Object.values(doc.formation).reduce((sum, n) => sum + n, 0),
    totalEntries: doc.pool.length,
    soldCount: doc.pool.filter((e) => e.status === "sold").length,
    currentName: current?.name ?? null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function generateCode(): string {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return code;
}

export function createRoomRepository(kv: KeyValueStore): RoomRepository {
  const roomKey = (code: string) => `${ROOM_PREFIX}${code}`;
  const undoKey = (code: string) => `${UNDO_PREFIX}${code}`;

  async function readIndex(): Promise<string[]> {
    try {
      const raw = await kv.getItem(INDEX_KEY);
      if (!raw) return [];
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((code): code is string => typeof code === "string" && code.length > 0);
    } catch {
      return [];
    }
  }

  async function writeIndex(codes: string[]): Promise<void> {
    await kv.setItem(INDEX_KEY, JSON.stringify([...new Set(codes)]));
  }

  async function load(code: string): Promise<RoomDoc | null> {
    return parseDoc(await kv.getItem(roomKey(normalizeCode(code))));
  }

  async function requireDoc(code: string): Promise<RoomDoc> {
    const doc = await load(code);
    if (!doc) throw new GameError("not_found", "This game is not saved on this device.");
    return doc;
  }

  async function save(code: string, doc: RoomDoc): Promise<void> {
    const normalized = normalizeCode(code);
    await kv.setItem(roomKey(normalized), JSON.stringify(doc));
    const index = await readIndex();
    if (!index.includes(normalized)) await writeIndex([normalized, ...index]);
  }

  async function readUndo(code: string): Promise<RoomDoc[]> {
    try {
      const raw = await kv.getItem(undoKey(normalizeCode(code)));
      if (!raw) return [];
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.map((d) => parseDoc(JSON.stringify(d))).filter((d): d is RoomDoc => d !== null);
    } catch {
      return [];
    }
  }

  async function writeUndo(code: string, docs: RoomDoc[]): Promise<void> {
    await kv.setItem(undoKey(normalizeCode(code)), JSON.stringify(docs.slice(-MAX_UNDO_STEPS)));
  }

  async function pushUndo(code: string, doc: RoomDoc): Promise<void> {
    const stack = await readUndo(code);
    await writeUndo(code, [...stack, doc]);
  }

  async function prune(): Promise<string[]> {
    const index = await readIndex();
    const entries: { code: string; updatedAt: number }[] = [];
    for (const code of index) {
      const doc = await load(code);
      if (doc) entries.push({ code, updatedAt: doc.updatedAt });
    }
    entries.sort((a, b) => b.updatedAt - a.updatedAt);
    const keep = entries.slice(0, MAX_SAVED_GAMES);
    const dropped = entries.slice(MAX_SAVED_GAMES);
    for (const room of dropped) {
      await kv.removeItem(roomKey(room.code));
      await kv.removeItem(undoKey(room.code));
    }
    await writeIndex(keep.map((entry) => entry.code));
    return keep.map((entry) => entry.code);
  }

  async function create(input: CreateGameInput): Promise<{ code: string; doc: RoomDoc }> {
    const doc = createRoom(input);
    for (let attempt = 0; attempt < 12; attempt++) {
      const code = generateCode();
      if (await kv.getItem(roomKey(code))) continue;
      await save(code, doc);
      await prune();
      return { code, doc };
    }
    throw new GameError("code_exhausted", "Could not find a free game code. Please retry.");
  }

  async function update(code: string, step: (doc: RoomDoc) => RoomDoc): Promise<RoomDoc> {
    const normalized = normalizeCode(code);
    const current = await requireDoc(normalized);
    const next = step(current);
    await pushUndo(normalized, current);
    await save(normalized, next);
    return next;
  }

  async function start(code: string): Promise<RoomDoc> {
    return update(code, startAuction);
  }

  async function assign(
    code: string,
    input: { entryId: string; seat: number; bid: number }
  ): Promise<RoomDoc> {
    return update(code, (doc) => assignPlayer(doc, input));
  }

  async function pass(code: string): Promise<RoomDoc> {
    return update(code, markUnsold);
  }

  async function reset(code: string): Promise<RoomDoc> {
    return update(code, resetRoom);
  }

  async function updateSettings(code: string, input: CreateGameInput): Promise<RoomDoc> {
    return update(code, (doc) => updateRoomSettings(doc, input));
  }

  async function undo(code: string): Promise<RoomDoc | null> {
    const normalized = normalizeCode(code);
    const stack = await readUndo(normalized);
    if (stack.length === 0) return null;
    const previous = stack[stack.length - 1];
    await writeUndo(normalized, stack.slice(0, -1));
    const restored: RoomDoc = {
      ...previous,
      revision: previous.revision + 1,
      updatedAt: Date.now(),
    };
    await save(normalized, restored);
    return restored;
  }

  async function canUndo(code: string): Promise<boolean> {
    const stack = await readUndo(code);
    return stack.length > 0;
  }

  async function remove(code: string): Promise<void> {
    const normalized = normalizeCode(code);
    await kv.removeItem(roomKey(normalized));
    await kv.removeItem(undoKey(normalized));
    const index = await readIndex();
    await writeIndex(index.filter((entry) => entry !== normalized));
  }

  async function clear(): Promise<void> {
    const keys = await kv.getAllKeys?.();
    if (keys) {
      const ours = keys.filter((key) => key.startsWith("tachkila.room.v2.") || key.startsWith("tachkila.undo.v2."));
      if (ours.length > 0 && kv.multiRemove) await kv.multiRemove(ours);
      else for (const key of ours) await kv.removeItem(key);
    }
    await kv.removeItem(INDEX_KEY);
  }

  async function list(): Promise<GameSummary[]> {
    const index = await readIndex();
    const summaries: GameSummary[] = [];
    const stale: string[] = [];
    for (const code of index) {
      const doc = await load(code);
      if (doc) summaries.push(summaryOf(code, doc));
      else stale.push(code);
    }
    if (stale.length > 0) await writeIndex(index.filter((code) => !stale.includes(code)));
    return summaries.sort((a, b) => b.updatedAt - a.updatedAt);
  }

  return {
    create,
    load,
    list,
    update,
    start,
    assign,
    pass,
    reset,
    updateSettings,
    undo,
    canUndo,
    remove,
    clear,
  };
}

export function serialize(doc: RoomDoc, code: string) {
  return serializeRoom(doc, code);
}
