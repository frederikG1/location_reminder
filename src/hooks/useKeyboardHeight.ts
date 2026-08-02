import { useEffect, useState } from "react";
import { Keyboard, Platform } from "react-native";

/**
 * Tastaturets aktuelle højde i punkter — 0 når det er lukket.
 *
 * KeyboardAvoidingView kan skubbe et ark op, men den fortæller aldrig hvor
 * meget plads der er tilbage. Et ark hvis højde er sat i procent måler derfor
 * stadig mod HELE skærmen, også mens tastaturet dækker halvdelen, og vokser ud
 * over toppen. Med tallet herfra kan højden regnes i pixels mod den plads der
 * faktisk er.
 */
export function useKeyboardHeight() {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    // "will"-varianterne findes kun på iOS, men de rammer samtidig med
    // tastaturets animation frem for efter den, så arket følger med i stedet
    // for at hoppe på plads bagefter.
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
