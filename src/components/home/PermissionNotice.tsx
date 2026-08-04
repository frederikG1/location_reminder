import AnimatedPressable from "@/src/components/ui/AnimatedPressable";
import FadeInView from "@/src/components/ui/FadeInView";
import { theme } from "@/src/theme";
import { StyleSheet, Text } from "react-native";

type Props = {
  title: string;
  message: string;
  onPress: () => void;
  delay?: number;
};

/**
 * The yellow card on the home screen that says something is turned off and
 * what to do about it. Used for both background location and notifications, so
 * the two warnings look the same.
 */
export default function PermissionNotice({
  title,
  message,
  onPress,
  delay,
}: Props) {
  return (
    <FadeInView delay={delay} style={styles.wrapper}>
      <AnimatedPressable
        style={styles.card}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityHint={message}
      >
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.text}>{message}</Text>
      </AnimatedPressable>
    </FadeInView>
  );
}

const styles = StyleSheet.create({
  // No paddingHorizontal here — the inset comes from scrollContent in
  // app/index.tsx, the only place that uses this component.
  wrapper: {
    marginTop: theme.spacing.md,
  },

  card: {
    backgroundColor: theme.colors.primaryMuted,
    borderRadius: theme.radius.md,
    borderWidth: theme.borderWidth,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
  },

  title: {
    fontSize: 15,
    fontFamily: theme.fonts.black,
    color: theme.colors.primaryStrong,
  },

  text: {
    marginTop: theme.spacing.xs,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: theme.fonts.semibold,
    color: theme.colors.textSecondary,
  },
});
