"use client";

import type { Position } from "@/lib/types";
import type { PublicRoom } from "@/lib/types";
import { cn } from "@/lib/utils";
import { initials, ptsClass, rosterEntries } from "@/components/room/utils";

const ROW_ORDER: Position[] = ["FWD", "MID", "DEF", "GK"];

export function Pitch({ room, seat }: { room: PublicRoom; seat: number }) {
  const p = room.participants.find((x) => x.seat === seat);
  const sold = p ? rosterEntries(room, p.roster).filter((e) => e.status === "sold") : [];

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-b from-emerald-600 via-emerald-700 to-emerald-900 p-2.5 ring-1 ring-emerald-950/40">
      <div className="absolute inset-x-0 top-1/2 h-px bg-white/15" />
      <div className="absolute left-1/2 top-1/2 size-14 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15" />

      <div className="flex items-center justify-between px-1 pb-2">
        <span className="truncate text-xs font-bold text-white/95">
          {p ? p.name : `Seat ${seat}`}
          {p?.isHost && " · Host"}
        </span>
        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-widest text-white/70">
          {room.formationLabel}
        </span>
      </div>

      {p ? (
        <div className="flex min-h-52 flex-col justify-evenly gap-1.5 py-1">
          {ROW_ORDER.map((pos) => {
            const filled = sold.filter((e) => e.position === pos);
            const count = room.formation[pos];
            return (
              <div key={pos} className="flex items-center justify-center gap-1.5">
                {Array.from({ length: count }, (_, i) => {
                  const entry = filled[i];
                  return entry ? (
                    <div key={i} className="flex flex-col items-center gap-0.5">
                      <span className="flex size-8 items-center justify-center rounded-full bg-white text-[10px] font-black text-zinc-800 ring-1 ring-black/10">
                        {initials(entry.name)}
                      </span>
                      <span
                        className={cn(
                          "inline-flex h-4 min-w-6 items-center justify-center rounded-full px-1 text-[9px] font-bold text-white",
                          ptsClass(entry.pts ?? 0)
                        )}
                      >
                        {entry.pts ?? "?"}
                      </span>
                    </div>
                  ) : (
                    <span
                      key={i}
                      className="flex size-7 items-center justify-center rounded-full border border-dashed border-white/35 text-[9px] font-bold uppercase text-white/45"
                    >
                      {pos.slice(0, 2)}
                    </span>
                  );
                })}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex min-h-52 items-center justify-center text-xs font-medium text-white/50">
          Empty seat
        </div>
      )}
    </div>
  );
}