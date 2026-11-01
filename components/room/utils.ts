import { POSITION_LABEL, POSITION_SHORT_LABEL } from "@/lib/types";
import type { Position, PublicPoolEntry, PublicRoom } from "@/lib/types";

export { POSITION_LABEL, POSITION_SHORT_LABEL };

const FLAGS: Record<string, string> = {
  Tunisia: "🇹🇳",
  Spain: "🇪🇸",
  Brazil: "🇧🇷",
  Belgium: "🇧🇪",
  Morocco: "🇲🇦",
  Senegal: "🇸🇳",
  "Costa Rica": "🇨🇷",
  France: "🇫🇷",
  Netherlands: "🇳🇱",
  Croatia: "🇭🇷",
  Portugal: "🇵🇹",
  Switzerland: "🇨🇭",
  "South Korea": "🇰🇷",
  Germany: "🇩🇪",
  Italy: "🇮🇹",
  Argentina: "🇦🇷",
  England: "🇬🇧",
  Norway: "🇳🇴",
  Uruguay: "🇺🇾",
  Egypt: "🇪🇬",
  Poland: "🇵🇱",
  Nigeria: "🇳🇬",
  Serbia: "🇷🇸",
  Colombia: "🇨🇴",
  Mexico: "🇲🇽",
  Algeria: "🇩🇿",
  Mali: "🇲🇱",
  Benin: "🇧🇯",
  Chad: "🇹🇩",
  Libya: "🇱🇾",
};

const NATIONALITY_ALIASES: Record<string, string> = {
  Egyption: "Egypt",
  Italien: "Italy",
  Spanish: "Spain",
  Brazilian: "Brazil",
  Maroc: "Morocco",
  Negiria: "Nigeria",
  Tunisia: "Tunisaia",
  Cote_divoire: "Côte d'Ivoire",
};

export function flagFor(nationality: string): string {
  return FLAGS[NATIONALITY_ALIASES[nationality] ?? nationality] ?? "🌍";
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function ptsClass(pts: number): string {
  if (pts >= 4) return "bg-emerald-500 text-white";
  if (pts === 3) return "bg-amber-500 text-white";
  if (pts === 2) return "bg-sky-500 text-white";
  return "bg-zinc-400 text-white";
}

export function entryById(room: PublicRoom, entryId: string): PublicPoolEntry | undefined {
  return room.pool.find((e) => e.id === entryId);
}

export function resolvedEntry(room: PublicRoom, entryId: string): PublicPoolEntry | undefined {
  const e = entryById(room, entryId);
  return e && (e.status === "sold" || e.status === "unsold") ? e : undefined;
}

export function rosterEntries(room: PublicRoom, roster: string[]): PublicPoolEntry[] {
  return roster
    .map((id) => resolvedEntry(room, id))
    .filter((e): e is PublicPoolEntry => Boolean(e));
}

export function teamScore(room: PublicRoom, roster: string[]): number {
  return rosterEntries(room, roster).reduce((sum, e) => sum + (e.status === "sold" ? e.pts : 0), 0);
}

export function filledSlots(room: PublicRoom, roster: string[], position: Position): number {
  return rosterEntries(room, roster).filter((e) => e.position === position && e.status === "sold").length;
}

export function upcomingCount(room: PublicRoom): number {
  return room.pool.filter((e) => e.status === "upcoming").length;
}

export function soldCount(room: PublicRoom): number {
  return room.pool.filter((e) => e.status === "sold").length;
}

export function nextEntries(room: PublicRoom, count = 5): PublicPoolEntry[] {
  return room.pool.filter((e) => e.status === "upcoming").slice(0, count);
}

export function remainingByPosition(room: PublicRoom): Record<Position, number> {
  const remaining = { GK: 0, DEF: 0, MID: 0, FWD: 0 } as Record<Position, number>;
  for (const entry of room.pool) {
    if (entry.status === "upcoming") remaining[entry.position] += 1;
  }
  return remaining;
}
