import React, { useEffect, useState } from "react";
import { Alert, Image, Text, View } from "react-native";
import { router } from "expo-router";
import { SessionService } from "@shared/services/account/SessionService.js";
import { BiometricService } from "@shared/services/account/BiometricService.js";
import { store } from "@shared/store/local-store.js";
import { Button, Row, Screen, Section, Title } from "../../src/components/ui.js";
import { useAppState } from "../../src/state/AppState.js";
import { D } from "../../src/catalog.js";
import { useStyles, useTheme } from "../../src/theme.js";

export default function Profile() {
  const { preference } = useTheme();
  const styles = useStyles(styleFactory);
  const { state, refresh } = useAppState();
  const mins = (state.history || []).reduce((a, h) => a + (h.duration || 0), 0);
  const prs = (state.history || []).filter((h) => h.volume > 12000).length;
  const [faceOn, setFaceOn] = useState(false);
  const [faceLabel, setFaceLabel] = useState("Face ID");
  const [faceOk, setFaceOk] = useState(false);

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

  async function logout() {
    await SessionService.logout();
    store.logout();
    refresh();
    router.replace("/login");
  }

  return (
    <Screen>
      <Title>Perfil</Title>
      <View style={styles.center}>
        <Image source={require("../../assets/logo.png")} style={styles.logo} />
        <Text style={styles.name}>{state.profile.name || "Aluno"}</Text>
        <Text style={styles.badge}>Aluno LumenFit</Text>
      </View>
      <View style={styles.stats}>
        <Stat n={state.history.length} l="Treinos" />
        <Stat n={prs} l="Recordes" />
        <Stat n={Math.max(1, Math.round(mins / 60)) + "h"} l="Tempo" />
      </View>
      <Section>Perfil</Section>
      <Row title="Medidas corporais" subtitle="Altura, peso e meta" onPress={() => router.push("/measures")} />
      <Row title="Nível de condicionamento" subtitle={state.profile.level} onPress={() => router.push("/settings")} />
      <Row title="Locais de treino" subtitle={(state.locations || []).length + " locais"} onPress={() => router.push("/locations")} />
      <Section>Notificações</Section>
      <Row title="Sons" subtitle="Alerta de descanso" right={<Text style={styles.val}>{state.profile.sound ? "On" : "Off"}</Text>} onPress={() => { state.profile.sound = !state.profile.sound; SessionService.hasToken() && SessionService.pushProfile(state).catch(() => {}); refresh(); }} />
      <Row title="Lembretes de treino" subtitle="Aviso no horário" right={<Text style={styles.val}>{state.settings.reminders ? "On" : "Off"}</Text>} onPress={() => { state.settings.reminders = !state.settings.reminders; SessionService.hasToken() && SessionService.pushProfile(state).catch(() => {}); refresh(); }} />
      <Section>Segurança</Section>
      <Row
        title={faceLabel}
        subtitle={faceOn ? "Desbloqueio do app ligado" : "Desbloquear o LumenFit no iPhone"}
        right={<Text style={styles.val}>{faceOn ? "On" : "Off"}</Text>}
        onPress={toggleFace}
      />
      <Section>Geral</Section>
      <Row
        title="Aparência"
        subtitle={{ system: "Igual ao iPhone", light: "Claro", dark: "Escuro" }[preference] || "Igual ao iPhone"}
        onPress={() => router.push("/settings")}
      />
      <Row title="Unidades de medida" subtitle={state.profile.unitKg ? "kg" : "lb"} onPress={() => { state.profile.unitKg = !state.profile.unitKg; SessionService.hasToken() && SessionService.pushProfile(state).catch(() => {}); refresh(); }} />
      <Row title="Matrícula" subtitle={state.member.plan} onPress={() => router.push("/membership")} />
      <Row title="Apps conectados" subtitle="Apple Saúde e Strava" onPress={() => router.push("/apps")} />
      <Row title="Catálogo ExerciseDB" subtitle={D.exercises.length + " exercícios"} onPress={() => router.push("/sync")} />
      <View style={styles.logoutWrap}>
        <Button ghost label="Sair" onPress={logout} />
      </View>
    </Screen>
  );
}

function Stat({ n, l }) {
  const { colors } = useTheme();
  const styles = useStyles(styleFactory);
  return (
    <View style={styles.stat}>
      <Text style={styles.statN}>{n}</Text>
      <Text style={styles.statL}>{l}</Text>
    </View>
  );
}

function styleFactory(c) {
  return {
  center: { alignItems: "center", marginBottom: 16 },
  logo: { width: 88, height: 88, borderRadius: 44, marginBottom: 8 },
  name: { color: c.text, fontSize: 22, fontWeight: "800" },
  badge: { color: c.red, marginTop: 6, fontWeight: "700" },
  stats: { flexDirection: "row", gap: 8 },
  stat: { flex: 1, backgroundColor: c.surface, borderRadius: 14, padding: 12, alignItems: "center" },
  statN: { color: c.text, fontWeight: "800", fontSize: 18 },
  statL: { color: c.muted, fontSize: 11, marginTop: 4 },
  val: { color: c.muted2, fontWeight: "700" },
  logoutWrap: { marginTop: 28 }
};
}
