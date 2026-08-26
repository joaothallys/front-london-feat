import React from "react";
import { Text } from "react-native";
import { SessionService } from "@shared/services/account/SessionService.js";
import { store } from "@shared/store/local-store.js";
import { Button, Chip, Screen, Section, TopBar } from "../src/components/ui.js";
import { useAppState } from "../src/state/AppState.js";
import { useTheme } from "../src/theme.js";
import { router } from "expo-router";

const THEMES = [
  ["system", "Sistema"],
  ["light", "Claro"],
  ["dark", "Escuro"]
];

export default function Settings() {
  const { state, refresh } = useAppState();
  const { colors, preference, setPreference } = useTheme();
  function sync() {
    if (SessionService.hasToken()) SessionService.pushProfile(state).catch(() => {});
    refresh();
  }
  return (
    <Screen>
      <TopBar title="Ajustes" back />
      <Section>Aparência</Section>
      {THEMES.map(([id, label]) => (
        <Chip
          key={id}
          label={label}
          on={preference === id}
          onPress={() => setPreference(id)}
        />
      ))}
      <Section>Sons</Section>
      <Chip label={state.profile.sound ? "Ligado" : "Desligado"} on={state.profile.sound} onPress={() => { state.profile.sound = !state.profile.sound; sync(); }} />
      <Section>Descanso padrão</Section>
      <Text style={{ color: colors.text, fontSize: 28, fontWeight: "800", marginBottom: 8 }}>{state.profile.restDefault}s</Text>
      <Chip label="−15s" onPress={() => { state.profile.restDefault = Math.max(30, state.profile.restDefault - 15); sync(); }} />
      <Chip label="+15s" onPress={() => { state.profile.restDefault = state.profile.restDefault + 15; sync(); }} />
      <Button ghost danger label="Limpar dados locais" onPress={() => { store.reset(); router.replace("/"); }} />
    </Screen>
  );
}
