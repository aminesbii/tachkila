import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { PitchDiagram } from "@/components/game/PitchDiagram";
import { FORMATION_DEFS } from "@/engine/formations";
import type { Formation } from "@/engine/types";
import { colors, radii, spacing } from "@/theme";

export function FormationPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (key: string) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      style={styles.scroll}
    >
      {FORMATION_DEFS.map((formation) => {
        const selected = formation.key === value;
        return (
          <Pressable
            key={formation.key}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={`${formation.label} formation`}
            onPress={() => onChange(formation.key)}
            style={({ pressed }) => [
              styles.card,
              selected && { borderColor: colors.primary, backgroundColor: colors.primarySoft },
              pressed && { opacity: 0.85 },
            ]}
          >
            <PitchDiagram
              formation={formation.counts as Formation}
              dot={5}
              gap={4}
              color={selected ? colors.primary : colors.textMuted}
            />
            <View style={styles.footer}>
              <AppText variant={selected ? "bodyStrong" : "body"} color={selected ? colors.primary : colors.text}>
                {formation.label}
              </AppText>
              <AppText variant="caption" color={colors.textDim} style={styles.hint}>
                {formation.counts.DEF}-{formation.counts.MID}-{formation.counts.FWD}
              </AppText>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    marginHorizontal: -spacing.lg,
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  card: {
    width: 92,
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
  },
  footer: {
    alignItems: "center",
    gap: 1,
  },
  hint: {
    fontSize: 9,
    letterSpacing: 0.5,
  },
});
