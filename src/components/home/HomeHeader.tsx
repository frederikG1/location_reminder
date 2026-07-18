import { Text, StyleSheet } from "react-native";
import FadeInView from "../ui/FadeInView";
import { theme } from "@/src/theme";

type HomeHeaderProps = {
  placeCount: number;
};

export default function HomeHeader({ placeCount }: HomeHeaderProps) {
  function getGreeting() {
    const hour = new Date().getHours();

    if (hour <= 12) return "Godmorgen";
    if (hour <= 18) return "God eftermiddag";

    return "God aften";
  }

  return (
    <FadeInView style={styles.header}>
      <Text style={styles.title}>{getGreeting()} 👋</Text>
      <Text style={styles.subtitle}>
        {placeCount === 0
          ? "Du har ikke gemt nogen steder endnu"
          : `Du har gemt ${placeCount} sted${placeCount === 1 ? "" : "er"} `}
      </Text>
    </FadeInView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
});
