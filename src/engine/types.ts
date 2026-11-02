/** Version of the persisted room shape. Bump it whenever `RoomDoc` changes. */
export const ROOM_SCHEMA_VERSION = 2;

export type Position = "GK" | "DEF" | "MID" | "FWD";

export const POSITIONS: readonly Position[] = ["GK", "DEF", "MID", "FWD"];

export const POSITION_LABEL: Record<Position, string> = {
  GK: "Goalkeeper",
  DEF: "Defender",
  MID: "Midfielder",
  FWD: "Forward",
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

/** The complete, serialisable state of one table. */
export interface RoomDoc {
  /** Bumped whenever the shape below changes, so saved games can be migrated. */
  schemaVersion: number;
  /** Incremented on every save. Useful once games can sync between devices. */
  revision: number;
  formation: Formation;
  status: RoomStatus;
  currentIndex: number;
  pool: PoolEntry[];
  /** The 2–6 managers sitting around the table. The host never plays. */
  participants: GamePlayer[];
  createdAt: number;
  updatedAt: number;
}

export interface PublicParticipant {
  id: string;
  seat: number;
  name: string;
  bankPoints: number;
  roster: string[];
}

export type PublicPoolEntry = PoolEntry;

export interface PublicRoom {
  /** Short code of the game, e.g. `K7F2Q`. Kept for future online play. */
  code: string;
  revision: number;
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
  soldCount: number;
  createdAt: number;
  updatedAt: number;
}

/** Everything the home screen needs to render a saved game. */
export interface GameSummary {
  code: string;
  status: RoomStatus;
  formationLabel: string;
  playerNames: string[];
  slotsPerTeam: number;
  totalEntries: number;
  soldCount: number;
  currentName: string | null;
  createdAt: number;
  updatedAt: number;
}
