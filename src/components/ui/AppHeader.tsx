import { Pressable, StyleSheet, View } from "react-native";
import type { ReactNode } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { AppText } from "@/components/ui/AppText";
import { colors, spacing } from "@/theme";

export interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  showBack?: boolean;
  right?: ReactNode;
  large?: boolean;
}

export function AppHeader({
  title,
  subtitle,
  onBack,
  showBack = true,
  right,
  large = false,
}: AppHeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <View style={styles.left}>
          {showBack ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              hitSlop={10}
              onPress={onBack ?? (() => router.back())}
              style={({ pressed }) => [styles.back, pressed && { opacity: 0.6 }]}
            >
              <Ionicons name="chevron-back" size={24} color={colors.text} />
            </Pressable>
          ) : null}
          <View style={styles.titles}>
            {title ? (
              <AppText variant={large ? "title" : "heading"} numberOfLines={1}>
                {title}
              </AppText>
            ) : null}
            {subtitle ? (
              <AppText variant="caption" color={colors.textMuted} numberOfLines={1}>
                {subtitle}
              </AppText>
            ) : null}
          </View>
        </View>
        {right ? <View style={styles.right}>{right}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    minHeight: 44,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flexShrink: 1,
  },
  titles: {
    flexShrink: 1,
    gap: 1,
  },
  back: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -8,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
});
