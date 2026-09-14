import React, { useEffect, useState } from "react";
import { Alert, Text } from "react-native";
import { SessionService } from "@shared/services/account/SessionService.js";
import { BiometricService } from "@shared/services/account/BiometricService.js";
import { confirmDeleteAccount } from "@shared/services/account/deleteAccountFlow.js";
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
  const [faceOn, setFaceOn] = useState(false);
  const [faceLabel, setFaceLabel] = useState("Face ID");
  const [faceOk, setFaceOk] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const loggedIn = SessionService.hasToken();

  useEffect(() => {
    let live = true;
    (async () => {
      const can = await BiometricService.canUse();
      const on = await BiometricService.isEnabled();
      const label = await BiometricService.label();
      if (!live) return;
      setFaceOk(can);
      setFaceOn(on);
      setFaceLabel(label);
    })();
    return () => { live = false; };
  }, []);

  async function toggleFace() {
    if (!faceOk) {
      Alert.alert(faceLabel, "Cadastre o " + faceLabel + " no iPhone em Ajustes → Face ID e Código.");
      return;
    }
    if (faceOn) {
      await BiometricService.disable();
      setFaceOn(false);
      return;
    }
    const ok = await BiometricService.enable(state.profile.email || "", "");
    if (ok) setFaceOn(true);
  }

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
      <Section>Segurança</Section>
      <Chip
        label={faceOn ? faceLabel + " ligado" : "Desbloquear com " + faceLabel}
        on={faceOn}
        onPress={toggleFace}
      />
      <Section>Sons</Section>
      <Chip label={state.profile.sound ? "Ligado" : "Desligado"} on={state.profile.sound} onPress={() => { state.profile.sound = !state.profile.sound; sync(); }} />
      <Section>Descanso padrão</Section>
      <Text style={{ color: colors.text, fontSize: 28, fontWeight: "800", marginBottom: 8 }}>{state.profile.restDefault}s</Text>
      <Chip label="−15s" onPress={() => { state.profile.restDefault = Math.max(30, state.profile.restDefault - 15); sync(); }} />
      <Chip label="+15s" onPress={() => { state.profile.restDefault = state.profile.restDefault + 15; sync(); }} />
      <Section>Conta</Section>
      <Button ghost danger label="Limpar dados locais" onPress={() => { store.reset(); router.replace("/"); }} />
      {loggedIn ? (
        <Button
          ghost
          danger
          label={deleting ? "Excluindo..." : "Excluir conta"}
          onPress={() => confirmDeleteAccount({ deleting, setDeleting, refresh })}
          disabled={deleting}
        />
      ) : null}
    </Screen>
  );
}
