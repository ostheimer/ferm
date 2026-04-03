import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";

import { colors } from "../../lib/theme";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          height: 72,
          paddingBottom: 12,
          paddingTop: 8,
          backgroundColor: "#fff9ef"
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Heute",
          tabBarIcon: ({ color, size }) => <Ionicons color={color} name="home-outline" size={size} />
        }}
      />
      <Tabs.Screen
        name="ansitze"
        options={{
          title: "Ansitze",
          tabBarIcon: ({ color, size }) => <Ionicons color={color} name="trail-sign-outline" size={size} />
        }}
      />
      <Tabs.Screen
        name="reviereinrichtungen"
        options={{
          title: "Einrichtungen",
          tabBarIcon: ({ color, size }) => <Ionicons color={color} name="map-outline" size={size} />
        }}
      />
      <Tabs.Screen
        name="fallwild"
        options={{
          title: "Fallwild",
          tabBarIcon: ({ color, size }) => <Ionicons color={color} name="camera-outline" size={size} />
        }}
      />
      <Tabs.Screen
        name="protokolle"
        options={{
          title: "Protokolle",
          tabBarIcon: ({ color, size }) => <Ionicons color={color} name="document-text-outline" size={size} />
        }}
      />
    </Tabs>
  );
}
