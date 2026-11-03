import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { AppText } from "@/components/ui/AppText";
import { PlayerAvatar } from "@/components/game/PlayerAvatar";
import type { PublicRoom } from "@/engine/types";
import { playerPhoto } from "@/lib/display";
import { soldEntries } from "@/lib/game-view";
import { colors, radii, seatColor, spacing } from "@/theme";

export function RecentSales({ room, limit = 8 }: { room: PublicRoom; limit?: number }) {
  const sales = soldEntries(room).slice(-limit).reverse();

  if (sales.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons name="receipt-outline" size={18} color={colors.textDim} />
        <AppText variant="caption" color={colors.textMuted} align="center">
          No sales yet. The first footballer is on the block.
        </AppText>
      </View>
    );
  }

  return (
    <View>
      {sales.map((entry) => {
        const winner = room.participants.find((p) => p.seat === entry.winnerSeat);
        const color = winner ? seatColor(winner.seat) : colors.textMuted;
        return (
          <View key={entry.id} style={styles.row}>
            <PlayerAvatar
              name={entry.name}
              imageUrl={playerPhoto(entry)}
              size={32}
              color={color}
            />
            <View style={{ flex: 1, gap: 1 }}>
              <AppText variant="bodyStrong" numberOfLines={1} style={styles.name}>
                {entry.name}
              </AppText>
              <AppText variant="caption" color={colors.textMuted} numberOfLines={1} style={styles.meta}>
                {winner ? `to ${winner.name}` : "Tickets"} · {entry.position}
              </AppText>
            </View>
            <View style={styles.bid}>
              <AppText variant="score" color={colors.primary} style={styles.bidText}>
                {entry.winningBid ?? 0}
              </AppText>
              <AppText variant="caption" color={colors.textDim} style={styles.meta}>
                pts
              </AppText>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  name: {
    fontSize: 14,
  },
  meta: {
    fontSize: 11,
    lineHeight: 14,
  },
  bid: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 3,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.sm,
    backgroundColor: colors.primarySoft,
  },
  bidText: {
    fontSize: 16,
  },
});
