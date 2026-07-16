import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
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
        <SafeAreaView style={styles.card}>
          <Text style={styles.heading}>Vil du mindes om {placeName}?</Text>
          <Text style={styles.body}>
            Tillad lokation i baggrunden, så vi kan give dig en påmindelse,
            næste gang du er i nærheden - også selvom appen ikke er åben.
          </Text>

          <Pressable style={styles.primaryButton} onPress={onAccept}>
            <Text style={styles.primaryButtonText}>Ja, giv adgang</Text>
          </Pressable>

          <Pressable style={styles.dismissButton} onPress={onDismiss}>
            <Text style={styles.dismissButtonText}>Ikke nu</Text>
          </Pressable>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const colors = {
  surface: "#FFFFFF",
  primary: "#2F6F4F",
  textPrimary: "#1A1A1A",
  textSecondary: "#6B6B6B",
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
  },
  heading: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 12,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  dismissButton: {
    paddingVertical: 14,
    alignItems: "center",
  },
  dismissButtonText: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: "500",
  },
});
