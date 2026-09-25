"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FORMATION_DEFS, DEFAULT_FORMATION } from "@/lib/formations";
import { createRoom, setToken } from "@/lib/api-client";
import { ApiError } from "@/lib/api-client";
import { cn } from "@/lib/utils";

export default function CreatePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [formation, setFormation] = useState(DEFAULT_FORMATION);
  const [blindMode, setBlindMode] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Enter your name.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const { code, token } = await createRoom({ name, formationKey: formation, blindMode });
      setToken(code, token);
      router.push(`/room/${code}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create the room.");
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Host a room</CardTitle>
          <CardDescription>
            You are Player 1 (the host). Share the room code with up to 3 friends.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Your name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Amine"
                maxLength={24}
                autoFocus
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Formation</Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {FORMATION_DEFS.map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setFormation(f.key)}
                    className={cn(
                      "rounded-lg border px-3 py-2 text-left transition-colors",
                      formation === f.key
                        ? "border-primary bg-primary/10 ring-1 ring-primary"
                        : "border-border bg-background hover:bg-muted"
                    )}
                  >
                    <div className="text-base font-bold">{f.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {f.counts.DEF}-{f.counts.MID}-{f.counts.FWD} outfield
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Each position is drawn 4× — every player can build the exact same squad.
              </p>
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-background p-3">
              <input
                type="checkbox"
                checked={blindMode}
                onChange={(e) => setBlindMode(e.target.checked)}
                className="mt-0.5 size-4 accent-primary"
              />
              <span className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold">Blind mode</span>
                <span className="text-xs text-muted-foreground">
                  Player point values stay hidden until the footballer is sold.
                  Turn off to reveal points immediately.
                </span>
              </span>
            </label>

            {error && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <Button type="submit" disabled={submitting} className="h-10 text-base">
              {submitting && <Loader2 className="animate-spin" />}
              Create room
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}