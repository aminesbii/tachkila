"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Copy, LogOut, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { fetchRoom, getToken, markUnsold, resetRoom, startAuction } from "@/lib/api-client";
import { upcomingCount } from "@/components/room/utils";
import { LobbyPanel } from "@/components/room/lobby-panel";
import { AuctionStage } from "@/components/room/auction-stage";
import { ResultsPanel } from "@/components/room/results-panel";

export function RoomView({ code }: { code: string }) {
  const router = useRouter();
  const qc = useQueryClient();
  const [copied, setCopied] = useState(false);

  const roomKey = ["room", code];

  const { data, isPending, error, isError } = useQuery({
    queryKey: roomKey,
    queryFn: () => fetchRoom(code, getToken(code)),
    refetchInterval: 2000,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: roomKey });

  const start = useMutation({ mutationFn: () => startAuction(code, getToken(code) ?? ""), onSuccess: invalidate });
  const reset = useMutation({ mutationFn: () => resetRoom(code, getToken(code) ?? ""), onSuccess: invalidate });
  const unsold = useMutation({ mutationFn: () => markUnsold(code, getToken(code) ?? ""), onSuccess: invalidate });

  async function copyCode() {
    if (!data) return;
    try {
      await navigator.clipboard.writeText(data.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-3 py-4 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <button
              onClick={copyCode}
              className="group inline-flex items-baseline gap-2 rounded-lg px-2 py-1 transition-colors hover:bg-muted"
              title="Copy room code"
            >
              <span className="text-3xl font-black tracking-widest">{data?.code ?? "·····"}</span>
              <Copy className="size-4 text-muted-foreground group-hover:text-foreground" />
            </button>
            {copied && <span className="text-xs font-medium text-emerald-600">copied!</span>}
          </div>
          <p className="text-xs text-muted-foreground">
            Formation {data?.formationLabel ?? "—"} · {data?.blindMode ? "Blind mode" : "Open points"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {data && data.status !== "finished" && (
            <Badge variant="secondary" className="h-6">
              {data.status === "lobby" ? "Lobby" : `${upcomingCount(data)} players left`}
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
            <LogOut /> Leave
          </Button>
        </div>
      </header>

      <Separator className="my-4" />

      <main className="flex flex-1 flex-col gap-6 pb-16">
        {isPending && (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground">
            <RefreshCw className="size-6 animate-spin" />
            <p className="text-sm">Waiting for room…</p>
          </div>
        )}

        {isError && (
          <Card>
            <CardHeader>
              <CardTitle>Room unavailable</CardTitle>
              <CardDescription>
                {error?.message ?? "Could not load this room."} You can try joining again.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button asChild variant="outline">
                <Link href="/join">Join a room</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/">Back home</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {data && data.status === "lobby" && (
          <LobbyPanel room={data} onStart={() => start.mutate()} starting={start.isPending} />
        )}
        {data && data.status === "auction" && (
          <AuctionStage room={data} onUnsold={() => unsold.mutate()} onReset={() => reset.mutate()} />
        )}
        {data && data.status === "finished" && (
          <ResultsPanel room={data} onReset={() => reset.mutate()} />
        )}
      </main>
    </div>
  );
}