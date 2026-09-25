"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PublicPoolEntry } from "@/lib/types";
import { flagFor, initials, POSITION_LABEL, ptsClass } from "@/components/room/utils";

export function BidCard({ entry, hiddenPts }: { entry: PublicPoolEntry; hiddenPts: boolean }) {
  const ptsHidden = hiddenPts && entry.pts === null;

  return (
    <div className="relative flex flex-col items-center gap-4 rounded-2xl bg-card px-6 py-8 text-center ring-1 ring-foreground/10">
      <div className="absolute inset-x-0 top-0 h-1.5 rounded-t-2xl bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500" />
      <Badge className="uppercase tracking-widest">Up for auction</Badge>

      <div className="relative">
        <div className="flex size-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-black text-primary ring-4 ring-primary/10">
          {initials(entry.name)}
        </div>
      </div>

      <div className="flex flex-col items-center gap-1">
        <h2 className="text-3xl font-black tracking-tight">{entry.name}</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {entry.nationality && <span className="text-base">{flagFor(entry.nationality)}</span>}
          <span>{POSITION_LABEL[entry.position]}</span>
          <span className="text-muted-foreground/60">·</span>
          <span>{entry.nationality || "Free agent"}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className={cn("rounded-lg px-3 py-1.5 text-xl font-black text-white", ptsClass(entry.pts ?? 0))}>
          {ptsHidden ? "??" : `${entry.pts} pts`}
        </span>
      </div>
    </div>
  );
}