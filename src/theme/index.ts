export const theme = {
  colors: {
    background: "#FFF4DE",
    surface: "#FFFFFF",
    surfaceAlt: "#FFF4DE",
    primary: "#FF9500",
    primaryMuted: "#FFF4DE",
    primaryText: "#1A1200", // orange buttons use dark text, not white
    primaryDisabled: "#FFD9A0",
    danger: "#1A1200", // "delete" reads as an inverse ink button, not red
    dangerMuted: "#FFF4DE",
    dangerFill: "rgba(255, 149, 0, 0.12)",
    primaryFill: "rgba(255, 149, 0, 0.2)",
    ringFill: "rgba(255, 149, 0, 0.2)",
    locationDot: "#0A84FF",
    textPrimary: "#1A1200",
    textSecondary: "#8A6A2A",
    textMuted: "#B99457",
    border: "#1A1200", // thick outline, not a hairline
    inputBg: "#FFF4DE",
    overlay: "rgba(26, 18, 0, 0.45)",
    pressed: "#FFEBC8",
  },
  borderWidth: 2.5,
  radius: {
    sm: 9,
    md: 16,
    button: 999, // pill buttons
    lg: 16,
    sheet: 26,
    pill: 999,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  },
  typography: {
    // fontFamily: a heavy geometric sans (e.g. "Nunito"/"Baloo 2" at 800/900) reads best here
    title: {
      fontSize: 29,
      fontWeight: "900",
      letterSpacing: -0.6,
      lineHeight: 33,
    },
    titleSm: {
      fontSize: 27,
      fontWeight: "900",
      letterSpacing: -0.5,
      lineHeight: 31,
    },
    heading: {
      fontSize: 23,
      fontWeight: "900",
      letterSpacing: -0.4,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "800",
      letterSpacing: -0.3,
    },
    body: {
      fontSize: 15,
      lineHeight: 22,
      fontWeight: "600",
    },
    label: {
      fontSize: 14,
      fontWeight: "800",
    },
    caption: {
      fontSize: 13,
      fontWeight: "600",
    },
    kicker: {
      fontSize: 12,
      fontWeight: "800",
      letterSpacing: 0.4,
      textTransform: "uppercase",
    },
  },
  shadow: {
    // Citrus relies on outlines, not shadows — keep these subtle/near-zero
    card: {
      shadowColor: "#1A1200",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 6,
      elevation: 1,
    },
    floating: {
      shadowColor: "#1A1200",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 10,
      elevation: 2,
    },
    sheet: {
      shadowColor: "#1A1200",
      shadowOffset: { width: 0, height: -6 },
      shadowOpacity: 0.1,
      shadowRadius: 18,
      elevation: 8,
    },
    primaryButton: {
      shadowColor: "#1A1200",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
  },
  animation: {
    fast: 150,
    normal: 250,
    slow: 400,
  },
} as const;
