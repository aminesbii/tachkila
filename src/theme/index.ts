import { Platform, type TextStyle } from "react-native";

/** Dark auction-night palette: deep pitch green, warm gold, crisp mint. */
export const colors = {
  background: "#07100C",
  backgroundElevated: "#0B1712",
  surface: "#10211A",
  surfaceAlt: "#152A21",
  surfaceHigh: "#1B3429",
  border: "rgba(255,255,255,0.08)",
  borderStrong: "rgba(255,255,255,0.16)",
  overlay: "rgba(3,8,6,0.72)",

  text: "#F3F7F4",
  textMuted: "#9AAFA2",
  textDim: "#6B8074",
  textInverse: "#04150E",

  primary: "#38E1A0",
  primaryDeep: "#0B6E4B",
  primarySoft: "rgba(56,225,160,0.12)",
  gold: "#F4C95D",
  goldDeep: "#B98A1E",
  goldSoft: "rgba(244,201,93,0.12)",
  danger: "#FF7A7A",
  dangerSoft: "rgba(255,122,122,0.12)",
  success: "#4ADE80",
  info: "#6FC6FF",

  pitchTop: "#10865B",
  pitchBottom: "#053826",
  pitchLine: "rgba(255,255,255,0.18)",
} as const;

export const seatColors = [
  "#F4C95D",
  "#6FC6FF",
  "#FF9E7A",
  "#B7A2FF",
  "#7BE495",
  "#FF9EC4",
] as const;

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  giant: 48,
} as const;

export const radii = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 26,
  pill: 999,
} as const;

const display = Platform.select({
  ios: "System",
  android: "sans-serif-condensed",
  default: "System",
});

const text = Platform.select({
  ios: "System",
  android: "sans-serif",
  default: "System",
});

const medium = Platform.select({
  ios: "System",
  android: "sans-serif-medium",
  default: "System",
});

const mono = Platform.select({
  ios: "Menlo",
  android: "monospace",
  default: "monospace",
});

export const typography = {
  fonts: { display, text, medium, mono },
  display: {
    fontFamily: display,
    fontSize: 40,
    lineHeight: 44,
    fontWeight: "800",
    letterSpacing: -1.2,
  } as TextStyle,
  title: {
    fontFamily: display,
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "800",
    letterSpacing: -0.6,
  } as TextStyle,
  heading: {
    fontFamily: medium,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "700",
    letterSpacing: -0.2,
  } as TextStyle,
  subheading: {
    fontFamily: medium,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "600",
  } as TextStyle,
  body: {
    fontFamily: text,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "400",
  } as TextStyle,
  bodyStrong: {
    fontFamily: medium,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "600",
  } as TextStyle,
  caption: {
    fontFamily: text,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "400",
  } as TextStyle,
  label: {
    fontFamily: medium,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "700",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  } as TextStyle,
  mono: {
    fontFamily: mono,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    letterSpacing: 2,
  } as TextStyle,
  score: {
    fontFamily: display,
    fontSize: 22,
    lineHeight: 26,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  } as TextStyle,
} as const;

export const shadows = {
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 6,
  },
  sheet: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 20,
  },
} as const;

export function seatColor(seat: number): string {
  return seatColors[(seat - 1) % seatColors.length];
}

export const MAX_CONTENT_WIDTH = 560;
