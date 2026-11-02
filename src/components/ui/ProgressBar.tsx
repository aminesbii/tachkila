import { StyleSheet, View } from "react-native";

import { colors } from "@/theme";

export function ProgressBar({
  value,
  color = colors.primary,
  height = 6,
  track = colors.surfaceAlt,
}: {
  value: number;
  color?: string;
  height?: number;
  track?: string;
}) {
  const clamped = Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
  return (
    <View style={[styles.track, { height, borderRadius: height / 2, backgroundColor: track }]}>
      <View
        style={{
          width: `${clamped * 100}%`,
          height,
          borderRadius: height / 2,
          backgroundColor: color,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: "100%",
    overflow: "hidden",
  },
});
