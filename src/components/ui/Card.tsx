import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import type { ReactNode } from "react";

import { colors, radii, spacing } from "@/theme";

export interface CardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
  tone?: "surface" | "alt" | "transparent";
  border?: boolean;
}

export function Card({ children, style, padded = true, tone = "surface", border = true }: CardProps) {
  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor:
            tone === "surface" ? colors.surface : tone === "alt" ? colors.surfaceAlt : "transparent",
          borderColor: border ? colors.border : "transparent",
          padding: padded ? spacing.lg : 0,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.lg,
    borderWidth: 1,
  },
});
