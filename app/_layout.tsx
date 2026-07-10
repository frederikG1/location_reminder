import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="places/[id]"
        options={{
          title: "Sted",
        }}
      />
    </Stack>
  );
}
