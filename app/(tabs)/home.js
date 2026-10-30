import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
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
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from "react-native-reanimated";
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
import { shareTitle } from "../../src/share.js";
import { createShareLink, shareItem } from "../../src/session/shareLink.js";
import { NumberPad } from "../../src/components/NumberPad.js";
import Swipeable from "../../src/components/Swipeable.js";
import { applyLoadToDay, dayMuscles, ensureDay, persistPlan, removeExerciseFromDay, updateDayItem } from "../../src/plan.js";
import { computeWorkoutStats } from "../../src/workout/stats.js";
import { finishBody } from "../../src/session/finishPayload.js";
import { isRetryable, queueSession } from "../../src/session/pendingSync.js";

const REST_STEPS = [30, 45, 60, 90, 120, 180];

export default function Home() {
  const { colors } = useTheme();
  const styles = useStyles(styleFactory);
  const { state, refresh } = useAppState();
  const { start, live } = useLive();
  const [gif, setGif] = useState(null);
  const [menu, setMenu] = useState(null);
  const [loadEdit, setLoadEdit] = useState(null);
  const [iaBusy, setIaBusy] = useState(false);
  const [sharing, setSharing] = useState(false);
  const iaRetry = !!(state.plan && state.plan.iaFailed);
  const days = (state.plan && state.plan.split) || [];
  const dayIndex = days.length ? Math.max(0, Math.min(state.planDay || 0, days.length - 1)) : 0;
  const day = days.length ? days[dayIndex] : null;
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
      sourceId: (day && day.id) || (state.plan && state.plan.id) || null,
      dayIndex
    });
    if (next) router.push("/session");
  }

  async function shareDay() {
    const name = shareTitle(day);
    if (!items.length || !SessionService.hasToken()) {
      Share.share({ message: name + " · LumenFit" }).catch(() => {});
      return;
    }
    if (sharing) return;
    setSharing(true);
    try {
      const shared = items.map((it) => {
        const e = exerciseOf(it.id) || {};
        const kg = Number(it.kg || e.kg) || 0;
        const reps = Number(it.reps || e.reps) || 0;
        const count = Math.max(1, Number(it.sets || e.sets) || 3);
        return shareItem(it.id, Array.from({ length: count }, () => ({ type: "N", kg, reps })), it.rest);
      });
      const { url } = await createShareLink({
        name,
        author: ((state.profile && state.profile.name) || "").split(" ")[0],
        items: shared
      });
      await Share.share(Platform.OS === "ios" ? { url } : { message: url, title: name });
    } catch (err) {
      Alert.alert("Não foi possível compartilhar", "Verifique sua conexão e tente de novo.");
    } finally {
      setSharing(false);
    }
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
    if (!items.length || live) return;
    Alert.alert("Registrar treino?", "Marca " + ((day && day.name) || "este treino") + " como feito hoje, com as cargas do plano.", [
      { text: "Cancelar", style: "cancel" },
      { text: "Registrar", onPress: registerDay }
    ]);
  }

  async function registerDay() {
    const duration = Number(state.profile.sessionDuration) || 60;
    const done = {
      name: (day && day.name) || "Treino",
      startedAt: Date.now() - duration * 60000,
      meta: { sourceType: "plan_day", sourceId: (day && day.id) || null },
      items: items.filter((it) => exerciseOf(it.id)).map((it) => {
        const e = exerciseOf(it.id);
        const kg = Number(it.kg || e.kg) || 0;
        const reps = Number(it.reps || e.reps) || 10;
        const count = Math.max(1, Number(it.sets || e.sets) || 3);
        return {
          id: it.id,
          rest: Number(it.rest || e.rest) || 90,
          sets: Array.from({ length: count }, () => ({ type: "N", kg, reps, done: true }))
        };
      })
    };
    const stats = computeWorkoutStats(done, duration);
    let rec = {
      id: "local-" + Date.now(),
      date: new Date().toISOString(),
      name: done.name,
      duration: stats.duration,
      volume: stats.volume,
      calories: stats.calories,
      exercises: stats.completedCount,
      sets: stats.doneSets,
      totalReps: stats.reps,
      muscles: stats.muscleLabels,
      lines: stats.lines
    };
    stats.muscles.forEach((m) => { state.recovery[m] = Date.now(); });
    if (SessionService.hasToken()) {
      const body = finishBody(done, { durationMin: stats.duration, muscles: stats.muscles });
      try {
        const mapped = SessionService.mapHistory(unwrap(await api.sessions.finish(body)) || {});
        rec = Object.assign({}, rec, mapped, {
          id: mapped.id || rec.id,
          volume: mapped.volume || rec.volume,
          exercises: mapped.exercises || rec.exercises,
          sets: mapped.sets || rec.sets
        });
      } catch (err) {
        if (isRetryable(err)) {
          rec.pendingSync = true;
          queueSession(rec.id, body);
        }
      }
    }
    state.history = [rec].concat(state.history || []);
    refresh();
    Alert.alert("Treino registrado", rec.name + " foi salvo no histórico.");
  }

  function applyLoad(toAll) {
    if (!loadEdit) return;
    const patch = { kg: loadEdit.kg, reps: loadEdit.reps };
    if (toAll || !menu || menu.type !== "item") applyLoadToDay(state, patch);
    else updateDayItem(state, menu.index, patch);
    refresh();
    if (menu && menu.type === "item") {
      setMenu(Object.assign({}, menu, { item: Object.assign({}, menu.item, patch) }));
    }
    setLoadEdit(null);
  }

  const listHeader = (
    <View>
      <View style={styles.header}>
        <View style={styles.grow}>
          <Text style={styles.kicker}>{greeting(state.profile.name)}</Text>
          <Text style={styles.title} numberOfLines={1}>{(state.plan && state.plan.name) || "Meu Plano"}</Text>
        </View>
        <View style={styles.headerBtns}>
          <HapticPressable
            style={styles.iconBtn}
            onPress={() => router.push("/recovery")}
            accessibilityLabel="Recuperação muscular"
          >
            <Ionicons name="flame" size={18} color={colors.red} />
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
            const on = idx === dayIndex;
            return (
              <HapticPressable
                key={idx}
                style={[styles.dayTab, on && styles.dayTabOn]}
                onPress={() => { state.planDay = idx; refresh(); }}
              >
                <Text style={[styles.dayTxt, on && styles.dayTxtOn]}>DIA {idx + 1}</Text>
                {d.name ? <Text style={[styles.dayName, on && styles.dayNameOn]} numberOfLines={1}>{shortDayName(d.name)}</Text> : null}
              </HapticPressable>
            );
          })}
        </ScrollView>
      ) : null}

      <View style={styles.filters}>
        <FilterChip
          icon="time-outline"
          label={(state.profile.sessionDuration || 60) + " min"}
          onPress={() => {
            const opts = SESSION_DURATIONS;
            const cur = opts.indexOf(Number(state.profile.sessionDuration) || 60);
            state.profile.sessionDuration = opts[(cur + 1) % opts.length];
            refresh();
          }}
        />
        <FilterChip icon="body-outline" label={unique.length + " músculo" + (unique.length === 1 ? "" : "s")} />
        <FilterChip
          icon="location-outline"
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
      {items.length && !live ? (
        <HapticPressable style={styles.action} onPress={logWorkout}>
          <View style={styles.actionIcon}>
            <Ionicons name="checkmark-done" size={18} color={colors.text} />
          </View>
          <View style={styles.grow}>
            <Text style={styles.actionTxt}>Registrar treino</Text>
            <Text style={styles.actionSub}>Já treinou sem o app? Salve no histórico.</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.muted} />
        </HapticPressable>
      ) : null}
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
                childrenContainerStyle={styles.rowCover}
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
                <View style={styles.rowCover}>
                  <HapticPressable
                    style={[styles.row, isActive && styles.rowActive]}
                    pressScale={false}
                    pressOpacity={false}
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
                </View>
              </Swipeable>
            </ScaleDecorator>
          );
        }}
      />

      <View style={styles.ctaBar}>
        <HapticPressable
          style={styles.share}
          onPress={shareDay}
          disabled={sharing}
          accessibilityLabel="Compartilhar treino"
        >
          <Ionicons name="share-outline" size={20} color={colors.text} />
        </HapticPressable>
        <HapticPressable style={styles.cta} onPress={begin}>
          {live ? <Ionicons name="play" size={16} color="#fff" /> : null}
          <Text style={styles.ctaTxt}>{live ? "Continuar treino" : items.length ? "Iniciar treino" : "Montar treino"}</Text>
        </HapticPressable>
      </View>

      <GifPreview visible={!!gif} uri={gif && gif.uri} title={gif && gif.title} exerciseId={gif && gif.id} onClose={() => setGif(null)} />

      {menu && menu.type === "list" ? (
      <DismissSheet onClose={() => setMenu(null)}>
        <View style={styles.sheetHead}>
          <Text style={styles.sheetTitle}>{(day && day.name) || "Meu Plano"}</Text>
        </View>
        <SheetRow
          icon="bookmark-outline"
          label="Salvar treino"
          onPress={saveDayAsWorkout}
        />
      </DismissSheet>
      ) : null}

      {menu && menu.type === "item" ? (
      <DismissSheet onClose={() => setMenu(null)}>
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
        <SheetRow
          icon="timer-outline"
          label="Editar tempo de descanso"
          right={(menu.item.rest || 60) + "s"}
          onPress={() => {
            const cur = Number(menu.item.rest) || 60;
            const next = REST_STEPS.find((n) => n > cur) || REST_STEPS[0];
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
      </DismissSheet>
      ) : null}

      <Modal visible={!!loadEdit} transparent animationType="slide" onRequestClose={() => setLoadEdit(null)}>
        <KeyboardAvoidingView style={styles.loadModal} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <Pressable style={styles.loadDim} onPress={() => setLoadEdit(null)} />
          <View style={styles.loadSheet}>
            <View style={styles.sheetHead}>
              <Text style={styles.sheetTitle} numberOfLines={1}>
                {menu && menu.type === "item" ? menu.exercise.name : "Peso e reps de todos"}
              </Text>
              <HapticPressable onPress={() => applyLoad(false)} hitSlop={10}>
                <Text style={styles.sheetDone}>Salvar</Text>
              </HapticPressable>
            </View>
            {loadEdit ? (
              <NumberPad
                kg={loadEdit.kg}
                reps={loadEdit.reps}
                focus={loadEdit.field === "reps" ? "reps" : "kg"}
                onFocus={(field) => setLoadEdit((cur) => ({ ...cur, field }))}
                onChangeKg={(kg) => setLoadEdit((cur) => ({ ...cur, kg }))}
                onChangeReps={(reps) => setLoadEdit((cur) => ({ ...cur, reps }))}
              />
            ) : null}
            {menu && menu.type === "item" && items.length > 1 ? (
              <HapticPressable style={styles.applyAll} onPress={() => applyLoad(true)}>
                <Text style={styles.applyAllTxt}>Aplicar a todos os exercícios do dia</Text>
              </HapticPressable>
            ) : null}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

function DismissSheet({ onClose, children }) {
  const styles = useStyles(styleFactory);
  const y = useSharedValue(56);
  const dim = useSharedValue(0);
  const sheetH = useSharedValue(420);
  const closing = useSharedValue(0);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  const dismiss = useCallback(() => closeRef.current(), []);

  useEffect(() => {
    dim.value = withTiming(1, { duration: 220, easing: Easing.out(Easing.cubic) });
    y.value = withSpring(0, { damping: 28, stiffness: 240, mass: 0.9, overshootClamping: true });
  }, [dim, y]);

  const playClose = useCallback((duration) => {
    if (closing.value) return;
    closing.value = 1;
    dim.value = withTiming(0, { duration, easing: Easing.out(Easing.cubic) });
    y.value = withTiming(sheetH.value + 72, {
      duration,
      easing: Easing.bezier(0.22, 1, 0.36, 1)
    }, (finished) => {
      if (finished) runOnJS(dismiss)();
    });
  }, [closing, dim, dismiss, sheetH, y]);

  const pan = useMemo(() => Gesture.Pan()
    .activeOffsetY(12)
    .failOffsetX([-28, 28])
    .onUpdate((e) => {
      if (closing.value) return;
      y.value = Math.max(0, e.translationY);
      dim.value = interpolate(y.value, [0, sheetH.value], [1, 0.18], Extrapolation.CLAMP);
    })
    .onEnd((e) => {
      if (closing.value) return;
      if (e.translationY > 72 || e.velocityY > 850) {
        closing.value = 1;
        const duration = e.velocityY > 1600 ? 150 : 220;
        dim.value = withTiming(0, { duration, easing: Easing.out(Easing.cubic) });
        y.value = withTiming(sheetH.value + 72, {
          duration,
          easing: Easing.bezier(0.22, 1, 0.36, 1)
        }, (finished) => {
          if (finished) runOnJS(dismiss)();
        });
      } else {
        dim.value = withTiming(1, { duration: 180, easing: Easing.out(Easing.cubic) });
        y.value = withSpring(0, { damping: 28, stiffness: 280, mass: 0.85, overshootClamping: true });
      }
    }), [closing, dim, dismiss, sheetH, y]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }]
  }));

  const dimStyle = useAnimatedStyle(() => ({
    opacity: dim.value
  }));

  return (
    <Modal visible transparent animationType="none" presentationStyle="overFullScreen" onRequestClose={() => playClose(240)}>
      <GestureHandlerRootView style={styles.sheetModal}>
        <Animated.View style={[styles.sheetDim, dimStyle]} pointerEvents="none" />
        <Pressable style={StyleSheet.absoluteFill} onPress={() => playClose(240)} />
        <GestureDetector gesture={pan}>
          <Animated.View
            style={[styles.sheet, sheetStyle]}
            onLayout={(e) => { sheetH.value = e.nativeEvent.layout.height; }}
          >
            <View style={styles.sheetHandle}>
              <View style={styles.grabber} />
            </View>
            {children}
          </Animated.View>
        </GestureDetector>
      </GestureHandlerRootView>
    </Modal>
  );
}

