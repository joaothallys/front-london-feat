import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text } from "react-native";
import { router } from "expo-router";
import { SessionService } from "@shared/services/account/SessionService.js";
import { Screen } from "../src/components/ui.js";
import { useAppState } from "../src/state/AppState.js";
import { colors } from "../src/theme.js";

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

function generateOnce(state) {
  const onboard = onboardFrom(state);
  if (!SessionService.hasToken()) {
    SessionService.applyLocalPlan(state, onboard);
    return Promise.resolve();
  }
  return SessionService.finishOnboarding(state, onboard).catch((err) => {
    if (err && err.status === 401 && !SessionService.hasToken()) throw err;
    SessionService.applyLocalPlan(state, onboard);
  });
}

export default function Ai() {
  const { state, refresh } = useAppState();
  const [hint, setHint] = useState("Ficha com os aparelhos da London Fitness.");

  useEffect(() => {
    let cancelled = false;

    async function waitAndLeave() {
      if (state.onboardingDone && state.plan && state.plan.split && state.plan.split.length && state.plan.id) {
        router.replace("/(tabs)/home");
        return;
      }
      if (!pendingGenerate) pendingGenerate = generateOnce(state).finally(() => { pendingGenerate = null; });
      try {
        await pendingGenerate;
        if (cancelled) return;
        refresh();
        router.replace("/(tabs)/home");
      } catch (err) {
        if (cancelled) return;
        refresh();
        router.replace("/login");
      }
    }

    waitAndLeave();
    const failHint = setTimeout(() => {
      if (!cancelled) setHint("Ainda montando. Se a IA falhar, usamos um plano local.");
    }, 20000);
    return () => {
      cancelled = true;
      clearTimeout(failHint);
    };
  }, []);

  return (
    <Screen noNav>
      <ActivityIndicator color={colors.red} style={{ marginTop: 80 }} />
      <Text style={styles.h}>Montando seu plano</Text>
      <Text style={styles.p}>{hint}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  h: { color: colors.text, fontSize: 22, fontWeight: "800", textAlign: "center", marginTop: 16 },
  p: { color: colors.muted, textAlign: "center", marginTop: 8, paddingHorizontal: 24 }
});
