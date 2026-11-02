import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { colors, spacing } from "@/theme";

export function StepDots({ step, total = 3 }: { step: number; total?: number }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.dots}>
        {Array.from({ length: total }, (_, index) => {
          const active = index === step;
          const done = index < step;
          return (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  width: active ? 22 : 7,
                  backgroundColor: active ? colors.primary : done ? colors.primaryDeep : colors.borderStrong,
                },
              ]}
            />
          );
        })}
      </View>
      <AppText variant="caption" color={colors.textDim} style={styles.label}>
        Step {step + 1} of {total}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  dots: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  dot: {
    height: 7,
    borderRadius: 4,
  },
  label: {
    fontVariant: ["tabular-nums"],
  },
});
