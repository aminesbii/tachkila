import { getFormation, totalSlots } from "@/lib/formations";
import type { PoolEntry, PublicParticipant, PublicPoolEntry, PublicRoom, RoomDoc } from "@/lib/types";

export type Participation = Pick<RoomDoc, "formation" | "pool" | "participants">;

export const STARTING_BANK = 100;

export function currentEntry(doc: RoomDoc): PoolEntry | undefined {
  if (doc.currentIndex < 0 || doc.currentIndex >= doc.pool.length) return undefined;
  return doc.pool[doc.currentIndex];
}

export function nextUpcomingIndex(pool: readonly PoolEntry[], after: number): number {
  for (let i = after + 1; i < pool.length; i++) {
    if (pool[i].status === "upcoming") return i;
  }
  return -1;
}

export function serializeRoom(doc: RoomDoc, code: string): PublicRoom {
  const current = currentEntry(doc);

  const participants: PublicParticipant[] = doc.participants.map((p) => ({
    id: p.id,
    seat: p.seat,
    name: p.name,
    bankPoints: p.bankPoints,
    roster: [...p.roster],
  }));

  const pool: PublicPoolEntry[] = doc.pool.map((e) => ({
    id: e.id,
    playerId: e.playerId,
    name: e.name,
    position: e.position,
    pts: e.pts,
    nationality: e.nationality,
    imageUrl: e.imageUrl,
    status: e.status,
    winnerSeat: e.winnerSeat,
    winningBid: e.winningBid,
    order: e.order,
  }));

  const formation = getFormation(`${doc.formation.DEF}-${doc.formation.MID}-${doc.formation.FWD}`);

  return {
    code,
    formation: { ...doc.formation },
    formationLabel: formation?.label ?? `${doc.formation.DEF}-${doc.formation.MID}-${doc.formation.FWD}`,
    status: doc.status,
    currentIndex: doc.currentIndex,
    currentEntryId: current ? current.id : null,
    pool,
    participants,
    slotsPerTeam: totalSlots(doc.formation),
    startingBank: STARTING_BANK,
    totalEntries: doc.pool.length,
    updatedAt: doc.updatedAt.getTime(),
  };
}

export function teamScore(doc: Participation, seat: number): number {
  let score = 0;
  for (const entryId of doc.participants.find((p) => p.seat === seat)?.roster ?? []) {
    const entry = doc.pool.find((e) => e.id === entryId);
    if (entry && entry.status === "sold") score += entry.pts;
  }
  return score;
}
