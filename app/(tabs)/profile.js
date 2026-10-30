import React, { useEffect, useState } from "react";
import { Alert, Image, Text, View } from "react-native";
import { router } from "expo-router";
import { SessionService } from "@shared/services/account/SessionService.js";
import { BiometricService } from "@shared/services/account/BiometricService.js";
import { store } from "@shared/store/local-store.js";
import { Button, Cell, Group, Row, Screen, Section, Title } from "../../src/components/ui.js";
import { useAppState } from "../../src/state/AppState.js";
import { useStyles, useTheme } from "../../src/theme.js";
import { playRestAlertNow, setRestSoundOn } from "../../src/session/restAlert.js";
import { confirmDeleteAccount } from "@shared/services/account/deleteAccountFlow.js";

export default function Profile() {
  const { preference } = useTheme();
  const styles = useStyles(styleFactory);
  const { state, refresh } = useAppState();
  const mins = (state.history || []).reduce((a, h) => a + (Number(h.duration) || 0), 0);
  const streak = weekStreak(state.history);
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

  function logout() {
    Alert.alert("Sair da conta?", "Seus treinos continuam salvos na sua conta.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          await SessionService.logout();
          store.resetUser();
          refresh();
          router.replace("/login");
        }
      }
    ]);
  }

  function toggleSound(on) {
    setRestSoundOn(on);
    if (on) playRestAlertNow();
    if (SessionService.hasToken()) SessionService.pushProfile(state).catch(() => {});
    refresh();
  }

  return (
    <Screen>
      <Title>Perfil</Title>
      <View style={styles.center}>
        <Image source={require("../../assets/logo.png")} style={styles.logo} />
        <Text style={styles.name}>{state.profile.name || "Aluno"}</Text>
        <Text style={styles.badge}>{publicEmail(state.profile.email) || "Aluno LumenFit"}</Text>
      </View>
      <View style={styles.stats}>
        <Stat n={(state.history || []).length} l="Treinos" />
        <Stat n={streak} l={streak === 1 ? "Semana seguida" : "Semanas seguidas"} />
        <Stat n={fmtHours(mins)} l="Treinando" />
      </View>
      <Section>Perfil</Section>
      <Row title="Medidas corporais" subtitle="Altura, peso e meta" onPress={() => router.push("/measures")} />
      <Row title="Nível e treino" subtitle={LEVELS[state.profile.level] || "Ajustar nível e descanso"} onPress={() => router.push("/settings")} />
      <Row title="Locais de treino" subtitle={(state.locations || []).length + " locais"} onPress={() => router.push("/locations")} />
      <Row title="Matrícula" subtitle={state.member.plan || "Ver plano e pagamentos"} onPress={() => router.push("/membership")} />
      <Section>Preferências</Section>
      <Group>
        <Cell
          title="Aviso sonoro do intervalo"
          subtitle={state.profile.sound !== false ? "Beep quando o descanso acaba" : "Desligado: só vibra no fim do descanso"}
          switchOn={state.profile.sound !== false}
          onSwitch={toggleSound}
        />
        <Cell
          title={faceLabel}
          subtitle={faceOn ? "Desbloqueio do app ligado" : "Desbloquear o LumenFit no iPhone"}
          switchOn={faceOn}
          onSwitch={toggleFace}
        />
        <Cell
          last
          title="Aparência"
          value={{ system: "Sistema", light: "Claro", dark: "Escuro" }[preference] || "Sistema"}
          onPress={() => router.push("/settings")}
        />
      </Group>
      <Section>Conta</Section>
      <View style={styles.logoutWrap}>
        <Button ghost label="Sair da conta" onPress={logout} />
        {loggedIn ? (
          <Button
            danger
            label={deleting ? "Excluindo conta…" : "Excluir minha conta"}
            disabled={deleting}
            onPress={() => confirmDeleteAccount({ deleting, setDeleting, refresh })}
          />
        ) : null}
      </View>
    </Screen>
  );
}

const LEVELS = { iniciante: "Iniciante", intermediario: "Intermediário", avancado: "Avançado" };

function publicEmail(email) {
  const text = String(email || "");
  return /@signin\.londonfitness\.local$/.test(text) ? "" : text;
}

function fmtHours(mins) {
  if (!mins) return "0h";
  if (mins < 60) return mins + "min";
  return Math.round(mins / 60) + "h";
}

function weekStart(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - x.getDay());
  return x.getTime();
}

// Semanas seguidas com pelo menos um treino, contando a atual ou a anterior.
function weekStreak(history) {
  const weeks = new Set((history || []).map((h) => weekStart(h.date)).filter((t) => !Number.isNaN(t)));
  const WEEK = 7 * 86400000;
  let cur = weekStart(Date.now());
  if (!weeks.has(cur)) cur -= WEEK;
  let n = 0;
  while (weeks.has(cur)) {
    n += 1;
    cur -= WEEK;
  }
  return n;
}

function Stat({ n, l }) {
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
  badge: { color: c.muted, marginTop: 4, fontWeight: "600", fontSize: 13 },
  stats: { flexDirection: "row", gap: 8 },
  stat: { flex: 1, backgroundColor: c.surface, borderRadius: 14, padding: 12, alignItems: "center", borderWidth: 1, borderColor: "transparent" },
  statN: { color: c.text, fontWeight: "800", fontSize: 18 },
  statL: { color: c.muted, fontSize: 11, marginTop: 4, textAlign: "center" },
  val: { color: c.muted2, fontWeight: "700" },
  logoutWrap: { marginTop: 4 }
};
}
