"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Play, Shuffle, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { updateLocalRoomSettings } from "@/lib/room-store";
import { isGameError } from "@/lib/room-reducer";
import {
  POSITION_SHORT_LABEL,
  remainingByPosition,
  upcomingCount,
} from "@/components/room/utils";
import { RoomSetupForm, type RoomSetupValue } from "@/components/room/room-setup-form";
import type { PublicRoom } from "@/lib/types";

function setupFromRoom(room: PublicRoom): RoomSetupValue {
  return {
    formationKey: room.formationLabel,
    playerNames: room.participants.map((p) => p.name),
  };
}

export function LobbyPanel({
  room,
  onStart,
  starting,
}: {
  room: PublicRoom;
  onStart: () => void;
  starting: boolean;
}) {
  const qc = useQueryClient();
  const [draft, setDraft] = useState<RoomSetupValue | null>(null);
  const [error, setError] = useState<string | null>(null);
  const setup = draft ?? setupFromRoom(room);
  const remaining = remainingByPosition(room);

  const save = useMutation({
    mutationFn: async (next: RoomSetupValue) =>
      updateLocalRoomSettings(room.code, {
        playerNames: next.playerNames,
        formationKey: next.formationKey,
      }),
    onSuccess: async () => {
      setDraft(null);
      setError(null);
      await qc.invalidateQueries({ queryKey: ["room", room.code] });
    },
    onError: (err) => setError(isGameError(err) ? err.message : "Could not update the room."),
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="size-5" /> Game players
          </CardTitle>
          <CardDescription>
            {room.participants.length} game {room.participants.length === 1 ? "player" : "players"} around the
            table. Nobody joins the room and nobody touches a device.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2">
            {room.participants.map((p) => (
              <div
                key={p.seat}
                className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2.5"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {p.seat}
                  </span>
                  <span className="truncate text-sm font-semibold">{p.name}</span>
                </div>
                <Badge variant="secondary" className="h-6 shrink-0">
                  {p.bankPoints} bank pts
                </Badge>
              </div>
            ))}
          </div>

          <Separator className="my-5" />

          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <p>
              Room code <span className="font-mono font-bold text-foreground">{room.code}</span> — you run the
              whole draft on this screen, with the host&apos;s full information.
            </p>
            <p>
              Pool size: <span className="font-semibold text-foreground">{room.totalEntries}</span> footballers —{" "}
              {room.formationLabel} formation, {room.slotsPerTeam} slots drawn once per game player.
            </p>
            <p>
              Auction order: goalkeepers first, then defenders, midfielders, then attackers — each group left to
              right across the pitch.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-6">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Ready?</CardTitle>
            <CardDescription>
              Everyone bids out loud, you type the winning bid and assign the footballer.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={onStart} disabled={starting} className="h-11 w-full text-base">
              {starting ? "Starting…" : (
                <>
                  <Play /> Start auction
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shuffle className="size-4" /> Room setup
            </CardTitle>
            <CardDescription>
              Change the formation or the number of game players — the pool is redrawn randomly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 grid grid-cols-4 gap-2 text-center text-xs">
              {(["GK", "DEF", "MID", "FWD"] as const).map((pos) => (
                <div key={pos} className="rounded-lg bg-muted px-2 py-1.5">
                  <div className="font-semibold text-foreground">{remaining[pos]}</div>
                  <div className="text-muted-foreground">{POSITION_SHORT_LABEL[pos]} left</div>
                </div>
              ))}
            </div>
            <RoomSetupForm
              value={setup}
              onChange={setDraft}
              onSubmit={(next) => save.mutate(next)}
              submitLabel="Redraw pool"
              pendingLabel="Redrawing…"
              submitting={save.isPending}
              error={error}
            />
            <p className="mt-3 text-xs text-muted-foreground">
              {upcomingCount(room)} footballers queued · the auction order never changes.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
