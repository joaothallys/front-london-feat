import React, { useEffect, useState } from "react";
import { FlatList, InteractionManager, StyleSheet, Text, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChestLibraryService } from "@shared/services/exercises/ChestLibraryService.js";
import { FavoriteService } from "@shared/services/favorites/FavoriteService.js";
import { MUSCLE_ART } from "@shared/domain/muscle-art.js";
import { catalogToAppView } from "@shared/data/exercises/exerciseCatalog.js";
import { ExerciseThumb } from "../src/components/ExerciseThumb.js";
import { GifPreview } from "../src/components/GifPreview.js";
import { HapticPressable } from "../src/components/HapticPressable.js";
import { ExerciseSkeletonList } from "../src/components/Skeleton.js";
import { MuscleArt } from "../src/components/MuscleArt.js";
import { useAppState } from "../src/state/AppState.js";
import { addExercisesToDay } from "../src/plan.js";
import { mediaUrl } from "../src/catalog.js";
import { colors } from "../src/theme.js";

const TABS = [
  ["todos", "Todos"],
  ["muscle", "Por músculo"],
  ["favorites", "Favoritos"]
];

function loadRows(tab, q, muscle) {
  if (tab === "muscle" && !muscle && !String(q || "").trim()) return [];
  const opts = { q, sort: "popularidade" };
  if (tab === "muscle" && muscle) opts.category = muscle;
  let rows = ChestLibraryService.query(opts);
  if (tab === "favorites") {
    const fav = new Set(FavoriteService.list());
    rows = rows.filter((ex) => fav.has(ex.id) || fav.has(ex.sourceId));
  }
  return rows;
}

export default function AddExercise() {
  const { replace } = useLocalSearchParams();
  const replaceIndex = replace != null && replace !== "" ? Number(replace) : null;
  const { state, refresh } = useAppState();
  const [tab, setTab] = useState("todos");
  const [q, setQ] = useState("");
  const [muscle, setMuscle] = useState("");
  const [picked, setPicked] = useState({});
  const [gif, setGif] = useState(null);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const selected = Object.keys(picked).filter((id) => picked[id]);
  const showMuscles = tab === "muscle" && !muscle && !q.trim();

  useEffect(() => {
    if (showMuscles) {
      setList([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const task = InteractionManager.runAfterInteractions(() => {
      setList(loadRows(tab, q, muscle));
      setLoading(false);
    });
    return () => task.cancel();
  }, [tab, q, muscle, showMuscles]);

  function changeTab(id) {
    setTab(id);
    setMuscle("");
    if (!(id === "muscle" && !q.trim())) {
      setList([]);
      setLoading(true);
    }
  }

  function toggle(ex) {
    setPicked((prev) => Object.assign({}, prev, { [ex.id]: !prev[ex.id] }));
  }

  function confirm() {
    const exercises = selected.map((id) => {
      const raw = ChestLibraryService.get(id);
      return catalogToAppView(raw) || raw;
    }).filter(Boolean);
    if (!exercises.length) return;
    addExercisesToDay(state, exercises, replaceIndex);
    refresh();
    router.back();
  }

  function renderItem({ item: ex }) {
    const view = catalogToAppView(ex);
    const on = !!picked[ex.id];
    return (
      <HapticPressable style={styles.row} onPress={() => toggle(ex)}>
        <ExerciseThumb
          exercise={view}
          size={64}
          onPress={() => setGif({ uri: mediaUrl(view), title: ex.displayName, id: ex.id })}
        />
        <Text style={styles.exName}>{ex.displayName}</Text>
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
        <Text style={styles.title}>Adicionar exercício</Text>
      </View>

      <View style={styles.search}>
        <Ionicons name="search" size={18} color={colors.muted} />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Buscar exercícios"
          placeholderTextColor={colors.muted}
          style={styles.input}
        />
      </View>

      <View style={styles.tabs}>
        {TABS.map(([id, label]) => (
          <HapticPressable key={id} style={[styles.tab, tab === id && styles.tabOn]} onPress={() => changeTab(id)}>
            <Text style={[styles.tabTxt, tab === id && styles.tabTxtOn]}>{label}</Text>
          </HapticPressable>
        ))}
      </View>

      {showMuscles ? (
        <FlatList
          data={MUSCLE_ART}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item: m }) => (
            <HapticPressable style={styles.muscleRow} onPress={() => { setMuscle(m.id); setLoading(true); setList([]); }}>
              <MuscleArt id={m.id} width={44} height={44} />
              <Text style={styles.exName}>{m.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.muted} />
            </HapticPressable>
          )}
        />
      ) : (
        <FlatList
          data={list}
          keyExtractor={(ex) => ex.id}
          renderItem={renderItem}
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          windowSize={5}
          removeClippedSubviews
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            loading ? null : (
              <View style={styles.countRow}>
                <Text style={styles.count}>{list.length} exercício{list.length === 1 ? "" : "s"}</Text>
                <Text style={styles.sort}>Ordenado por Popularidade</Text>
              </View>
            )
          }
          ListEmptyComponent={
            loading
              ? <ExerciseSkeletonList count={8} />
              : <Text style={styles.empty}>{tab === "favorites" ? "Nenhum favorito ainda." : "Nenhum exercício encontrado."}</Text>
          }
          ListFooterComponent={<View style={{ height: selected.length ? 96 : 24 }} />}
        />
      )}

      {selected.length ? (
        <HapticPressable style={styles.cta} onPress={confirm}>
          <Text style={styles.ctaTxt}>Adicionar ({selected.length})</Text>
        </HapticPressable>
      ) : null}

      <GifPreview
        visible={!!gif}
        uri={gif && gif.uri}
        title={gif && gif.title}
        exerciseId={gif && gif.id}
        onClose={() => setGif(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  top: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, marginBottom: 8 },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  title: { flex: 1, textAlign: "center", color: colors.text, fontSize: 18, fontWeight: "800", marginRight: 40 },
  search: { flexDirection: "row", alignItems: "center", gap: 8, marginHorizontal: 16, backgroundColor: colors.surface, borderRadius: 14, paddingHorizontal: 12, height: 44 },
  input: { flex: 1, color: colors.text, fontSize: 16 },
  tabs: { flexDirection: "row", margin: 16, backgroundColor: colors.surface, borderRadius: 999, padding: 4 },
  tab: { flex: 1, alignItems: "center", paddingVertical: 8, borderRadius: 999 },
  tabOn: { backgroundColor: colors.surface3 },
  tabTxt: { color: colors.muted, fontWeight: "800", fontSize: 11, letterSpacing: 0.4, textTransform: "uppercase" },
  tabTxtOn: { color: colors.text },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  countRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  count: { color: colors.muted, fontSize: 12 },
  sort: { color: colors.muted, fontSize: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 },
  muscleRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  exName: { flex: 1, color: colors.text, fontSize: 16, fontWeight: "700" },
  check: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: colors.muted, alignItems: "center", justifyContent: "center" },
  checkOn: { backgroundColor: colors.red, borderColor: colors.red },
  empty: { color: colors.muted, textAlign: "center", marginTop: 32 },
  cta: { position: "absolute", left: 16, right: 16, bottom: 18, height: 52, borderRadius: 26, backgroundColor: colors.red, alignItems: "center", justifyContent: "center" },
  ctaTxt: { color: "#fff", fontWeight: "900", letterSpacing: 0.6, textTransform: "uppercase" }
});
