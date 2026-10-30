import React, { useEffect, useState } from "react";
import { Alert, View } from "react-native";
import { SessionService } from "@shared/services/account/SessionService.js";
import { BiometricService } from "@shared/services/account/BiometricService.js";
import { confirmDeleteAccount } from "@shared/services/account/deleteAccountFlow.js";
import { Cell, Group, Screen, Section, Segmented, Stepper, TopBar } from "../src/components/ui.js";
import { useAppState } from "../src/state/AppState.js";
import { useTheme } from "../src/theme.js";
import { playRestAlertNow, setRestSoundOn } from "../src/session/restAlert.js";

const THEMES = [
  ["system", "Sistema"],
  ["light", "Claro"],
  ["dark", "Escuro"]
];

const LEVELS = [
  ["iniciante", "Iniciante"],
  ["intermediario", "Intermediário"],
  ["avancado", "Avançado"]
];

export default function Settings() {
  const { state, refresh } = useAppState();
  const { preference, setPreference } = useTheme();
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

  const rest = Number(state.profile.restDefault) || 90;

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

      <Section>Seu nível</Section>
      <Group>
        <View style={{ padding: 6 }}>
          <Segmented
            options={LEVELS}
            value={state.profile.level || "intermediario"}
            onChange={(level) => { state.profile.level = level; sync(); }}
          />
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
          title="Aviso sonoro do intervalo"
          subtitle="Toca quando o descanso acaba, com o app aberto"
          switchOn={state.profile.sound !== false}
          onSwitch={(on) => {
            setRestSoundOn(on);
            if (on) playRestAlertNow();
            sync();
          }}
        />
        <Cell
          last
          title="Descanso"
          subtitle="Pausa padrão entre séries"
          right={(
            <Stepper
              value={rest}
              suffix="s"
              onMinus={() => { state.profile.restDefault = Math.max(30, rest - 15); sync(); }}
              onPlus={() => { state.profile.restDefault = Math.min(300, rest + 15); sync(); }}
            />
          )}
        />
      </Group>

      {loggedIn ? (
        <>
          <Section>Conta</Section>
          <Group>
            <Cell
              last
              danger
              title="Excluir minha conta"
              subtitle={deleting ? "Excluindo conta…" : "Apaga a conta e os dados pessoais. Essa ação é permanente."}
              onPress={() => confirmDeleteAccount({ deleting, setDeleting, refresh })}
            />
          </Group>
        </>
      ) : null}
    </Screen>
  );
}
