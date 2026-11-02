import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { AppText } from "@/components/ui/AppText";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { BidPad } from "@/components/game/BidPad";
import { SeatAvatar } from "@/components/game/SeatAvatar";
import { MIN_BID } from "@/engine/game";
import type { PublicPoolEntry, PublicRoom } from "@/engine/types";
import { filledAt } from "@/lib/game-view";
import { colors, radii, seatColor, spacing } from "@/theme";

export interface AssignSheetProps {
  room: PublicRoom;
  entry: PublicPoolEntry | null;
  open: boolean;
  busy?: boolean;
  onClose: () => void;
  onAssign: (seat: number, bid: number) => Promise<boolean>;
}

export function AssignSheet({ room, entry, open, busy = false, onClose, onAssign }: AssignSheetProps) {
  const [seat, setSeat] = useState<number | null>(null);
  const [bid, setBid] = useState("");

  if (!entry) return null;

  const selected = room.participants.find((p) => p.seat === seat) ?? null;
  const bidNum = bid === "" ? NaN : Number(bid);
  const validBid =
    selected !== null && Number.isInteger(bidNum) && bidNum >= MIN_BID && bidNum <= selected.bankPoints;
  const tooHigh = selected !== null && Number.isFinite(bidNum) && bidNum > selected.bankPoints;
  const tooLow = selected !== null && bid !== "" && Number.isFinite(bidNum) && bidNum < MIN_BID;

  function slotsLeft(seatNo: number) {
    const participant = room.participants.find((p) => p.seat === seatNo);
    if (!participant) return 0;
    return Math.max(0, room.formation[entry!.position] - filledAt(room, participant.roster, entry!.position));
  }

  async function submit() {
    if (seat === null || !validBid) return;
    const ok = await onAssign(seat, bidNum);
    if (ok) onClose();
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={`Sell ${entry.name}`}
      subtitle={`${entry.position} · ${entry.pts} pts · type the final bid shouted out loud`}
      scroll
    >
      <View style={styles.seats}>
        {room.participants.map((participant) => {
          const left = slotsLeft(participant.seat);
          const canTake = left > 0 && participant.bankPoints > 0;
          const active = participant.seat === seat;
          const color = seatColor(participant.seat);
          return (
            <Pressable
              key={participant.seat}
              accessibilityRole="button"
              accessibilityState={{ selected: active, disabled: !canTake }}
              disabled={!canTake || busy}
              onPress={() => {
                setSeat(participant.seat);
                setBid("");
              }}
              style={({ pressed }) => [
                styles.seat,
                active && { borderColor: color, backgroundColor: color + "12" },
                !canTake && { opacity: 0.4 },
                pressed && canTake ? { opacity: 0.8 } : null,
              ]}
            >
              <SeatAvatar name={participant.name} color={color} size={34} ring={active} />
              <View style={{ flex: 1, gap: 1 }}>
                <AppText variant="bodyStrong" numberOfLines={1} style={styles.seatName}>
                  {participant.name}
                </AppText>
                <AppText variant="caption" color={colors.textMuted} style={styles.seatMeta}>
                  {left > 0
                    ? `${left} ${entry.position} slot${left === 1 ? "" : "s"} open`
                    : `${entry.position} slots full`}
                </AppText>
              </View>
              <View style={styles.bank}>
                <AppText variant="bodyStrong" color={canTake ? colors.text : colors.textMuted}>
                  {participant.bankPoints}
                </AppText>
                <AppText variant="caption" color={colors.textDim} style={styles.seatMeta}>
                  bank
                </AppText>
              </View>
              {active ? <Ionicons name="checkmark-circle" size={18} color={color} /> : null}
            </Pressable>
          );
        })}
      </View>

      {selected ? (
        <View style={styles.bidArea}>
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <AppText variant="label" color={colors.textMuted}>
              Final bid
            </AppText>
            <View style={styles.dividerLine} />
          </View>
          <BidPad value={bid} onChange={setBid} max={selected.bankPoints} disabled={busy} />
          {tooLow ? (
            <AppText variant="caption" color={colors.textMuted}>
              Bid at least {MIN_BID} bank point.
            </AppText>
          ) : null}
          {tooHigh ? (
            <AppText variant="caption" color={colors.danger}>
              {selected.name} only has {selected.bankPoints} bank points.
            </AppText>
          ) : null}
          <Button
            label={`Assign to ${selected.name}`}
            icon={<Ionicons name="checkmark" size={18} color={colors.textInverse} />}
            onPress={submit}
            loading={busy}
            disabled={!validBid}
            size="lg"
          />
        </View>
      ) : (
        <View style={styles.hint}>
          <Ionicons name="hand-left-outline" size={18} color={colors.textDim} />
          <AppText variant="caption" color={colors.textMuted} align="center">
            Pick the manager who won the bid to enter the price.
          </AppText>
        </View>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  seats: {
    gap: spacing.sm,
  },
  seat: {
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
  seatName: {
    fontSize: 14,
  },
  seatMeta: {
    fontSize: 10,
    lineHeight: 13,
  },
  bank: {
    alignItems: "flex-end",
  },
  bidArea: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  hint: {
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
});
