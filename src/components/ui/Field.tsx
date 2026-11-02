import { StyleSheet, TextInput, View, type TextInputProps } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { colors, radii, spacing, typography } from "@/theme";

export interface FieldProps extends TextInputProps {
  label?: string;
  error?: string | null;
  hint?: string;
}

export function Field({ label, error, hint, style, ...rest }: FieldProps) {
  return (
    <View style={styles.wrap}>
      {label ? (
        <AppText variant="label" color={colors.textMuted} style={styles.label}>
          {label}
        </AppText>
      ) : null}
      <TextInput
        placeholderTextColor={colors.textDim}
        selectionColor={colors.primary}
        keyboardAppearance="dark"
        maxFontSizeMultiplier={1.25}
        {...rest}
        style={[
          styles.input,
          error ? { borderColor: "rgba(255,122,122,0.55)" } : null,
          style,
        ]}
      />
      {error ? (
        <AppText variant="caption" color={colors.danger}>
          {error}
        </AppText>
      ) : hint ? (
        <AppText variant="caption" color={colors.textDim}>
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  label: {
    marginLeft: 2,
  },
  input: {
    height: 52,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    color: colors.text,
    ...typography.body,
    fontSize: 16,
  },
});
