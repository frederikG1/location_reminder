import { getPlaceEmoji } from "@/src/components/places/PlaceCard";
import AnimatedPressable from "@/src/components/ui/AnimatedPressable";
import { theme } from "@/src/theme";
import { formatWalkTime } from "@/src/util/formatWalkTime";
import { StyleSheet, Text, TextInput, View } from "react-native";

export const RADIUS_OPTIONS = [50, 100, 250, 500, 1000];
export const RADIUS_DEFAULT = 250;

function formatRadiusLabel(radius: number) {
  return radius >= 1000 ? `${radius / 1000} km` : `${radius} m`;
}

/**
 * Typing a new emoji appends to whatever's already there, so this keeps only
 * the most recently typed one. Segmented by grapheme cluster, not code unit,
 * so multi-part emoji (skin tones, flags, ZWJ sequences) survive intact.
 */
function keepLastEmoji(text: string): string {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segments = Array.from(
      new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(
        text,
      ),
    );
    return segments.length > 0 ? segments[segments.length - 1].segment : "";
  }

  const codePoints = Array.from(text);
  return codePoints.length > 0 ? codePoints[codePoints.length - 1] : "";
}

type Suggestion = {
  emoji: string;
  name: string;
  note: string;
};

const SUGGESTIONS: Suggestion[] = [
  { emoji: "🛒", name: "Groceries", note: "Milk and coffee filters" },
  { emoji: "🏋️", name: "Gym", note: "Take the kit home" },
  // { emoji: "🏠", name: "Mum", note: "Give the drill back" },
  { emoji: "☕", name: "Coffee", note: "The nice little café" }
];

type Props = {
  name: string;
  note: string;
  radius: number;
  emoji: string;
  onChangeName: (name: string) => void;
  onChangeNote: (note: string) => void;
  onChangeRadius: (radius: number) => void;
  onChangeEmoji: (emoji: string) => void;
  onSave: () => void;
  showSuggestions?: boolean;
  saveLabel?: string;
};

/**
 * The body of the save-a-place form: suggestion chips, name, note and the
 * radius presets. Shared by the first-run flow and the save/edit modal so the
 * sheet you meet on day one is the same one you use on day thirty.
 */
