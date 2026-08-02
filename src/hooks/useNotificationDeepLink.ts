import { router, useRootNavigationState } from "expo-router";
import * as Notifications from "expo-notifications";
import { useEffect, useRef } from "react";

/**
 * Sender brugeren hen til det sted en notifikation handler om. Dækker både kold
 * start og app i baggrunden, fordi useLastNotificationResponse holder på det
 * seneste tryk indtil vi har handlet på det.
 */
export function useNotificationDeepLink() {
  const response = Notifications.useLastNotificationResponse();
  const navigationState = useRootNavigationState();
  const handledIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Ved kold start monteres layoutet før navigatoren er klar; navigerer vi
    // der, forsvinder ruten tavst.
    if (!response || !navigationState?.key) {
      return;
    }

    // Hooken beholder samme svar på tværs af renders — uden denne vagt ville vi
    // navigere igen hver gang træet gentegnes.
    const notificationId = response.notification.request.identifier;

    if (handledIdRef.current === notificationId) {
      return;
    }

    const placeId = response.notification.request.content.data?.placeId;

    if (typeof placeId !== "string") {
      return;
    }

    handledIdRef.current = notificationId;

    router.push({ pathname: "/places/[id]", params: { id: placeId } });
  }, [response, navigationState?.key]);
}
