import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import type { Formation, Position } from "@/engine/types";
import { colors, radii } from "@/theme";

const ROW_ORDER: Position[] = ["FWD", "MID", "DEF", "GK"];

/** A tiny formation preview made of dots — no images, instant to render. */
export function PitchDiagram({
  formation,
  dot = 6,
  gap = 5,
  color = colors.primary,
  muted = "rgba(255,255,255,0.16)",
  showLabels = false,
}: {
  formation: Formation;
  dot?: number;
  gap?: number;
  color?: string;
  muted?: string;
  showLabels?: boolean;
}) {
  return (
    <View style={styles.rows}>
      {ROW_ORDER.map((position) => (
        <View key={position} style={[styles.row, { gap }]}>
          {showLabels ? (
            <AppText variant="label" color={colors.textDim} style={styles.rowLabel}>
              {position}
            </AppText>
          ) : null}
          {Array.from({ length: formation[position] }, (_, index) => (
            <View
              key={`${position}-${index}`}
              style={{
                width: dot,
                height: dot,
                borderRadius: dot / 2,
                backgroundColor: color,
                opacity: position === "GK" ? 1 : 0.9,
              }}
            />
          ))}
        </View>
      ))}
      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "50%",
          height: StyleSheet.hairlineWidth,
          backgroundColor: muted,
          opacity: 0.5,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  rows: {
    justifyContent: "space-evenly",
    gap: 7,
    paddingVertical: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: {
    width: 28,
  },
});

export const pitchCardRadius = radii.lg;
