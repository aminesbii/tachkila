"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RoomView } from "@/components/room/room-view";
import { normalizeCode } from "@/lib/room-store";

function RoomScreen() {
  const params = useSearchParams();
  const code = normalizeCode(params.get("code") ?? "");

  if (!code) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle>No room code</CardTitle>
            <CardDescription>
              This screen opens a room saved on your phone. Create a room first and the code comes with it.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button asChild>
              <Link href="/create">Create a room</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Back home</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return <RoomView code={code} />;
}

export default function RoomPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-muted-foreground">
          <RefreshCw className="size-6 animate-spin" />
        </div>
      }
    >
      <RoomScreen />
    </Suspense>
  );
}
