import React, { useEffect, useState } from "react";
import { Alert, Text, View } from "react-native";
import { SessionService } from "@shared/services/account/SessionService.js";
import { BiometricService } from "@shared/services/account/BiometricService.js";
import { confirmDeleteAccount } from "@shared/services/account/deleteAccountFlow.js";
import { Cell, Group, Screen, Section, Segmented, Stepper, TopBar } from "../src/components/ui.js";
import { HapticPressable } from "../src/components/HapticPressable.js";
import { useAppState } from "../src/state/AppState.js";
import { useTheme } from "../src/theme.js";

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

  async function toggleFace(next) {
    if (!faceOk) {
      Alert.alert(faceLabel, "Cadastre o " + faceLabel + " no iPhone em Ajustes → Face ID e Código.");
      return;
    }
    if (!next) {
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
      <Group>
        <View style={{ padding: 6 }}>
          <Segmented options={THEMES} value={preference} onChange={setPreference} />
        </View>
      </Group>

      <Section>Geral</Section>
      <Group>
        <Cell
          title={faceLabel}
          subtitle="Desbloquear o LumenFit no iPhone"
          switchOn={faceOn}
          onSwitch={toggleFace}
        />
        <Cell
          title="Sons"
          subtitle="Alerta de descanso"
          switchOn={!!state.profile.sound}
          onSwitch={(on) => { state.profile.sound = on; sync(); }}
        />
        <Cell
          last
          title="Descanso"
          subtitle="Pausa padrão entre séries"
          right={(
            <Stepper
              value={state.profile.restDefault}
              suffix="s"
              onMinus={() => { state.profile.restDefault = Math.max(30, state.profile.restDefault - 15); sync(); }}
              onPlus={() => { state.profile.restDefault = state.profile.restDefault + 15; sync(); }}
            />
          )}
        />
      </Group>

      {loggedIn ? (
        <View style={{ marginTop: 40, marginBottom: 12, alignItems: "center" }}>
          <HapticPressable
            onPress={() => confirmDeleteAccount({ deleting, setDeleting, refresh })}
            disabled={deleting}
          >
            <Text style={{ color: colors.muted, fontSize: 13 }}>
              {deleting ? "Excluindo conta…" : "Excluir conta"}
            </Text>
          </HapticPressable>
        </View>
      ) : null}
    </Screen>
  );
}
