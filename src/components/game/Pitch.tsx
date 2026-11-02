import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { AppText } from "@/components/ui/AppText";
import type { Position, PublicRoom } from "@/engine/types";
import { initials } from "@/lib/display";
import { filledAt, ptsColor, rosterEntries, teamScore, totalFilled } from "@/lib/game-view";
import { colors, radii, spacing } from "@/theme";

const ROW_ORDER: Position[] = ["FWD", "MID", "DEF", "GK"];

export function Pitch({ room, seat }: { room: PublicRoom; seat: number }) {
  const participant = room.participants.find((item) => item.seat === seat);
  const score = participant ? teamScore(room, participant.roster) : 0;
  const signed = participant ? totalFilled(room, participant.roster) : 0;
  const sold = participant ? rosterEntries(room, participant.roster) : [];

  return (
    <LinearGradient
      colors={[colors.pitchTop, colors.pitchBottom]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.pitch}
    >
      <View pointerEvents="none" style={styles.halfway} />
      <View pointerEvents="none" style={styles.centerCircle} />

      <View style={styles.header}>
        <View style={{ flexShrink: 1 }}>
          <AppText variant="subheading" color="#FFFFFF" numberOfLines={1}>
            {participant?.name ?? `Seat ${seat}`}
          </AppText>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="star" size={11} color={colors.gold} />
              <AppText variant="caption" color="rgba(255,255,255,0.9)">
                {score} pts
              </AppText>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="wallet-outline" size={11} color="rgba(255,255,255,0.72)" />
              <AppText variant="caption" color="rgba(255,255,255,0.72)">
                {participant?.bankPoints ?? 0} bank
              </AppText>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="people-outline" size={11} color="rgba(255,255,255,0.72)" />
              <AppText variant="caption" color="rgba(255,255,255,0.72)">
                {signed}/{room.slotsPerTeam}
              </AppText>
            </View>
          </View>
        </View>
        <View style={styles.formationTag}>
          <AppText variant="label" color="rgba(255,255,255,0.82)">
            {room.formationLabel}
          </AppText>
        </View>
      </View>

      <View style={styles.rows}>
        {ROW_ORDER.map((position) => {
          const count = room.formation[position];
          const filled = sold.filter((entry) => entry.position === position);
          return (
            <View key={position} style={styles.row}>
              {Array.from({ length: count }, (_, index) => {
                const entry = filled[index];
                return entry ? (
                  <View key={`${position}-${index}`} style={styles.tokenWrap}>
                    <View style={styles.token}>
                      <AppText style={styles.tokenText} numberOfLines={1}>
                        {initials(entry.name)}
                      </AppText>
                    </View>
                    <View style={[styles.ptsPill, { backgroundColor: ptsColor(entry.pts) }]}>
                      <AppText style={styles.ptsText}>{entry.pts}</AppText>
                    </View>
                  </View>
                ) : (
                  <View key={`${position}-${index}`} style={styles.emptySlot}>
                    <AppText variant="label" color="rgba(255,255,255,0.42)" style={styles.emptyText}>
                      {position}
                    </AppText>
                  </View>
                );
              })}
            </View>
          );
        })}
      </View>

      <View pointerEvents="none" style={styles.footerLine}>
        <AppText variant="caption" color="rgba(255,255,255,0.5)">
          {filledAt(room, participant?.roster ?? [], "GK")} GK ·{" "}
          {filledAt(room, participant?.roster ?? [], "DEF")} DEF ·{" "}
          {filledAt(room, participant?.roster ?? [], "MID")} MID ·{" "}
          {filledAt(room, participant?.roster ?? [], "FWD")} FWD
        </AppText>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  pitch: {
    borderRadius: radii.lg,
    padding: spacing.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    minHeight: 296,
  },
  halfway: {
    position: "absolute",
    left: spacing.md,
    right: spacing.md,
    top: "52%",
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.pitchLine,
  },
  centerCircle: {
    position: "absolute",
    alignSelf: "center",
    top: "44%",
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.pitchLine,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
    paddingBottom: spacing.sm,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginTop: 2,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  formationTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.pill,
    backgroundColor: "rgba(0,0,0,0.22)",
  },
  rows: {
    flex: 1,
    justifyContent: "space-evenly",
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    minHeight: 42,
  },
  tokenWrap: {
    alignItems: "center",
    width: 32,
  },
  token: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.16)",
  },
  tokenText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#1B2A22",
    letterSpacing: -0.2,
  },
  ptsPill: {
    minWidth: 16,
    height: 14,
    borderRadius: 7,
    paddingHorizontal: 3,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -5,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.28)",
  },
  ptsText: {
    fontSize: 8,
    fontWeight: "800",
    color: "#07100C",
    lineHeight: 10,
  },
  emptySlot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "rgba(255,255,255,0.32)",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 8,
    letterSpacing: 0.4,
  },
  footerLine: {
    alignItems: "center",
    paddingTop: spacing.xs,
  },
});
