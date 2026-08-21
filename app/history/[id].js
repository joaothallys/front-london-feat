import React, { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useFocusEffect } from "expo-router";
import { api, unwrap } from "@shared/api/client.js";
import { Empty, Screen, TopBar } from "../../src/components/ui.js";
import { exerciseOf } from "../../src/catalog.js";
import { colors } from "../../src/theme.js";

function asList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (Array.isArray(value.exercises)) return value.exercises;
  if (Array.isArray(value.data)) return value.data;
  return [];
}

function nameOf(id) {
  const e = exerciseOf(id);
  return (e && e.name) || id;
}

export default function HistoryDetail() {
  const { id } = useLocalSearchParams();
  const [row, setRow] = useState(null);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      setRow(unwrap(await api.history.get(id)) || null);
    } catch (err) {
      setRow(null);
    }
  }, [id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const exercises = asList(row);
  return (
    <Screen>
      <TopBar title={(row && row.name) || "Treino"} back />
      {row ? (
        <Text style={styles.meta}>
          {(row.durationMin || 0) + " min · " + Math.round(row.volumeKg || 0) + " kg · " + (row.calories || 0) + " kcal"}
        </Text>
      ) : null}
      {exercises.length ? exercises.map((ex, i) => (
        <View key={(ex.exerciseId || i) + "-" + i} style={styles.card}>
          <Text style={styles.name}>{nameOf(ex.exerciseId)}</Text>
          {(ex.sets || []).filter((s) => s.type !== "W").map((s, si) => (
            <Text key={si} style={styles.set}>{s.type}  ·  {s.kg} kg × {s.reps}</Text>
          ))}
        </View>
      )) : <Empty>Não foi possível abrir este treino.</Empty>}
    </Screen>
  );
}

const styles = StyleSheet.create({
  meta: { color: colors.muted, marginBottom: 12 },
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.line },
  name: { color: colors.text, fontWeight: "800", marginBottom: 8 },
  set: { color: colors.muted2, marginTop: 4 }
});
