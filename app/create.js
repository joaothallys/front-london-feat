import React, { useState } from "react";
import { router } from "expo-router";
import { api, unwrap } from "@shared/api/client.js";
import { SessionService } from "@shared/services/account/SessionService.js";
import { Button, Empty, Field, Row, Screen, TopBar } from "../src/components/ui.js";
import { ExerciseThumb } from "../src/components/ExerciseThumb.js";
import { useAppState } from "../src/state/AppState.js";
import { D, exerciseOf } from "../src/catalog.js";

export default function Create() {
  const { state, refresh } = useAppState();
  const [name, setName] = useState("Meu treino");
  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);
  const results = q.trim()
    ? D.exercises.filter((ex) => ((ex.name || "") + " " + (ex.originalName || "")).toLowerCase().indexOf(q.toLowerCase()) >= 0).slice(0, 12)
    : [];

  async function save() {
    let id = "c" + Date.now();
    if (SessionService.hasToken()) {
      try {
        const created = unwrap(await api.workouts.create({
          name: name || "Meu treino",
          exercises: SessionService.payloadItems(items)
        }));
        id = created.id || id;
      } catch (err) {}
    }
    state.custom.push({ id, name: name || "Meu treino", items });
    refresh();
    router.replace("/(tabs)/workouts");
  }

  return (
    <Screen>
      <TopBar title="Nova ficha" back />
      <Field label="Nome do treino" value={name} onChangeText={setName} autoCapitalize="words" />
      {items.length ? items.map((it, i) => {
        const e = exerciseOf(it.id);
        return <Row key={i} title={e ? e.name : it.id} subtitle={it.sets + " x " + it.reps} thumb={<ExerciseThumb exercise={e} />} right={<Button ghost label="✕" onPress={() => setItems(items.filter((_, idx) => idx !== i))} />} />;
      }) : <Empty>Adicione exercícios da biblioteca</Empty>}
      <Field placeholder="Buscar exercício" value={q} onChangeText={setQ} />
      {results.map((e) => (
        <Row key={e.id} title={e.name} subtitle={e.equipment} thumb={<ExerciseThumb exercise={e} />} onPress={() => {
          setItems([...items, { id: e.id, sets: e.sets, reps: e.reps, kg: e.kg, rest: e.rest }]);
          setQ("");
        }} />
      ))}
      <Button label="Salvar ficha" onPress={save} disabled={!items.length} />
    </Screen>
  );
}