function greeting(name) {
  const h = new Date().getHours();
  const hi = h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
  const first = String(name || "").trim().split(" ")[0];
  return first ? hi + ", " + first : hi;
}

function shortDayName(name) {
  const text = String(name || "").replace(/^[A-Z]\s*[·\-–]\s*/, "");
  return text.length > 18 ? text.slice(0, 17) + "…" : text;
}

function FilterChip({ label, onPress, icon }) {
  const { colors } = useTheme();
  const styles = useStyles(styleFactory);
  return (
    <HapticPressable style={styles.chip} onPress={onPress} disabled={!onPress}>
      {icon ? <Ionicons name={icon} size={13} color={colors.muted2} /> : null}
      <Text style={styles.chipTxt} numberOfLines={1}>{label}</Text>
      {onPress ? <Ionicons name="chevron-forward" size={12} color={colors.muted} /> : null}
    </HapticPressable>
  );
}

function SheetRow({ icon, label, right, onPress, danger }) {
  const { colors } = useTheme();
  const styles = useStyles(styleFactory);
  return (
    <HapticPressable style={styles.sheetRow} onPress={onPress}>
      <View style={styles.actionIcon}>
        <Ionicons name={icon} size={18} color={danger ? colors.danger : colors.text} />
      </View>
      <Text style={[styles.actionTxt, danger && { color: colors.danger }]}>{label}</Text>
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
  kicker: { color: c.muted, fontSize: 13, fontWeight: "600", marginBottom: 2 },
  title: { color: c.text, fontSize: 24, fontWeight: "800" },
  headerBtns: { flexDirection: "row", gap: 8 },
  iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: c.surface, alignItems: "center", justifyContent: "center" },
  iaBanner: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: c.surface, borderRadius: 16, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: "transparent" },
  iaTitle: { color: c.text, fontWeight: "800", fontSize: 14 },
  iaTxt: { color: c.muted, fontSize: 12, lineHeight: 17, marginTop: 4 },
  iaBtn: { backgroundColor: c.red, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  iaBtnTxt: { color: "#fff", fontWeight: "800", fontSize: 12 },
  days: { gap: 8, paddingBottom: 12 },
  dayTab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14, backgroundColor: c.surface, borderWidth: 1, borderColor: "transparent", minWidth: 64 },
  dayTabOn: { backgroundColor: c.redSoft, borderColor: c.red },
  dayTxt: { color: c.muted, fontWeight: "800", fontSize: 11, letterSpacing: 0.6 },
  dayTxtOn: { color: c.text },
  dayName: { color: c.muted, fontSize: 12, fontWeight: "600", marginTop: 2, maxWidth: 140 },
  dayNameOn: { color: c.muted2 },
  filters: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  chip: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: c.surface, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: "transparent", maxWidth: "100%" },
  chipTxt: { color: c.text, fontWeight: "700", fontSize: 13, flexShrink: 1 },
  section: { color: c.text, fontSize: 17, fontWeight: "700", letterSpacing: -0.2, marginTop: 10, marginBottom: 10 },
  sectionInline: { color: c.text, fontSize: 17, fontWeight: "700", letterSpacing: -0.2 },
  muscles: { gap: 10, paddingBottom: 8 },
  muscleCard: { width: 100, alignItems: "center" },
  muscleLbl: { color: c.muted2, fontSize: 12, marginTop: 6, fontWeight: "600" },
  muted: { color: c.muted },
  exHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8, marginBottom: 10 },
  exHeadBtns: { flexDirection: "row", gap: 8 },
  round: { width: 36, height: 36, borderRadius: 18, backgroundColor: c.surface, alignItems: "center", justifyContent: "center" },
  rowCover: { backgroundColor: c.bg },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, backgroundColor: c.bg },
  rowActive: { opacity: 0.88 },
  handle: { paddingHorizontal: 4, paddingVertical: 8 },
  grow: { flex: 1 },
  exName: { color: c.text, fontSize: 16, fontWeight: "700" },
  exMeta: { color: c.muted, marginTop: 4, fontSize: 13 },
  delete: { backgroundColor: c.danger, width: 88, alignItems: "center", justifyContent: "center" },
  deleteTxt: { color: "#fff", fontWeight: "800", fontSize: 11, marginTop: 4, textTransform: "uppercase" },
  action: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14 },
  actionIcon: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: "transparent", alignItems: "center", justifyContent: "center" },
  actionTxt: { flex: 1, color: c.text, fontWeight: "600", fontSize: 15 },
  actionSub: { color: c.muted, fontSize: 12, marginTop: 2 },
  ctaBar: { position: "absolute", left: 16, right: 16, bottom: 12, flexDirection: "row", alignItems: "center", gap: 10 },
  share: { width: 52, height: 52, borderRadius: 16, backgroundColor: c.surface3, alignItems: "center", justifyContent: "center" },
  cta: { flex: 1, height: 52, borderRadius: 16, backgroundColor: c.red, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8, shadowColor: c.red, shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
  ctaTxt: { color: "#fff", fontWeight: "700", fontSize: 16, letterSpacing: -0.2 },
  sheetModal: { flex: 1, justifyContent: "flex-end" },
  sheetDim: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.55)" },
  sheet: { backgroundColor: c.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 18, paddingBottom: 28 },
  sheetHandle: { alignItems: "center", paddingTop: 10, paddingBottom: 12 },
  grabber: { width: 40, height: 5, borderRadius: 3, backgroundColor: c.line },
  sheetHead: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  sheetTitle: { color: c.text, fontSize: 18, fontWeight: "800", flex: 1 },
  applyAll: { alignItems: "center", paddingVertical: 12, marginTop: 4 },
  applyAllTxt: { color: c.muted2, fontWeight: "700", fontSize: 13 },
  sheetDone: { color: c.red, fontWeight: "800" },
  loadModal: { flex: 1, justifyContent: "flex-end" },
  loadDim: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.55)" },
  loadSheet: { backgroundColor: c.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 18, paddingBottom: 28 },
  sheetRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  sheetRight: { color: c.muted2, fontWeight: "700" }
};
}