export default function PlaceFormFields({
  name,
  note,
  radius,
  emoji,
  onChangeName,
  onChangeNote,
  onChangeRadius,
  onChangeEmoji,
  onSave,
  showSuggestions = false,
  saveLabel,
}: Props) {
  const canSave = name.trim().length > 0;

  const buttonLabel = canSave
    ? (saveLabel ?? `Save ${name.trim()}`)
    : "Pick or type a name first";

  function applySuggestion(suggestion: Suggestion) {
    onChangeName(suggestion.name);
    onChangeNote(suggestion.note);
    onChangeEmoji(suggestion.emoji);
  }

  return (
    <View>
      <View style={styles.emojiRow}>
        <TextInput
          value={emoji}
          onChangeText={(text) => onChangeEmoji(keepLastEmoji(text))}
          placeholder={getPlaceEmoji(name)}
          maxLength={16}
          style={styles.emojiInput}
          accessibilityLabel="Symbol for the place"
          accessibilityHint="Type an emoji, or we'll pick one from the name"
        />
        <Text style={styles.emojiHint}>Tap to choose your own symbol</Text>
      </View>

      {showSuggestions ? (
        <View style={styles.chips}>
          {SUGGESTIONS.map((suggestion) => {
            const selected = name === suggestion.name;

            return (
              <AnimatedPressable
                key={suggestion.name}
                style={[styles.chip, selected && styles.chipSelected]}
                onPress={() => applySuggestion(suggestion)}
                accessibilityRole="button"
                accessibilityLabel={suggestion.name}
                accessibilityState={{ selected }}
              >
                <Text
                  style={[styles.chipText, selected && styles.chipTextSelected]}
                >
                  {suggestion.emoji} {suggestion.name}
                </Text>
              </AnimatedPressable>
            );
          })}
        </View>
      ) : null}

      <TextInput
        value={name}
        onChangeText={onChangeName}
        placeholder="Tap a suggestion, or type a name"
        placeholderTextColor={theme.colors.textMuted}
        style={styles.input}
      />

      <TextInput
        value={note}
        onChangeText={onChangeNote}
        placeholder="Why? Milk, filters, the usual…"
        placeholderTextColor={theme.colors.textMuted}
        style={[styles.input, styles.inputSpaced]}
      />

      <View style={styles.radiusRow}>
        <Text style={styles.radiusLabel}>Remind me within</Text>

        <View style={styles.radiusValueRow}>
          <Text style={styles.radiusValue}>{formatRadiusLabel(radius)}</Text>
          <Text style={styles.radiusWalk}>{formatWalkTime(radius)}</Text>
        </View>
      </View>

      <View style={styles.radiusOptions}>
        {RADIUS_OPTIONS.map((option) => {
          const selected = radius === option;

          return (
            <AnimatedPressable
              key={option}
              style={[styles.chip, selected && styles.chipSelected]}
              onPress={() => onChangeRadius(option)}
              accessibilityRole="button"
              accessibilityLabel={`Radius ${formatRadiusLabel(option)}`}
              accessibilityState={{ selected }}
            >
              <Text
                style={[styles.chipText, selected && styles.chipTextSelected]}
              >
                {formatRadiusLabel(option)}
              </Text>
            </AnimatedPressable>
          );
        })}
      </View>

      {canSave ? (
        <AnimatedPressable
          style={styles.saveButton}
          onPress={onSave}
          accessibilityRole="button"
          accessibilityLabel={buttonLabel}
        >
          <Text style={styles.saveButtonText}>{buttonLabel}</Text>
        </AnimatedPressable>
      ) : (
        <View
          style={[styles.saveButton, styles.saveButtonDisabled]}
          accessibilityRole="button"
          accessibilityLabel={buttonLabel}
          accessibilityState={{ disabled: true }}
        >
          <Text style={styles.saveButtonText}>{buttonLabel}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  emojiRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },

  emojiInput: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.primaryMuted,
    borderWidth: theme.borderWidth,
    borderColor: theme.colors.border,
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: 24,
    padding: 0,
  },

  emojiHint: {
    ...theme.typography.caption,
    flex: 1,
    color: theme.colors.textSecondary,
  },

  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },

  chip: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 10,
    borderRadius: theme.radius.pill,
    borderWidth: theme.borderWidth,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.inputBg,
  },

  chipSelected: {
    borderColor: theme.colors.primary,
  },

  chipText: {
    fontSize: 15,
    fontFamily: theme.fonts.bold,
    color: theme.colors.textPrimary,
  },

  chipTextSelected: {
    fontFamily: theme.fonts.extrabold,
    color: theme.colors.primaryStrong,
  },

  input: {
    backgroundColor: theme.colors.inputBg,
    borderWidth: theme.borderWidth,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
    fontFamily: theme.fonts.bold,
    color: theme.colors.textPrimary,
  },

  inputSpaced: {
    marginTop: theme.spacing.sm,
  },

  radiusRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginTop: theme.spacing.xl,
  },

  radiusLabel: {
    ...theme.typography.label,
    color: theme.colors.textSecondary,
  },

  radiusValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 7,
  },

  radiusValue: {
    ...theme.typography.sectionTitle,
    color: theme.colors.primaryStrong,
  },

  radiusWalk: {
    ...theme.typography.captionStrong,
    color: theme.colors.textSecondary,
  },

  radiusOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },

  saveButton: {
    marginTop: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: theme.radius.button,
    borderWidth: theme.borderWidth,
    borderColor: theme.colors.border,
    alignItems: "center",
    ...theme.shadow.primaryButton,
  },

  saveButtonDisabled: {
    backgroundColor: theme.colors.primaryDisabled,
    shadowOpacity: 0,
    elevation: 0,
  },

  saveButtonText: {
    fontSize: 17,
    fontFamily: theme.fonts.black,
    color: theme.colors.primaryText,
  },
});
