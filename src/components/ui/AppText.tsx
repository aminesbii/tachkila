import { Text, type TextProps, type TextStyle } from "react-native";

import { colors, typography } from "@/theme";

export type TextVariant = Exclude<keyof typeof typography, "fonts">;

export interface AppTextProps extends TextProps {
  variant?: TextVariant;
  color?: string;
  align?: TextStyle["textAlign"];
}

export function AppText({
  variant = "body",
  color = colors.text,
  align,
  style,
  ...rest
}: AppTextProps) {
  return (
    <Text
      maxFontSizeMultiplier={1.35}
      {...rest}
      style={[typography[variant], { color }, align ? { textAlign: align } : null, style]}
    />
  );
}
