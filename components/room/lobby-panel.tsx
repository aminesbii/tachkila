"use client";

import { Play, UserPlus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DEFAULT_FORMATION } from "@/lib/formations";
import { FORMATION_DEFS } from "@/lib/formations";
import type { PublicRoom } from "@/lib/types";

export function LobbyPanel({
  room,
  onStart,
  starting,
}: {
  room: PublicRoom;
  onStart: () => void;
  starting: boolean;
}) {
  const isHost = room.viewer.isHost;
  const seats = Array.from({ length: 4 }, (_, i) => i + 1);
  const formation = FORMATION_DEFS.find((f) => f.key === room.formationLabel) ?? FORMATION_DEFS.find((f) => f.key === DEFAULT_FORMATION);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="size-5" /> Players in the room
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2">
            {seats.map((seat) => {
              const p = room.participants.find((x) => x.seat === seat);
              const isYou = room.viewer.seat === seat;
              return (
                <div
                  key={seat}
                  className={`flex items-center justify-between rounded-lg border px-3 py-2.5 ${
                    p
                      ? isYou
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card"
                      : "border-dashed border-border bg-muted/30"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {seat}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">
                        {p ? p.name : "Waiting…"}
                        {isYou && p && <span className="text-primary"> (you)</span>}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {p ? (p.isHost ? "Host · 100 pts" : `${100} bank pts`) : "Empty seat"}
                      </span>
                    </div>
                  </div>
                  {p?.isHost && <Badge>Host</Badge>}
                </div>
              );
            })}
          </div>

          <Separator className="my-5" />

          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <p>
              Share code <span className="font-mono font-bold text-foreground">{room.code}</span> with 3
              friends and wait for them to join.
            </p>
            <p>
              Pool size: <span className="font-semibold text-foreground">{room.totalEntries}</span> footballers —{" "}
              {formation?.label ?? room.formationLabel} formation, each position drawn 4×.
            </p>
            {room.blindMode && (
              <p>Point values are hidden until each footballer is sold (blind mode).</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Ready?</CardTitle>
        </CardHeader>
        <CardContent>
          {isHost ? (
            <Button onClick={onStart} disabled={starting} className="h-11 w-full text-base">
              {starting ? "Starting…" : <><Play /> Start auction</>}
            </Button>
          ) : room.viewer.seat ? (
            <p className="text-sm text-muted-foreground">
              You are in. Waiting for the host to start the auction.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              You are spectating this lobby. Ask the host for the code, or leave to join a room.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}