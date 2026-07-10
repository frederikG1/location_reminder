import { Modal, Text, TextInput, Button, StyleSheet } from "react-native";
import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (name: string, note: string) => void;

  initialName?: string;
  initialNote?: string;
};

export default function CreatePlaceModal({
  visible,
  onClose,
  onSave,
  initialName,
  initialNote,
}: Props) {
  const [name, setName] = useState(initialName ?? "");
  const [note, setNote] = useState(initialNote ?? "");

  //sync every time modal opens
  useEffect(() => {
    setName(initialName ?? "");
    setNote(initialNote ?? "");
  }, [initialName, initialNote, visible]);

  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={styles.modalContainer}>
        <Text>{initialName ? "Rediger sted" : "Gem sted"}</Text>
        <TextInput value={name} onChangeText={setName} />

        <Text>Note om stedet</Text>

        <TextInput value={note} onChangeText={setNote} />

        <Button title="Gem" onPress={() => onSave(name, note)} />

        <Button title="Annuller" onPress={onClose} />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    padding: 20,
  },
});
