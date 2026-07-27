import AnimatedPressable from "@/src/components/ui/AnimatedPressable";
import { theme } from "@/src/theme";
import { formatWalkTime } from "@/src/util/formatWalkTime";
import Slider from "@react-native-community/slider";
import { StyleSheet, Text, TextInput, View } from "react-native";

export const RADIUS_MIN = 50;
export const RADIUS_MAX = 1000;
export const RADIUS_STEP = 25;
export const RADIUS_DEFAULT = 200;

type Suggestion = {
  emoji: string;
  name: string;
  note: string;
};

const SUGGESTIONS: Suggestion[] = [
  { emoji: "🛒", name: "Netto", note: "Mælk og kaffefiltre" },
  { emoji: "🏋️", name: "Fitness", note: "Tag tøjet med hjem" },
  // { emoji: "🏠", name: "Mor", note: "Giv boremaskinen tilbage" },
  { emoji: "☕", name: "Spisested", note: "Hyggelig café"}
];

type Props = {
  name: string;
  note: string;
  radius: number;
  onChangeName: (name: string) => void;
  onChangeNote: (note: string) => void;
  onChangeRadius: (radius: number) => void;
  onSave: () => void;
  showSuggestions?: boolean;
  saveLabel?: string;
};

/**
 * The body of the save-a-place form: suggestion chips, name, note and the
 * radius slider. Shared by the first-run flow and the save/edit modal so the
 * sheet you meet on day one is the same one you use on day thirty.
 */
export default function PlaceFormFields({
  name,
  note,
  radius,
  onChangeName,
  onChangeNote,
  onChangeRadius,
  onSave,
  showSuggestions = false,
  saveLabel,
}: Props) {
  const canSave = name.trim().length > 0;

  const buttonLabel = canSave
    ? (saveLabel ?? `Gem ${name.trim()}`)
    : "Vælg eller skriv et navn først";

  function applySuggestion(suggestion: Suggestion) {
    onChangeName(suggestion.name);
    onChangeNote(suggestion.note);
  }

  return (
    <View>
      {showSuggestions ? (
        <View style={styles.chips}>
          {SUGGESTIONS.map((suggestion) => {
            const selected = name === suggestion.name;

            return (
              <AnimatedPressable
                key={suggestion.name}
                style={[styles.chip, selected && styles.chipSelected]}
                onPress={() => applySuggestion(suggestion)}
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
        placeholder="Tryk på et forslag, eller skriv et navn"
        placeholderTextColor={theme.colors.textMuted}
        style={styles.input}
      />

      <TextInput
        value={note}
        onChangeText={onChangeNote}
        placeholder="Hvorfor? Mælk, filtre, det sædvanlige…"
        placeholderTextColor={theme.colors.textMuted}
        style={[styles.input, styles.inputSpaced]}
      />

      <View style={styles.radiusRow}>
        <Text style={styles.radiusLabel}>Påmind mig indenfor</Text>

        <View style={styles.radiusValueRow}>
          <Text style={styles.radiusValue}>{radius} m</Text>
          <Text style={styles.radiusWalk}>{formatWalkTime(radius)}</Text>
        </View>
      </View>

      <Slider
        minimumValue={RADIUS_MIN}
        maximumValue={RADIUS_MAX}
        step={RADIUS_STEP}
        value={radius}
        onValueChange={onChangeRadius}
        minimumTrackTintColor={theme.colors.primary}
        maximumTrackTintColor={theme.colors.border}
        thumbTintColor={theme.colors.primary}
      />

      <View style={styles.radiusBounds}>
        <Text style={styles.radiusBoundText}>{RADIUS_MIN} m</Text>
        <Text style={styles.radiusBoundText}>1 km</Text>
      </View>

      {canSave ? (
        <AnimatedPressable style={styles.saveButton} onPress={onSave}>
          <Text style={styles.saveButtonText}>{buttonLabel}</Text>
        </AnimatedPressable>
      ) : (
        <View style={[styles.saveButton, styles.saveButtonDisabled]}>
          <Text style={styles.saveButtonText}>{buttonLabel}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
    fontWeight: "500",
    color: theme.colors.textPrimary,
  },

  chipTextSelected: {
    color: theme.colors.primary,
  },

  input: {
    backgroundColor: theme.colors.inputBg,
    borderWidth: theme.borderWidth,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
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
    color: theme.colors.primary,
  },

  radiusWalk: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },

  radiusBounds: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: -2,
  },

  radiusBoundText: {
    fontSize: 11.5,
    color: theme.colors.textMuted,
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
    color: theme.colors.primaryText,
    fontSize: 17,
    fontWeight: "600",
  },
});
