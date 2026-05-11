import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { AppLoader } from "../components/app-loader";
import { hydrateOfflineQueue, syncOfflineQueue } from "../lib/offline-queue";
import { restoreSession, useSessionSnapshot } from "../lib/session";

export default function RootLayout() {
  const session = useSessionSnapshot();

  useEffect(() => {
    void restoreSession();
    void hydrateOfflineQueue();
  }, []);

  useEffect(() => {
    if (session.status === "authenticated") {
      void syncOfflineQueue();
    }
  }, [session.status]);

  if (session.status === "loading" || !session.hydrated) {
    return <AppLoader />;
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack initialRouteName="(tabs)" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="ueber-hege"
          options={{ headerShown: true, title: "Über hege", headerBackTitle: "" }}
        />
        <Stack.Screen
          name="benachrichtigungen"
          options={{ headerShown: true, title: "Benachrichtigungen", headerBackTitle: "" }}
        />
      </Stack>
    </>
  );
}
