import { StyleSheet, View } from "react-native";

import { colors, spacing } from "@/theme";

export function Divider({ spaced = false }: { spaced?: boolean }) {
  return <View style={[styles.line, spaced ? styles.spaced : null]} />;
}

const styles = StyleSheet.create({
  line: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    width: "100%",
  },
  spaced: {
    marginVertical: spacing.lg,
  },
});
