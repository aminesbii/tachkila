"use client";

import { useState } from "react";
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
import { assignLocalPlayer } from "@/lib/room-store";
import { GameError } from "@/lib/room-reducer";
import { filledSlots, initials, POSITION_SHORT_LABEL } from "@/components/room/utils";
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

  const slotsLeft = (seatNo: number) => {
    const player = room.participants.find((p) => p.seat === seatNo);
    if (!player) return 0;
    return room.slotsPerTeam - filledSlots(room, player.roster, entry.position);
  };

  const selected = room.participants.find((p) => p.seat === seat) ?? null;
  const bidNum = Number(bid);
  const isBidValid =
    selected !== null && bid !== "" && Number.isInteger(bidNum) && bidNum >= 0 && bidNum <= selected.bankPoints;

  function handleOpenChange(next: boolean) {
    if (!next) {
      setSeat(null);
      setBid("");
    }
    onOpenChange(next);
  }

  const assign = useMutation({
    mutationFn: async () => {
      if (!selected) throw new GameError("bad_seat", "Pick the game player who won the bid.");
      return assignLocalPlayer(room.code, { entryId: entry.id, seat: selected.seat, bid: bidNum });
    },
    onSuccess: async () => {
      onOpenChange(false);
      await qc.invalidateQueries({ queryKey: ["room", room.code] });
    },
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sell {entry.name}</DialogTitle>
          <DialogDescription>
            Type the final bid the winner just shouted out, then assign the footballer to that game player.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-1.5">
          {room.participants.map((p) => {
            const missing = slotsLeft(p.seat);
            const canTake = missing > 0 && p.bankPoints > 0;
            const selectedClass = seat === p.seat;
            return (
              <button
                key={p.seat}
                type="button"
                disabled={!canTake}
                onClick={() => {
                  setSeat(p.seat);
                  setBid("");
                }}
                className={cn(
                  "flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                  selectedClass
                    ? "border-primary bg-primary/10 ring-1 ring-primary"
                    : "border-border bg-background hover:bg-muted",
                  !canTake && "cursor-not-allowed opacity-50"
                )}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                    {initials(p.name)}
                  </span>
                  <span className="truncate font-semibold">{p.name}</span>
                </span>
                <span className="flex shrink-0 flex-col items-end text-[11px] leading-tight text-muted-foreground">
                  <span className="font-semibold text-foreground">{p.bankPoints} pts left</span>
                  {missing > 0 ? (
                    <span>
                      needs {missing} {POSITION_SHORT_LABEL[entry.position]}
                    </span>
                  ) : (
                    <span>{POSITION_SHORT_LABEL[entry.position]} slots full</span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {selected && (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="bid" className="text-sm font-medium">
              Final bid from {selected.name}
            </label>
            <Input
              id="bid"
              type="number"
              inputMode="numeric"
              min={0}
              max={selected.bankPoints}
              value={bid}
              onChange={(e) => setBid(e.target.value)}
              placeholder="0"
              className="text-lg font-bold"
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              {selected.name} has {selected.bankPoints} bank points. Nothing is suggested — type what was bid
              out loud.
            </p>
            {bid !== "" && !isBidValid && (
              <p className="text-xs text-destructive">
                {bidNum > selected.bankPoints
                  ? `${selected.name} only has ${selected.bankPoints} bank points.`
                  : "Enter a whole number of points."}
              </p>
            )}
          </div>
        )}

        {assign.isError && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {(assign.error as Error)?.message ?? "Could not complete the sale."}
          </p>
        )}

        <DialogFooter>
          <Button
            onClick={() => selected && assign.mutate()}
            disabled={!selected || !isBidValid || assign.isPending}
            className="w-full sm:w-auto"
          >
            {assign.isPending && <Loader2 className="animate-spin" />}
            Assign to {selected ? selected.name : "…"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
