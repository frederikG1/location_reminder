export const theme = {
  colors: {
    background: "#FFF4DE",
    surface: "#FFFFFF",
    surfaceAlt: "#FFF4DE",
    primary: "#FF9500",
    // Orange som TEKST eller IKON — aldrig `primary`, der kun giver 2.0:1 mod
    // cremebaggrunden. Denne er 4.5:1 mod creme og 4.9:1 mod hvid.
    // `primary` er stadig den rigtige til fyld, kanter, prikker og knapflader.
    primaryStrong: "#B05A00",
    primaryMuted: "#FFF4DE",
    primaryText: "#1A1200", // orange buttons use dark text, not white
    primaryDisabled: "#FFD9A0",
    danger: "#1A1200", // "delete" reads as an inverse ink button, not red
    dangerMuted: "#FFF4DE",
    dangerFill: "rgba(255, 149, 0, 0.12)",
    primaryFill: "rgba(255, 149, 0, 0.2)",
    ringFill: "rgba(255, 149, 0, 0.2)",
    locationDot: "#0A84FF",
    mapSurface: "#F3E7CE", // bag kortet indtil fliserne er hentet
    textPrimary: "#1A1200",
    textSecondary: "#8A6A2A",
    // Var #B99457, som kun gav 2.6:1 mod baggrunden — under WCAG AA's 4.5:1 for
    // små tekster. Hierarkiet bæres nu af skriftstørrelse og vægt, ikke farve.
    textMuted: "#8A6A2A",
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
  // React Native kan ikke vælge vægt inden for en custom fontfamilie — hver
  // vægt ER sin egen familie. Derfor sætter tokens herunder `fontFamily` og
  // ikke `fontWeight`: kombinerer man begge, syntetiserer iOS oven i den
  // allerede fede skrift. Rendering er gated på at fonten er loadet
  // (app/_layout.tsx), så der er aldrig et vindue uden den.
  fonts: {
    semibold: "Nunito_600SemiBold",
    bold: "Nunito_700Bold",
    extrabold: "Nunito_800ExtraBold",
    black: "Nunito_900Black",
  },
  typography: {
    title: {
      fontSize: 29,
      fontFamily: "Nunito_900Black",
      letterSpacing: -0.6,
      lineHeight: 36,
    },
    titleSm: {
      fontSize: 27,
      fontFamily: "Nunito_900Black",
      letterSpacing: -0.5,
      lineHeight: 34,
    },
    heading: {
      fontSize: 23,
      fontFamily: "Nunito_900Black",
      letterSpacing: -0.4,
    },
    sectionTitle: {
      fontSize: 20,
      fontFamily: "Nunito_900Black",
      letterSpacing: -0.3,
    },
    body: {
      fontSize: 15,
      lineHeight: 22,
      fontFamily: "Nunito_600SemiBold",
    },
    label: {
      fontSize: 14,
      fontFamily: "Nunito_800ExtraBold",
    },
    caption: {
      fontSize: 13,
      fontFamily: "Nunito_600SemiBold",
    },
    captionStrong: {
      fontSize: 13,
      fontFamily: "Nunito_700Bold",
    },
    kicker: {
      fontSize: 12,
      fontFamily: "Nunito_900Black",
      letterSpacing: 0.6,
      textTransform: "uppercase",
    },
    button: {
      fontSize: 16,
      fontFamily: "Nunito_800ExtraBold",
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
