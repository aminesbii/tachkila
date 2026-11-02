import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import type { ReactNode } from "react";

import { AppText } from "@/components/ui/AppText";
import { colors, radii, typography } from "@/theme";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "gold";
type Size = "sm" | "md" | "lg";

export interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  iconRight?: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityHint?: string;
}

const HEIGHTS: Record<Size, number> = { sm: 42, md: 52, lg: 58 };

function palette(variant: Variant) {
  switch (variant) {
    case "primary":
      return { background: colors.primary, border: colors.primary, text: colors.textInverse };
    case "gold":
      return { background: colors.gold, border: colors.gold, text: "#241A02" };
    case "secondary":
      return { background: colors.surfaceAlt, border: colors.borderStrong, text: colors.text };
    case "danger":
      return { background: colors.dangerSoft, border: "rgba(255,122,122,0.32)", text: colors.danger };
    case "ghost":
    default:
      return { background: "transparent", border: "transparent", text: colors.textMuted };
  }
}

export function Button({
  label,
  onPress,
  variant = "primary",
  size = "md",
  icon,
  iconRight,
  loading = false,
  disabled = false,
  fullWidth = true,
  style,
  testID,
  accessibilityHint,
}: ButtonProps) {
  const tone = palette(variant);
  const isDisabled = disabled || loading;

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      android_ripple={{ color: "rgba(255,255,255,0.12)" }}
      style={({ pressed }) => [
        styles.base,
        {
          height: HEIGHTS[size],
          backgroundColor: tone.background,
          borderColor: tone.border,
          opacity: isDisabled ? 0.45 : pressed ? 0.86 : 1,
          transform: [{ scale: pressed && !isDisabled ? 0.985 : 1 }],
          alignSelf: fullWidth ? "stretch" : "flex-start",
          paddingHorizontal: size === "sm" ? 14 : 20,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={tone.text} />
      ) : (
        <View style={styles.content}>
          {icon ? <View style={styles.icon}>{icon}</View> : null}
          <AppText
            style={[
              typography.bodyStrong,
              { color: tone.text, fontSize: size === "sm" ? 14 : 16, textAlign: "center" },
            ]}
            numberOfLines={1}
          >
            {label}
          </AppText>
          {iconRight ? <View style={styles.icon}>{iconRight}</View> : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  icon: {
    alignItems: "center",
    justifyContent: "center",
  },
});
