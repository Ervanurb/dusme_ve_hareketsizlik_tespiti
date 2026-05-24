import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Ana Sayfa",
          tabBarIcon: ({ size, focused }) => (
            <Ionicons
              name="home"
              size={size}
              color={focused ? "#1E3A8A" : "#94A3B8"}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="alerts"
        options={{
          title: "Alarmlar",
          tabBarIcon: ({ size, focused }) => (
            <Ionicons
              name="warning"
              size={size}
              color={focused ? "#DC2626" : "#94A3B8"}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ size, focused }) => (
            <Ionicons
              name="person"
              size={size}
              color={focused ? "#16A34A" : "#94A3B8"}
            />
          ),
        }}
      />
    </Tabs>
  );
}
