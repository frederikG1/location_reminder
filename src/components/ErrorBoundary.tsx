import { theme } from "@/src/theme";
import { log } from "@/src/util/logger";
import { Component, type ErrorInfo, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = { children: ReactNode };
type State = { hasError: boolean };

/**
 * Without this, an error during rendering becomes a permanent white screen
 * with no hint of what went wrong. Resetting state mounts the tree again,
 * which is enough to get past a transient failure.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    log("Unexpected error:", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Oops, something went wrong</Text>
        <Text style={styles.body}>
          The app hit an unexpected error. Your saved places are still there.
        </Text>

        <Pressable
          style={styles.button}
          onPress={() => this.setState({ hasError: false })}
          accessibilityRole="button"
          accessibilityLabel="Try again"
        >
          <Text style={styles.buttonText}>Try again</Text>
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
