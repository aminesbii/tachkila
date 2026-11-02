import { useCallback } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Screen } from "@/components/ui/Screen";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { GameCard } from "@/components/game/GameCard";
import { PitchDiagram } from "@/components/game/PitchDiagram";
import { useGames } from "@/hooks/use-games";
import { hapticTap } from "@/lib/feedback";
import { colors, radii, shadows, spacing } from "@/theme";

export default function HomeScreen() {
  const router = useRouter();
  const { games, loading, error, remove } = useGames();

  const confirmRemove = useCallback(
    (code: string, label: string) => {
      hapticTap();
      Alert.alert("Delete this game?", `${label} and its full auction history will be removed from this phone.`, [
        { text: "Keep", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => void remove(code) },
      ]);
    },
    [remove]
  );

  return (
    <Screen
      edges={["top"]}
      contentStyle={styles.content}
      footer={
        <Button
          label="New game"
          size="lg"
          icon={<Ionicons name="add" size={20} color={colors.textInverse} />}
          onPress={() => router.push("/new-game")}
        />
      }
    >
      <View style={styles.topBar}>
        <View style={styles.brand}>
          <View style={styles.brandMark}>
            <Ionicons name="football" size={18} color={colors.textInverse} />
          </View>
          <View>
            <AppText style={styles.brandName}>TACHKILA</AppText>
            <AppText variant="label" color={colors.textDim} style={styles.brandTag}>
              Auction night
            </AppText>
          </View>
        </View>
        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="How to play"
            hitSlop={8}
            onPress={() => router.push("/rules")}
            style={({ pressed }) => [styles.iconButton, pressed && { opacity: 0.65 }]}
          >
            <Ionicons name="book-outline" size={19} color={colors.textMuted} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Settings"
            hitSlop={8}
            onPress={() => router.push("/settings")}
            style={({ pressed }) => [styles.iconButton, pressed && { opacity: 0.65 }]}
          >
            <Ionicons name="settings-outline" size={19} color={colors.textMuted} />
          </Pressable>
        </View>
      </View>

      <LinearGradient
        colors={["#123A2B", "#0A1D16"]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={styles.hero}
      >
        <View pointerEvents="none" style={styles.heroGlow} />
        <View style={styles.heroContent}>
          <View style={styles.heroBadge}>
            <View style={styles.liveDot} />
            <AppText variant="label" color={colors.primary}>
              One phone · full control
            </AppText>
          </View>
          <AppText variant="title" style={styles.heroTitle}>
            Run the draft.{`\n`}Crown a champion.
          </AppText>
          <AppText variant="body" color={colors.textMuted} style={styles.heroBody}>
            Put the phone on the table. Every bid is shouted, you type the final price and the squad builds
            itself.
          </AppText>
        </View>
        <View pointerEvents="none" style={styles.heroPitch}>
          <PitchDiagram formation={{ GK: 1, DEF: 4, MID: 3, FWD: 3 }} dot={7} gap={7} color="rgba(56,225,160,0.55)" />
        </View>
      </LinearGradient>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <AppText variant="score">{games.length}</AppText>
          <AppText variant="caption" color={colors.textDim}>
            saved {games.length === 1 ? "game" : "games"}
          </AppText>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <AppText variant="score">{games.filter((game) => game.status === "auction").length}</AppText>
          <AppText variant="caption" color={colors.textDim}>
            live now
          </AppText>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <AppText variant="score">{games.filter((game) => game.status === "finished").length}</AppText>
          <AppText variant="caption" color={colors.textDim}>
            finished
          </AppText>
        </View>
      </View>

      <SectionTitle
        style={styles.sectionTitle}
        right={
          games.length > 0 ? (
            <AppText variant="caption" color={colors.textDim}>
              Hold a card to delete
            </AppText>
          ) : null
        }
      >
        Your games
      </SectionTitle>

      {error ? (
        <AppText variant="caption" color={colors.danger}>
          {error}
        </AppText>
      ) : null}

      {games.length === 0 && !loading ? (
        <EmptyState
          icon="albums-outline"
          title="No auction yet"
          body="Create a game, add the managers around the table and start the bidding. Everything is saved on this phone."
        />
      ) : (
        <View style={styles.list}>
          {games.map((game) => (
            <GameCard
              key={game.code}
              game={game}
              onPress={() =>
                router.push({ pathname: "/game/[code]", params: { code: game.code } })
              }
              onLongPress={() => confirmRemove(game.code, `${game.formationLabel} · ${game.code}`)}
            />
          ))}
        </View>
      )}

      <View style={styles.footnote}>
        <Ionicons name="lock-closed-outline" size={12} color={colors.textDim} />
        <AppText variant="caption" color={colors.textDim}>
          Games stay on this device. No account, no server.
        </AppText>
      </View>

    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.xl,
    paddingBottom: 140,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  brandMark: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: {
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 2.4,
  },
  brandTag: {
    fontSize: 9,
    letterSpacing: 2.6,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  hero: {
    borderRadius: radii.xl,
    padding: spacing.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(56,225,160,0.18)",
    minHeight: 214,
    justifyContent: "center",
    ...shadows.card,
  },
  heroGlow: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: colors.primary,
    opacity: 0.09,
    top: -90,
    right: -40,
  },
  heroContent: {
    gap: spacing.sm,
    maxWidth: "76%",
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  heroTitle: {
    fontSize: 30,
    lineHeight: 34,
  },
  heroBody: {
    fontSize: 13,
    lineHeight: 19,
  },
  heroPitch: {
    position: "absolute",
    right: -6,
    top: 0,
    bottom: 0,
    width: 128,
    justifyContent: "center",
    opacity: 0.9,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stat: {
    flex: 1,
    alignItems: "center",
    gap: 1,
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: "stretch",
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  sectionTitle: {
    marginTop: spacing.sm,
  },
  list: {
    gap: spacing.md,
  },
  footnote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    marginTop: spacing.sm,
  },
});
