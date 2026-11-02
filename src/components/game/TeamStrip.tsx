import { ScrollView, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { AppText } from "@/components/ui/AppText";
import { SeatAvatar } from "@/components/game/SeatAvatar";
import type { PublicRoom } from "@/engine/types";
import { teamScore } from "@/lib/game-view";
import { colors, radii, seatColor, spacing } from "@/theme";

export function TeamStrip({
  room,
  highlightSeat,
}: {
  room: PublicRoom;
  highlightSeat?: number;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      style={styles.scroll}
    >
      {room.participants.map((participant) => {
        const color = seatColor(participant.seat);
        const active = participant.seat === highlightSeat;
        return (
          <View
            key={participant.seat}
            style={[
              styles.item,
              {
                borderColor: active ? color : colors.border,
                backgroundColor: active ? color + "14" : colors.surface,
              },
            ]}
          >
            <SeatAvatar name={participant.name} color={color} size={28} ring={active} />
            <View style={{ gap: 1 }}>
              <AppText variant="bodyStrong" numberOfLines={1} style={styles.name}>
                {participant.name}
              </AppText>
              <View style={styles.meta}>
                <Ionicons name="wallet-outline" size={10} color={colors.textDim} />
                <AppText variant="caption" color={colors.textMuted} style={styles.metaText}>
                  {participant.bankPoints} bank
                </AppText>
                <Ionicons name="star" size={10} color={colors.gold} />
                <AppText variant="caption" color={colors.textMuted} style={styles.metaText}>
                  {teamScore(room, participant.roster)}
                </AppText>
              </View>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    marginHorizontal: -spacing.lg,
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    minWidth: 132,
  },
  name: {
    fontSize: 13,
    maxWidth: 96,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  metaText: {
    fontSize: 11,
    lineHeight: 14,
  },
});
