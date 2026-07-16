import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#FFFFFF" },
        headerTintColor: "#1A1A1A",
        headerTitleStyle: { fontWeight: "600" },
        headerBackTitle: "Tilbage",
      }}
    >
      <Stack.Screen
        name="places/[id]"
        options={{
          title: "Sted",
        }}
      />
      <Stack.Screen
        name="map"
        options={{
          title: "Kort",
        }}
      />
    </Stack>
  );
}
