import { ScrollView, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { AppText } from "@/components/ui/AppText";
import type { PublicPoolEntry } from "@/engine/types";
import { ptsColor } from "@/lib/game-view";
import { colors, radii, spacing } from "@/theme";

export function UpcomingStrip({ entries }: { entries: PublicPoolEntry[] }) {
  if (entries.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.heading}>
        <Ionicons name="time-outline" size={13} color={colors.textDim} />
        <AppText variant="label" color={colors.textMuted}>
          Coming up
        </AppText>
        <AppText variant="caption" color={colors.textDim}>
          {entries.length} queued
        </AppText>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {entries.map((entry) => (
          <View key={entry.id} style={styles.chip}>
            <View style={[styles.dot, { backgroundColor: ptsColor(entry.pts) }]} />
            <View style={styles.chipText}>
              <AppText variant="caption" numberOfLines={1} style={styles.name}>
                {entry.name}
              </AppText>
              <AppText variant="caption" color={colors.textDim} style={styles.meta}>
                {entry.position} · {entry.pts} pts
              </AppText>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  heading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    maxWidth: 168,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  chipText: {
    flexShrink: 1,
  },
  name: {
    fontSize: 12,
    lineHeight: 16,
  },
  meta: {
    fontSize: 10,
    lineHeight: 13,
  },
});
