// Dev-only logging. Collected behind one helper, so release builds stay quiet
// and these call sites can later point at crash reporting instead of the console.
export function log(...args: unknown[]) {
  if (__DEV__) {
    console.log(...args);
  }
}
