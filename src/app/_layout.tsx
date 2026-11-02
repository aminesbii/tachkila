import { useEffect } from "react";
import { DarkTheme, Stack, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import * as SystemUI from "expo-system-ui";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ToastProvider } from "@/components/ui/Toast";
import { SettingsProvider, useSettings } from "@/hooks/use-settings";
import { colors } from "@/theme";

void SplashScreen.preventAutoHideAsync().catch(() => undefined);
void SystemUI.setBackgroundColorAsync(colors.background).catch(() => undefined);

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.backgroundElevated,
    text: colors.text,
    border: colors.border,
    primary: colors.primary,
    notification: colors.gold,
  },
};

function Root() {
  const { ready } = useSettings();

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync().catch(() => undefined);
  }, [ready]);

  return (
    <ThemeProvider value={navigationTheme}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="new-game" options={{ animation: "slide_from_bottom" }} />
        <Stack.Screen name="game/[code]" />
        <Stack.Screen name="rules" />
        <Stack.Screen name="settings" />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SettingsProvider>
          <ToastProvider>
            <Root />
          </ToastProvider>
        </SettingsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
