import React, { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { MUSCLE_ART } from "@shared/domain/muscle-art.js";
import { Empty, Field, Row, Screen, Segmented, Title } from "../../src/components/ui.js";
import { HapticPressable } from "../../src/components/HapticPressable.js";
import { MuscleArt } from "../../src/components/MuscleArt.js";
import { ExerciseThumb } from "../../src/components/ExerciseThumb.js";
import { useAppState } from "../../src/state/AppState.js";
import { ChestLibraryService } from "@shared/services/exercises/ChestLibraryService.js";
import { D, exerciseOf } from "../../src/catalog.js";
import { useStyles } from "../../src/theme.js";

function countByMuscle() {
  const counts = {};
  MUSCLE_ART.forEach((m) => { counts[m.id] = 0; });
  ChestLibraryService.all().forEach((ex) => {
    if (ex.isActive === false) return;
    if (counts[ex.category] != null) counts[ex.category] += 1;
  });
  return counts;
}

export default function Library() {
  const styles = useStyles(styleFactory);
  const { state } = useAppState();
  const [tab, setTab] = useState("muscle");
  const [q, setQ] = useState("");
  const counts = useMemo(() => countByMuscle(), []);
  const favs = (state.favorites || []).map((id) => exerciseOf(id)).filter(Boolean);
  const search = q.trim()
    ? D.exercises.filter((ex) => ((ex.name || "") + " " + (ex.originalName || "")).toLowerCase().indexOf(q.toLowerCase()) >= 0).slice(0, 40)
    : [];

  return (
    <Screen>
      <Title style={styles.heading}>Exercícios</Title>
      <Field placeholder="Buscar exercício" value={q} onChangeText={setQ} />
      <Segmented
        options={[{ id: "muscle", label: "Por músculo" }, { id: "favorites", label: "Favoritos" }]}
        value={tab}
        onChange={setTab}
      />
      {q.trim() ? (
        search.length ? search.map((ex) => (
          <Row key={ex.id} title={ex.name} subtitle={(ex.bodyPart || "") + " · " + (ex.equipment || "")} thumb={<ExerciseThumb exercise={ex} />} onPress={() => router.push("/exercise/" + ex.id)} />
        )) : <Empty>Nenhum exercício encontrado.</Empty>
      ) : tab === "favorites" ? (
        favs.length ? favs.map((ex) => (
          <Row key={ex.id} title={ex.name} subtitle={ex.equipment} thumb={<ExerciseThumb exercise={ex} />} onPress={() => router.push("/exercise/" + ex.id)} />
        )) : <Empty>Ainda não há favoritos.</Empty>
      ) : (
        <View style={styles.list}>
          {MUSCLE_ART.map((m) => {
            const n = counts[m.id] || 0;
            return (
              <HapticPressable
                key={m.id}
                style={styles.muscleRow}
                onPress={() => router.push("/library/" + m.id)}
              >
                <View style={styles.thumb}>
                  <MuscleArt id={m.id} width={58} height={58} compact />
                </View>
                <View style={styles.muscleMeta}>
                  <Text style={styles.muscleName}>{m.label}</Text>
                  <Text style={styles.muscleCount}>{n} exercício{n === 1 ? "" : "s"}</Text>
                </View>
              </HapticPressable>
            );
          })}
        </View>
      )}
    </Screen>
  );
}

function styleFactory(c) {
  return {
    heading: { marginBottom: 18 },
    list: { marginTop: 2 },
    muscleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.line
    },
    thumb: {
      width: 64,
      height: 64,
      borderRadius: 14,
      backgroundColor: c.surface,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden"
    },
    muscleMeta: { flex: 1 },
    muscleName: { color: c.text, fontSize: 17, fontWeight: "700" },
    muscleCount: { color: c.muted, fontSize: 13, marginTop: 3 }
  };
}
