import { theme } from "@/src/theme";
import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import BackButton from "./BackButton";
import FadeInView from "./FadeInView";

type Props = {
  /**
   * Omitted when the screen's content carries the heading itself — the place
   * screen already shows the name large with an emoji, and "Place" above it
   * would only repeat that in a flatter word.
   */
  title?: string;
  right?: ReactNode;
  onBack?: () => void;
};

/**
 * Replaces the native stack header on every screen that isn't the home screen.
 * The native one is a white bar with the system's blue chevron and "Back" —
 * the app has neither white bars, nor blue, nor the system typeface anywhere
 * else.
 *
 * The title sits below the button rather than beside it, so it can be just as
 * large as the home screen's heading. A centred title in a bar would force it
 * down to a size no other heading in the app has.
 */
export default function ScreenHeader({ title, right, onBack }: Props) {
  return (
    <FadeInView style={styles.header}>
      <View style={styles.row}>
        <BackButton onPress={onBack} />
        {right ?? null}
      </View>

      {title ? <Text style={styles.title}>{title}</Text> : null}
    </FadeInView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.md,
  },

  title: {
    marginTop: theme.spacing.md,
    fontSize: 32,
    fontFamily: theme.fonts.black,
    color: theme.colors.textPrimary,
    letterSpacing: -0.7,
  },
});
