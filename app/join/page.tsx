"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError, joinRoom, setToken } from "@/lib/api-client";

export default function JoinPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
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
      const { code: roomCode, token } = await joinRoom({ code, name });
      setToken(roomCode, token);
      router.push(`/room/${roomCode}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not join the room.");
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Join a room</CardTitle>
          <CardDescription>Enter the room code shared by your host.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="code">Room code</Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 5))}
                placeholder="ABC12"
                className="text-center text-xl font-black tracking-[0.5em]"
                maxLength={5}
                autoFocus
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Your name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Yassine"
                maxLength={24}
              />
            </div>

            {error && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <Button type="submit" disabled={submitting} className="h-10 text-base">
              {submitting && <Loader2 className="animate-spin" />}
              Join room
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}