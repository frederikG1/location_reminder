// Dev-only logging. Samlet bag én hjælper, så release-builds er tavse og disse
// kaldesteder senere kan pege på crash-rapportering i stedet for konsollen.
export function log(...args: unknown[]) {
  if (__DEV__) {
    console.log(...args);
  }
}
