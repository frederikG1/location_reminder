import { theme } from "@/src/theme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import AnimatedPressable from "./AnimatedPressable";

type Props = {
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
};

/**
 * Samme cirkel som indstillingsknappen på forsiden — det er den form appen
 * bruger til "en enkelt handling", og en tilbageknap er ikke en undtagelse.
 */
export default function BackButton({ style, onPress }: Props) {
  return (
    <AnimatedPressable
      style={[styles.button, style]}
      onPress={onPress ?? goBack}
      accessibilityRole="button"
      accessibilityLabel="Tilbage"
      hitSlop={10}
    >
      <Ionicons
        name="chevron-back"
        size={22}
        color={theme.colors.textPrimary}
        style={styles.icon}
      />
    </AnimatedPressable>
  );
}

/**
 * En notifikation kan åbne et sted direkte. Sker det ved koldstart, er der
 * ikke nødvendigvis noget at gå tilbage til — og uden faldet her ville
 * knappen se ud som om den virkede uden at gøre noget.
 */
function goBack() {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace("/");
  }
}

const styles = StyleSheet.create({
  button: {
    width: 42,
    height: 42,
    borderRadius: theme.radius.pill,
    borderWidth: theme.borderWidth,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },

  // Chevronen har mere luft i højre side af sit eget glyf-felt end i venstre,
  // så den lander optisk skævt i en cirkel uden det her lille skub.
  icon: {
    marginLeft: -2,
  },
});
