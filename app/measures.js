import React, { useState } from "react";
import { router } from "expo-router";
import { api } from "@shared/api/client.js";
import { SessionService } from "@shared/services/account/SessionService.js";
import { Button, Field, Screen, TopBar } from "../src/components/ui.js";
import { useAppState } from "../src/state/AppState.js";

export default function Measures() {
  const { state, refresh } = useAppState();
  const m = state.bodyMeasures || {};
  const [height, setHeight] = useState(m.height ? String(m.height) : "");
  const [weight, setWeight] = useState(m.weight ? String(m.weight) : "");
  const [goal, setGoal] = useState(m.weightGoal ? String(m.weightGoal) : "");

  function save() {
    state.bodyMeasures.height = Number(height) || null;
    state.bodyMeasures.weight = Number(weight) || null;
    state.bodyMeasures.weightGoal = Number(goal) || null;
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
      <Field label="Altura (cm)" value={height} onChangeText={setHeight} keyboardType="numeric" />
      <Field label="Peso (kg)" value={weight} onChangeText={setWeight} keyboardType="numeric" />
      <Field label="Meta de peso (kg)" value={goal} onChangeText={setGoal} keyboardType="numeric" />
      <Button label="Salvar alterações" onPress={save} />
    </Screen>
  );
}
