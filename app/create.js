import React, { useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { api, unwrap } from "@shared/api/client.js";
import { MUSCLE_ART } from "@shared/domain/muscle-art.js";
import { catalogToAppView } from "@shared/data/exercises/exerciseCatalog.js";
import { ChestLibraryService } from "@shared/services/exercises/ChestLibraryService.js";
import { SessionService } from "@shared/services/account/SessionService.js";
import { Button, Field } from "../src/components/ui.js";
import { ExerciseThumb } from "../src/components/ExerciseThumb.js";
import { HapticPressable } from "../src/components/HapticPressable.js";
import { MuscleArt } from "../src/components/MuscleArt.js";
import { useAppState } from "../src/state/AppState.js";
import { useStyles, useTheme } from "../src/theme.js";

const TABS = [
  ["todos", "Todos"],
  ["muscle", "Por músculo"]
];

function toItem(ex) {
  const view = catalogToAppView(ex) || ex;
  return {
    id: view.id || ex.id,
    sets: view.sets || 3,
    reps: view.reps || 12,
    kg: view.kg || 12,
    rest: view.rest || 60
  };
}

export default function Create() {
  const { colors } = useTheme();
  const styles = useStyles(styleFactory);
  const { state, refresh } = useAppState();
  const [name, setName] = useState("Meu treino");
  const [q, setQ] = useState("");
  const [tab, setTab] = useState("todos");
  const [muscle, setMuscle] = useState("");
  const [items, setItems] = useState([]);

  const showMuscles = tab === "muscle" && !muscle && !q.trim();
  const picked = useMemo(() => {
    const map = {};
    items.forEach((it) => { map[it.id] = true; });
    return map;
  }, [items]);

  const list = useMemo(() => {
    if (showMuscles) return [];
    const opts = { q, sort: "popularidade" };
    if (tab === "muscle" && muscle) opts.category = muscle;
    return ChestLibraryService.query(opts);
  }, [tab, q, muscle, showMuscles]);

  function changeTab(id) {
    setTab(id);
    setMuscle("");
  }

  function toggle(ex) {
    const next = toItem(ex);
    setItems((cur) => {
      if (cur.some((it) => it.id === next.id)) {
        return cur.filter((it) => it.id !== next.id);
      }
      return cur.concat(next);
    });
  }

  function remove(id) {
    setItems((cur) => cur.filter((it) => it.id !== id));
  }

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
    router.replace({ pathname: "/(tabs)/workouts", params: { open: "saved" } });
  }

  function renderExercise({ item: ex }) {
    const view = catalogToAppView(ex);
    const on = !!picked[ex.id];
    return (
      <HapticPressable style={styles.row} onPress={() => toggle(ex)}>
        <ExerciseThumb exercise={view} size={56} />
        <View style={styles.grow}>
          <Text style={styles.exName}>{ex.displayName}</Text>
          <Text style={styles.exMeta}>{ex.equipment || (view && view.equipment) || ""}</Text>
        </View>
        <View style={[styles.check, on && styles.checkOn]}>
          {on ? <Ionicons name="checkmark" size={16} color="#fff" /> : null}
        </View>
      </HapticPressable>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.top}>
        <HapticPressable style={styles.back} onPress={() => (muscle ? setMuscle("") : router.back())}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </HapticPressable>
        <Text style={styles.title}>Nova ficha</Text>
      </View>

      <FlatList
        data={showMuscles ? MUSCLE_ART : list}
        keyExtractor={(row) => row.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            <Field label="Nome do treino" value={name} onChangeText={setName} autoCapitalize="words" />

            <Text style={styles.section}>Na ficha · {items.length}</Text>
            {items.length ? items.map((it) => {
              const view = ChestLibraryService.view(it.id);
              return (
                <View key={it.id} style={styles.picked}>
                  <ExerciseThumb exercise={view} size={44} showMuscle={false} />
                  <Text style={styles.pickedName} numberOfLines={1}>{view ? view.name : it.id}</Text>
                  <HapticPressable onPress={() => remove(it.id)}>
                    <Ionicons name="close" size={18} color={colors.muted} />
                  </HapticPressable>
                </View>
              );
            }) : (
              <Text style={styles.hint}>Escolha os exercícios abaixo. Toque de novo para tirar da ficha.</Text>
            )}

            <View style={styles.search}>
              <Ionicons name="search" size={18} color={colors.muted} />
              <TextInput
                value={q}
                onChangeText={setQ}
                placeholder="Buscar por nome"
                placeholderTextColor={colors.muted}
                style={styles.input}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {q ? (
                <HapticPressable onPress={() => setQ("")}>
                  <Ionicons name="close-circle" size={18} color={colors.muted} />
                </HapticPressable>
              ) : null}
            </View>

            <View style={styles.tabs}>
              {TABS.map(([id, label]) => (
                <HapticPressable key={id} style={[styles.tab, tab === id && styles.tabOn]} onPress={() => changeTab(id)}>
                  <Text style={[styles.tabTxt, tab === id && styles.tabTxtOn]}>{label}</Text>
                </HapticPressable>
              ))}
            </View>

            {muscle ? (
              <HapticPressable style={styles.muscleChip} onPress={() => setMuscle("")}>
                <Text style={styles.muscleChipT}>
                  {(MUSCLE_ART.find((m) => m.id === muscle) || {}).label || muscle}
                </Text>
                <Ionicons name="close" size={14} color={colors.text} />
              </HapticPressable>
            ) : null}

            {!showMuscles ? (
              <Text style={styles.count}>
                {list.length} exercício{list.length === 1 ? "" : "s"}
                {q.trim() ? " para “" + q.trim() + "”" : ""}
              </Text>
            ) : (
              <Text style={styles.count}>Filtre por grupo muscular</Text>
            )}
          </View>
        }
        renderItem={
          showMuscles
            ? ({ item: m }) => (
              <HapticPressable style={styles.muscleRow} onPress={() => setMuscle(m.id)}>
                <MuscleArt id={m.id} width={44} height={44} />
                <Text style={styles.exName}>{m.label}</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.muted} />
              </HapticPressable>
            )
            : renderExercise
        }
        ListEmptyComponent={
          showMuscles ? null : <Text style={styles.empty}>Nenhum exercício encontrado.</Text>
        }
        ListFooterComponent={<View style={{ height: 88 }} />}
      />

      <View style={styles.footer}>
        <Button label="Salvar ficha" onPress={save} disabled={!items.length} />
      </View>
    </SafeAreaView>
  );
}

