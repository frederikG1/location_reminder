import PlaceFormFields, {
  RADIUS_DEFAULT,
} from "@/src/components/places/PlaceFormFields";
import AnimatedPressable from "@/src/components/ui/AnimatedPressable";
import { theme } from "@/src/theme";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (name: string, note: string, radius: number, emoji: string) => void;
  initialName?: string;
  initialNote?: string;
  initialRadius?: number;
  initialEmoji?: string;
};

export default function CreatePlaceModal({
  visible,
  onClose,
  onSave,
  initialName,
  initialNote,
  initialRadius,
  initialEmoji,
}: Props) {
  const [name, setName] = useState(initialName ?? "");
  const [note, setNote] = useState(initialNote ?? "");
  const [radius, setRadius] = useState(initialRadius ?? RADIUS_DEFAULT);
  const [emoji, setEmoji] = useState(initialEmoji ?? "");
  const insets = useSafeAreaInsets();

  useEffect(() => {
    setName(initialName ?? "");
    setNote(initialNote ?? "");
    setRadius(initialRadius ?? RADIUS_DEFAULT);
    setEmoji(initialEmoji ?? "");
  }, [initialName, initialNote, initialRadius, initialEmoji, visible]);

  const isEditing = Boolean(initialName);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        {/* Tryk uden for arket lukker det — samme forventning som ethvert
            andet bundark på iOS. */}
        <Pressable
          style={styles.backdropFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Luk"
        />

        <KeyboardAvoidingView
          style={styles.keyboardAvoiding}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.sheet}>
            <View style={styles.handle} />

            <ScrollView
              contentContainerStyle={[
                styles.scrollContent,
                { paddingBottom: Math.max(insets.bottom, theme.spacing.lg) },
              ]}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.heading}>
                {isEditing ? "Rediger sted" : "Hvad er her?"}
              </Text>

              <PlaceFormFields
                name={name}
                note={note}
                radius={radius}
                emoji={emoji}
                onChangeName={setName}
                onChangeNote={setNote}
                onChangeRadius={setRadius}
                onChangeEmoji={setEmoji}
                onSave={() => onSave(name, note, radius, emoji)}
                showSuggestions={!isEditing}
                saveLabel={isEditing ? "Gem ændringer" : undefined}
              />

              <AnimatedPressable
                style={styles.cancelButton}
                onPress={onClose}
                haptic={false}
                accessibilityRole="button"
                accessibilityLabel="Annuller"
              >
                <Text style={styles.cancelButtonText}>Annuller</Text>
              </AnimatedPressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: theme.colors.overlay,
  },

  backdropFill: {
    flex: 1,
  },

  // KeyboardAvoidingView shrink-wraps to its content by default, so without an
  // explicit width it only takes up as much horizontal space as its children
  // need — leaving the dimmed backdrop visible down both sides of the sheet.
  keyboardAvoiding: {
    width: "100%",
  },

  sheet: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.radius.sheet,
    borderTopRightRadius: theme.radius.sheet,
    borderWidth: theme.borderWidth,
    // Bundkanten ligger uden for skærmen, så kun de øverste hjørners streg ses.
    borderBottomWidth: 0,
    borderColor: theme.colors.border,
    paddingTop: theme.spacing.md,
    // Arket må aldrig dække hele skærmen — det er det, der gør det til et ark.
    maxHeight: "92%",
  },

  handle: {
    width: 52,
    height: 5,
    borderRadius: 3,
    backgroundColor: theme.colors.border,
    alignSelf: "center",
    marginBottom: theme.spacing.md,
  },

  scrollContent: {
    paddingHorizontal: theme.spacing.xl,
  },

  heading: {
    ...theme.typography.titleSm,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.lg,
  },

  cancelButton: {
    paddingVertical: 14,
    alignItems: "center",
  },

  cancelButtonText: {
    ...theme.typography.button,
    color: theme.colors.textSecondary,
  },
});
