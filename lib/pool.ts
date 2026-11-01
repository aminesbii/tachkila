import { playersByPosition } from "@/data/players";
import type { PlayerSeed } from "@/data/players";
import { poolBreakdown, slotRows } from "@/lib/formations";
import { POSITIONS } from "@/lib/types";
import type { Formation, PoolEntry, Position } from "@/lib/types";

export interface GeneratedPool {
  entries: PoolEntry[];
  counts: Record<Position, number>;
}

export function shuffle<T>(input: readonly T[], rng: () => number = Math.random): T[] {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function randomRng(): () => number {
  return Math.random;
}

function freeAgent(entryId: string, position: Position, index: number, rng: () => number): PoolEntry {
  return {
    id: entryId,
    playerId: `free-${entryId}`,
    name: `Free agent ${index}`,
    position,
    pts: 1 + Math.floor(rng() * 4),
    nationality: "",
    status: "upcoming",
    order: 0,
  };
}

/**
 * Builds a fresh auction pool.
 *
 * The pool holds `slots per game player × game players` footballers for every
 * position, so each game player can always complete the formation. Footballers
 * are shuffled with the given `rng` (Math.random by default), which is what
 * makes every room's pool different.
 *
 * Auction order: goalkeepers, then defenders, midfielders and finally forwards,
 * each group running left to right across the pitch.
 */
export function generatePool(
  formation: Formation,
  numGamePlayers: number,
  rng: () => number = randomRng()
): GeneratedPool {
  const decks: Record<Position, PlayerSeed[]> = {
    GK: shuffle(playersByPosition("GK"), rng),
    DEF: shuffle(playersByPosition("DEF"), rng),
    MID: shuffle(playersByPosition("MID"), rng),
    FWD: shuffle(playersByPosition("FWD"), rng),
  };
  const used: Record<Position, number> = { GK: 0, DEF: 0, MID: 0, FWD: 0 };

  const entries: PoolEntry[] = [];
  let order = 0;

  for (const row of slotRows(formation)) {
    const position = row[0];
    for (let i = 0; i < numGamePlayers; i++) {
      const deck = decks[position];
      const source = used[position] < deck.length ? deck[used[position]] : null;
      const id = `${position}-${order}`;
      const entry: PoolEntry = source
        ? {
            id,
            playerId: source.id,
            name: source.name,
            position,
            pts: source.pts,
            nationality: source.nationality,
            imageUrl: source.imageUrl,
            status: "upcoming",
            order,
          }
        : freeAgent(id, position, order + 1, rng);
      entries.push(entry);
      used[position] += 1;
      order += 1;
    }
  }

  return { entries, counts: poolBreakdown(formation, numGamePlayers) };
}

export function poolPositionSequence(entries: readonly PoolEntry[]): Position[] {
  return entries.map((e) => e.position);
}

export function freeAgentsUsed(entries: readonly PoolEntry[]): number {
  return entries.filter((e) => e.playerId.startsWith("free-")).length;
}

export function countsByPosition(entries: readonly PoolEntry[]): Record<Position, number> {
  const counts = { GK: 0, DEF: 0, MID: 0, FWD: 0 } as Record<Position, number>;
  for (const entry of entries) {
    if (POSITIONS.includes(entry.position)) counts[entry.position] += 1;
  }
  return counts;
}
