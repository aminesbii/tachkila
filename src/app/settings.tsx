import { useState } from "react";
import { Alert, Pressable, StyleSheet, Switch, View } from "react-native";
import Constants from "expo-constants";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppHeader } from "@/components/ui/AppHeader";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { useToast } from "@/components/ui/Toast";
import { useSettings } from "@/hooks/use-settings";
import { hapticSelect, hapticTap } from "@/lib/feedback";
import { roomRepository } from "@/storage/async-storage";
import { colors, spacing } from "@/theme";

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { settings, setHaptics } = useSettings();
  const { showToast } = useToast();
  const [clearing, setClearing] = useState(false);

  const version = Constants.expoConfig?.version ?? "1.0.0";

  function clearAll() {
    hapticTap();
    Alert.alert(
      "Delete every game?",
      "All saved auctions, squads and results will be removed from this phone. This cannot be undone.",
      [
        { text: "Keep games", style: "cancel" },
        {
          text: "Delete all",
          style: "destructive",
          onPress: async () => {
            setClearing(true);
            await roomRepository.clear();
            setClearing(false);
            showToast("All saved games removed", "info");
          },
        },
      ]
    );
  }

  return (
    <Screen
      header={<AppHeader title="Settings" subtitle="Small app, few knobs" onBack={() => router.back()} />}
      contentStyle={{ paddingBottom: insets.bottom + spacing.xxxl }}
    >
      <View style={styles.block}>
        <SectionTitle>Feedback</SectionTitle>
        <Card padded={false}>
          <View style={styles.row}>
            <View style={styles.rowIcon}>
              <Ionicons name="phone-portrait-outline" size={17} color={colors.primary} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <AppText variant="bodyStrong">Haptics</AppText>
              <AppText variant="caption" color={colors.textMuted}>
                A short tap when a sale closes or a step is confirmed.
              </AppText>
            </View>
            <Switch
              value={settings.haptics}
              onValueChange={(value) => {
                setHaptics(value);
                if (value) hapticSelect();
              }}
              trackColor={{ false: colors.surfaceHigh, true: colors.primaryDeep }}
              thumbColor={settings.haptics ? colors.primary : colors.textMuted}
              ios_backgroundColor={colors.surfaceHigh}
            />
          </View>
        </Card>
      </View>

      <View style={styles.block}>
        <SectionTitle>Data</SectionTitle>
        <Card padded={false}>
          <View style={styles.row}>
            <View style={styles.rowIcon}>
              <Ionicons name="cloud-offline-outline" size={17} color={colors.info} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <AppText variant="bodyStrong">Offline by design</AppText>
              <AppText variant="caption" color={colors.textMuted}>
                No account, no server. Every game lives in this phone&apos;s local storage.
              </AppText>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={[styles.row, styles.dangerRow]}>
            <View style={[styles.rowIcon, { backgroundColor: colors.dangerSoft }]}>
              <Ionicons name="trash-outline" size={17} color={colors.danger} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <AppText variant="bodyStrong" color={colors.danger}>
                Delete all games
              </AppText>
              <AppText variant="caption" color={colors.textMuted}>
                Clears every saved auction from this phone.
              </AppText>
            </View>
          </View>
          <View style={styles.actionWrap}>
            <Button
              label="Delete all saved games"
              variant="danger"
              size="sm"
              loading={clearing}
              onPress={clearAll}
              icon={<Ionicons name="trash-outline" size={15} color={colors.danger} />}
            />
          </View>
        </Card>
      </View>

      <View style={styles.block}>
        <SectionTitle>About</SectionTitle>
        <Card padded={false}>
          <View style={styles.row}>
            <View style={styles.brandMark}>
              <Ionicons name="football" size={18} color={colors.textInverse} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <AppText variant="bodyStrong">Tachkila</AppText>
              <AppText variant="caption" color={colors.textMuted}>
                Version {version} · auction draft for one phone
              </AppText>
            </View>
          </View>
          <View style={styles.divider} />
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/rules")}
            style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
          >
            <View style={styles.rowIcon}>
              <Ionicons name="book-outline" size={17} color={colors.text} />
            </View>
            <AppText variant="bodyStrong" style={{ flex: 1 }}>
              How to play
            </AppText>
            <Ionicons name="chevron-forward" size={15} color={colors.textDim} />
          </Pressable>
        </Card>
      </View>

      <AppText variant="caption" color={colors.textDim} align="center" style={styles.footer}>
        Made for the table. No accounts, no ads, no tracking.
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  dangerRow: {
    paddingBottom: spacing.xs,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: spacing.lg,
  },
  actionWrap: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  brandMark: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    marginTop: spacing.lg,
  },
});
