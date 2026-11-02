import { useEffect, useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import type { ReactNode } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppText } from "@/components/ui/AppText";
import { colors, radii, shadows, spacing } from "@/theme";

export interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  scroll?: boolean;
}

export function BottomSheet({
  open,
  onClose,
  title,
  subtitle,
  children,
  scroll = true,
}: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [slide] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!open) return;
    slide.setValue(0);
    Animated.spring(slide, {
      toValue: 1,
      useNativeDriver: true,
      damping: 22,
      stiffness: 220,
      mass: 0.9,
    }).start();
  }, [open, slide]);

  if (!open) return null;

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />
        <Animated.View
          style={[
            styles.sheet,
            {
              maxHeight: height * 0.9,
              paddingBottom: 0,
              transform: [
                {
                  translateY: slide.interpolate({
                    inputRange: [0, 1],
                    outputRange: [height, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.handleWrap}>
            <View style={styles.handle} />
          </View>

          <View style={styles.header}>
            <View style={{ flex: 1, gap: 2 }}>
              {title ? <AppText variant="heading">{title}</AppText> : null}
              {subtitle ? (
                <AppText variant="caption" color={colors.textMuted}>
                  {subtitle}
                </AppText>
              ) : null}
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              hitSlop={12}
              onPress={onClose}
              style={({ pressed }) => [styles.close, pressed && { opacity: 0.6 }]}
            >
              <Ionicons name="close" size={20} color={colors.textMuted} />
            </Pressable>
          </View>

          {scroll ? (
            <ScrollView
              bounces={false}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{
                paddingHorizontal: spacing.xl,
                paddingBottom: Math.max(insets.bottom, spacing.lg) + spacing.lg,
              }}
            >
              {children}
            </ScrollView>
          ) : (
            <View
              style={{
                paddingHorizontal: spacing.xl,
                paddingBottom: Math.max(insets.bottom, spacing.lg) + spacing.lg,
              }}
            >
              {children}
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.backgroundElevated,
    borderTopLeftRadius: radii.xl + 4,
    borderTopRightRadius: radii.xl + 4,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderBottomWidth: 0,
    ...shadows.sheet,
  },
  handleWrap: {
    alignItems: "center",
    paddingTop: spacing.md,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderStrong,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  close: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
