"use client";

import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { assignPlayer as apiAssign, getToken } from "@/lib/api-client";
import { initials } from "@/components/room/utils";
import { cn } from "@/lib/utils";
import type { PublicPoolEntry, PublicRoom } from "@/lib/types";

export function AssignDialog({
  room,
  entry,
  open,
  onOpenChange,
}: {
  room: PublicRoom;
  entry: PublicPoolEntry;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const qc = useQueryClient();
  const [seat, setSeat] = useState<number | null>(null);
  const [bid, setBid] = useState("");
  const [quickError, setQuickError] = useState<string | null>(null);

  const maxSlots = useMemo(
    () => Object.values(room.formation).reduce((a, b) => a + b, 0),
    [room.formation]
  );

  const selected = room.participants.find((p) => p.seat === seat) ?? null;
  const bidNum = Number(bid);
  const isBidValid =
    selected !== null &&
    Number.isInteger(bidNum) &&
    bidNum >= 0 &&
    bidNum <= selected.bankPoints;

  function handleOpenChange(next: boolean) {
    if (!next) {
      setSeat(null);
      setBid("");
      setQuickError(null);
    }
    onOpenChange(next);
  }

  const assign = useMutation({
    mutationFn: ({ s, b }: { s: number; b: number }) =>
      apiAssign(room.code, getToken(room.code) ?? "", { entryId: entry.id, seat: s, bid: b }),
    onSuccess: async () => {
      onOpenChange(false);
      await qc.invalidateQueries({ queryKey: ["room", room.code] });
    },
  });

  function confirm() {
    if (!selected || !isBidValid) return;
    assign.mutate({ s: selected.seat, b: bidNum });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sell {entry.name}</DialogTitle>
          <DialogDescription>
            Pick the winning participant and enter the amount they bid out loud.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-1.5">
          {room.participants.map((p) => {
            const rosterFull = p.roster.length >= maxSlots;
            const selectedClass = seat === p.seat;
            return (
              <button
                key={p.seat}
                type="button"
                disabled={rosterFull}
                onClick={() => {
                  setSeat(p.seat);
                  setBid("");
                  setQuickError(null);
                }}
                className={cn(
                  "flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors",
                  selectedClass
                    ? "border-primary bg-primary/10 ring-1 ring-primary"
                    : "border-border bg-background hover:bg-muted",
                  rosterFull && "cursor-not-allowed opacity-50"
                )}
              >
                <span className="flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                    {initials(p.name)}
                  </span>
                  <span className="font-semibold">
                    {p.name} <span className="text-muted-foreground">(seat {p.seat})</span>
                  </span>
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                  {rosterFull ? "Roster full" : `${p.bankPoints} pts left`}
                </span>
              </button>
            );
          })}
        </div>

        {selected && (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="bid" className="text-sm font-medium">
              Winning bid for {selected.name}
            </label>
            <div className="flex gap-2">
              <Input
                id="bid"
                type="number"
                min={0}
                max={selected.bankPoints}
                value={bid}
                onChange={(e) => {
                  setBid(e.target.value);
                  setQuickError(null);
                }}
                placeholder="0"
                className="flex-1 text-lg font-bold"
                inputMode="numeric"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setBid(String(selected.bankPoints));
                  setQuickError(null);
                }}
              >
                Max
              </Button>
            </div>
            {bid !== "" && !isBidValid && (
              <p className="text-xs text-destructive">
                {bidNum < 0
                  ? "Bid can't be negative."
                  : bidNum > selected.bankPoints
                    ? `${selected.name} only has ${selected.bankPoints} pts.`
                    : "Enter a whole number of points."}
              </p>
            )}
          </div>
        )}

        {quickError && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{quickError}</p>
        )}

        {assign.isError && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {(assign.error as Error)?.message ?? "Could not complete the sale."}
          </p>
        )}

        <DialogFooter>
          <Button
            onClick={confirm}
            disabled={!selected || !isBidValid || assign.isPending}
            className="w-full sm:w-auto"
          >
            {assign.isPending && <Loader2 className="animate-spin" />}
            Sell to {selected ? selected.name : "…"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}