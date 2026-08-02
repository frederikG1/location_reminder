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
          {/*
            Ingen skærme bruger den native header. Den er en hvid bjælke med
            systemets chevron og systemskrift — tre ting appen ikke bruger
            nogen andre steder. Hver skærm sætter i stedet sin egen
            <ScreenHeader />, så tilbageknappen er den samme cirkel som
            resten af appens ikonknapper.
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
            Sat her frem for per skærm: paletten er lys-only, og kortet ligger
            nu helt op under statuslinjen, hvor lys tekst ville forsvinde.
          */}
          <StatusBar style="dark" />
        </LocationProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
