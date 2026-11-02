import { useCallback, useEffect, useRef, useState } from "react";

import { serializeRoom } from "@/engine/game";
import { isGameError } from "@/engine/room-reducer";
import type { PublicRoom, RoomDoc } from "@/engine/types";
import { roomRepository } from "@/storage/async-storage";
import { normalizeCode } from "@/storage/room-repository";
import type { CreateGameInput } from "@/storage/room-repository";

function messageOf(error: unknown): string {
  if (isGameError(error)) return error.message;
  return "Something went wrong. Please try again.";
}

export interface UseRoomResult {
  room: PublicRoom | null;
  loading: boolean;
  busy: boolean;
  error: string | null;
  notFound: boolean;
  undoAvailable: boolean;
  start: () => Promise<boolean>;
  assign: (entryId: string, seat: number, bid: number) => Promise<boolean>;
  pass: () => Promise<boolean>;
  reset: () => Promise<boolean>;
  updateSettings: (input: CreateGameInput) => Promise<boolean>;
  undo: () => Promise<boolean>;
}

export function useRoom(rawCode: string): UseRoomResult {
  const code = normalizeCode(rawCode);
  const [room, setRoom] = useState<PublicRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [undoAvailable, setUndoAvailable] = useState(false);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const adopt = useCallback(
    async (doc: RoomDoc) => {
      setRoom(serializeRoom(doc, code));
      const canUndo = await roomRepository.canUndo(code);
      if (alive.current) setUndoAvailable(canUndo);
    },
    [code]
  );

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      // Yield once so every update below happens outside the synchronous part
      // of the effect; the first render already shows `loading: true`.
      await Promise.resolve();
      if (cancelled) return;

      if (!code) {
        setLoading(false);
        setNotFound(true);
        setError("No game code was provided.");
        return;
      }

      try {
        const doc = await roomRepository.load(code);
        if (cancelled || !alive.current) return;
        if (!doc) {
          setRoom(null);
          setNotFound(true);
          setUndoAvailable(false);
        } else {
          setNotFound(false);
          await adopt(doc);
        }
      } catch (err) {
        if (!cancelled && alive.current) setError(messageOf(err));
      } finally {
        if (!cancelled && alive.current) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [adopt, code]);

  const apply = useCallback(
    async (action: (target: string) => Promise<RoomDoc>): Promise<boolean> => {
      if (!code) return false;
      setBusy(true);
      setError(null);
      try {
        const doc = await action(code);
        if (!alive.current) return true;
        await adopt(doc);
        setNotFound(false);
        return true;
      } catch (err) {
        if (alive.current) setError(messageOf(err));
        return false;
      } finally {
        if (alive.current) setBusy(false);
      }
    },
    [adopt, code]
  );

  const start = useCallback(() => apply(roomRepository.start), [apply]);
  const assign = useCallback(
    (entryId: string, seat: number, bid: number) =>
      apply((target) => roomRepository.assign(target, { entryId, seat, bid })),
    [apply]
  );
  const pass = useCallback(() => apply(roomRepository.pass), [apply]);
  const reset = useCallback(() => apply(roomRepository.reset), [apply]);
  const updateSettings = useCallback(
    (input: CreateGameInput) => apply((target) => roomRepository.updateSettings(target, input)),
    [apply]
  );

  const undo = useCallback(async (): Promise<boolean> => {
    if (!code) return false;
    setBusy(true);
    setError(null);
    try {
      const doc = await roomRepository.undo(code);
      if (!doc) {
        if (alive.current) setError("Nothing to undo.");
        return false;
      }
      if (!alive.current) return true;
      await adopt(doc);
      return true;
    } catch (err) {
      if (alive.current) setError(messageOf(err));
      return false;
    } finally {
      if (alive.current) setBusy(false);
    }
  }, [adopt, code]);

  return {
    room,
    loading,
    busy,
    error,
    notFound,
    undoAvailable,
    start,
    assign,
    pass,
    reset,
    updateSettings,
    undo,
  };
}
