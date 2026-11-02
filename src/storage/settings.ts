import AsyncStorage from "@react-native-async-storage/async-storage";

const SETTINGS_KEY = "tachkila.settings.v1";

export interface AppSettings {
  haptics: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  haptics: true,
};

export async function loadSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return DEFAULT_SETTINGS;
    const value = parsed as Partial<AppSettings>;
    return { haptics: value.haptics !== false };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Settings are a nice-to-have; never crash the game over them.
  }
}
