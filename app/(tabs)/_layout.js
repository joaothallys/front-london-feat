import React from "react";
import { StyleSheet } from "react-native";
import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "../../src/theme.js";

export default function TabsLayout() {
  const { colors } = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.bg,
          borderTopColor: colors.line,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: 78,
          paddingTop: 6
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" }
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

// Ícone cheio na aba ativa, contorno nas outras.
function ic(name) {
  return ({ color, size, focused }) => <Ionicons name={focused ? name : name + "-outline"} size={size} color={color} />;
}
