import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { AppText } from "@/components/ui/AppText";
import { PlayerAvatar } from "@/components/game/PlayerAvatar";
import type { PublicPoolEntry } from "@/engine/types";
import { flagFor, playerPhoto } from "@/lib/display";
import { ptsColor } from "@/lib/game-view";
import { colors, radii, spacing } from "@/theme";

export function PlayerCard({ entry }: { entry: PublicPoolEntry }) {
  const accent = ptsColor(entry.pts);
  return (
    <LinearGradient
      colors={["#143C2C", "#0A1F17"]}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={styles.card}
    >
      <View pointerEvents="none" style={[styles.glow, { backgroundColor: accent }]} />

      <View style={styles.topRow}>
        <View style={styles.tag}>
          <View style={styles.liveDot} />
          <AppText variant="label" color={colors.primary}>
            Up for auction
          </AppText>
        </View>
        <View style={[styles.position, { borderColor: accent + "66" }]}>
          <AppText variant="label" color={accent}>
            {entry.position}
          </AppText>
        </View>
      </View>

      <View style={styles.avatarWrap}>
        <PlayerAvatar
          name={entry.name}
          imageUrl={playerPhoto(entry)}
          size={132}
          color={accent}
          ring
        />
      </View>

      <View style={styles.identity}>
        <AppText variant="title" align="center" numberOfLines={2} style={styles.name}>
          {entry.name}
        </AppText>
        <View style={styles.nationality}>
          <AppText style={styles.flag}>{flagFor(entry.nationality)}</AppText>
          <AppText variant="caption" color={colors.textMuted}>
            {entry.nationality || "Free agent"} · {entry.position === "GK" ? "Goalkeeper" : entry.position === "DEF" ? "Defender" : entry.position === "MID" ? "Midfielder" : "Forward"}
          </AppText>
        </View>
      </View>

      <View style={styles.ptsRow}>
        <View style={[styles.ptsBadge, { backgroundColor: accent }]}>
          <Ionicons name="star" size={14} color="#07100C" />
          <AppText style={styles.ptsText}>{entry.pts} PTS</AppText>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    padding: spacing.xl,
    overflow: "hidden",
    minHeight: 330,
    justifyContent: "space-between",
  },
  glow: {
    position: "absolute",
    width: 190,
    height: 190,
    borderRadius: 95,
    opacity: 0.12,
    top: -70,
    right: -50,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radii.pill,
    backgroundColor: "rgba(56,225,160,0.1)",
    borderWidth: 1,
    borderColor: "rgba(56,225,160,0.24)",
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  position: {
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  avatarWrap: {
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  identity: {
    alignItems: "center",
    gap: spacing.xs,
  },
  name: {
    fontSize: 30,
    lineHeight: 34,
  },
  nationality: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  flag: {
    fontSize: 15,
    lineHeight: 18,
  },
  ptsRow: {
    alignItems: "center",
    paddingTop: spacing.md,
  },
  ptsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
  },
  ptsText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#07100C",
    letterSpacing: 1,
  },
});
