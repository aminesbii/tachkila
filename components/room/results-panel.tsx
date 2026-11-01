"use client";

import { Camera, RotateCcw, Trophy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pitch } from "@/components/room/pitch";
import { rankScores, scoreRoom } from "@/lib/scoring";
import { cn } from "@/lib/utils";
import type { PublicRoom } from "@/lib/types";

const MEDALS = ["bg-amber-500", "bg-zinc-400", "bg-orange-700"];

export function ResultsPanel({ room, onReset }: { room: PublicRoom; onReset: () => void }) {
  const standings = rankScores(scoreRoom(room));
  const winner = standings[0];

  return (
    <div className="flex flex-col gap-6">
      <Card className="relative overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500" />
        <CardHeader className="flex flex-col items-center gap-1 text-center">
          <Trophy className="size-10 text-amber-500" />
          <CardTitle className="text-3xl">{winner ? `${winner.name} wins!` : "Auction finished"}</CardTitle>
          {winner && (
            <CardDescription>
              {winner.score} team points · {winner.bankPoints} bank points left · {winner.acquired} players signed
            </CardDescription>
          )}
        </CardHeader>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div className="flex flex-col gap-6">
          <Card size="sm">
            <CardHeader>
              <CardTitle className="text-sm">Final standings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col">
                {standings.map((p, i) => (
                  <div
                    key={p.seat}
                    className={cn(
                      "flex items-center justify-between border-b py-2.5 text-sm last:border-b-0",
                      i === 0 && "font-extrabold"
                    )}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        className={cn(
                          "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white",
                          MEDALS[i] ?? "bg-muted text-muted-foreground"
                        )}
                      >
                        {i + 1}
                      </span>
                      <span className="truncate">{p.name}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      <Badge variant="outline" className="h-5 text-[10px]">
                        {p.bankPoints} bank
                      </Badge>
                      <span className="w-8 text-right font-black">{p.score}</span>
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader>
              <CardTitle className="text-sm">Snapshot</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Room <span className="font-mono font-bold text-foreground">{room.code}</span> ·{" "}
                {room.formationLabel} · {room.participants.length} game players · {room.totalEntries} footballers
                auctioned. You ran it as the host, so you do not score.
              </p>
              <Button
                variant="outline"
                className="mt-3"
                onClick={() => {
                  if (!winner) return;
                  navigator.clipboard
                    ?.writeText(`${winner.name} wins with ${winner.score} points!`)
                    .catch(() => undefined);
                }}
              >
                <Camera /> Copy result
              </Button>
            </CardContent>
          </Card>
        </div>

        <section>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Final formations
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {room.participants.map((p) => (
              <Pitch key={p.seat} room={room} seat={p.seat} />
            ))}
          </div>
        </section>
      </div>

      <div className="flex justify-center">
        <Button variant="outline" onClick={onReset}>
          <RotateCcw /> Play again with a new random pool
        </Button>
      </div>
    </div>
  );
}
