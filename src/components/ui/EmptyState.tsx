import { StyleSheet, View } from "react-native";
import type { ReactNode } from "react";
import { Ionicons } from "@expo/vector-icons";

import { AppText } from "@/components/ui/AppText";
import { colors, radii, spacing } from "@/theme";

export function EmptyState({
  icon = "football-outline",
  title,
  body,
  action,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <View style={styles.wrap}>
      <View style={styles.icon}>
        <Ionicons name={icon} size={26} color={colors.primary} />
      </View>
      <AppText variant="subheading" align="center">
        {title}
      </AppText>
      {body ? (
        <AppText variant="caption" color={colors.textMuted} align="center" style={styles.body}>
          {body}
        </AppText>
      ) : null}
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  icon: {
    width: 56,
    height: 56,
    borderRadius: radii.pill,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  body: {
    maxWidth: 300,
  },
  action: {
    marginTop: spacing.md,
    alignSelf: "stretch",
  },
});
