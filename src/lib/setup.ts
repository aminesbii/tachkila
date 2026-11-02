import {
  DEFAULT_FORMATION,
  FORMATION_DEFS,
  MAX_GAME_PLAYERS,
  MIN_GAME_PLAYERS,
  poolBreakdown,
  poolSize,
  totalSlots,
} from "@/engine/formations";
import type { Formation, Position } from "@/engine/types";

export interface SetupValue {
  formationKey: string;
  playerNames: string[];
}

export function normalizePlayerNames(names: readonly string[], count: number): string[] {
  return Array.from({ length: count }, (_, index) => names[index]?.slice(0, 24) ?? "");
}

export function defaultSetup(count = 4): SetupValue {
  return { formationKey: DEFAULT_FORMATION, playerNames: normalizePlayerNames([], count) };
}

export function setupFromRoomNames(formationKey: string, names: readonly string[]): SetupValue {
  return { formationKey, playerNames: normalizePlayerNames(names, names.length) };
}

export function validateSetup(value: SetupValue): string | null {
  const count = value.playerNames.length;
  if (count < MIN_GAME_PLAYERS) return `Add at least ${MIN_GAME_PLAYERS} managers.`;
  if (count > MAX_GAME_PLAYERS) return `At most ${MAX_GAME_PLAYERS} managers can play.`;
  if (!FORMATION_DEFS.some((def) => def.key === value.formationKey)) return "Pick a formation.";
  if (value.playerNames.some((name) => !name.trim())) return "Give every manager a name.";
  const unique = new Set(value.playerNames.map((name) => name.trim().toLowerCase()));
  if (unique.size !== count) return "Every manager needs a different name.";
  return null;
}

export interface SetupPreview {
  slots: number;
  pool: number;
  breakdown: Record<Position, number>;
  counts: Formation;
}

export function previewSetup(value: SetupValue): SetupPreview {
  const def = FORMATION_DEFS.find((item) => item.key === value.formationKey) ?? FORMATION_DEFS[0];
  const counts = def.counts;
  return {
    slots: totalSlots(counts),
    pool: poolSize(counts, value.playerNames.length),
    breakdown: poolBreakdown(counts, value.playerNames.length),
    counts,
  };
}
