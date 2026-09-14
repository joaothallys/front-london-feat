import React, { useCallback, useState } from "react";
import { Text, View } from "react-native";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { api, unwrap } from "@shared/api/client.js";
import { Empty, Screen, TopBar } from "../../src/components/ui.js";
import { HapticPressable } from "../../src/components/HapticPressable.js";
import { useAppState } from "../../src/state/AppState.js";
import { exerciseOf } from "../../src/catalog.js";
import { useStyles, useTheme } from "../../src/theme.js";

function asList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (Array.isArray(value.exercises)) return value.exercises;
  if (Array.isArray(value.lines)) return value.lines;
  if (Array.isArray(value.data)) return value.data;
  return [];
}

function nameOf(id) {
  const e = exerciseOf(id);
  return (e && e.name) || id;
}

export default function HistoryDetail() {
  const { colors } = useTheme();
  const styles = useStyles(styleFactory);
  const { id } = useLocalSearchParams();
  const { state } = useAppState();
  const local = (state.history || []).find((row) => String(row.id) === String(id)) || null;
  const [row, setRow] = useState(local);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const remote = unwrap(await api.history.get(id));
      setRow(remote || local || null);
    } catch (err) {
      setRow(local || null);
    }
  }, [id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const exercises = asList(row);
  return (
    <Screen>
      <TopBar
        title={(row && row.name) || "Treino"}
        back
        right={
          id ? (
            <HapticPressable
              style={styles.editBtn}
              onPress={() => router.push({ pathname: "/create", params: { history: id } })}
            >
              <Ionicons name="pencil-outline" size={18} color={colors.text} />
            </HapticPressable>
          ) : null
        }
      />
      {row ? (
        <Text style={styles.meta}>
          {(row.durationMin || row.duration || 0) + " min · " + Math.round(row.volumeKg || row.volume || 0) + " kg · " + (row.calories || 0) + " kcal"}
        </Text>
      ) : null}
      {exercises.length ? exercises.map((ex, i) => {
        const title = ex.name || nameOf(ex.exerciseId || ex.id);
        const sets = ex.sets;
        return (
          <View key={(ex.exerciseId || ex.id || i) + "-" + i} style={styles.card}>
            <Text style={styles.name}>{title}</Text>
            {Array.isArray(sets) ? sets.filter((s) => s && s.type !== "W").map((s, si) => (
              <Text key={si} style={styles.set}>{(s.type || "N") + "  ·  " + (s.kg || 0) + " kg × " + (s.reps || 0)}</Text>
            )) : (
              <Text style={styles.set}>{ex.detail || ((ex.sets || 0) + " séries")}</Text>
            )}
          </View>
        );
      }) : <Empty>Não foi possível abrir este treino.</Empty>}
    </Screen>
  );
}

function styleFactory(c) {
  return {
    meta: { color: c.muted, marginBottom: 12 },
    card: { backgroundColor: c.surface, borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: c.line },
    name: { color: c.text, fontWeight: "800", marginBottom: 8 },
    set: { color: c.muted2, marginTop: 4 },
    editBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: c.surface, alignItems: "center", justifyContent: "center" }
  };
}
