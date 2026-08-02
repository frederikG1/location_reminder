import { theme } from "@/src/theme";
import type { ReactNode } from "react";
import { StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import Animated, { SlideInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * Hvor langt arket hænger ned under skærmkanten.
 *
 * Fladen — og de to lodrette kantstreger — fortsætter forbi bunden i stedet
 * for at slutte præcis dér. Uden det kan hverken afrunding eller
 * subpixel-placering undgå at efterlade en stribe af kortet langs nederste
 * kant, og stregerne ender brat midt i ingenting. Samme greb som i
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
 * Bemærk at `style` lægges sidst: formularskridtet overskriver både `bottom`
 * (så arket kan lægge sig oven på tastaturet) og `paddingBottom` (så den
 * polstring der ellers rydder home-indikatoren ikke bliver dødt rum oven på
 * tasterne).
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
    // Bundkanten ligger uden for skærmen (se SHEET_OVERHANG), så kun de to
    // lodrette streger og de øverste hjørner ses — og ingen af dem slutter et
    // sted øjet kan få fat i.
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
