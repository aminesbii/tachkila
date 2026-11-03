import { useEffect, useState } from "react";
import { Animated, BackHandler, Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { AppText } from "@/components/ui/AppText";
import { PlayerAvatar } from "@/components/game/PlayerAvatar";
import { SeatAvatar } from "@/components/game/SeatAvatar";
import { colors, radii, seatColor, spacing } from "@/theme";

export interface SaleResult {
  entryName: string;
  imageUrl?: string;
  position: string;
  pts: number;
  winnerName: string;
  winnerSeat: number;
  bid: number;
}

/**
 * Deliberately not a `Modal`: it is an in-tree overlay rendered by the game
 * screen. Presenting a second native modal while the assign sheet dismisses
 * freezes iOS (facebook/react-native#50152), and this overlay is always shown
 * straight after that sheet closes.
 */
export function SaleOverlay({
  sale,
  onClose,
}: {
  sale: SaleResult | null;
  onClose: () => void;
}) {
  const [scale] = useState(() => new Animated.Value(0.92));
  const [opacity] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!sale) return;
    scale.setValue(0.92);
    opacity.setValue(0);
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, damping: 16, stiffness: 220 }),
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();
  }, [sale, scale, opacity]);

  useEffect(() => {
    if (!sale) return;
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      onClose();
      return true;
    });
    return () => subscription.remove();
  }, [onClose, sale]);

  if (!sale) return null;

  const color = seatColor(sale.winnerSeat);

  return (
    <View style={styles.layer} accessibilityViewIsModal>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Dismiss sale"
        style={StyleSheet.absoluteFill}
        onPress={onClose}
      />

      <Animated.View style={[styles.card, { opacity, transform: [{ scale }] }]}>
        <View style={styles.portrait}>
          <PlayerAvatar
            name={sale.entryName}
            imageUrl={sale.imageUrl}
            size={104}
            color={colors.primary}
            ring
          />
          <View style={styles.burst}>
            <Ionicons name="checkmark" size={18} color={colors.textInverse} />
          </View>
        </View>

        <AppText variant="label" color={colors.primary}>
          Sold
        </AppText>
        <AppText variant="title" align="center" numberOfLines={2}>
          {sale.entryName}
        </AppText>
        <AppText variant="caption" color={colors.textMuted}>
          {sale.position} · {sale.pts} pts
        </AppText>

        <View style={styles.rule} />

        <View style={styles.winner}>
          <SeatAvatar name={sale.winnerName} color={color} size={44} ring />
          <View style={{ gap: 1 }}>
            <AppText variant="caption" color={colors.textDim}>
              Goes to
            </AppText>
            <AppText variant="heading" numberOfLines={1}>
              {sale.winnerName}
            </AppText>
          </View>
        </View>

        <View style={styles.price}>
          <AppText variant="display" color={colors.gold} style={styles.priceText}>
            {sale.bid}
          </AppText>
          <AppText variant="label" color={colors.textMuted}>
            bank points
          </AppText>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Next footballer"
          onPress={onClose}
          style={({ pressed }) => [styles.cta, pressed && { opacity: 0.85 }]}
        >
          <AppText variant="bodyStrong" color={colors.textInverse}>
            Next footballer
          </AppText>
          <Ionicons name="arrow-forward" size={18} color={colors.textInverse} />
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.overlay,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    zIndex: 50,
    elevation: 50,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: "rgba(56,225,160,0.28)",
    backgroundColor: colors.backgroundElevated,
  },
  burst: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 3,
    borderColor: colors.backgroundElevated,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  portrait: {
    marginBottom: spacing.xs,
  },
  rule: {
    width: 48,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderStrong,
    marginVertical: spacing.md,
  },
  winner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  price: {
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  priceText: {
    fontSize: 44,
    lineHeight: 50,
    fontVariant: ["tabular-nums"],
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    alignSelf: "stretch",
    height: 52,
    marginTop: spacing.sm,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
  },
});
