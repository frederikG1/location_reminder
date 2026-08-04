import AnimatedPressable from "@/src/components/ui/AnimatedPressable";
import FadeInView from "@/src/components/ui/FadeInView";
import { theme } from "@/src/theme";
import { Modal, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  visible: boolean;
  onAccept: () => void;
  onDismiss: () => void;
};

export default function BackgroundPermissionModal({
  visible,
  onAccept,
  onDismiss,
}: Props) {
  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <FadeInView style={styles.cardWrapper}>
          <SafeAreaView style={styles.card}>
            <Text style={styles.heading}>Turn reminders on</Text>
            <Text style={styles.body}>
              Allow background location, so we can give you a reminder the next
              time you&apos;re nearby — even when the app isn&apos;t open.
            </Text>

            <AnimatedPressable
              style={styles.primaryButton}
              onPress={onAccept}
              accessibilityRole="button"
              accessibilityLabel="Yes, allow it"
            >
              <Text style={styles.primaryButtonText}>Yes, allow it</Text>
            </AnimatedPressable>

            <AnimatedPressable
              style={styles.dismissButton}
              onPress={onDismiss}
              haptic={false}
              accessibilityRole="button"
              accessibilityLabel="Not now"
            >
              <Text style={styles.dismissButtonText}>Not now</Text>
            </AnimatedPressable>
          </SafeAreaView>
        </FadeInView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: "center",
    paddingHorizontal: theme.spacing.xl,
  },
  cardWrapper: {
    width: "100%",
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: theme.borderWidth,
    borderColor: theme.colors.border,
    padding: theme.spacing.xxl,
    ...theme.shadow.floating,
  },
  heading: {
    ...theme.typography.sectionTitle,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  body: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xxl,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: theme.radius.button,
    borderWidth: theme.borderWidth,
    borderColor: theme.colors.border,
    alignItems: "center",
  },
  primaryButtonText: {
    ...theme.typography.button,
    color: theme.colors.primaryText,
  },
  dismissButton: {
    paddingVertical: 14,
    alignItems: "center",
  },
  dismissButtonText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
});
