"use client";

import { useState } from "react";
import { RefreshCw, SkipForward } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pitch } from "@/components/room/pitch";
import { Scoreboard } from "@/components/room/scoreboard";
import { BidCard } from "@/components/room/bid-card";
import { SoldList } from "@/components/room/sold-list";
import { AssignDialog } from "@/components/room/assign-dialog";
import { nextEntries, upcomingCount } from "@/components/room/utils";
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
  const current = room.pool.find((e) => e.id === room.currentEntryId);
  const queue = nextEntries(room, 6);

  if (!current) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Nothing up for auction</CardTitle>
          <CardDescription>
            The pool may be empty. You can reset and replay.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={onReset}>
            <RefreshCw /> New random pool
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col gap-6">
          <BidCard entry={current} />

          <div className="flex flex-col gap-3">
            <Button onClick={() => setAssignOpen(true)} className="h-11 text-base">
              Enter final bid &amp; assign…
            </Button>
            <div className="flex items-center justify-between gap-2">
              <Button variant="outline" onClick={onUnsold} className="flex-1">
                <SkipForward /> Pass (unsold)
              </Button>
              <span className="text-xs text-muted-foreground">
                {upcomingCount(room)} left after this
              </span>
            </div>
          </div>

          {queue.length > 0 && (
            <section>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Coming up
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {queue.map((e) => (
                  <span
                    key={e.id}
                    className="rounded-md border border-border bg-card px-2 py-1 text-xs font-medium"
                  >
                    {e.name} <span className="text-muted-foreground">· {e.pts} pts</span>
                  </span>
                ))}
              </div>
            </section>
          )}

          <section>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Formations
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {room.participants.map((p) => (
                <Pitch key={p.seat} room={room} seat={p.seat} />
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
