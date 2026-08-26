import React, { useState } from "react";
import { router } from "expo-router";
import { api } from "@shared/api/client.js";
import { SessionService } from "@shared/services/account/SessionService.js";
import { Button, Field, Screen, TopBar } from "../src/components/ui.js";
import { useAppState } from "../src/state/AppState.js";

function parseMeasure(raw) {
  if (raw == null || String(raw).trim() === "") return null;
  const n = Number(String(raw).trim().replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function onMeasureChange(set) {
  return (text) => {
    const next = String(text || "").replace(/[^\d.,]/g, "").replace(/([.,].*)[.,]/g, "$1");
    set(next);
  };
}

export default function Measures() {
  const { state, refresh } = useAppState();
  const m = state.bodyMeasures || {};
  const [height, setHeight] = useState(m.height != null ? String(m.height).replace(".", ",") : "");
  const [weight, setWeight] = useState(m.weight != null ? String(m.weight).replace(".", ",") : "");
  const [goal, setGoal] = useState(m.weightGoal != null ? String(m.weightGoal).replace(".", ",") : "");

  function save() {
    state.bodyMeasures.height = parseMeasure(height);
    state.bodyMeasures.weight = parseMeasure(weight);
    state.bodyMeasures.weightGoal = parseMeasure(goal);
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
      <Field label="Altura (cm)" value={height} onChangeText={onMeasureChange(setHeight)} keyboardType="decimal-pad" />
      <Field label="Peso (kg)" value={weight} onChangeText={onMeasureChange(setWeight)} keyboardType="decimal-pad" />
      <Field label="Meta de peso (kg)" value={goal} onChangeText={onMeasureChange(setGoal)} keyboardType="decimal-pad" />
      <Button label="Salvar alterações" onPress={save} />
    </Screen>
  );
}
