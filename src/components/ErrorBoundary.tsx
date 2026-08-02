import { theme } from "@/src/theme";
import { log } from "@/src/util/logger";
import { Component, type ErrorInfo, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = { children: ReactNode };
type State = { hasError: boolean };

/**
 * Uden denne bliver en fejl under rendering til en permanent hvid skærm uden
 * nogen antydning af hvad der gik galt. Nulstilling af state monterer træet
 * igen, hvilket er nok til at komme videre fra en forbigående fejl.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    log("Uventet fejl:", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Ups, noget gik galt</Text>
        <Text style={styles.body}>
          Appen stødte på en uventet fejl. Dine gemte steder er der stadig.
        </Text>

        <Pressable
          style={styles.button}
          onPress={() => this.setState({ hasError: false })}
          accessibilityRole="button"
          accessibilityLabel="Prøv igen"
        >
          <Text style={styles.buttonText}>Prøv igen</Text>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.background,
  },

  title: {
    ...theme.typography.sectionTitle,
    color: theme.colors.textPrimary,
  },

  body: {
    ...theme.typography.body,
    marginTop: theme.spacing.sm,
    textAlign: "center",
    color: theme.colors.textSecondary,
  },

  button: {
    marginTop: theme.spacing.xl,
    backgroundColor: theme.colors.primary,
    borderWidth: theme.borderWidth,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.button,
    paddingVertical: 15,
    paddingHorizontal: theme.spacing.xl,
  },

  buttonText: {
    ...theme.typography.button,
    color: theme.colors.primaryText,
  },
});
