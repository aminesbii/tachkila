import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import type { ReactNode } from "react";

import { AppText } from "@/components/ui/AppText";
import { colors, spacing } from "@/theme";

export function SectionTitle({
  children,
  right,
  style,
}: {
  children: ReactNode;
  right?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.row, style]}>
      <AppText variant="label" color={colors.textMuted}>
        {children}
      </AppText>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
});
