import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";

import { Pitch } from "@/components/game/Pitch";
import type { PublicRoom } from "@/engine/types";
import { colors, seatColor, spacing } from "@/theme";

export function TeamCarousel({ room }: { room: PublicRoom }) {
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(width - spacing.lg * 2, 460);
  const interval = cardWidth + spacing.md;
  const [active, setActive] = useState(0);

  function onScrollEnd(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const index = Math.round(event.nativeEvent.contentOffset.x / interval);
    setActive(Math.max(0, Math.min(room.participants.length - 1, index)));
  }

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={interval}
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum
        onMomentumScrollEnd={onScrollEnd}
        contentContainerStyle={styles.track}
      >
        {room.participants.map((participant) => (
          <View key={participant.seat} style={{ width: cardWidth, marginRight: spacing.md }}>
            <Pitch room={room} seat={participant.seat} />
          </View>
        ))}
      </ScrollView>

      {room.participants.length > 1 ? (
        <View style={styles.dots}>
          {room.participants.map((participant, index) => (
            <View
              key={participant.seat}
              style={[
                styles.dot,
                index === active
                  ? { backgroundColor: seatColor(participant.seat), width: 18 }
                  : { backgroundColor: colors.borderStrong },
              ]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    paddingHorizontal: spacing.lg,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
    marginTop: spacing.md,
  },
  dot: {
    height: 5,
    width: 5,
    borderRadius: 3,
  },
});
