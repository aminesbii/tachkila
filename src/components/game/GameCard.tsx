import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { AppText } from "@/components/ui/AppText";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { GameSummary, RoomStatus } from "@/engine/types";
import { formatRelative } from "@/lib/display";
import { colors, radii, spacing } from "@/theme";

const STATUS: Record<RoomStatus, { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }> = {
  lobby: { label: "Lobby", color: colors.info, icon: "people-outline" },
  auction: { label: "Live", color: colors.primary, icon: "radio-outline" },
  finished: { label: "Finished", color: colors.gold, icon: "trophy-outline" },
};

export function GameCard({
  game,
  onPress,
  onLongPress,
}: {
  game: GameSummary;
  onPress: () => void;
  onLongPress?: () => void;
}) {
  const status = STATUS[game.status];
  const progress = game.totalEntries === 0 ? 0 : game.soldCount / game.totalEntries;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${game.formationLabel} game ${game.code}, ${status.label}`}
      accessibilityHint="Open this game"
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={350}
      android_ripple={{ color: "rgba(255,255,255,0.06)" }}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.85, transform: [{ scale: 0.995 }] }]}
    >
      <View style={styles.top}>
        <View style={[styles.badge, { borderColor: status.color + "44", backgroundColor: status.color + "14" }]}>
          <Ionicons name={status.icon} size={11} color={status.color} />
          <AppText variant="label" color={status.color} style={styles.badgeText}>
            {status.label}
          </AppText>
        </View>
        <AppText variant="mono" color={colors.textDim}>
          {game.code}
        </AppText>
      </View>

      <View style={styles.middle}>
        <View style={{ flex: 1, gap: 2 }}>
          <AppText variant="heading" numberOfLines={1}>
            {game.playerNames.join(" · ")}
          </AppText>
          <AppText variant="caption" color={colors.textMuted} numberOfLines={1}>
            {game.formationLabel} · {game.totalEntries} footballers · {game.playerNames.length} managers
          </AppText>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textDim} />
      </View>

      <View style={styles.progressRow}>
        <ProgressBar value={progress} color={status.color} height={5} />
        <AppText variant="caption" color={colors.textMuted} style={styles.progressText}>
          {game.soldCount}/{game.totalEntries}
        </AppText>
      </View>

      <View style={styles.bottom}>
        <View style={styles.footerItem}>
          <Ionicons name="time-outline" size={11} color={colors.textDim} />
          <AppText variant="caption" color={colors.textDim} style={styles.footerText}>
            {formatRelative(game.updatedAt)}
          </AppText>
        </View>
        {game.status === "auction" && game.currentName ? (
          <View style={styles.footerItem}>
            <Ionicons name="pricetag-outline" size={11} color={colors.primary} />
            <AppText variant="caption" color={colors.textMuted} numberOfLines={1} style={styles.footerText}>
              Bidding on {game.currentName}
            </AppText>
          </View>
        ) : game.status === "lobby" ? (
          <AppText variant="caption" color={colors.textDim} style={styles.footerText}>
            Ready to start
          </AppText>
        ) : (
          <AppText variant="caption" color={colors.textDim} style={styles.footerText}>
            Final table ready
          </AppText>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 9,
    letterSpacing: 1,
  },
  middle: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  progressText: {
    fontVariant: ["tabular-nums"],
    fontSize: 11,
    minWidth: 42,
    textAlign: "right",
  },
  bottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  footerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexShrink: 1,
  },
  footerText: {
    fontSize: 11,
    lineHeight: 14,
  },
});
