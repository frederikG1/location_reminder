import { Ionicons } from "@expo/vector-icons";
import { Text, StyleSheet, View } from "react-native";
import AnimatedPressable from "../ui/AnimatedPressable";
import FadeInView from "../ui/FadeInView";
import { theme } from "@/src/theme";
import { getHomeMessage } from "@/src/util/getHomeMessage";

type HomeHeaderProps = {
  nearbyPlacesCount: number;
  nearestPlaceName?: string;
  onOpenSettings: () => void;
};

export default function HomeHeader({
  nearbyPlacesCount,
  nearestPlaceName,
  onOpenSettings,
}: HomeHeaderProps) {
  function getGreeting() {
    const hour = new Date().getHours();

    if (hour < 5) return "Good night";
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";

    return "Good evening";
  }

  return (
    <FadeInView style={styles.header}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>{getGreeting()} 👋</Text>

        <AnimatedPressable
          style={styles.settingsButton}
          onPress={onOpenSettings}
          accessibilityRole="button"
          accessibilityLabel="Settings"
        >
          <Ionicons
            name="settings-outline"
            size={20}
            color={theme.colors.textPrimary}
          />
        </AnimatedPressable>
      </View>

      <Text style={styles.subtitle}>
        {getHomeMessage(nearbyPlacesCount, nearestPlaceName)}
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
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.md,
  },
  title: {
    flex: 1,
    fontSize: 32,
    fontFamily: theme.fonts.black,
    color: theme.colors.textPrimary,
    letterSpacing: -0.7,
  },
  settingsButton: {
    width: 42,
    height: 42,
    borderRadius: theme.radius.pill,
    borderWidth: theme.borderWidth,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
});
