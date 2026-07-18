import { LocationProvider } from "@/src/context/LocationProvider";
import "@/src/tasks/geofencingTask";
import { theme } from "@/src/theme";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <LocationProvider>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: theme.colors.surface },
            headerTintColor: theme.colors.textPrimary,
            headerTitleStyle: { fontWeight: "600" },
            headerBackTitle: "Tilbage",
            headerShadowVisible: false,
            contentStyle: { backgroundColor: theme.colors.background },
          }}
        >
          <Stack.Screen
            name="index"
            options={{
              headerShown: false,
            }}
          />
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
      </LocationProvider>
    </GestureHandlerRootView>
  );
}
