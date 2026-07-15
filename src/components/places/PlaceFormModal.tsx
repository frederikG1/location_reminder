import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput } from "react-native";
import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Slider from "@react-native-community/slider";

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

  useEffect(() => {
    setName(initialName ?? "");
    setNote(initialNote ?? "");
    setRadius(initialRadius ?? 200);
  }, [initialName, initialNote, initialRadius, visible]);

  const isEditing = Boolean(initialName);
  const canSave = name.trim().length > 0;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.heading}>{isEditing ? "Rediger sted" : "Gem sted"}</Text>

          <Text style={styles.label}>Navn</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Fx Café Norden"
            placeholderTextColor="#9B9B95"
            style={styles.input}
          />

          <Text style={styles.label}>Note</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Hvorfor vil du huske dette sted?"
            placeholderTextColor="#9B9B95"
            style={[styles.input, styles.noteInput]}
            multiline
          />

          <Text style={styles.label}>Påmind mig indenfor</Text>
          <Text style={styles.radiusValue}>{radius}m</Text>
          <Slider
            minimumValue={50}
            maximumValue={500}
            step={50}
            value={radius}
            onValueChange={setRadius}
            minimumTrackTintColor="#2F6F4F"
            maximumTrackTintColor="#E5E5E1"
            thumbTintColor="#2F6F4F"
          />
        </ScrollView>

        <Pressable
          style={[styles.primaryButton, !canSave && styles.primaryButtonDisabled]}
          disabled={!canSave}
          onPress={() => onSave(name, note, radius)}
        >
          <Text style={styles.primaryButtonText}>Gem</Text>
        </Pressable>

        <Pressable style={styles.cancelButton} onPress={onClose}>
          <Text style={styles.cancelButtonText}>Annuller</Text>
        </Pressable>
      </SafeAreaView>
    </Modal>
  );
}

const colors = {
  background: "#FFFFFF",
  primary: "#2F6F4F",
  textPrimary: "#1A1A1A",
  textSecondary: "#6B6B6B",
  border: "#E5E5E1",
  inputBg: "#F7F7F5",
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 6,
    marginTop: 16,
  },
  input: {
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.textPrimary,
  },
  noteInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  radiusValue: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 8,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
  },
  primaryButtonDisabled: {
    opacity: 0.4,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: "500",
  },
});