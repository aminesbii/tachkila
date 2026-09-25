"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pitch } from "@/components/room/pitch";
import { Scoreboard } from "@/components/room/scoreboard";
import { BidCard } from "@/components/room/bid-card";
import { SoldList } from "@/components/room/sold-list";
import { AssignDialog } from "@/components/room/assign-dialog";
import { upcomingCount } from "@/components/room/utils";
import type { PublicRoom } from "@/lib/types";

export function AuctionStage({
  room,
  onUnsold,
  onReset,
}: {
  room: PublicRoom;
  onUnsold: () => void;
  onReset: () => void;
}) {
  const [assignOpen, setAssignOpen] = useState(false);
  const isHost = room.viewer.isHost;
  const current = room.pool.find((e) => e.id === room.currentEntryId);

  if (!current) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Nothing up for auction</CardTitle>
          <CardDescription>
            The pool may be empty. {isHost ? "You can reset and replay." : "Wait for the host."}
          </CardDescription>
        </CardHeader>
        {isHost && (
          <CardContent>
            <Button variant="outline" onClick={onReset}>
              <RefreshCw /> Reset room
            </Button>
          </CardContent>
        )}
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col gap-6">
          <BidCard entry={current} hiddenPts={current.pts === null} />

          <div className="flex flex-col gap-3">
            {isHost ? (
              <>
                <Button onClick={() => setAssignOpen(true)} className="h-11 text-base">
                  Sell to a seat…
                </Button>
                <div className="flex items-center justify-between gap-2">
                  <Button variant="outline" onClick={onUnsold} className="flex-1">
                    Pass (unsold)
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    {upcomingCount(room)} left after this
                  </span>
                </div>
              </>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-between gap-2 pt-4">
                  <p className="text-sm text-muted-foreground">
                    {room.viewer.seat
                      ? "Bid out loud to the host!"
                      : "Waiting for the host to sell the player."}
                  </p>
                  {room.blindMode && current.pts === null && (
                    <Badge variant="outline" className="shrink-0">pts hidden</Badge>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <section>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Formations
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {[1, 2, 3, 4].map((seat) => (
                <Pitch key={seat} room={room} seat={seat} />
              ))}
            </div>
          </section>
        </div>

        <aside className="flex flex-col gap-6">
          <Card size="sm">
            <CardHeader>
              <CardTitle className="text-sm">Live scoreboard</CardTitle>
            </CardHeader>
            <CardContent>
              <Scoreboard room={room} />
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader>
              <CardTitle className="text-sm">Recent sales</CardTitle>
            </CardHeader>
            <SoldList room={room} />
          </Card>
        </aside>
      </div>

      <AssignDialog
        room={room}
        entry={current}
        open={assignOpen}
        onOpenChange={setAssignOpen}
      />
    </>
  );
}