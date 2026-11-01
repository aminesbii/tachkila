"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createLocalRoom } from "@/lib/room-store";
import { isGameError } from "@/lib/room-reducer";
import {
  RoomSetupForm,
  defaultSetup,
  type RoomSetupValue,
} from "@/components/room/room-setup-form";

export default function CreatePage() {
  const router = useRouter();
  const [setup, setSetup] = useState<RoomSetupValue>(defaultSetup());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(next: RoomSetupValue) {
    setSubmitting(true);
    setError(null);
    try {
      const { code } = createLocalRoom({
        playerNames: next.playerNames,
        formationKey: next.formationKey,
      });
      router.push(`/room/?code=${code}`);
    } catch (err) {
      setError(isGameError(err) ? err.message : "Could not create the room.");
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create a room</CardTitle>
          <CardDescription>
            You run the auction as the host. You do not play and you hold no points — pick the formation, pick
            the 2–6 game players around the table, and you have all the information on screen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RoomSetupForm
            value={setup}
            onChange={setSetup}
            onSubmit={handleSubmit}
            submitLabel="Create room"
            pendingLabel="Creating room…"
            submitting={submitting}
            error={error}
          />

          <div className="mt-5 flex flex-col gap-2 border-t pt-4 text-xs text-muted-foreground">
            <p>
              Game players never join the room and never touch a device: they bid out loud, the host enters the
              winning bid and assigns the footballer.
            </p>
            <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="self-start px-0">
              ← Back home
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
