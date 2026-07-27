import PlaceFormFields, {
  RADIUS_DEFAULT,
} from "@/src/components/places/PlaceFormFields";
import AnimatedPressable from "@/src/components/ui/AnimatedPressable";
import { theme } from "@/src/theme";
import { useEffect, useState } from "react";
import { Modal, ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
  const [radius, setRadius] = useState(initialRadius ?? RADIUS_DEFAULT);

  useEffect(() => {
    setName(initialName ?? "");
    setNote(initialNote ?? "");
    setRadius(initialRadius ?? RADIUS_DEFAULT);
  }, [initialName, initialNote, initialRadius, visible]);

  const isEditing = Boolean(initialName);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.heading}>
            {isEditing ? "Rediger sted" : "Hvad er her?"}
          </Text>

          <PlaceFormFields
            name={name}
            note={note}
            radius={radius}
            onChangeName={setName}
            onChangeNote={setNote}
            onChangeRadius={setRadius}
            onSave={() => onSave(name, note, radius)}
            showSuggestions={!isEditing}
            saveLabel={isEditing ? "Gem ændringer" : undefined}
          />
        </ScrollView>

        <AnimatedPressable style={styles.cancelButton} onPress={onClose}>
          <Text style={styles.cancelButtonText}>Annuller</Text>
        </AnimatedPressable>
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
    ...theme.typography.heading,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xl,
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
