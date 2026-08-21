import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { bootNative } from "../src/boot.js";
import { BrandSplash } from "../src/components/BrandSplash.js";
import { AppStateProvider } from "../src/state/AppState.js";
import { LiveSessionProvider } from "../src/state/LiveSession.js";
import { colors } from "../src/theme.js";

SplashScreen.preventAutoHideAsync().catch(() => {});

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.bg,
    text: colors.text,
    border: colors.line,
    primary: colors.red
  }
};

export default function RootLayout() {
  const [booted, setBooted] = useState(false);
  const [introDone, setIntroDone] = useState(false);

  useEffect(() => {
    bootNative().finally(() => setBooted(true));
  }, []);

  if (!booted || !introDone) {
    return (
      <View
        style={{ flex: 1, backgroundColor: "#000000" }}
        onLayout={() => { SplashScreen.hideAsync().catch(() => {}); }}
      >
        <StatusBar style="light" />
        <BrandSplash onDone={() => setIntroDone(true)} />
      </View>
    );
  }
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider value={navTheme}>
          <AppStateProvider>
            <LiveSessionProvider>
              <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="login" />
                <Stack.Screen name="onboarding" />
                <Stack.Screen name="ai" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="add-exercise" />
                <Stack.Screen name="session" />
                <Stack.Screen name="summary" />
              </Stack>
              <StatusBar style="light" />
            </LiveSessionProvider>
          </AppStateProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
