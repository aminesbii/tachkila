import type { Position, PublicPoolEntry, PublicRoom } from "@/engine/types";

export function entryById(room: PublicRoom, entryId: string): PublicPoolEntry | undefined {
  return room.pool.find((entry) => entry.id === entryId);
}

export function rosterEntries(room: PublicRoom, roster: readonly string[]): PublicPoolEntry[] {
  return roster
    .map((id) => entryById(room, id))
    .filter((entry): entry is PublicPoolEntry => Boolean(entry && entry.status === "sold"));
}

export function teamScore(room: PublicRoom, roster: readonly string[]): number {
  return rosterEntries(room, roster).reduce((sum, entry) => sum + entry.pts, 0);
}

export function filledAt(room: PublicRoom, roster: readonly string[], position: Position): number {
  return rosterEntries(room, roster).filter((entry) => entry.position === position).length;
}

export function openSlotsAt(
  room: PublicRoom,
  roster: readonly string[],
  position: Position
): number {
  return Math.max(0, room.formation[position] - filledAt(room, roster, position));
}

export function totalFilled(room: PublicRoom, roster: readonly string[]): number {
  return rosterEntries(room, roster).length;
}

export function upcomingEntries(room: PublicRoom): PublicPoolEntry[] {
  return room.pool.filter((entry) => entry.status === "upcoming");
}

export function nextEntries(room: PublicRoom, count = 6): PublicPoolEntry[] {
  return upcomingEntries(room).slice(0, count);
}

export function upcomingCount(room: PublicRoom): number {
  return room.pool.filter((entry) => entry.status === "upcoming").length;
}

export function soldEntries(room: PublicRoom): PublicPoolEntry[] {
  return room.pool.filter((entry) => entry.status === "sold");
}

export function remainingByPosition(room: PublicRoom): Record<Position, number> {
  const remaining: Record<Position, number> = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
  for (const entry of room.pool) {
    if (entry.status === "upcoming") remaining[entry.position] += 1;
  }
  return remaining;
}

export function ptsColor(pts: number): string {
  if (pts >= 4) return "#F4C95D";
  if (pts === 3) return "#38E1A0";
  if (pts === 2) return "#6FC6FF";
  return "#9AAFA2";
}

export function statusLabel(status: PublicRoom["status"]): string {
  switch (status) {
    case "lobby":
      return "Lobby";
    case "auction":
      return "Live auction";
    default:
      return "Finished";
  }
}
