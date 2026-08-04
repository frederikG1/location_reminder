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
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

// The whole theme is set in Nunito. Showing anything before the font is ready
// makes the layout visibly shift under the user — so we keep the splash up
// until it is.
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
    // If the font fails, an app in the system typeface beats an app that never
    // gets past the splash.
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
          {/*
            No screen uses the native header. It is a white bar with the
            system chevron and the system typeface — three things the app uses
            nowhere else. Each screen sets its own <ScreenHeader /> instead, so
            the back button is the same circle as the rest of the app's icon
            buttons.
          */}
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: theme.colors.background },
            }}
          >
            <Stack.Screen
              name="onboarding"
              options={{
                gestureEnabled: false,
              }}
            />
          </Stack>

          {/*
            Set here rather than per screen: the palette is light-only, and the
            map now runs all the way up under the status bar, where light text
            would disappear.
          */}
          <StatusBar style="dark" />
        </LocationProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
