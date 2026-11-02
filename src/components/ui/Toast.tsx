import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Animated, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppText } from "@/components/ui/AppText";
import { colors, radii, shadows, spacing } from "@/theme";

type Tone = "success" | "info" | "danger";

interface ToastState {
  id: number;
  message: string;
  tone: Tone;
}

interface ToastContextValue {
  showToast: (message: string, tone?: Tone) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS: Record<Tone, keyof typeof Ionicons.glyphMap> = {
  success: "checkmark-circle",
  info: "information-circle",
  danger: "alert-circle",
};

const TONES: Record<Tone, string> = {
  success: colors.primary,
  info: colors.info,
  danger: colors.danger,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ToastState | null>(null);
  const opacity = useState(() => new Animated.Value(0))[0];
  const translate = useState(() => new Animated.Value(-12))[0];
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sequence = useRef(0);

  const showToast = useCallback(
    (message: string, tone: Tone = "success") => {
      sequence.current += 1;
      const id = sequence.current;
      setToast({ id, message, tone });
      if (timer.current) clearTimeout(timer.current);

      opacity.setValue(0);
      translate.setValue(-12);
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.spring(translate, { toValue: 0, useNativeDriver: true, damping: 18, stiffness: 220 }),
      ]).start();

      timer.current = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: true }),
          Animated.timing(translate, { toValue: -10, duration: 220, useNativeDriver: true }),
        ]).start(() => {
          setToast((current) => (current?.id === id ? null : current));
        });
      }, 2200);
    },
    [opacity, translate]
  );

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? (
        <View pointerEvents="none" style={[styles.layer, { top: insets.top + spacing.sm }]}>
          <Animated.View
            style={[
              styles.toast,
              { opacity, transform: [{ translateY: translate }], borderColor: TONES[toast.tone] + "55" },
            ]}
          >
            <Ionicons name={ICONS[toast.tone]} size={18} color={TONES[toast.tone]} />
            <AppText variant="bodyStrong" style={{ flexShrink: 1 }} numberOfLines={2}>
              {toast.message}
            </AppText>
          </Animated.View>
        </View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider");
  return context;
}

const styles = StyleSheet.create({
  layer: {
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 1000,
    alignItems: "center",
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceHigh,
    borderWidth: 1,
    maxWidth: 420,
    ...shadows.card,
  },
});
