import PlaceFormFields, {
  RADIUS_DEFAULT,
} from "@/src/components/places/PlaceFormFields";
import AnimatedPressable from "@/src/components/ui/AnimatedPressable";
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

/** Højden af luk-knappens række, så ScrollView'ens grænse kan trække den fra. */
const CLOSE_ROW_HEIGHT = 46;

/**
 * Hvor langt arket hænger ned under skærmkanten. Cremefarven fortsætter forbi
 * bunden, så hverken afrunding eller subpixel-placering kan efterlade en
 * stribe af den mørke baggrund langs nederste kant.
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

  // Et konkret pixeltal, ikke "92%" eller flex:1. Sheet'et er en
  // hug-content-boks (kun maxHeight, ingen egen height/flex) — en flex:1-
  // ScrollView deri kan ikke vide hvor meget plads den har, fordi boksens
  // egen højde afhænger af ScrollView'ens indhold, som igen venter på at
  // vide sin plads. Et fast tal bryder den cirkularitet.
  const sheetMaxHeight = Math.round(windowHeight * 0.92);

  // ScrollView'en skal have sin EGEN grænse, fratrukket arkets egen padding —
  // ellers kan de tilsammen blive højere end sheetMaxHeight, og bunden bliver
  // klippet væk af overflow:hidden i stedet for at kunne scrolles til.
  const scrollMaxHeight =
    sheetMaxHeight - insets.bottom - theme.spacing.md - CLOSE_ROW_HEIGHT;

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
        KeyboardAvoidingView SKAL være det yderste flex:1-lag, ikke nestet
        inde i det — ellers "padding"-adfærden bare gør arket højere i stedet
        for at give det mindre plads, og toppen (overskrift, emoji-vælger)
        skubbes usynligt op over skærmens kant når tastaturet (særligt det
        høje emoji-tastatur) åbner.
      */}
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Tryk uden for arket lukker det — samme forventning som ethvert
            andet bundark på iOS. */}
        <Pressable
          style={styles.backdropFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Luk"
        />

        <View
          style={[
            styles.sheet,
            {
              // Overhænget lægges oven i grænsen, så den SYNLIGE højde stadig
              // er sheetMaxHeight.
              maxHeight: sheetMaxHeight + SHEET_OVERHANG,
              // Cremefarven fortsætter ned under home-indikatoren og videre ud
              // over skærmkanten, hvor bundkanten gemmer sig.
              paddingBottom: insets.bottom + SHEET_OVERHANG,
              marginBottom: -SHEET_OVERHANG,
            },
          ]}
        >
          <View style={styles.closeRow}>
            <AnimatedPressable
              style={styles.closeButton}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Luk"
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
    // Bevidst UDEN kant — det eneste sted i appen uden den mørke streg.
    // Designet vil have "border-top" alene, men React Native kan ikke tegne en
    // kant på én side sammen med borderRadius (iOS falder tilbage til en anden
    // kodesti, og hjørnerne buer ikke med), og en hel kant efterlader to
    // lodrette streger der slutter brat ved skærmkanten. Den mørke baggrund
    // afgrænser allerede arket tydeligt.
    paddingTop: theme.spacing.md,
    // Bevidst INGEN overflow:"hidden" her. Den lavede et maskelag, som iOS
    // rundede bundhjørnerne på, så baggrunden sivede igennem i siderne.
    // ScrollView'en klipper allerede sit eget indhold, og dens maxHeight
    // holder den inden for arket — så masken var overflødig.
  },

  // Erstatter den tidligere greb-streg, som så ud som om man kunne trække i
  // den uden at kunne det. Et kryds lover kun det, det faktisk gør.
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
