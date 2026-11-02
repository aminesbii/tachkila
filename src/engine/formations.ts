import { POSITIONS } from "@/engine/types";
import type { Formation, Position } from "@/engine/types";

export interface FormationDef {
  key: string;
  label: string;
  counts: Formation;
  display: Position[];
}

export const FORMATION_DEFS: FormationDef[] = [
  { key: "4-4-2", label: "4-4-2", counts: { GK: 1, DEF: 4, MID: 4, FWD: 2 }, display: ["GK", "DEF", "MID", "FWD"] },
  { key: "4-3-3", label: "4-3-3", counts: { GK: 1, DEF: 4, MID: 3, FWD: 3 }, display: ["GK", "DEF", "MID", "FWD"] },
  { key: "3-5-2", label: "3-5-2", counts: { GK: 1, DEF: 3, MID: 5, FWD: 2 }, display: ["GK", "DEF", "MID", "FWD"] },
  { key: "3-4-3", label: "3-4-3", counts: { GK: 1, DEF: 3, MID: 4, FWD: 3 }, display: ["GK", "DEF", "MID", "FWD"] },
  { key: "5-3-2", label: "5-3-2", counts: { GK: 1, DEF: 5, MID: 3, FWD: 2 }, display: ["GK", "DEF", "MID", "FWD"] },
];

export const DEFAULT_FORMATION = "4-4-2";

export const MIN_GAME_PLAYERS = 2;
export const MAX_GAME_PLAYERS = 6;

export const GAME_PLAYER_COUNTS: number[] = Array.from(
  { length: MAX_GAME_PLAYERS - MIN_GAME_PLAYERS + 1 },
  (_, i) => MIN_GAME_PLAYERS + i
);

export function isValidGamePlayerCount(count: number): boolean {
  return Number.isInteger(count) && count >= MIN_GAME_PLAYERS && count <= MAX_GAME_PLAYERS;
}

export function getFormation(key: string): FormationDef | undefined {
  return FORMATION_DEFS.find((f) => f.key === key);
}

export function formationKey(counts: Formation): string {
  return `${counts.DEF}-${counts.MID}-${counts.FWD}`;
}

export function totalSlots(counts: Formation): number {
  return counts.GK + counts.DEF + counts.MID + counts.FWD;
}

export function poolSize(counts: Formation, numPlayers: number): number {
  return totalSlots(counts) * numPlayers;
}

export function slotOrder(counts: Formation): Position[] {
  return slotRows(counts).flat();
}

/** One row per pitch slot, in auction order: goalkeepers, then defenders, midfielders, forwards. */
export function slotRows(counts: Formation): Position[][] {
  const rows: Position[][] = [];
  for (const pos of POSITIONS) {
    for (let i = 0; i < counts[pos]; i++) {
      rows.push([pos]);
    }
  }
  return rows;
}

export function poolBreakdown(counts: Formation, numGamePlayers: number): Record<Position, number> {
  const breakdown = { GK: 0, DEF: 0, MID: 0, FWD: 0 } as Record<Position, number>;
  for (const pos of POSITIONS) {
    breakdown[pos] = counts[pos] * numGamePlayers;
  }
  return breakdown;
}

export function validateFormation(counts: Formation): boolean {
  if (counts.GK !== 1) return false;
  if (counts.DEF < 3 || counts.DEF > 5) return false;
  if (counts.MID < 3 || counts.MID > 5) return false;
  if (counts.FWD < 2 || counts.FWD > 3) return false;
  return counts.DEF + counts.MID + counts.FWD === 10;
}