import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View
} from "react-native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Swipeable } from "react-native-gesture-handler";
import { SESSION_DURATIONS } from "@shared/domain/profile.js";
import { muscleArt } from "@shared/domain/muscle-art.js";
import { MuscleArt } from "../../src/components/MuscleArt.js";
import { ExerciseThumb } from "../../src/components/ExerciseThumb.js";
import { GifPreview } from "../../src/components/GifPreview.js";
import { HapticPressable } from "../../src/components/HapticPressable.js";
import { useAppState } from "../../src/state/AppState.js";
import { useLive } from "../../src/state/LiveSession.js";
import { ensure } from "@shared/services/exercises/LondonExercise.js";
import { exerciseOf, mediaUrl } from "../../src/catalog.js";
import { colors } from "../../src/theme.js";
import { warmGif } from "../../src/media/GifCache.js";
import { SessionService } from "@shared/services/account/SessionService.js";
import { dayMuscles, ensureDay, persistPlan, removeExerciseFromDay, updateDayItem } from "../../src/plan.js";

export default function Home() {
  const { state, refresh } = useAppState();
  const { start } = useLive();
  const [gif, setGif] = useState(null);
  const [menu, setMenu] = useState(null);
  const days = (state.plan && state.plan.split) || [];
  const day = days.length ? days[Math.max(0, Math.min(state.planDay || 0, days.length - 1))] : null;
  const items = (day && day.items) || [];
  const loc = (state.locations || []).find((l) => l.id === state.activeLocationId) || (state.locations || [])[0];
  const unique = useMemo(() => dayMuscles(day).filter((m) => muscleArt(m)), [day, items.length]);

  useEffect(() => {
    if (!SessionService.hasToken()) return;
    SessionService.syncActivePlan(state).then(() => refresh()).catch(() => {});
  }, []);

  useEffect(() => {
    const gender = state.profile && state.profile.gender;
    const missing = items.filter((it) => {
      const e = exerciseOf(it.id);
      return e && e._stub;
    });
    if (!missing.length) return;
    Promise.all(missing.map((it) => ensure(it.id, gender))).then(() => refresh()).catch(() => {});
  }, [items]);

  useEffect(() => {
    items.slice(0, 2).forEach((it) => {
      const e = exerciseOf(it.id);
      const uri = mediaUrl(e);
      if (e && uri) warmGif(e.id, uri).catch(() => {});
    });
  }, [items]);

  function begin() {
    if (!items.length) {
      ensureDay(state);
      refresh();
      router.push("/add-exercise");
      return;
    }
    const live = start(day.name || "Meu Plano", items, {
      sourceType: "plan_day",
      sourceId: (day && day.id) || (state.plan && state.plan.id) || null
    });
    if (live) router.push("/session");
  }

  function logWorkout() {
    if (!items.length) return;
    const rec = {
      id: "w" + Date.now(),
      date: new Date().toISOString(),
      name: (day && day.name) || "Treino",
      duration: state.profile.sessionDuration || 60,
      volume: 0,
      calories: Math.round((state.profile.sessionDuration || 60) * 8.2),
      exercises: items.length,
      sets: items.reduce((a, it) => a + (it.sets || 3), 0)
    };
    state.history.push(rec);
    refresh();
    Alert.alert("Treino registrado", rec.name + " foi salvo no histórico.");
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Ionicons name="barbell" size={18} color={colors.text} />
            <Text style={styles.title}>Meu Plano</Text>
            <Ionicons name="chevron-down" size={16} color={colors.muted} />
          </View>
          <View style={styles.headerBtns}>
            <HapticPressable style={styles.iconBtn} onPress={() => router.push("/recovery")}>
              <Ionicons name="flame" size={18} color={colors.red} />
            </HapticPressable>
            <HapticPressable
              style={styles.iconBtn}
              onPress={() => Share.share({ message: (day && day.name) || "Meu Plano · London Fitness" }).catch(() => {})}
            >
              <Ionicons name="share-outline" size={18} color={colors.text} />
            </HapticPressable>
          </View>
        </View>

        {days.length ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.days}>
            {days.map((d, idx) => {
              const on = idx === (state.planDay || 0);
              return (
                <HapticPressable
                  key={idx}
                  style={[styles.dayTab, on && styles.dayTabOn]}
                  onPress={() => { state.planDay = idx; refresh(); }}
                >
                  <Text style={[styles.dayTxt, on && styles.dayTxtOn]}>DIA {idx + 1}</Text>
                </HapticPressable>
              );
            })}
          </ScrollView>
        ) : null}

        <View style={styles.filters}>
          <FilterChip
            label={(state.profile.sessionDuration || 60) + "min"}
            onPress={() => {
              const opts = SESSION_DURATIONS;
              const cur = opts.indexOf(Number(state.profile.sessionDuration) || 60);
              state.profile.sessionDuration = opts[(cur + 1) % opts.length];
              refresh();
            }}
          />
          <FilterChip label={unique.length + " Músculo" + (unique.length === 1 ? "" : "s")} />
          <FilterChip
            label={(loc && loc.name) || "Local"}
            onPress={() => router.push("/locations")}
          />
        </View>

        <Text style={styles.section}>Músculos trabalhados</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.muscles}>
          {unique.length ? unique.map((m) => {
            const art = muscleArt(m);
            return (
              <View key={m} style={styles.muscleCard}>
                <MuscleArt id={m} width={88} height={88} />
                <Text style={styles.muscleLbl}>{art ? art.label : m}</Text>
              </View>
            );
          }) : <Text style={styles.muted}>Adicione exercícios para ver os grupos.</Text>}
        </ScrollView>

        <View style={styles.exHead}>
          <Text style={styles.sectionInline}>{items.length} exercício{items.length === 1 ? "" : "s"}</Text>
          <View style={styles.exHeadBtns}>
            <HapticPressable style={styles.round} onPress={() => router.push("/add-exercise")}>
              <Ionicons name="add" size={20} color={colors.text} />
            </HapticPressable>
            <HapticPressable style={styles.round} onPress={() => setMenu({ type: "list" })}>
              <Ionicons name="ellipsis-horizontal" size={18} color={colors.text} />
            </HapticPressable>
          </View>
        </View>

        {items.map((it, index) => {
          const e = exerciseOf(it.id);
          if (!e) return null;
          return (
            <Swipeable
              key={it.id + "-" + index}
              renderRightActions={() => (
                <HapticPressable
                  style={styles.delete}
                  onPress={() => { removeExerciseFromDay(state, index); refresh(); }}
                >
                  <Ionicons name="trash" size={18} color="#fff" />
                  <Text style={styles.deleteTxt}>Deletar</Text>
                </HapticPressable>
              )}
            >
              <HapticPressable style={styles.row} onPress={() => setMenu({ type: "item", index, exercise: e, item: it })}>
                <ExerciseThumb
                  exercise={e}
                  onPress={() => setGif({ uri: mediaUrl(e), title: e.name, id: e.id })}
                />
                <View style={styles.grow}>
                  <Text style={styles.exName}>{e.name}</Text>
                  <Text style={styles.exMeta}>
                    {it.sets || e.sets || 3} sets  •  {it.reps || e.reps || 12} reps  •  {it.kg || e.kg || 0} kg
                  </Text>
                </View>
              </HapticPressable>
            </Swipeable>
          );
        })}

        <HapticPressable style={styles.action} onPress={() => router.push("/add-exercise")}>
          <View style={styles.actionIcon}>
            <Ionicons name="add" size={18} color={colors.text} />
          </View>
          <Text style={styles.actionTxt}>Adicionar exercício</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.muted} />
        </HapticPressable>
        <HapticPressable style={styles.action} onPress={logWorkout}>
          <View style={styles.actionIcon}>
            <Ionicons name="checkmark-done" size={18} color={colors.text} />
          </View>
          <Text style={styles.actionTxt}>Registrar treino</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.muted} />
        </HapticPressable>
        <View style={{ height: 88 }} />
      </ScrollView>

      <View style={styles.ctaBar}>
        <HapticPressable
          style={styles.share}
          onPress={() => Share.share({ message: (day && day.name) || "Meu Plano · London Fitness" }).catch(() => {})}
        >
          <Ionicons name="share-outline" size={20} color={colors.text} />
        </HapticPressable>
        <HapticPressable style={styles.cta} onPress={begin}>
          <Text style={styles.ctaTxt}>Iniciar treino</Text>
        </HapticPressable>
      </View>

      <GifPreview visible={!!gif} uri={gif && gif.uri} title={gif && gif.title} exerciseId={gif && gif.id} onClose={() => setGif(null)} />

      {menu && menu.type === "item" ? (
        <Pressable style={styles.sheetBg} onPress={() => setMenu(null)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.sheetHead}>
              <ExerciseThumb exercise={menu.exercise} size={56} onPress={() => setGif({ uri: mediaUrl(menu.exercise), title: menu.exercise.name, id: menu.exercise.id })} />
              <Text style={styles.sheetTitle}>{menu.exercise.name}</Text>
            </View>
            <SheetRow
              icon="timer-outline"
              label="Editar tempo de descanso"
              right={(menu.item.rest || 45) + "s"}
              onPress={() => {
                const next = menu.item.rest >= 90 ? 45 : (menu.item.rest || 45) + 15;
                updateDayItem(state, menu.index, { rest: next });
                persistPlan(state);
                refresh();
                setMenu(Object.assign({}, menu, { item: Object.assign({}, menu.item, { rest: next }) }));
              }}
            />
            <SheetRow icon="swap-horizontal" label="Substituir exercício" onPress={() => {
              setMenu(null);
              router.push({ pathname: "/add-exercise", params: { replace: String(menu.index) } });
            }} />
            <SheetRow icon="play-circle-outline" label="Vídeo e instruções" onPress={() => {
              setMenu(null);
              router.push("/exercise/" + menu.exercise.id);
            }} />
            <SheetRow icon="trash-outline" label="Remover do plano" danger onPress={() => {
              removeExerciseFromDay(state, menu.index);
              refresh();
              setMenu(null);
            }} />
          </Pressable>
        </Pressable>
      ) : null}
    </SafeAreaView>
  );
}

