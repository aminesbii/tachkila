import { totalSlots } from "@/lib/formations";
import { STARTING_BANK, type Participation } from "@/lib/game";

export interface SeatScore {
  seat: number;
  name: string;
  score: number;
  bankPoints: number;
  acquired: number;
  maxSlots: number;
}

export function scoreRoom(room: Participation): SeatScore[] {
  const total = totalSlots(room.formation);
  return [...room.participants]
    .map((p) => {
      let score = 0;
      for (const entryId of p.roster) {
        const entry = room.pool.find((e) => e.id === entryId);
        if (entry && entry.status === "sold") score += entry.pts;
      }
      return {
        seat: p.seat,
        name: p.name,
        score,
        bankPoints: p.bankPoints,
        acquired: p.roster.length,
        maxSlots: total,
      };
    })
    .sort((a, b) => a.seat - b.seat);
}

export function rankScores(scores: SeatScore[]): SeatScore[] {
  const active = scores.filter((s) => s.acquired > 0 || s.bankPoints < STARTING_BANK);
  return [...active].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.bankPoints !== a.bankPoints) return b.bankPoints - a.bankPoints;
    return a.seat - b.seat;
  });
}