function styleFactory(c) {
  return {
  safe: { flex: 1, backgroundColor: c.bg },
  top: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, marginBottom: 4 },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: c.surface, alignItems: "center", justifyContent: "center" },
  title: { flex: 1, textAlign: "center", color: c.text, fontSize: 18, fontWeight: "800", marginRight: 40 },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  section: { color: c.muted, fontSize: 11, fontWeight: "800", letterSpacing: 0.6, textTransform: "uppercase", marginTop: 4, marginBottom: 8 },
  hint: { color: c.muted, fontSize: 13, lineHeight: 18, marginBottom: 12 },
  picked: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  pickedName: { flex: 1, color: c.text, fontWeight: "700" },
  search: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: c.surface, borderRadius: 14, paddingHorizontal: 12, height: 44, marginTop: 8, borderWidth: 1, borderColor: c.line },
  input: { flex: 1, color: c.text, fontSize: 16 },
  tabs: { flexDirection: "row", marginTop: 12, marginBottom: 8, backgroundColor: c.surface, borderRadius: 999, padding: 4 },
  tab: { flex: 1, alignItems: "center", paddingVertical: 8, borderRadius: 999 },
  tabOn: { backgroundColor: c.surface3 },
  tabTxt: { color: c.muted, fontWeight: "800", fontSize: 11, letterSpacing: 0.4, textTransform: "uppercase" },
  tabTxtOn: { color: c.text },
  muscleChip: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: c.redSoft, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, marginBottom: 8 },
  muscleChipT: { color: c.text, fontWeight: "800", fontSize: 12 },
  count: { color: c.muted, fontSize: 12, marginBottom: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 },
  muscleRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.line },
  grow: { flex: 1 },
  exName: { flex: 1, color: c.text, fontSize: 16, fontWeight: "700" },
  exMeta: { color: c.muted, fontSize: 12, marginTop: 2 },
  check: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: c.muted, alignItems: "center", justifyContent: "center" },
  checkOn: { backgroundColor: c.red, borderColor: c.red },
  empty: { color: c.muted, textAlign: "center", marginTop: 24 },
  footer: { paddingHorizontal: 16, paddingBottom: 12, paddingTop: 4, borderTopWidth: 1, borderTopColor: c.line, backgroundColor: c.bg }
};
}
