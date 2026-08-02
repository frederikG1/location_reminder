import { theme } from "@/src/theme";
import * as Haptics from "expo-haptics";
import { Pressable, StyleSheet } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from "react-native-reanimated";

const TRACK_WIDTH = 56;
const TRACK_HEIGHT = 33;
const THUMB_SIZE = 25;
const PADDING = 1.5;
const TRAVEL = TRACK_WIDTH - THUMB_SIZE - theme.borderWidth * 2 - PADDING * 2;

type Props = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  accessibilityLabel?: string;
};

/**
 * Kontakten fra designet. React Natives egen `Switch` kan hverken få en kant
 * eller en anden form, og en kantløs kontakt ville være det eneste element i
 * appen uden den mørke streg omkring sig.
 */
export default function Toggle({
  value,
  onValueChange,
  disabled,
  accessibilityLabel,
}: Props) {
  const progress = useDerivedValue(() =>
    withTiming(value ? 1 : 0, { duration: theme.animation.fast }),
  );

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [theme.colors.inputBg, theme.colors.primary],
    ),
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * TRAVEL }],
  }));

  return (
    <Pressable
      onPress={() => {
        if (disabled) {
          return;
        }
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onValueChange(!value);
      }}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value, disabled }}
      hitSlop={8}
    >
      <Animated.View
        style={[styles.track, trackStyle, disabled && styles.disabled]}
      >
        <Animated.View style={[styles.thumb, thumbStyle]} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: theme.radius.pill,
    borderWidth: theme.borderWidth,
    borderColor: theme.colors.border,
    justifyContent: "center",
    paddingHorizontal: PADDING,
  },

  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    borderWidth: theme.borderWidth,
    borderColor: theme.colors.border,
  },

  disabled: {
    opacity: 0.45,
  },
});
