"use client";

import { cn } from "@/lib/utils";
import type { PublicRoom } from "@/lib/types";
import { ptsClass } from "@/components/room/utils";

export function SoldList({ room }: { room: PublicRoom }) {
  const lastSold = room.pool.filter((e) => e.status === "sold").slice(-12).reverse();

  if (lastSold.length === 0) {
    return (
      <p className="px-4 py-6 text-center text-sm text-muted-foreground">
        No sales yet — the first footballer is up for auction.
      </p>
    );
  }

  return (
    <div className="flex flex-col">
      {lastSold.map((e) => {
        const winner = room.participants.find((p) => p.seat === e.winnerSeat);
        return (
          <div
            key={e.id}
            className="flex items-center justify-between gap-2 border-b px-4 py-2 text-sm last:border-b-0"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="truncate font-semibold">{e.name}</span>
                <span
                  className={cn(
                    "inline-flex h-4 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white",
                    ptsClass(e.pts ?? 0)
                  )}
                >
                  {e.pts ?? "?"}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {winner ? `→ ${winner.name}` : "→ Ticket"}
              </span>
            </div>
            <span className="shrink-0 text-sm font-black text-emerald-600 dark:text-emerald-400">
              {e.winningBid ?? 0} pts
            </span>
          </div>
        );
      })}
    </div>
  );
}