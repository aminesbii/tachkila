import type { Formation, Position } from "@/lib/types";

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

export function getFormation(key: string): FormationDef | undefined {
  return FORMATION_DEFS.find((f) => f.key === key);
}

export function formationKey(counts: Formation): string {
  return `${counts.DEF}-${counts.MID}-${counts.FWD}`;
}

export function totalSlots(counts: Formation): number {
  return counts.GK + counts.DEF + counts.MID + counts.FWD;
}

export function poolSize(counts: Formation): number {
  return totalSlots(counts) * 4;
}

export function validateFormation(counts: Formation): boolean {
  if (counts.GK !== 1) return false;
  if (counts.DEF < 3 || counts.DEF > 5) return false;
  if (counts.MID < 3 || counts.MID > 5) return false;
  if (counts.FWD < 2 || counts.FWD > 3) return false;
  return counts.DEF + counts.MID + counts.FWD === 10;
}