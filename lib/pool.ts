import { playersByPosition } from "@/data/players";
import type { Formation, PoolEntry, Position } from "@/lib/types";
import { POSITIONS } from "@/lib/types";

export interface GeneratedPool {
  entries: PoolEntry[];
  counts: Record<Position, number>;
}

export function shuffle<T>(input: T[], rng: () => number = Math.random): T[] {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function generatePool(formation: Formation, seed?: string): GeneratedPool {
  const entries: PoolEntry[] = [];
  const counts: Record<Position, number> = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
  let order = 0;

  for (const position of POSITIONS) {
    const need = formation[position] * 4;
    const candidates = shuffle(playersByPosition(position));
    for (let i = 0; i < need; i++) {
      const source = i < candidates.length ? candidates[i] : null;
      const rng = seed ? seededRng(`${seed}-${position}-${i}`) : Math.random;
      const fakePts = source ? source.pts : 1 + Math.floor(rng() * 4);
      entries.push({
        id: `${position}-${i}`,
        playerId: source?.id ?? `fake-${position}-${i}`,
        name: source?.name ?? `${positionLabel(position)} ${i + 1}`,
        position,
        pts: fakePts,
        nationality: source?.nationality ?? "",
        imageUrl: source?.imageUrl,
        status: "upcoming",
        order,
      });
      counts[position] += 1;
      order += 1;
    }
  }

  return { entries, counts };
}

function positionLabel(p: Position): string {
  switch (p) {
    case "GK":
      return "Gardi";
    case "DEF":
      return "Defender";
    case "MID":
      return "Midfielder";
    case "FWD":
      return "Forward";
  }
}

function seededRng(input: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    h = h >>> 0;
    return (h % 100000) / 100000;
  };
}

export function fakePlayerFallbackUsed(entries: PoolEntry[]): boolean {
  return entries.some((e) => e.playerId.startsWith("fake-"));
}