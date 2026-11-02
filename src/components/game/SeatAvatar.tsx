import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { initials } from "@/lib/display";

export function SeatAvatar({
  name,
  color,
  size = 36,
  ring = false,
}: {
  name: string;
  color: string;
  size?: number;
  ring?: boolean;
}) {
  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color + "22",
          borderColor: color + (ring ? "CC" : "55"),
          borderWidth: ring ? 2 : 1,
        },
      ]}
    >
      <AppText
        style={{ color, fontWeight: "800", fontSize: size * 0.34, letterSpacing: -0.2 }}
        numberOfLines={1}
      >
        {initials(name)}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: "center",
    justifyContent: "center",
  },
});
