import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import type { ReactNode } from "react";
import { SafeAreaView, useSafeAreaInsets, type Edge } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

import { colors, spacing } from "@/theme";

export interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  footer?: ReactNode;
  header?: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  edges?: readonly Edge[];
  avoidKeyboard?: boolean;
  background?: string;
  testID?: string;
}

export function Screen({
  children,
  scroll = true,
  footer,
  header,
  contentStyle,
  edges = ["top"],
  avoidKeyboard = false,
  background = colors.background,
  testID,
}: ScreenProps) {
  const insets = useSafeAreaInsets();

  const body = scroll ? (
    <ScrollView
      testID={testID}
      style={styles.flex}
      contentContainerStyle={[
        styles.content,
        footer ? { paddingBottom: 150 + insets.bottom } : null,
        contentStyle,
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
    >
      {children}
    </ScrollView>
  ) : (
    <View testID={testID} style={[styles.flex, contentStyle]}>
      {children}
    </View>
  );

  return (
    <SafeAreaView edges={edges} style={[styles.flex, { backgroundColor: background }]}>
      {header}
      {avoidKeyboard ? (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={0}
        >
          {body}
        </KeyboardAvoidingView>
      ) : (
        body
      )}
      {footer ? (
        <View pointerEvents="box-none" style={styles.footerWrap}>
          <LinearGradient
            colors={["rgba(7,16,12,0)", "rgba(7,16,12,0.92)", colors.background]}
            locations={[0, 0.35, 1]}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <View
            style={[
              styles.footer,
              { paddingBottom: Math.max(insets.bottom, spacing.md) + spacing.xs },
            ]}
          >
            {footer}
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  footerWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: spacing.xxl,
  },
  footer: {
    paddingHorizontal: spacing.lg,
  },
});
