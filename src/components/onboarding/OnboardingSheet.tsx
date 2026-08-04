import { theme } from "@/src/theme";
import type { ReactNode } from "react";
import { StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import Animated, { SlideInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * How far the sheet hangs below the screen edge.
 *
 * The surface — and the two vertical border lines — continue past the bottom
 * instead of ending exactly there. Without that, neither rounding nor subpixel
 * placement can avoid leaving a strip of the card along the bottom edge, and
 * the lines end abruptly in the middle of nothing. Same trick as in
 * PlaceFormModal.
 */
export const SHEET_OVERHANG = 120;

type Props = {
  children: ReactNode;
  /** Renders the small grabber bar used on the form step. */
  handle?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * The white bottom sheet the first-run flow speaks through. Every step swaps
 * its contents; giving the sheet a `key` per step re-runs the slide-up.
 *
 * Note that `style` is applied last: the form step overrides both `bottom` (so
 * the sheet can sit on top of the keyboard) and `paddingBottom` (so the
 * padding that otherwise clears the home indicator doesn't become dead space
 * on top of the keys).
 */
export default function OnboardingSheet({ children, handle, style }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Animated.View
      entering={SlideInDown.duration(theme.animation.slow)}
      style={[
        styles.sheet,
        {
          paddingBottom:
            Math.max(insets.bottom, theme.spacing.xl) + 16 + SHEET_OVERHANG,
          marginBottom: -SHEET_OVERHANG,
        },
        style,
      ]}
    >
      {handle ? <Animated.View style={styles.handle} /> : null}
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.radius.sheet,
    borderTopRightRadius: theme.radius.sheet,
    borderWidth: theme.borderWidth,
    borderColor: theme.colors.border,
    // The bottom border sits off-screen (see SHEET_OVERHANG), so only the two
    // vertical lines and the top corners are visible — and none of them end
    // anywhere the eye can catch.
    borderBottomWidth: 0,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xxl,
    ...theme.shadow.sheet,
  },

  handle: {
    width: 38,
    height: 5,
    borderRadius: 3,
    backgroundColor: theme.colors.border,
    alignSelf: "center",
    marginTop: -6,
    marginBottom: theme.spacing.lg,
  },
});
