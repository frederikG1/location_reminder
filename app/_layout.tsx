import ErrorBoundary from "@/src/components/ErrorBoundary";
import { LocationProvider } from "@/src/context/LocationProvider";
import { useNotificationDeepLink } from "@/src/hooks/useNotificationDeepLink";
import "@/src/tasks/geofencingTask";
import { theme } from "@/src/theme";
import {
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  Nunito_900Black,
  useFonts,
} from "@expo-google-fonts/nunito";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

// Hele temaet er sat i Nunito. Vises noget før fonten er klar, skifter layoutet
// synligt under brugeren — så vi holder splashen oppe indtil da.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    Nunito_900Black,
  });

  useNotificationDeepLink();

  useEffect(() => {
    // Fejler fonten, er en app i systemskrift bedre end en app der aldrig
    // kommer forbi splashen.
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <LocationProvider>
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: theme.colors.surface },
              headerTintColor: theme.colors.textPrimary,
              headerTitleStyle: { fontFamily: theme.fonts.extrabold },
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
              name="onboarding"
              options={{
                headerShown: false,
                gestureEnabled: false,
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
            <Stack.Screen
              name="settings"
              options={{
                title: "Indstillinger",
              }}
            />
          </Stack>
        </LocationProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
