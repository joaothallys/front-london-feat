import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Modal,
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
import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler";
import DraggableFlatList, { ScaleDecorator } from "react-native-draggable-flatlist";
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
import { useStyles, useTheme } from "../../src/theme.js";
import { warmGif } from "../../src/media/GifCache.js";
import { SessionService } from "@shared/services/account/SessionService.js";
import { api, unwrap } from "@shared/api/client.js";
import { NumberWheel } from "../../src/components/NumberWheel.js";
import { applyLoadToDay, dayMuscles, ensureDay, persistPlan, removeExerciseFromDay, updateDayItem } from "../../src/plan.js";

export default function Home() {
  const { colors } = useTheme();
  const styles = useStyles(styleFactory);
  const { state, refresh } = useAppState();
  const { start, live } = useLive();
  const [gif, setGif] = useState(null);
  const [menu, setMenu] = useState(null);
  const [loadEdit, setLoadEdit] = useState(null);
  const [iaBusy, setIaBusy] = useState(false);
  const iaRetry = !!(state.plan && state.plan.iaFailed);
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

  async function retryIa() {
    if (iaBusy || !SessionService.hasToken()) return;
    setIaBusy(true);
    try {
      await SessionService.generateIaPlan(state, {
        name: state.profile.name,
        gender: state.profile.gender,
        goal: state.profile.goal,
        level: state.profile.level,
        days: state.profile.days
      });
      refresh();
    } catch (err) {
      Alert.alert("IA indisponível", "Ainda não deu para montar com a IA. Tente de novo em instantes.");
    } finally {
      setIaBusy(false);
    }
  }

  function begin() {
    if (live) {
      router.push("/session");
      return;
    }
    if (!items.length) {
      ensureDay(state);
      refresh();
      router.push("/add-exercise");
      return;
    }
    const next = start(day.name || "Meu Plano", items, {
      sourceType: "plan_day",
      sourceId: (day && day.id) || (state.plan && state.plan.id) || null
    });
    if (next) router.push("/session");
  }

  async function saveDayAsWorkout() {
    if (!day || !items.length) {
      Alert.alert("Nada para salvar", "Adicione exercícios neste dia antes de salvar o treino.");
      return;
    }
    const name = (day && day.name) || "Meu treino";
    const copy = items.map((it) => ({
      id: it.id,
      sets: it.sets,
      reps: it.reps,
      kg: it.kg,
      rest: it.rest
    }));
    let id = "c" + Date.now();
    if (SessionService.hasToken()) {
      try {
        const created = unwrap(await api.workouts.create({
          name,
          exercises: SessionService.payloadItems(copy)
        }));
        id = (created && created.id) || id;
      } catch (err) {}
    }
    state.custom = (state.custom || []).concat([{ id, name, items: copy }]);
    refresh();
    setMenu(null);
    Alert.alert("Treino salvo", name + " está em Treinos salvos.", [
      { text: "OK" },
      { text: "Ver", onPress: () => router.push({ pathname: "/(tabs)/workouts", params: { open: "saved" } }) }
    ]);
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

  function applyLoad() {
    if (!loadEdit) return;
    applyLoadToDay(state, { kg: loadEdit.kg, reps: loadEdit.reps });
    refresh();
    if (menu && menu.type === "item") {
      setMenu(Object.assign({}, menu, { item: Object.assign({}, menu.item, { kg: loadEdit.kg, reps: loadEdit.reps }) }));
    }
    setLoadEdit(null);
  }

  const listHeader = (
    <View>
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
            onPress={() => Share.share({ message: (day && day.name) || "Meu Plano · LumenFit" }).catch(() => {})}
          >
            <Ionicons name="share-outline" size={18} color={colors.text} />
          </HapticPressable>
        </View>
      </View>

      {iaRetry ? (
        <View style={styles.iaBanner}>
          <View style={styles.grow}>
            <Text style={styles.iaTitle}>A IA não montou este plano</Text>
            <Text style={styles.iaTxt}>Você está no plano local. Tente gerar de novo quando a IA voltar.</Text>
          </View>
          <HapticPressable style={styles.iaBtn} onPress={retryIa} disabled={iaBusy}>
            <Text style={styles.iaBtnTxt}>{iaBusy ? "Gerando…" : "Tentar IA"}</Text>
          </HapticPressable>
        </View>
      ) : null}

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
    </View>
  );

  const listFooter = (
    <View>
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
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <DraggableFlatList
        data={items}
        keyExtractor={(it, index) => it.id + "-" + index}
        activationDistance={16}
        containerStyle={styles.list}
        contentContainerStyle={styles.scroll}
        ListHeaderComponent={listHeader}
        ListFooterComponent={listFooter}
        onDragEnd={({ data }) => {
          const current = ensureDay(state);
          current.items = data;
          persistPlan(state);
          refresh();
        }}
        renderItem={({ item: it, getIndex, drag, isActive }) => {
          const e = exerciseOf(it.id);
          const index = getIndex();
          if (!e || index == null) return null;
          return (
            <ScaleDecorator>
              <Swipeable
                enabled={!isActive}
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
                <HapticPressable
                  style={[styles.row, isActive && styles.rowActive]}
                  onPress={() => setMenu({ type: "item", index, exercise: e, item: it })}
                >
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
                  <Pressable onPressIn={drag} style={styles.handle} hitSlop={8}>
                    <Ionicons name="reorder-three-outline" size={24} color={colors.muted} />
                  </Pressable>
                </HapticPressable>
              </Swipeable>
            </ScaleDecorator>
          );
        }}
      />

      <View style={styles.ctaBar}>
        <HapticPressable
          style={styles.share}
          onPress={() => Share.share({ message: (day && day.name) || "Meu Plano · LumenFit" }).catch(() => {})}
        >
          <Ionicons name="share-outline" size={20} color={colors.text} />
        </HapticPressable>
        <HapticPressable style={styles.cta} onPress={begin}>
          <Text style={styles.ctaTxt}>{live ? "Continuar treino" : "Iniciar treino"}</Text>
        </HapticPressable>
      </View>

      <GifPreview visible={!!gif} uri={gif && gif.uri} title={gif && gif.title} exerciseId={gif && gif.id} onClose={() => setGif(null)} />

      {menu && menu.type === "list" ? (
        <Pressable style={styles.sheetBg} onPress={() => setMenu(null)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.sheetHead}>
              <Text style={styles.sheetTitle}>{(day && day.name) || "Meu Plano"}</Text>
            </View>
            <SheetRow
              icon="bookmark-outline"
              label="Salvar treino"
              onPress={saveDayAsWorkout}
            />
          </Pressable>
        </Pressable>
      ) : null}

      {menu && menu.type === "item" ? (
        <Pressable style={styles.sheetBg} onPress={() => setMenu(null)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.sheetHead}>
              <ExerciseThumb exercise={menu.exercise} size={56} onPress={() => setGif({ uri: mediaUrl(menu.exercise), title: menu.exercise.name, id: menu.exercise.id })} />
              <Text style={styles.sheetTitle}>{menu.exercise.name}</Text>
            </View>
            <SheetRow
              icon="barbell-outline"
              label="Peso e repetições"
              right={(menu.item.kg || 0) + " kg · " + (menu.item.reps || 12)}
              onPress={() => setLoadEdit({ kg: Number(menu.item.kg) || 0, reps: Number(menu.item.reps) || 12 })}
            />
            <Text style={styles.sheetHint}>Ao definir, vale para todos os exercícios do dia.</Text>
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

      <Modal visible={!!loadEdit} transparent animationType="slide" onRequestClose={() => setLoadEdit(null)}>
        <GestureHandlerRootView style={styles.loadModal}>
          <Pressable style={styles.loadDim} onPress={() => setLoadEdit(null)} />
          <View style={styles.loadSheet}>
            <View style={styles.sheetHead}>
              <Text style={styles.sheetTitle}>Peso e reps de todos</Text>
              <HapticPressable onPress={applyLoad}>
                <Text style={styles.sheetDone}>Pronto</Text>
              </HapticPressable>
            </View>
            <Text style={styles.sheetHintModal}>Esse valor entra em todos os exercícios deste dia.</Text>
            {loadEdit ? (
              <View style={styles.wheels}>
                <View style={styles.wheelCol}>
                  <Text style={styles.wheelLbl}>kg</Text>
                  <NumberWheel
                    key={"plan-kg"}
                    value={loadEdit.kg}
                    min={0}
                    max={200}
                    step={0.5}
                    onChange={(kg) => setLoadEdit((cur) => ({ ...cur, kg }))}
                  />
                </View>
                <View style={styles.wheelCol}>
                  <Text style={styles.wheelLbl}>Reps</Text>
                  <NumberWheel
                    key={"plan-reps"}
                    value={loadEdit.reps}
                    min={1}
                    max={40}
                    step={1}
                    onChange={(reps) => setLoadEdit((cur) => ({ ...cur, reps }))}
                  />
                </View>
              </View>
            ) : null}
          </View>
        </GestureHandlerRootView>
      </Modal>
    </SafeAreaView>
  );
}

function FilterChip({ label, onPress }) {
  const { colors } = useTheme();
  const styles = useStyles(styleFactory);
  return (
    <HapticPressable style={styles.chip} onPress={onPress}>
      <Text style={styles.chipTxt}>{label}</Text>
      <Ionicons name="chevron-down" size={12} color={colors.muted} />
    </HapticPressable>
  );
}

function SheetRow({ icon, label, right, onPress, danger }) {
  const { colors } = useTheme();
  const styles = useStyles(styleFactory);
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

function styleFactory(c) {
  return {
  safe: { flex: 1, backgroundColor: c.bg },
  list: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingBottom: 24 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { color: c.text, fontSize: 22, fontWeight: "800" },
  headerBtns: { flexDirection: "row", gap: 8 },
  iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: c.surface, alignItems: "center", justifyContent: "center" },
  iaBanner: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: c.surface, borderRadius: 16, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: c.line },
  iaTitle: { color: c.text, fontWeight: "800", fontSize: 14 },
  iaTxt: { color: c.muted, fontSize: 12, lineHeight: 17, marginTop: 4 },
  iaBtn: { backgroundColor: c.red, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  iaBtnTxt: { color: "#fff", fontWeight: "800", fontSize: 12 },
  days: { gap: 8, paddingBottom: 12 },
  dayTab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  dayTabOn: { backgroundColor: c.surface3 },
  dayTxt: { color: c.muted, fontWeight: "800", fontSize: 12, letterSpacing: 0.6 },
  dayTxtOn: { color: c.text },
  filters: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  chip: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: c.surface, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  chipTxt: { color: c.text, fontWeight: "700", fontSize: 13 },
  section: { color: c.muted, fontSize: 11, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase", marginTop: 10, marginBottom: 10 },
  sectionInline: { color: c.muted, fontSize: 11, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase" },
  muscles: { gap: 10, paddingBottom: 8 },
  muscleCard: { width: 100, alignItems: "center" },
  muscleLbl: { color: c.muted2, fontSize: 12, marginTop: 6, fontWeight: "600" },
  muted: { color: c.muted },
  exHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8, marginBottom: 10 },
  exHeadBtns: { flexDirection: "row", gap: 8 },
  round: { width: 36, height: 36, borderRadius: 18, backgroundColor: c.surface, alignItems: "center", justifyContent: "center" },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, backgroundColor: c.bg },
  rowActive: { opacity: 0.88 },
  handle: { paddingHorizontal: 4, paddingVertical: 8 },
  grow: { flex: 1 },
  exName: { color: c.text, fontSize: 16, fontWeight: "700" },
  exMeta: { color: c.muted, marginTop: 4, fontSize: 13 },
  delete: { backgroundColor: c.red, width: 88, alignItems: "center", justifyContent: "center" },
  deleteTxt: { color: "#fff", fontWeight: "800", fontSize: 11, marginTop: 4, textTransform: "uppercase" },
  action: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14 },
  actionIcon: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: c.line, alignItems: "center", justifyContent: "center" },
  actionTxt: { flex: 1, color: c.text, fontWeight: "800", letterSpacing: 0.4, textTransform: "uppercase", fontSize: 13 },
  ctaBar: { position: "absolute", left: 16, right: 16, bottom: 12, flexDirection: "row", alignItems: "center", gap: 10 },
  share: { width: 52, height: 52, borderRadius: 26, backgroundColor: c.surface3, alignItems: "center", justifyContent: "center" },
  cta: { flex: 1, height: 52, borderRadius: 26, backgroundColor: c.red, alignItems: "center", justifyContent: "center" },
  ctaTxt: { color: "#fff", fontWeight: "900", letterSpacing: 0.8, textTransform: "uppercase" },
  sheetBg: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" },
  sheet: { backgroundColor: c.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 18, paddingBottom: 28 },
  sheetHead: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  sheetTitle: { color: c.text, fontSize: 18, fontWeight: "800", flex: 1 },
  sheetHint: { color: c.muted, fontSize: 12, marginBottom: 8, marginLeft: 48 },
  sheetHintModal: { color: c.muted, fontSize: 12, marginBottom: 8 },
  sheetDone: { color: c.red, fontWeight: "800" },
  loadModal: { flex: 1, justifyContent: "flex-end" },
  loadDim: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.55)" },
  loadSheet: { backgroundColor: c.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 18, paddingBottom: 28 },
  wheels: { flexDirection: "row", gap: 12, marginTop: 8 },
  wheelCol: { flex: 1 },
  wheelLbl: { color: c.muted, textAlign: "center", fontWeight: "700", marginBottom: 4, textTransform: "uppercase", fontSize: 11, letterSpacing: 0.6 },
  sheetRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  sheetRight: { color: c.muted2, fontWeight: "700" }
};
}
