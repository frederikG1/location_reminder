import AnimatedPressable from "@/src/components/ui/AnimatedPressable";
import FadeInView from "@/src/components/ui/FadeInView";
import { theme } from "@/src/theme";
import { Modal, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  visible: boolean;
  placeName: string;
  onAccept: () => void;
  onDismiss: () => void;
};

export default function BackgroundPermissionModal({
  visible,
  placeName,
  onAccept,
  onDismiss,
}: Props) {
  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <FadeInView style={styles.cardWrapper}>
          <SafeAreaView style={styles.card}>
            <Text style={styles.heading}>Vil du mindes om {placeName}?</Text>
            <Text style={styles.body}>
              Tillad lokation i baggrunden, så vi kan give dig en påmindelse,
              næste gang du er i nærheden — også selvom appen ikke er åben.
            </Text>

            <AnimatedPressable style={styles.primaryButton} onPress={onAccept}>
              <Text style={styles.primaryButtonText}>Ja, giv adgang</Text>
            </AnimatedPressable>

            <AnimatedPressable style={styles.dismissButton} onPress={onDismiss} haptic={false}>
              <Text style={styles.dismissButtonText}>Ikke nu</Text>
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
    padding: theme.spacing.xxl,
    ...theme.shadow.floating,
  },
  heading: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xxl,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: theme.radius.md,
    alignItems: "center",
  },
  primaryButtonText: {
    color: theme.colors.primaryText,
    fontSize: 16,
    fontWeight: "600",
  },
  dismissButton: {
    paddingVertical: 14,
    alignItems: "center",
  },
  dismissButtonText: {
    color: theme.colors.textSecondary,
    fontSize: 15,
    fontWeight: "500",
  },
});
