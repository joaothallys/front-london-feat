import React, { useState } from "react";
import { Text } from "react-native";
import { router } from "expo-router";
import { api } from "@shared/api/client.js";
import { maskMeasure } from "@shared/domain/masks.js";
import { SessionService } from "@shared/services/account/SessionService.js";
import { Button, Field, Screen, TopBar } from "../src/components/ui.js";
import { useAppState } from "../src/state/AppState.js";
import { useTheme } from "../src/theme.js";

function parseMeasure(raw) {
  if (raw == null || String(raw).trim() === "") return null;
  const n = Number(String(raw).trim().replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function outOfRange(value, min, max) {
  return value != null && (value < min || value > max);
}

export default function Measures() {
  const { colors } = useTheme();
  const { state, refresh } = useAppState();
  const m = state.bodyMeasures || {};
  const [height, setHeight] = useState(m.height != null ? String(m.height).replace(".", ",") : "");
  const [weight, setWeight] = useState(m.weight != null ? String(m.weight).replace(".", ",") : "");
  const [goal, setGoal] = useState(m.weightGoal != null ? String(m.weightGoal).replace(".", ",") : "");

  const [error, setError] = useState("");

  function save() {
    const nextHeight = parseMeasure(height);
    const nextWeight = parseMeasure(weight);
    const nextGoal = parseMeasure(goal);
    if (outOfRange(nextHeight, 100, 250)) {
      setError("Informe a altura em centímetros, entre 100 e 250.");
      return;
    }
    if (outOfRange(nextWeight, 30, 400) || outOfRange(nextGoal, 30, 400)) {
      setError("Informe o peso em quilos, entre 30 e 400.");
      return;
    }
    state.bodyMeasures.height = nextHeight;
    state.bodyMeasures.weight = nextWeight;
    state.bodyMeasures.weightGoal = nextGoal;
    refresh();
    if (SessionService.hasToken()) {
      api.body.create({
        heightCm: state.bodyMeasures.height,
        weightKg: state.bodyMeasures.weight,
        weightGoalKg: state.bodyMeasures.weightGoal
      }).catch(() => {});
    }
    router.back();
  }

  return (
    <Screen>
      <TopBar title="Medidas corporais" back />
      <Field label="Altura (cm)" value={height} onChangeText={(v) => setHeight(maskMeasure(v))} keyboardType="decimal-pad" />
      <Field label="Peso (kg)" value={weight} onChangeText={(v) => setWeight(maskMeasure(v))} keyboardType="decimal-pad" />
      <Field label="Meta de peso (kg)" value={goal} onChangeText={(v) => setGoal(maskMeasure(v))} keyboardType="decimal-pad" />
      {error ? <Text style={{ color: colors.danger, marginBottom: 10, fontSize: 13 }}>{error}</Text> : null}
      <Button label="Salvar alterações" onPress={save} />
    </Screen>
  );
}
