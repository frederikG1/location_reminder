import { router, useRootNavigationState } from "expo-router";
import * as Notifications from "expo-notifications";
import { useEffect, useRef } from "react";

/**
 * Sends the user to the place a notification is about. Covers both a cold
 * start and a backgrounded app, because useLastNotificationResponse holds on
 * to the most recent tap until we have acted on it.
 */
export function useNotificationDeepLink() {
  const response = Notifications.useLastNotificationResponse();
  const navigationState = useRootNavigationState();
  const handledIdRef = useRef<string | null>(null);

  useEffect(() => {
    // On a cold start the layout mounts before the navigator is ready; if we
    // navigate then, the route silently disappears.
    if (!response || !navigationState?.key) {
      return;
    }

    // The hook keeps the same response across renders — without this guard we
    // would navigate again every time the tree re-renders.
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
