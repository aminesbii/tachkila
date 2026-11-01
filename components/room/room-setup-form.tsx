"use client";

import { useState } from "react";
import { Loader2, Shuffle, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DEFAULT_FORMATION,
  FORMATION_DEFS,
  GAME_PLAYER_COUNTS,
  MAX_GAME_PLAYERS,
  poolBreakdown,
  poolSize,
  totalSlots,
} from "@/lib/formations";
import { POSITION_SHORT_LABEL } from "@/components/room/utils";
import { cn } from "@/lib/utils";

export interface RoomSetupValue {
  formationKey: string;
  playerNames: string[];
}

export function normalizePlayerNames(names: readonly string[], count: number): string[] {
  return Array.from({ length: count }, (_, i) => names[i]?.trim() || `Player ${i + 1}`);
}

export function defaultSetup(count = 4): RoomSetupValue {
  return { formationKey: DEFAULT_FORMATION, playerNames: normalizePlayerNames([], count) };
}

function validate(value: RoomSetupValue): string | null {
  if (value.playerNames.length === 0) return "Add at least one game player.";
  if (value.playerNames.some((n) => !n.trim())) return "Give every game player a name.";
  if (new Set(value.playerNames.map((n) => n.trim().toLowerCase())).size !== value.playerNames.length) {
    return "Every game player needs a different name.";
  }
  return null;
}

export function RoomSetupForm({
  value,
  onChange,
  onSubmit,
  submitLabel,
  pendingLabel,
  submitting,
  error,
}: {
  value: RoomSetupValue;
  onChange: (next: RoomSetupValue) => void;
  onSubmit: (next: RoomSetupValue) => void;
  submitLabel: string;
  pendingLabel: string;
  submitting: boolean;
  error: string | null;
}) {
  const [localError, setLocalError] = useState<string | null>(null);
  const count = value.playerNames.length;
  const counts = FORMATION_DEFS.find((f) => f.key === value.formationKey)?.counts ?? FORMATION_DEFS[0].counts;
  const slots = totalSlots(counts);
  const breakdown = poolBreakdown(counts, count);

  function patch(next: Partial<RoomSetupValue>) {
    setLocalError(null);
    onChange({ ...value, ...next });
  }

  function setCount(next: number) {
    patch({ playerNames: normalizePlayerNames(value.playerNames, next) });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: RoomSetupValue = {
      formationKey: value.formationKey,
      playerNames: normalizePlayerNames(value.playerNames, count),
    };
    const message = validate(next);
    if (message) {
      setLocalError(message);
      return;
    }
    setLocalError(null);
    onChange(next);
    onSubmit(next);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label>Formation</Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {FORMATION_DEFS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => patch({ formationKey: f.key })}
              className={cn(
                "rounded-lg border px-3 py-2 text-left transition-colors",
                value.formationKey === f.key
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
      </div>

      <div className="flex flex-col gap-2">
        <Label className="flex items-center gap-2">
          <Users className="size-4" /> Game players in this pool
        </Label>
        <div className="flex flex-wrap gap-2">
          {GAME_PLAYER_COUNTS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setCount(n)}
              className={cn(
                "rounded-lg border px-4 py-2 text-sm font-semibold transition-colors",
                count === n
                  ? "border-primary bg-primary/10 ring-1 ring-primary"
                  : "border-border bg-background hover:bg-muted"
              )}
            >
              {n}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          {count} game {count === 1 ? "player" : "players"} × {slots} slots ={" "}
          <span className="font-semibold text-foreground">{poolSize(counts, count)}</span> footballers, freshly
          randomized for this room. Max {MAX_GAME_PLAYERS}.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Game player names</Label>
        <div className="grid gap-2 sm:grid-cols-2">
          {value.playerNames.map((name, i) => (
            <Input
              key={i}
              value={name}
              onChange={(e) =>
                patch({ playerNames: value.playerNames.map((n, j) => (j === i ? e.target.value : n)) })
              }
              placeholder={`Player ${i + 1}`}
              maxLength={24}
            />
          ))}
        </div>
      </div>

      <div className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
        <p className="mb-1 font-semibold text-foreground">Pool &amp; auction order</p>
        <p>
          {count} × {slots} = {poolSize(counts, count)} footballers:{" "}
          {(["GK", "DEF", "MID", "FWD"] as const)
            .map((pos) => `${breakdown[pos]} ${POSITION_SHORT_LABEL[pos]}`)
            .join(" · ")}
        </p>
        <p className="mt-1">
          Goalkeepers first, then defenders, midfielders and finally attackers — each group left to right across
          the pitch. Every room is drawn from a different random shuffle.
        </p>
      </div>

      {(localError || error) && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {localError ?? error}
        </p>
      )}

      <Button type="submit" disabled={submitting} className="h-10 text-base">
        {submitting ? <Loader2 className="animate-spin" /> : <Shuffle />}
        {submitting ? pendingLabel : submitLabel}
      </Button>
    </form>
  );
}