function FilterChip({ label, onPress }) {
  return (
    <HapticPressable style={styles.chip} onPress={onPress}>
      <Text style={styles.chipTxt}>{label}</Text>
      <Ionicons name="chevron-down" size={12} color={colors.muted} />
    </HapticPressable>
  );
}

function SheetRow({ icon, label, right, onPress, danger }) {
  return (
    <HapticPressable style={styles.sheetRow} onPress={onPress}>
      <View style={styles.actionIcon}>
        <Ionicons name={icon} size={18} color={danger ? colors.red : colors.text} />
      </View>
      <Text style={[styles.actionTxt, danger && { color: colors.red }]}>{label}</Text>
      {right ? <Text style={styles.sheetRight}>{right}</Text> : <Ionicons name="chevron-forward" size={18} color={colors.muted} />}
    </HapticPressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: 16, paddingBottom: 24 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { color: colors.text, fontSize: 22, fontWeight: "800" },
  headerBtns: { flexDirection: "row", gap: 8 },
  iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  days: { gap: 8, paddingBottom: 12 },
  dayTab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  dayTabOn: { backgroundColor: colors.surface3 },
  dayTxt: { color: colors.muted, fontWeight: "800", fontSize: 12, letterSpacing: 0.6 },
  dayTxtOn: { color: colors.text },
  filters: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  chip: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.surface, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  chipTxt: { color: colors.text, fontWeight: "700", fontSize: 13 },
  section: { color: colors.muted, fontSize: 11, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase", marginTop: 10, marginBottom: 10 },
  sectionInline: { color: colors.muted, fontSize: 11, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase" },
  muscles: { gap: 10, paddingBottom: 8 },
  muscleCard: { width: 100, alignItems: "center" },
  muscleLbl: { color: colors.muted2, fontSize: 12, marginTop: 6, fontWeight: "600" },
  muted: { color: colors.muted },
  exHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8, marginBottom: 10 },
  exHeadBtns: { flexDirection: "row", gap: 8 },
  round: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 },
  grow: { flex: 1 },
  exName: { color: colors.text, fontSize: 16, fontWeight: "700" },
  exMeta: { color: colors.muted, marginTop: 4, fontSize: 13 },
  delete: { backgroundColor: colors.red, width: 88, alignItems: "center", justifyContent: "center" },
  deleteTxt: { color: "#fff", fontWeight: "800", fontSize: 11, marginTop: 4, textTransform: "uppercase" },
  action: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14 },
  actionIcon: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: colors.line, alignItems: "center", justifyContent: "center" },
  actionTxt: { flex: 1, color: colors.text, fontWeight: "800", letterSpacing: 0.4, textTransform: "uppercase", fontSize: 13 },
  ctaBar: { position: "absolute", left: 16, right: 16, bottom: 12, flexDirection: "row", alignItems: "center", gap: 10 },
  share: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.surface3, alignItems: "center", justifyContent: "center" },
  cta: { flex: 1, height: 52, borderRadius: 26, backgroundColor: colors.red, alignItems: "center", justifyContent: "center" },
  ctaTxt: { color: "#fff", fontWeight: "900", letterSpacing: 0.8, textTransform: "uppercase" },
  sheetBg: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" },
  sheet: { backgroundColor: colors.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 18, paddingBottom: 28 },
  sheetHead: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  sheetTitle: { color: colors.text, fontSize: 18, fontWeight: "800", flex: 1 },
  sheetRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  sheetRight: { color: colors.muted2, fontWeight: "700" }
});
