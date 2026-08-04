import { useEffect, useState } from "react";
import { Keyboard, Platform } from "react-native";

/**
 * The keyboard's current height in points — 0 when it is closed.
 *
 * KeyboardAvoidingView can push a sheet up, but it never says how much room is
 * left. A sheet whose height is set as a percentage therefore still measures
 * against the WHOLE screen, even while the keyboard covers half of it, and
 * grows past the top. With the number from here, the height can be calculated
 * in pixels against the space that actually exists.
 */
export function useKeyboardHeight() {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    // The "will" variants only exist on iOS, but they fire alongside the
    // keyboard's animation rather than after it, so the sheet follows along
    // instead of snapping into place afterwards.
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const show = Keyboard.addListener(showEvent, (event) => {
      setHeight(event.endCoordinates.height);
    });

    const hide = Keyboard.addListener(hideEvent, () => setHeight(0));

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return height;
}
