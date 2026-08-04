import PlaceFormFields, {
  RADIUS_DEFAULT,
} from "@/src/components/places/PlaceFormFields";
import AnimatedPressable from "@/src/components/ui/AnimatedPressable";
import { useKeyboardHeight } from "@/src/hooks/useKeyboardHeight";
import { theme } from "@/src/theme";
import { Ionicons } from "@expo/vector-icons";
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
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/** Height of the close-button row, so the ScrollView's limit can subtract it. */
const CLOSE_ROW_HEIGHT = 46;

/**
 * How far the sheet hangs below the screen edge. The cream colour continues
 * past the bottom, so neither rounding nor subpixel placement can leave a strip
 * of the dark background along the bottom edge.
 */
const SHEET_OVERHANG = 120;

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
  const { height: windowHeight } = useWindowDimensions();
  const keyboardHeight = useKeyboardHeight();

  // A concrete pixel value, not "92%" or flex:1. The sheet is a hug-content
  // box (maxHeight only, no height/flex of its own) — a flex:1 ScrollView
  // inside it cannot know how much room it has, because the box's own height
  // depends on the ScrollView's content, which in turn is waiting to learn its
  // own space. A fixed number breaks that circularity.
  //
  // The keyboard is subtracted FIRST. Without that, the number was still
  // derived from the whole screen while KeyboardAvoidingView pushed the sheet
  // up — so the top (heading and emoji picker) ended up behind the status bar,
  // exactly when the keyboard was open.
  const sheetMaxHeight = Math.round((windowHeight - keyboardHeight) * 0.92);

  // With the keyboard up it already covers the home indicator, so the sheet's
  // own bottom padding would just be dead space on top of the keys.
  const sheetPaddingBottom = keyboardHeight > 0 ? theme.spacing.md : insets.bottom;

  // The ScrollView needs its OWN limit, minus the sheet's own padding —
  // otherwise the two together can exceed sheetMaxHeight, and the bottom gets
  // clipped by overflow:hidden instead of being scrollable to.
  const scrollMaxHeight =
    sheetMaxHeight - sheetPaddingBottom - theme.spacing.md - CLOSE_ROW_HEIGHT;

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
      {/*
        KeyboardAvoidingView MUST be the outermost flex:1 layer, not nested
        inside one — otherwise the "padding" behaviour just makes the sheet
        taller instead of giving it less room, and the top (heading, emoji
        picker) is pushed invisibly past the screen edge when the keyboard
        (especially the tall emoji keyboard) opens.
      */}
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Tapping outside the sheet closes it — the same expectation as any
            other bottom sheet on iOS. */}
        <Pressable
          style={styles.backdropFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close"
        />

        <View
          style={[
            styles.sheet,
            {
              // The overhang is added on top of the limit, so the VISIBLE
              // height is still sheetMaxHeight.
              maxHeight: sheetMaxHeight + SHEET_OVERHANG,
              // The cream continues down under the home indicator and on past
              // the screen edge, where the bottom border hides.
              paddingBottom: sheetPaddingBottom + SHEET_OVERHANG,
              marginBottom: -SHEET_OVERHANG,
            },
          ]}
        >
          <View style={styles.closeRow}>
            <AnimatedPressable
              style={styles.closeButton}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Ionicons
                name="close"
                size={20}
                color={theme.colors.textPrimary}
              />
            </AnimatedPressable>
          </View>

          <ScrollView
            style={{ maxHeight: scrollMaxHeight }}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.heading}>
              {isEditing ? "Edit place" : "What's here?"}
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
              saveLabel={isEditing ? "Save changes" : undefined}
            />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
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

  sheet: {
    width: "100%",
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.radius.sheet,
    borderTopRightRadius: theme.radius.sheet,
    // Deliberately WITHOUT a border — the only place in the app without the
    // dark outline. The design wants "border-top" alone, but React Native
    // cannot draw a single-sided border together with borderRadius (iOS falls
    // back to a different code path and the corners don't curve along), and a
    // full border leaves two vertical lines ending abruptly at the screen
    // edge. The dark backdrop already delimits the sheet clearly.
    paddingTop: theme.spacing.md,
    // Deliberately NO overflow:"hidden" here. It created a mask layer whose
    // bottom corners iOS rounded, letting the background bleed through at the
    // sides. The ScrollView already clips its own content, and its maxHeight
    // keeps it inside the sheet — so the mask was redundant.
  },

  // Replaces the earlier grabber bar, which looked draggable without being so.
  // A cross only promises what it actually does.
  closeRow: {
    height: CLOSE_ROW_HEIGHT,
    paddingHorizontal: theme.spacing.xl,
    alignItems: "flex-end",
    justifyContent: "center",
  },

  closeButton: {
    width: 38,
    height: 38,
    borderRadius: theme.radius.pill,
    borderWidth: theme.borderWidth,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },

  scrollContent: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
  },

  heading: {
    ...theme.typography.titleSm,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.lg,
  },
});
