import { theme } from "@/src/theme";
import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import BackButton from "./BackButton";
import FadeInView from "./FadeInView";

type Props = {
  /**
   * Udelades, når skærmens indhold selv bærer overskriften — stedsiden viser
   * allerede navnet stort med emoji, og "Sted" ovenover ville kun gentage det
   * med et fladere ord.
   */
  title?: string;
  right?: ReactNode;
  onBack?: () => void;
};

/**
 * Erstatter den native stak-header på de skærme der ikke er forsiden. Den
 * native er en hvid bjælke med systemets blå chevron og "Tilbage" — appen har
 * hverken hvide bjælker, blå eller systemskrift andre steder.
 *
 * Titlen står under knappen frem for ved siden af, så den kan være lige så
 * stor som forsidens overskrift. En centreret titel i en bjælke ville tvinge
 * den ned i en størrelse ingen andre overskrifter i appen har.
 */
export default function ScreenHeader({ title, right, onBack }: Props) {
  return (
    <FadeInView style={styles.header}>
      <View style={styles.row}>
        <BackButton onPress={onBack} />
        {right ?? null}
      </View>

      {title ? <Text style={styles.title}>{title}</Text> : null}
    </FadeInView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.md,
  },

  title: {
    marginTop: theme.spacing.md,
    fontSize: 32,
    fontFamily: theme.fonts.black,
    color: theme.colors.textPrimary,
    letterSpacing: -0.7,
  },
});
