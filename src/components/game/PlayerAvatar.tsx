import { useState } from "react";
import { Image, StyleSheet, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { monogram } from "@/lib/display";
import { colors } from "@/theme";

/**
 * Portrait of a footballer. When we have no online picture — or the download
 * fails on a dead link — the circle shows the first two letters of the name
 * instead, so a card never renders empty.
 */
export function PlayerAvatar({
  name,
  imageUrl,
  size,
  color = colors.primary,
  ring = false,
}: {
  name: string;
  imageUrl?: string | null;
  size: number;
  /** Tints the fallback letters and the border. */
  color?: string;
  ring?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const showPhoto = Boolean(imageUrl) && !failed;

  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: ring ? 2 : 1,
          borderColor: color + (ring ? "CC" : "55"),
          backgroundColor: color + "1A",
        },
      ]}
    >
      {showPhoto ? (
        <Image
          source={{ uri: imageUrl as string }}
          style={[styles.photo, { height: size * 1.35 }]}
          resizeMode="cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <AppText
          numberOfLines={1}
          style={{ color, fontWeight: "800", fontSize: size * 0.3, letterSpacing: -0.2 }}
        >
          {monogram(name)}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  // Taller than the circle and pinned to the top: Wikipedia lead photos are
  // full-body shots, so a centred crop would cut the head off.
  photo: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
});
