export type Position = "GK" | "DEF" | "MID" | "FWD";

export const POSITIONS: ReadonlyArray<Position> = ["GK", "DEF", "MID", "FWD"];

export type Formation = Record<Position, number>;

export type RoomStatus = "lobby" | "auction" | "finished";

export type PoolEntryStatus = "upcoming" | "auction" | "sold" | "unsold";

export interface PoolEntry {
  id: string;
  playerId: string;
  name: string;
  position: Position;
  pts: number;
  nationality: string;
  imageUrl?: string;
  status: PoolEntryStatus;
  winnerSeat?: number;
  winningBid?: number;
  order: number;
}

export interface Participant {
  id: string;
  seat: number;
  name: string;
  isHost: boolean;
  token: string;
  bankPoints: number;
  roster: string[];
}

export interface RoomDoc {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  hostParticipantId: string;
  formation: Formation;
  blindMode: boolean;
  status: RoomStatus;
  currentIndex: number;
  pool: PoolEntry[];
  participants: Participant[];
}

export interface PublicParticipant {
  id: string;
  seat: number;
  name: string;
  isHost: boolean;
  bankPoints: number;
  roster: string[];
}

export interface PublicPoolEntry {
  id: string;
  playerId: string;
  name: string;
  position: Position;
  pts: number | null;
  nationality: string;
  imageUrl?: string;
  status: PoolEntryStatus;
  winnerSeat?: number;
  winningBid?: number;
  order: number;
}

export interface PublicRoom {
  code: string;
  formation: Formation;
  formationLabel: string;
  blindMode: boolean;
  status: RoomStatus;
  currentIndex: number;
  currentEntryId: string | null;
  pool: PublicPoolEntry[];
  participants: PublicParticipant[];
  viewer: {
    seat: number | null;
    isHost: boolean;
  };
  totalEntries: number;
  updatedAt: number;
}