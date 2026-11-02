import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import type { ReactNode } from "react";

import { AppText } from "@/components/ui/AppText";
import { colors, radii, spacing } from "@/theme";

export interface ChipProps {
  label: string;
  sublabel?: string;
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  icon?: ReactNode;
  tone?: "primary" | "gold";
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
}

export function Chip({
  label,
  sublabel,
  selected = false,
  disabled = false,
  onPress,
  icon,
  tone = "primary",
  style,
  accessibilityHint,
}: ChipProps) {
  const accent = tone === "gold" ? colors.gold : colors.primary;
  const accentSoft = tone === "gold" ? colors.goldSoft : colors.primarySoft;

  const content = (
    <View style={[styles.inner, selected && { backgroundColor: accentSoft }]}>
      {icon}
      <View style={{ flexShrink: 1 }}>
        <AppText
          variant={selected ? "bodyStrong" : "body"}
          color={selected ? accent : colors.textMuted}
          numberOfLines={1}
        >
          {label}
        </AppText>
        {sublabel ? (
          <AppText variant="caption" color={selected ? accent : colors.textDim} numberOfLines={1}>
            {sublabel}
          </AppText>
        ) : null}
      </View>
    </View>
  );

  if (!onPress) {
    return (
      <View
        style={[
          styles.base,
          { borderColor: selected ? accent : colors.border, backgroundColor: colors.surface },
          style,
        ]}
      >
        {content}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      accessibilityHint={accessibilityHint}
      disabled={disabled}
      onPress={onPress}
      android_ripple={{ color: "rgba(255,255,255,0.1)" }}
      style={({ pressed }) => [
        styles.base,
        {
          borderColor: selected ? accent : colors.border,
          backgroundColor: colors.surface,
          opacity: disabled ? 0.4 : pressed ? 0.8 : 1,
        },
        style,
      ]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.pill,
    borderWidth: 1,
    overflow: "hidden",
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: 9,
    borderRadius: radii.pill,
  },
});
