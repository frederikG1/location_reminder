import { log } from "@/src/util/logger";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermissions() {
  const { status } = await Notifications.requestPermissionsAsync();

  return status === "granted";
}

export async function hasNotificationPermission() {
  const { status } = await Notifications.getPermissionsAsync();

  return status === "granted";
}

export async function sendNotification(
  title: string,
  body: string,
  data?: Record<string, unknown>,
) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
      },
      trigger: null,
    });
  } catch (error) {
    log("Notification error:", error);
  }
}
