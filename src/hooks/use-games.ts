import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";

import type { GameSummary } from "@/engine/types";
import { roomRepository } from "@/storage/async-storage";

export interface UseGamesResult {
  games: GameSummary[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  remove: (code: string) => Promise<void>;
  clear: () => Promise<void>;
}

export function useGames(): UseGamesResult {
  const [games, setGames] = useState<GameSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setGames(await roomRepository.list());
      setError(null);
    } catch {
      setError("Could not read saved games.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh])
  );

  const remove = useCallback(
    async (code: string) => {
      await roomRepository.remove(code);
      await refresh();
    },
    [refresh]
  );

  const clear = useCallback(async () => {
    await roomRepository.clear();
    await refresh();
  }, [refresh]);

  return { games, loading, error, refresh, remove, clear };
}
