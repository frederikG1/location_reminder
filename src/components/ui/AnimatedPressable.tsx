import * as Haptics from "expo-haptics";
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const AnimatedPressableBase = Animated.createAnimatedComponent(Pressable);

type Props = PressableProps & {
  style?: StyleProp<ViewStyle>;
  haptic?: boolean;
};

const springConfig = {
  damping: 18,
  stiffness: 320,
  mass: 0.4,
};

export default function AnimatedPressable({
  style,
  haptic = true,
  disabled,
  onPressIn,
  onPressOut,
  ...props
}: Props) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressableBase
      {...props}
      disabled={disabled}
      style={[style, animatedStyle, disabled && { opacity: 0.45 }]}
      onPressIn={(event) => {
        if (!disabled) {
          scale.value = withSpring(0.97, springConfig);
          if (haptic) {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        }
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        scale.value = withSpring(1, springConfig);
        onPressOut?.(event);
      }}
    />
  );
}
