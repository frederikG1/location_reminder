import AnimatedPressable from "@/src/components/ui/AnimatedPressable";
import { theme } from "@/src/theme";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from "react-native";
import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Slider from "@react-native-community/slider";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from "react-native-reanimated";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (name: string, note: string, radius: number) => void;
  initialName?: string;
  initialNote?: string;
  initialRadius?: number;
};

export default function CreatePlaceModal({
  visible,
  onClose,
  onSave,
  initialName,
  initialNote,
  initialRadius,
}: Props) {
  const [name, setName] = useState(initialName ?? "");
  const [note, setNote] = useState(initialNote ?? "");
  const [radius, setRadius] = useState(initialRadius ?? 200);
  const radiusScale = useSharedValue(1);

  useEffect(() => {
    setName(initialName ?? "");
    setNote(initialNote ?? "");
    setRadius(initialRadius ?? 200);
  }, [initialName, initialNote, initialRadius, visible]);

  const radiusAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: radiusScale.value }],
  }));

  const isEditing = Boolean(initialName);
  const canSave = name.trim().length > 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.heading}>
            {isEditing ? "Rediger sted" : "Gem sted"}
          </Text>

          <Text style={styles.label}>Navn</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Fx Café Norden"
            placeholderTextColor={theme.colors.textMuted}
            style={styles.input}
          />

          <Text style={styles.label}>Note</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Hvorfor vil du huske dette sted?"
            placeholderTextColor={theme.colors.textMuted}
            style={[styles.input, styles.noteInput]}
            multiline
          />

          <Text style={styles.label}>Påmind mig indenfor</Text>
          <Animated.Text style={[styles.radiusValue, radiusAnimatedStyle]}>
            {radius}m
          </Animated.Text>
          <Slider
            minimumValue={50}
            maximumValue={500}
            step={50}
            value={radius}
            onValueChange={(value) => {
              setRadius(value);
            }}
            minimumTrackTintColor={theme.colors.primary}
            maximumTrackTintColor={theme.colors.border}
            thumbTintColor={theme.colors.primary}
          />
        </ScrollView>

        <AnimatedPressable
          style={[
            styles.primaryButton,
            !canSave && styles.primaryButtonDisabled,
          ]}
          disabled={!canSave}
          onPress={() => onSave(name, note, radius)}
        >
          <Text style={styles.primaryButtonText}>Gem</Text>
        </AnimatedPressable>

        <Pressable style={styles.cancelButton} onPress={onClose}>
          <Text style={styles.cancelButtonText}>Annuller</Text>
        </Pressable>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.xl,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xl,
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xl,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textSecondary,
    marginBottom: 6,
    marginTop: theme.spacing.lg,
  },
  input: {
    backgroundColor: theme.colors.inputBg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  noteInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  radiusValue: {
    fontSize: 22,
    fontWeight: "700",
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 15,
    borderRadius: theme.radius.md,
    alignItems: "center",
    marginTop: theme.spacing.md,
  },
  primaryButtonDisabled: {
    opacity: 0.4,
  },
  primaryButtonText: {
    color: theme.colors.primaryText,
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelButtonText: {
    color: theme.colors.textSecondary,
    fontSize: 15,
    fontWeight: "500",
  },
});
