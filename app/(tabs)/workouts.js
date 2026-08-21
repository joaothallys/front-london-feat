import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Swipeable } from "react-native-gesture-handler";
import { Button, Chip, Empty, Row, Screen, Title } from "../../src/components/ui.js";
import { ExerciseThumb } from "../../src/components/ExerciseThumb.js";
import { HapticPressable } from "../../src/components/HapticPressable.js";
import { useAppState } from "../../src/state/AppState.js";
import { useLive } from "../../src/state/LiveSession.js";
import { D, exerciseOf } from "../../src/catalog.js";
import { SessionService } from "@shared/services/account/SessionService.js";
import { api } from "@shared/api/client.js";
import { colors } from "../../src/theme.js";

export default function Workouts() {
  const { state, refresh } = useAppState();
  const { start } = useLive();
  const [tab, setTab] = useState("saved");
  const saved = state.custom || [];
  const programs = D.programs || [];

  function startSplit(day) {
    const live = start(day.name, day.items, { sourceType: "plan_day", sourceId: day.id || (state.plan && state.plan.id) || null });
    if (live) router.push("/session");
  }

  function removeWorkout(workout) {
    Alert.alert("Excluir treino?", workout.name + " vai sair da sua lista.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: () => {
          state.custom = (state.custom || []).filter((row) => row.id !== workout.id);
          refresh();
          if (SessionService.hasToken() && workout.id) {
            api.workouts.remove(workout.id).catch(() => {});
          }
        }
      }
    ]);
  }

  return (
    <Screen>
      <Title>Treinos</Title>
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        <Chip label={"Treinos (" + saved.length + ")"} on={tab === "saved"} onPress={() => setTab("saved")} />
        <Chip label={"Planos (" + (state.plan ? 1 : 0) + ")"} on={tab === "plans"} onPress={() => setTab("plans")} />
        <Chip label="Programas" on={tab === "programs"} onPress={() => setTab("programs")} />
        <Chip label="Rápidos" onPress={() => router.push("/fast")} />
      </View>
      {tab === "saved" ? (
        <>
          <Button ghost label="+ Criar treino" onPress={() => router.push("/create")} />
          {saved.length ? saved.map((c) => (
            <Swipeable
              key={c.id}
              renderRightActions={() => (
                <HapticPressable style={styles.delete} onPress={() => removeWorkout(c)}>
                  <Ionicons name="trash" size={18} color="#fff" />
                  <Text style={styles.deleteTxt}>Excluir</Text>
                </HapticPressable>
              )}
            >
              <Row
                title={c.name}
                subtitle={c.items.length + " exercícios"}
                thumb={<ExerciseThumb exercise={exerciseOf(c.items[0] && c.items[0].id)} />}
                right={
                  <View style={styles.right}>
                    <Chip label="Adicionar" onPress={() => {
                      if (!state.plan) return;
                      state.plan.split.push({ name: c.name, focus: [], items: c.items });
                      refresh();
                      if (SessionService.hasToken() && state.plan.id) {
                        api.plans.update(state.plan.id, {
                          days: state.plan.split.map((day) => ({
                            name: day.name,
                            focus: day.focus || [],
                            exercises: SessionService.payloadItems(day.items)
                          }))
                        }).catch(() => {});
                      }
                      router.push("/(tabs)/home");
                    }} />
                    <HapticPressable style={styles.trash} onPress={() => removeWorkout(c)}>
                      <Ionicons name="trash-outline" size={18} color={colors.red} />
                    </HapticPressable>
                  </View>
                }
              />
            </Swipeable>
          )) : <Empty>Nenhum treino salvo ainda.</Empty>}
        </>
      ) : null}
      {tab === "plans" ? (
        state.plan ? state.plan.split.map((d, i) => (
          <Row
            key={i}
            title={d.name}
            subtitle={d.items.length + " exercícios"}
            thumb={<ExerciseThumb exercise={exerciseOf(d.items[0] && d.items[0].id)} />}
            onPress={() => startSplit(d)}
          />
        )) : <Empty>Nenhum plano ainda.</Empty>
      ) : null}
      {tab === "programs" ? programs.map((p) => (
        <Row key={p.id} title={p.name} subtitle={(p.blurb || "") + " · " + p.days + " dias"} onPress={() => router.push("/program/" + p.id)} />
      )) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  right: { flexDirection: "row", alignItems: "center" },
  trash: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  delete: { backgroundColor: colors.red, width: 88, alignItems: "center", justifyContent: "center", borderRadius: 16, marginBottom: 8 },
  deleteTxt: { color: "#fff", fontWeight: "800", fontSize: 11, marginTop: 4, textTransform: "uppercase" }
});
