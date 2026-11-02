import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { setHapticsEnabled } from "@/lib/feedback";
import { DEFAULT_SETTINGS, loadSettings, saveSettings, type AppSettings } from "@/storage/settings";

interface SettingsContextValue {
  settings: AppSettings;
  ready: boolean;
  setHaptics: (enabled: boolean) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    void loadSettings().then((loaded) => {
      if (!alive) return;
      setSettings(loaded);
      setHapticsEnabled(loaded.haptics);
      setReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  const setHaptics = useCallback((enabled: boolean) => {
    setHapticsEnabled(enabled);
    setSettings((current) => {
      const next = { ...current, haptics: enabled };
      void saveSettings(next);
      return next;
    });
  }, []);

  const value = useMemo(() => ({ settings, ready, setHaptics }), [settings, ready, setHaptics]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) throw new Error("useSettings must be used inside SettingsProvider");
  return context;
}
