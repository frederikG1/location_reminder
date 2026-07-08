import { Modal, Text, TextInput, Button} from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (name: string, note: string) => void;
};

export default function CreatePlaceModal({ visible, onClose, onSave }: Props) {
  const [name, setName] = useState("");
  const [note, setNote] = useState("");

  return (
    <Modal visible={visible}>
      <SafeAreaView>
        <Text>Gem sted</Text>
        <TextInput value={name} onChangeText={setName} />

        <Text>Note om stedet</Text>
        
        <TextInput value={note} onChangeText={setNote} />

        <Button title="Gem" onPress={() => onSave(name, note)} />

        <Button title="Annuller" onPress={onClose} />
      </SafeAreaView>
    </Modal>
  );
}
