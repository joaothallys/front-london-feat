import React, { createContext, useContext, useMemo } from "react";
import { StyleSheet, useColorScheme } from "react-native";
import { useAppState } from "./state/AppState.js";

// Paleta "Zinco e Laranja": cinzas neutros (sem o tom azulado antigo) e laranja de destaque.
// Os nomes red/red2/redSoft/cta ficaram por compatibilidade: hoje são o laranja da marca.
// Para excluir e outras ações destrutivas use `danger`, que continua vermelho.
export const darkColors = {
  bg: "#09090B",
  bg2: "#111113",
  surface: "#18181B",
  surface2: "#1F1F23",
  surface3: "#27272A",
  raised: "#3F3F46",
  line: "#2E2E33",
  text: "#FAFAFA",
  muted: "#A1A1AA",
  muted2: "#D4D4D8",
  accent: "#FF6A1A",
  onAccent: "#FFFFFF",
  red: "#FF6A1A",
  red2: "#E5560A",
  redSoft: "rgba(255, 106, 26, 0.16)",
  danger: "#EF4444",
  dangerSoft: "rgba(239, 68, 68, 0.14)",
  green: "#22C55E",
  cta: "#FF6A1A",
  amber: "#F5B942"
};

export const lightColors = {
  // Fundo um pouco mais escuro que os cartões: sem borda, é o tom que separa.
  bg: "#F2F2F4",
  bg2: "#FFFFFF",
  surface: "#FFFFFF",
  surface2: "#ECECEF",
  surface3: "#E2E2E6",
  raised: "#FFFFFF",
  line: "#E4E4E7",
  text: "#09090B",
  muted: "#71717A",
  muted2: "#3F3F46",
  accent: "#F25C05",
  onAccent: "#FFFFFF",
  red: "#F25C05",
  red2: "#D94F00",
  redSoft: "rgba(242, 92, 5, 0.10)",
  danger: "#DC2626",
  dangerSoft: "rgba(220, 38, 38, 0.10)",
  green: "#16A34A",
  cta: "#F25C05",
  amber: "#C48A12"
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
