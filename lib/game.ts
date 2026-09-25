import { getFormation } from "@/lib/formations";
import type {
  Participant,
  PoolEntry,
  PublicParticipant,
  PublicPoolEntry,
  PublicRoom,
  RoomDoc,
} from "@/lib/types";

export type Participation = Pick<RoomDoc, "formation" | "pool" | "participants">;

export const STARTING_BANK = 100;

export function participationOf(doc: RoomDoc): Participation {
  return { formation: doc.formation, pool: doc.pool, participants: doc.participants };
}

export function findParticipantByToken(doc: RoomDoc, token: string | null | undefined): Participant | undefined {
  if (!token) return undefined;
  return doc.participants.find((p) => p.token === token);
}

export function isHostToken(doc: RoomDoc, token: string | null | undefined): boolean {
  const p = findParticipantByToken(doc, token);
  return Boolean(p && p.id === doc.hostParticipantId);
}

export function currentEntry(doc: RoomDoc): PoolEntry | undefined {
  if (doc.currentIndex < 0 || doc.currentIndex >= doc.pool.length) return undefined;
  return doc.pool[doc.currentIndex];
}

export function nextUpcomingIndex(doc: RoomDoc, after: number): number {
  for (let i = after + 1; i < doc.pool.length; i++) {
    if (doc.pool[i].status === "upcoming") return i;
  }
  return -1;
}

export function rosterEntryIds(doc: RoomDoc, seat: number): string[] {
  const p = doc.participants.find((x) => x.seat === seat);
  return p ? [...p.roster] : [];
}

export function entryById(doc: RoomDoc, entryId: string): PoolEntry | undefined {
  return doc.pool.find((e) => e.id === entryId);
}

export function serializeRoom(doc: RoomDoc, viewerToken?: string | null): PublicRoom {
  const viewer = findParticipantByToken(doc, viewerToken);
  const isHost = Boolean(viewer && viewer.id === doc.hostParticipantId);
  const current = currentEntry(doc);

  const participants: PublicParticipant[] = doc.participants.map((p) => ({
    id: p.id,
    seat: p.seat,
    name: p.name,
    isHost: p.isHost,
    bankPoints: p.bankPoints,
    roster: [...p.roster],
  }));

  const pool: PublicPoolEntry[] = doc.pool.map((e) => {
    const hidden = doc.blindMode && (e.status === "upcoming" || e.status === "auction") && !isHost;
    return {
      id: e.id,
      playerId: e.playerId,
      name: e.name,
      position: e.position,
      pts: hidden ? null : e.pts,
      nationality: e.nationality,
      imageUrl: e.imageUrl,
      status: e.status,
      winnerSeat: e.winnerSeat,
      winningBid: e.winningBid,
      order: e.order,
    };
  });

  const formation = getFormation(`${doc.formation.DEF}-${doc.formation.MID}-${doc.formation.FWD}`);

  return {
    code: doc._id,
    formation: { ...doc.formation },
    formationLabel: formation?.label ?? formation?.key ?? "",
    blindMode: doc.blindMode,
    status: doc.status,
    currentIndex: doc.currentIndex,
    currentEntryId: current ? current.id : null,
    pool,
    participants,
    viewer: {
      seat: viewer?.seat ?? null,
      isHost,
    },
    totalEntries: doc.pool.length,
    updatedAt: doc.updatedAt.getTime(),
  };
}

export function teamScore(doc: Participation, seat: number): number {
  let score = 0;
  for (const entryId of rosterEntryIds(doc as RoomDoc, seat)) {
    const entry = doc.pool.find((e) => e.id === entryId);
    if (entry && entry.status === "sold") score += entry.pts;
  }
  return score;
}