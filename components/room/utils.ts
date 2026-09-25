import type { PoolEntry, PublicPoolEntry, PublicRoom, Position } from "@/lib/types";

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
};

export function flagFor(nationality: string): string {
  return FLAGS[nationality] ?? "🌍";
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

export const POSITION_LABEL: Record<Position, string> = {
  GK: "Goalkeeper",
  DEF: "Defender",
  MID: "Midfielder",
  FWD: "Forward",
};

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
  return rosterEntries(room, roster).reduce((sum, e) => sum + (e.status === "sold" ? e.pts ?? 0 : 0), 0);
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

export function slotLabel(room: PublicRoom, entry: PoolEntry | PublicPoolEntry): string {
  return `${entry.position} · ${entry.pts ?? "??"} pts`;
}