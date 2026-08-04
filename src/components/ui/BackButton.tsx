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
 * The same circle as the settings button on the home screen — that is the
 * shape the app uses for "a single action", and a back button is no exception.
 */
export default function BackButton({ style, onPress }: Props) {
  return (
    <AnimatedPressable
      style={[styles.button, style]}
      onPress={onPress ?? goBack}
      accessibilityRole="button"
      accessibilityLabel="Back"
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
 * A notification can open a place directly. When that happens on a cold start
 * there isn't necessarily anything to go back to — and without the fallback
 * here the button would look like it worked while doing nothing.
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

  // The chevron has more air on the right of its own glyph box than on the
  // left, so it lands optically off-centre in a circle without this small nudge.
  icon: {
    marginLeft: -2,
  },
});
