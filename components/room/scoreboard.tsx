"use client";

import { Coins, Goal, Star } from "lucide-react";

import { cn } from "@/lib/utils";
import type { PublicRoom } from "@/lib/types";
import { filledSlots, teamScore } from "@/components/room/utils";

export function Scoreboard({ room }: { room: PublicRoom }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {room.participants.map((p) => {
        const score = teamScore(room, p.roster);
        const slotsFilled = (["GK", "DEF", "MID", "FWD"] as const).reduce(
          (sum, pos) => sum + filledSlots(room, p.roster, pos),
          0
        );
        return (
          <div key={p.seat} className="rounded-lg border border-border bg-card px-3 py-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {p.seat}
                </span>
                <span className="truncate text-sm font-semibold">{p.name}</span>
              </div>
              <span className="flex shrink-0 items-center gap-1 text-sm font-black text-emerald-600 dark:text-emerald-400">
                <Star className="size-3.5 fill-current" />
                {score}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Coins className="size-3" />
                <span className={cn("font-semibold", p.bankPoints < 20 && "text-destructive")}>
                  {p.bankPoints} pts
                </span>
              </span>
              <span className="inline-flex items-center gap-1">
                <Goal className="size-3" />
                {slotsFilled}/{room.slotsPerTeam} slots
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
