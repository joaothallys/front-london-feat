import React, { createContext, useContext, useMemo } from "react";
import { StyleSheet, useColorScheme } from "react-native";
import { useAppState } from "./state/AppState.js";

export const darkColors = {
  bg: "#001013",
  bg2: "#000000",
  surface: "#0a181b",
  surface2: "#0f2024",
  surface3: "#163036",
  line: "#1d3a40",
  text: "#ffffff",
  muted: "#8a8a8a",
  muted2: "#d9d9d9",
  red: "#e10600",
  red2: "#b80000",
  redSoft: "rgba(225, 6, 0, 0.16)",
  green: "#22c55e",
  cta: "#e10600",
  amber: "#f5b942"
};

export const lightColors = {
  bg: "#f3f6f7",
  bg2: "#ffffff",
  surface: "#ffffff",
  surface2: "#eef2f3",
  surface3: "#e3eaec",
  line: "#d2dcdf",
  text: "#0b1a1c",
  muted: "#6b7a7d",
  muted2: "#3d4c4f",
  red: "#e10600",
  red2: "#b80000",
  redSoft: "rgba(225, 6, 0, 0.10)",
  green: "#16a34a",
  cta: "#e10600",
  amber: "#c48a12"
};

export const colors = darkColors;

export const space = {
  screen: 16
};

const ThemeCtx = createContext(null);
const sheetCache = { light: new WeakMap(), dark: new WeakMap() };

export function resolveScheme(preference, system) {
  if (preference === "light" || preference === "dark") return preference;
  return system === "light" ? "light" : "dark";
}

export function palette(scheme) {
  return scheme === "light" ? lightColors : darkColors;
}

export function AppThemeProvider({ children }) {
  const { state, refresh } = useAppState();
  const system = useColorScheme();
  const preference = (state.settings && state.settings.theme) || "system";
  const scheme = resolveScheme(preference, system);
  const themeColors = palette(scheme);
  const value = useMemo(() => ({
    colors: themeColors,
    scheme,
    preference,
    system: system === "light" ? "light" : "dark",
    setPreference(next) {
      if (!state.settings) state.settings = {};
      state.settings.theme = next;
      refresh();
    }
  }), [themeColors, scheme, preference, system, refresh, state]);
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) {
    return {
      colors: darkColors,
      scheme: "dark",
      preference: "system",
      system: "dark",
      setPreference() {}
    };
  }
  return ctx;
}

export function useStyles(factory) {
  const { scheme } = useTheme();
  const bucket = sheetCache[scheme] || sheetCache.dark;
  let sheet = bucket.get(factory);
  if (!sheet) {
    sheet = StyleSheet.create(factory(palette(scheme)));
    bucket.set(factory, sheet);
  }
  return sheet;
}
