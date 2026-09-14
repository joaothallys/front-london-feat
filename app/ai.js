import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { SessionService } from "@shared/services/account/SessionService.js";
import { Button, Screen } from "../src/components/ui.js";
import { useAppState } from "../src/state/AppState.js";
import { useStyles, useTheme } from "../src/theme.js";

let pendingGenerate = null;

function onboardFrom(state) {
  return {
    name: state.profile.name,
    gender: state.profile.gender,
    goal: state.profile.goal,
    level: state.profile.level,
    days: state.profile.days
  };
}

async function runGenerate(state, retry) {
  const onboard = onboardFrom(state);
  if (!SessionService.hasToken()) {
    SessionService.applyLocalPlan(state, onboard);
    return { ok: true, local: true };
  }
  try {
    if (retry) await SessionService.generateIaPlan(state, onboard);
    else await SessionService.finishOnboarding(state, onboard);
    return { ok: true };
  } catch (err) {
    if (err && err.status === 401 && !SessionService.hasToken()) throw err;
    SessionService.applyLocalPlan(state, onboard);
    return { ok: false };
  }
}

export default function Ai() {
  const { colors } = useTheme();
  const styles = useStyles(styleFactory);
  const { state, refresh } = useAppState();
  const [phase, setPhase] = useState("loading");
  const [hint, setHint] = useState("Ficha com os aparelhos do LumenFit.");

  function goHome() {
    refresh();
    router.replace("/(tabs)/home");
  }

  async function startGenerate(retry) {
    setPhase("loading");
    setHint(retry ? "Tentando de novo com a IA." : "Ficha com os aparelhos do LumenFit.");
    if (!pendingGenerate) pendingGenerate = runGenerate(state, retry).finally(() => { pendingGenerate = null; });
    try {
      const result = await pendingGenerate;
      if (result.ok) {
        goHome();
        return;
      }
      refresh();
      setPhase("fail");
    } catch (err) {
      refresh();
      router.replace("/login");
    }
  }

  useEffect(() => {
    if (state.onboardingDone && state.plan && state.plan.split && state.plan.split.length && state.plan.id && !state.plan.iaFailed) {
      router.replace("/(tabs)/home");
      return undefined;
    }
    startGenerate(false);
    const failHint = setTimeout(() => {
      setHint("Ainda montando. A IA está demorando.");
    }, 20000);
    return () => clearTimeout(failHint);
  }, []);

  if (phase === "fail") {
    return (
      <Screen noNav>
        <View style={styles.box}>
          <Text style={styles.h}>A IA não montou o plano</Text>
          <Text style={styles.p}>
            O servidor não conseguiu falar com a IA agora. Você pode tentar de novo ou seguir com um plano local e gerar depois.
          </Text>
          <Button label="Tentar com a IA de novo" onPress={() => startGenerate(true)} />
          <Button ghost label="Continuar com plano local" onPress={goHome} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen noNav>
      <ActivityIndicator color={colors.red} style={{ marginTop: 80 }} />
      <Text style={styles.h}>Montando seu plano</Text>
      <Text style={styles.p}>{hint}</Text>
    </Screen>
  );
}

function styleFactory(c) {
  return {
  box: { marginTop: 64 },
  h: { color: c.text, fontSize: 22, fontWeight: "800", textAlign: "center", marginTop: 16 },
  p: { color: c.muted, textAlign: "center", marginTop: 8, marginBottom: 20, paddingHorizontal: 24, lineHeight: 20 }
};
}
