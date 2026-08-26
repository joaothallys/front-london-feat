import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { MUSCLE_ART } from "@shared/domain/muscle-art.js";
import { Chip, Empty, Field, Row, Screen, Title } from "../../src/components/ui.js";
import { HapticPressable } from "../../src/components/HapticPressable.js";
import { MuscleArt } from "../../src/components/MuscleArt.js";
import { ExerciseThumb } from "../../src/components/ExerciseThumb.js";
import { useAppState } from "../../src/state/AppState.js";
import { D, exerciseOf } from "../../src/catalog.js";
import { useStyles, useTheme } from "../../src/theme.js";

const LIBRARY = ["peito", "costas", "ombros", "biceps", "triceps", "gluteos", "pernas", "trapezio"];

export default function Library() {
  const { colors } = useTheme();
  const styles = useStyles(styleFactory);
  const { state } = useAppState();
  const [tab, setTab] = useState("muscle");
  const [q, setQ] = useState("");
  const favs = (state.favorites || []).map((id) => exerciseOf(id)).filter(Boolean);
  const search = q.trim()
    ? D.exercises.filter((ex) => ((ex.name || "") + " " + (ex.originalName || "")).toLowerCase().indexOf(q.toLowerCase()) >= 0).slice(0, 40)
    : [];

  return (
    <Screen>
      <Title>Exercícios</Title>
      <Field placeholder="Buscar exercício" value={q} onChangeText={setQ} />
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        <Chip label="Por músculo" on={tab === "muscle"} onPress={() => setTab("muscle")} />
        <Chip label="Favoritos" on={tab === "favorites"} onPress={() => setTab("favorites")} />
      </View>
      {q.trim() ? (
        search.length ? search.map((ex) => (
          <Row key={ex.id} title={ex.name} subtitle={(ex.bodyPart || "") + " · " + (ex.equipment || "")} thumb={<ExerciseThumb exercise={ex} />} onPress={() => router.push("/exercise/" + ex.id)} />
        )) : <Empty>Nenhum exercício encontrado.</Empty>
      ) : tab === "favorites" ? (
        favs.length ? favs.map((ex) => (
          <Row key={ex.id} title={ex.name} subtitle={ex.equipment} thumb={<ExerciseThumb exercise={ex} />} onPress={() => router.push("/exercise/" + ex.id)} />
        )) : <Empty>Ainda não há favoritos.</Empty>
      ) : (
        <View style={styles.grid}>
          {MUSCLE_ART.map((m) => (
            <HapticPressable
              key={m.id}
              style={styles.cell}
              onPress={() => LIBRARY.indexOf(m.id) >= 0 ? router.push("/library/" + m.id) : null}
            >
              <MuscleArt id={m.id} width={160} height={110} />
            </HapticPressable>
          ))}
        </View>
      )}
    </Screen>
  );
}

function styleFactory(c) {
  return {
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  cell: { width: "48%", backgroundColor: c.surface, borderRadius: 16, overflow: "hidden" }
};
}
