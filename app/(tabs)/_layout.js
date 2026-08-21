import React from "react";
import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors } from "../../src/theme.js";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.bg2,
          borderTopColor: colors.line,
          height: 78,
          paddingTop: 6
        },
        tabBarActiveTintColor: colors.red,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "700" }
      }}
    >
      <Tabs.Screen name="home" options={{ title: "Meu Plano", tabBarIcon: ic("barbell") }} />
      <Tabs.Screen name="workouts" options={{ title: "Treinos", tabBarIcon: ic("fitness") }} />
      <Tabs.Screen name="progress" options={{ title: "Progresso", tabBarIcon: ic("stats-chart") }} />
      <Tabs.Screen name="library" options={{ title: "Exercícios", tabBarIcon: ic("book") }} />
      <Tabs.Screen name="profile" options={{ title: "Perfil", tabBarIcon: ic("person") }} />
    </Tabs>
  );
}

function ic(name) {
  return ({ color, size }) => <Ionicons name={name} size={size} color={color} />;
}
