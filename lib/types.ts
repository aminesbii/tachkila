export type Position = "GK" | "DEF" | "MID" | "FWD";

export const POSITIONS: ReadonlyArray<Position> = ["GK", "DEF", "MID", "FWD"];

export const POSITION_LABEL: Record<Position, string> = {
  GK: "goalkeeper",
  DEF: "defender",
  MID: "midfielder",
  FWD: "forward",
};

export const POSITION_SHORT_LABEL: Record<Position, string> = {
  GK: "GK",
  DEF: "DEF",
  MID: "MID",
  FWD: "FWD",
};

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

export interface GamePlayer {
  id: string;
  seat: number;
  name: string;
  bankPoints: number;
  roster: string[];
}

export interface RoomDoc {
  formation: Formation;
  status: RoomStatus;
  currentIndex: number;
  pool: PoolEntry[];
  /** The 2–6 game players sitting around the table. The host never plays. */
  participants: GamePlayer[];
  updatedAt: Date;
}

export interface PublicParticipant {
  id: string;
  seat: number;
  name: string;
  bankPoints: number;
  roster: string[];
}

export interface PublicPoolEntry {
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

export interface PublicRoom {
  /** Short code of the room, e.g. `K7F2Q`. Lives only on this device. */
  code: string;
  formation: Formation;
  formationLabel: string;
  status: RoomStatus;
  currentIndex: number;
  currentEntryId: string | null;
  pool: PublicPoolEntry[];
  /** Game players only — the host is never one of them. */
  participants: PublicParticipant[];
  slotsPerTeam: number;
  startingBank: number;
  totalEntries: number;
  updatedAt: number;
}
