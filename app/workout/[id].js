import React from "react";
import { Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Button, Screen, TopBar } from "../../src/components/ui.js";
import { ExerciseThumb } from "../../src/components/ExerciseThumb.js";
import { HapticPressable } from "../../src/components/HapticPressable.js";
import { useAppState } from "../../src/state/AppState.js";
import { useLive } from "../../src/state/LiveSession.js";
import { exerciseOf } from "../../src/catalog.js";
import { useStyles, useTheme } from "../../src/theme.js";

export default function SavedWorkout() {
  const { colors } = useTheme();
  const styles = useStyles(styleFactory);
  const { id } = useLocalSearchParams();
  const { state } = useAppState();
  const { start } = useLive();
  const workout = (state.custom || []).find((row) => String(row.id) === String(id));

  if (!workout) {
    return (
      <Screen>
        <TopBar title="Treino salvo" back />
        <Text style={{ color: colors.muted }}>Este treino não está mais na sua lista.</Text>
      </Screen>
    );
  }

  const items = workout.items || [];

  function begin() {
    const live = start(workout.name, items, { sourceType: "custom", sourceId: workout.id });
    if (live) router.push("/session");
  }

  return (
    <Screen>
      <TopBar
        title={workout.name}
        back
        right={
          <HapticPressable
            style={styles.editBtn}
            onPress={() => router.push({ pathname: "/create", params: { id: workout.id } })}
          >
            <Ionicons name="pencil-outline" size={18} color={colors.text} />
          </HapticPressable>
        }
      />
      <Text style={styles.meta}>
        {items.length + " exercício" + (items.length === 1 ? "" : "s")}
      </Text>
      {items.map((it, i) => {
        const e = exerciseOf(it.id);
        return (
          <View key={(it.id || i) + "-" + i} style={styles.card}>
            <ExerciseThumb exercise={e} size={52} />
            <View style={styles.grow}>
              <Text style={styles.name}>{(e && e.name) || it.id}</Text>
              <Text style={styles.detail}>
                {(it.sets || 3) + " sets  ·  " + (it.reps || 12) + " reps  ·  " + (it.kg || 0) + " kg"}
              </Text>
            </View>
          </View>
        );
      })}
      <Button label="Iniciar treino" onPress={begin} />
    </Screen>
  );
}

function styleFactory(c) {
  return {
    meta: { color: c.muted, marginBottom: 14, fontWeight: "700" },
    card: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      backgroundColor: c.surface,
      borderRadius: 16,
      padding: 12,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: c.line
    },
    grow: { flex: 1 },
    name: { color: c.text, fontWeight: "800", fontSize: 15 },
    detail: { color: c.muted, marginTop: 4, fontSize: 13 },
    editBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: c.surface, alignItems: "center", justifyContent: "center" }
  };
}
