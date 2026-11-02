import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { AppText } from "@/components/ui/AppText";
import { colors, radii, spacing } from "@/theme";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "clear", "0", "back"] as const;

type Key = (typeof KEYS)[number];

export interface BidPadProps {
  value: string;
  onChange: (next: string) => void;
  max: number;
  disabled?: boolean;
}

/**
 * A self-contained number pad: typing a bid never opens the system keyboard,
 * which keeps the table quiet and the auction moving.
 */
export function BidPad({ value, onChange, max, disabled = false }: BidPadProps) {
  const amount = value === "" ? 0 : Number(value);
  const invalid = value !== "" && (!Number.isInteger(amount) || amount > max);

  function press(key: Key) {
    if (disabled) return;
    if (key === "clear") {
      onChange("");
      return;
    }
    if (key === "back") {
      onChange(value.slice(0, -1));
      return;
    }
    if (value.length >= 4) return;
    // Avoid leading zeroes like "05".
    if (value === "" && key === "0") return;
    onChange(`${value}${key}`);
  }

  function nudge(delta: number) {
    if (disabled) return;
    const base = value === "" ? 0 : Number(value);
    const next = Math.max(0, Math.min(max, (Number.isFinite(base) ? base : 0) + delta));
    onChange(String(next));
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.display}>
        <AppText variant="display" color={invalid ? colors.danger : colors.text} style={styles.amount}>
          {value === "" ? "0" : value}
        </AppText>
        <AppText variant="caption" color={colors.textDim}>
          of {max} bank points
        </AppText>
      </View>

      <View style={styles.quickRow}>
        {[1, 5, 10].map((delta) => (
          <Pressable
            key={delta}
            accessibilityRole="button"
            accessibilityLabel={`Add ${delta}`}
            disabled={disabled}
            onPress={() => nudge(delta)}
            style={({ pressed }) => [styles.quick, pressed && { opacity: 0.7 }]}
          >
            <AppText variant="bodyStrong" color={colors.textMuted} style={styles.quickText}>
              +{delta}
            </AppText>
          </Pressable>
        ))}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Maximum bid"
          disabled={disabled}
          onPress={() => onChange(String(max))}
          style={({ pressed }) => [styles.quick, pressed && { opacity: 0.7 }]}
        >
          <AppText variant="label" color={colors.gold} style={styles.quickText}>
            MAX
          </AppText>
        </Pressable>
      </View>

      <View style={styles.pad}>
        {KEYS.map((key) => {
          const isAction = key === "clear" || key === "back";
          return (
            <Pressable
              key={key}
              accessibilityRole="button"
              accessibilityLabel={key === "back" ? "Delete last digit" : key === "clear" ? "Clear" : key}
              disabled={disabled}
              onPress={() => press(key)}
              android_ripple={{ color: "rgba(255,255,255,0.08)" }}
              style={({ pressed }) => [
                styles.key,
                isAction && styles.actionKey,
                pressed && { backgroundColor: colors.surfaceHigh },
                disabled && { opacity: 0.4 },
              ]}
            >
              {key === "back" ? (
                <Ionicons name="backspace-outline" size={22} color={colors.textMuted} />
              ) : key === "clear" ? (
                <AppText variant="label" color={colors.textMuted}>
                  CLR
                </AppText>
              ) : (
                <AppText style={styles.keyText}>{key}</AppText>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.md,
  },
  display: {
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  amount: {
    fontSize: 48,
    lineHeight: 54,
    fontVariant: ["tabular-nums"],
  },
  quickRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  quick: {
    flex: 1,
    height: 38,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  quickText: {
    fontSize: 12,
  },
  pad: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  key: {
    width: "31%",
    flexGrow: 1,
    height: 54,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  actionKey: {
    backgroundColor: colors.surfaceAlt,
  },
  keyText: {
    fontSize: 22,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
});
