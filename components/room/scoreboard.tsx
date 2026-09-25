"use client";

import { Coins, Goal, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PublicRoom } from "@/lib/types";
import { teamScore } from "@/components/room/utils";

export function Scoreboard({
  room,
}: {
  room: PublicRoom;
}) {
  const maxSlots = Object.values(room.formation).reduce((a, b) => a + b, 0);

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {[1, 2, 3, 4].map((seat) => {
        const p = room.participants.find((x) => x.seat === seat);
        const score = p ? teamScore(room, p.roster) : 0;
        const acquired = p ? p.roster.length : 0;
        const active = p ? seat === room.viewer.seat : false;
        return (
          <div
            key={seat}
            className={cn(
              "rounded-lg border px-3 py-2.5",
              active
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : p
                  ? "border-border bg-card"
                  : "border-dashed border-border bg-muted/30 opacity-60"
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {seat}
                </span>
                <span className="truncate text-sm font-semibold">
                  {p ? p.name : "Empty"}
                  {active && p && <span className="text-primary"> · you</span>}
                </span>
                {p?.isHost && <Badge variant="outline" className="h-5 text-[10px]">Host</Badge>}
              </div>
              <span className="flex items-center gap-1 text-sm font-black text-emerald-600 dark:text-emerald-400">
                <Star className="size-3.5 fill-current" />
                {score}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Coins className="size-3" />
                <span className={cn("font-semibold", p && p.bankPoints < 20 && "text-destructive")}>
                  {p?.bankPoints ?? "—"} pts
                </span>
              </span>
              <span className="inline-flex items-center gap-1">
                <Goal className="size-3" />
                {p ? `${acquired}/${maxSlots} slots` : ""}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}