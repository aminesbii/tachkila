import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { AppText } from "@/components/ui/AppText";
import { SeatAvatar } from "@/components/game/SeatAvatar";
import type { PublicRoom } from "@/engine/types";
import { teamScore, totalFilled } from "@/lib/game-view";
import { colors, radii, seatColor, spacing } from "@/theme";

interface Row {
  seat: number;
  name: string;
  score: number;
  bank: number;
  signed: number;
}

export function Standings({ room, final = false }: { room: PublicRoom; final?: boolean }) {
  const rows: Row[] = room.participants
    .map((participant) => ({
      seat: participant.seat,
      name: participant.name,
      score: teamScore(room, participant.roster),
      bank: participant.bankPoints,
      signed: totalFilled(room, participant.roster),
    }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.bank !== a.bank) return b.bank - a.bank;
      return a.seat - b.seat;
    });

  return (
    <View style={styles.list}>
      {rows.map((row, index) => {
        const color = seatColor(row.seat);
        const leader = index === 0;
        return (
          <View
            key={row.seat}
            style={[
              styles.row,
              leader && {
                backgroundColor: colors.goldSoft,
                borderColor: "rgba(244,201,93,0.28)",
              },
            ]}
          >
            <View style={[styles.rank, { backgroundColor: leader ? colors.gold : colors.surfaceAlt }]}>
              {leader ? (
                <Ionicons name="trophy" size={12} color="#241A02" />
              ) : (
                <AppText style={[styles.rankText, { color: colors.textMuted }]}>{index + 1}</AppText>
              )}
            </View>

            <SeatAvatar name={row.name} color={color} size={32} ring={leader} />

            <View style={{ flex: 1, gap: 1 }}>
              <AppText variant="bodyStrong" numberOfLines={1} style={styles.name}>
                {row.name}
              </AppText>
              <View style={styles.meta}>
                <Ionicons name="wallet-outline" size={10} color={colors.textDim} />
                <AppText variant="caption" color={colors.textMuted} style={styles.metaText}>
                  {row.bank} bank
                </AppText>
                <AppText variant="caption" color={colors.textDim} style={styles.metaText}>
                  ·
                </AppText>
                <AppText variant="caption" color={colors.textMuted} style={styles.metaText}>
                  {row.signed}/{room.slotsPerTeam} signed
                </AppText>
              </View>
            </View>

            <View style={styles.score}>
              <AppText variant="score" color={leader ? colors.gold : colors.text}>
                {row.score}
              </AppText>
              <AppText variant="caption" color={colors.textDim} style={styles.metaText}>
                {final ? "PTS" : "pts"}
              </AppText>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  rank: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  rankText: {
    fontSize: 11,
    fontWeight: "800",
  },
  name: {
    fontSize: 14,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  metaText: {
    fontSize: 10,
    lineHeight: 13,
  },
  score: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 3,
    minWidth: 44,
    justifyContent: "flex-end",
  },
});
