import React, { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { Button, Chip, Screen, Section, TopBar } from "../src/components/ui.js";
import { useLive } from "../src/state/LiveSession.js";
import { D } from "../src/catalog.js";

export default function Fast() {
  const { start } = useLive();
  const [sel, setSel] = useState([]);
  const [dur, setDur] = useState(30);

  function tog(id) {
    if (sel.indexOf(id) >= 0) setSel(sel.filter((x) => x !== id));
    else if (sel.length < 2) setSel([...sel, id]);
    else setSel([id]);
  }

  function go() {
    const mus = sel.length ? sel : ["peito"];
    const n = dur <= 20 ? 4 : dur <= 30 ? 5 : 6;
    const items = D.exercises.filter((e) => mus.indexOf(e.muscle) >= 0).slice(0, n).map((e) => ({
      id: e.id, sets: 3, reps: e.reps, kg: e.kg, rest: 45
    }));
    const live = start("Rápido · " + mus.join(" + "), items, { sourceType: "fast" });
    if (live) router.push("/session");
  }

  return (
    <Screen>
      <TopBar title="Treino rápido" back />
      <Section>Até 2 grupos</Section>
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {D.muscles.map((m) => (
          <Chip key={m.id} label={m.label} on={sel.indexOf(m.id) >= 0} onPress={() => tog(m.id)} />
        ))}
      </View>
      <Section>Duração</Section>
      <View style={{ flexDirection: "row" }}>
        {[20, 30, 45].map((n) => <Chip key={n} label={n + " min"} on={dur === n} onPress={() => setDur(n)} />)}
      </View>
      <Button label="Gerar e treinar" onPress={go} />
    </Screen>
  );
}
