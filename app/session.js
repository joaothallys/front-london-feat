import React, { useEffect, useRef, useState } from "react";
import { Alert, AppState, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Image } from "expo-image";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../src/components/ui.js";
import { HapticPressable } from "../src/components/HapticPressable.js";
import { NumField, NumberDoneBar } from "../src/components/NumberPad.js";
import { Skeleton } from "../src/components/Skeleton.js";
import { useAppState } from "../src/state/AppState.js";
import { useLive } from "../src/state/LiveSession.js";
import { exerciseOf, mediaUrl } from "../src/catalog.js";
import { cachedGif, warmGif } from "../src/media/GifCache.js";
import { updatePlanItemLoad } from "../src/plan.js";
import { FinishSheet } from "../src/components/workout/FinishSheet.js";
import { RestOverlay } from "../src/components/workout/RestOverlay.js";
import { restStillRunning } from "../src/session/restClock.js";
import { playRestAlertNow } from "../src/session/restAlert.js";
import { useStyles, useTheme } from "../src/theme.js";

function ExerciseGif({ exercise, styles }) {
  const remote = mediaUrl(exercise, { preferGif: true });
  const [uri, setUri] = useState(() => (exercise && remote ? cachedGif(exercise.id) || remote : ""));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!exercise || !remote) {
      setUri("");
      return;
    }
    setUri(cachedGif(exercise.id) || remote);
    warmGif(exercise.id, remote).then((u) => { if (u) setUri(u); }).catch(() => {});
  }, [exercise && exercise.id, remote]);

  return (
    <View style={styles.gifWrap}>
      {uri ? (
        <Image
          source={{ uri }}
          style={styles.gif}
          contentFit="contain"
          cachePolicy="memory-disk"
          autoplay
          onLoad={() => setReady(true)}
        />
      ) : null}
      {!ready ? (
        <View style={styles.gifSkel}>
          <Skeleton width="100%" height={200} radius={16} />
        </View>
      ) : null}
    </View>
  );
}

function ExerciseBlock({ item, itemIndex, total, active, styles, colors, onToggle, onPatch, onRemove, onAdd, onLayout }) {
  const e = exerciseOf(item.id);
  const done = item.sets.filter((s) => s.done).length;
  const canRemove = item.sets.length > 1;
  return (
    <View style={[styles.block, active && styles.blockOn]} onLayout={onLayout}>
      <View style={styles.blockTop}>
        <Text style={styles.kicker}>Exercício {itemIndex + 1}/{total}</Text>
        <Text style={styles.muted}>{done}/{item.sets.length}</Text>
      </View>
      <ExerciseGif exercise={e} styles={styles} />
      <Text style={styles.h}>{e ? e.name : item.id}</Text>
      <Text style={styles.muted}>{e ? (e.equipment || "") : ""}</Text>
      <View style={styles.head}>
        <Text style={[styles.th, styles.thNum]}>#</Text>
        <Text style={[styles.th, styles.thType]}>Tipo</Text>
        <Text style={[styles.th, styles.thFlex]}>kg</Text>
        <Text style={[styles.th, styles.thFlex]}>Reps</Text>
        <View style={styles.acts} />
      </View>
      {item.sets.map((s, i) => (
        <View key={i} style={styles.set}>
          <Text style={styles.td}>{i + 1}</Text>
          <Text style={styles.tdType}>{s.type}</Text>
          <NumField
            value={s.kg}
            decimal
            onCommit={(kg) => onPatch(i, { kg })}
            style={styles.in}
            textStyle={styles.inTxt}
            activeStyle={styles.inOn}
          />
          <NumField
            value={s.reps}
            onCommit={(reps) => onPatch(i, { reps })}
            style={styles.in}
            textStyle={styles.inTxt}
            activeStyle={styles.inOn}
          />
          <View style={styles.acts}>
            <HapticPressable onPress={() => onToggle(i)} style={[styles.check, s.done && styles.checkOn]}>
              {s.done ? <Ionicons name="checkmark" size={18} color="#fff" /> : null}
            </HapticPressable>
            <HapticPressable
              onPress={() => onRemove(i)}
              disabled={!canRemove}
              style={[styles.rm, !canRemove && styles.rmOff]}
            >
              <Ionicons name="trash-outline" size={18} color={canRemove ? colors.muted : colors.line} />
            </HapticPressable>
          </View>
        </View>
      ))}
      <View style={styles.row}>
        <HapticPressable onPress={() => onAdd("N")}><Text style={styles.link}>+ Série</Text></HapticPressable>
        <HapticPressable onPress={() => onAdd("D")}><Text style={styles.link}>+ Drop</Text></HapticPressable>
        <HapticPressable onPress={() => onAdd("S")}><Text style={styles.link}>+ Super</Text></HapticPressable>
      </View>
    </View>
  );
}

export default function Session() {
  const { colors } = useTheme();
  const styles = useStyles(styleFactory);
  const { state, refresh } = useAppState();
  const { live, setLive, finish, quit, skipRest, goToNext, toggleSet } = useLive();
  const [, setTick] = useState(0);
  const [finishOpen, setFinishOpen] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [restMini, setRestMini] = useState(false);
  const scrollRef = useRef(null);
  const blockY = useRef({});

  useEffect(() => {
    if (!live || !live.rest) return undefined;
    let done = false;
    function tick(fromBackground) {
      if (restStillRunning(live.rest)) {
        setTick((n) => n + 1);
        return;
      }
      if (done) return;
      done = true;
      if (!fromBackground) playRestAlertNow();
      skipRest();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
    const t = setInterval(() => tick(false), 250);
    const sub = AppState.addEventListener("change", (next) => {
      if (next === "active") tick(true);
    });
    return () => {
      clearInterval(t);
      sub.remove();
    };
  }, [live && live.rest && live.rest.endsAt, skipRest]);

  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 30000);
    return () => clearInterval(t);
  }, []);

  if (!live || !live.items || !live.items.length) {
    return (
      <SafeAreaView style={[styles.safe, styles.emptyWrap]}>
        <Ionicons name="barbell-outline" size={36} color={colors.muted} />
        <Text style={styles.emptyT}>Nenhum treino em andamento</Text>
        <Text style={styles.emptyS}>Comece um treino pelo Meu Plano ou pelos treinos salvos.</Text>
        <Button label="Ir para o Meu Plano" onPress={() => router.replace("/(tabs)/home")} />
      </SafeAreaView>
    );
  }

  const current = live.items[live.index] || live.items[0];
  const currentEx = exerciseOf(current.id);
  const totalSets = live.items.reduce((n, it) => n + it.sets.length, 0);
  const doneSets = live.items.reduce((n, it) => n + it.sets.filter((s) => s.done).length, 0);

  function updateItem(itemIndex, fn) {
    setLive((cur) => (cur ? {
      ...cur,
      items: cur.items.map((it, ii) => (ii === itemIndex ? fn(it) : it))
    } : cur));
  }

  // Só séries normais de um dia do plano viram a carga padrão daquele dia.
  function persistLoad(itemIndex, setIndex, patch) {
    const it = live.items[itemIndex];
    const set = it && it.sets[setIndex];
    const meta = live.meta || {};
    if (!set || set.type !== "N" || meta.sourceType !== "plan_day" || meta.dayIndex == null) return;
    if (updatePlanItemLoad(state, meta.dayIndex, it.id, patch)) refresh();
  }

  function patchSet(itemIndex, i, patch) {
    updateItem(itemIndex, (it) => ({
      ...it,
      sets: it.sets.map((row, ri) => (ri === i ? { ...row, ...patch } : row))
    }));
  }

  function addSet(itemIndex, type) {
    updateItem(itemIndex, (it) => {
      const last = it.sets[it.sets.length - 1] || { kg: 0, reps: 10 };
      return { ...it, sets: it.sets.concat({ type, kg: last.kg, reps: last.reps, done: false }) };
    });
  }

  function removeSet(itemIndex, i) {
    const it = live.items[itemIndex];
    if (!it || !it.sets || it.sets.length <= 1) return;
    updateItem(itemIndex, (row) => ({ ...row, sets: row.sets.filter((_, ri) => ri !== i) }));
  }

  function scrollToItem(itemIndex) {
    const y = blockY.current[itemIndex];
    if (y == null || !scrollRef.current) return;
    scrollRef.current.scrollTo({ y: Math.max(0, y - 8), animated: true });
  }

  function nextFromRest() {
    const target = live.index + 1;
    if (goToNext()) scrollToItem(target);
    else setFinishOpen(true);
  }

  function confirmDiscard() {
    Alert.alert("Descartar treino?", "As séries deste treino não vão para o histórico.", [
      { text: "Cancelar", style: "cancel" },
      { text: "Descartar", style: "destructive", onPress: () => { quit(); router.replace("/(tabs)/home"); } }
    ]);
  }

  async function confirmFinish(payload) {
    setFinishing(true);
    try {
      await finish(payload);
      router.replace("/summary");
    } catch (err) {
      setFinishing(false);
      Alert.alert("Não deu para salvar", "Algo deu errado ao registrar o treino. Tente de novo.");
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.top}>
        <HapticPressable
          style={styles.backBtn}
          hitSlop={8}
          accessibilityLabel="Sair do treino"
          onPress={() => Alert.alert("Sair do treino?", "Você pode continuar depois de onde parou.", [
            { text: "Continuar depois", onPress: () => router.replace("/(tabs)/home") },
            { text: "Descartar treino", style: "destructive", onPress: () => confirmDiscard() },
            { text: "Cancelar", style: "cancel" }
          ])}
        >
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </HapticPressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.kicker}>{live.items.length} exercício{live.items.length === 1 ? "" : "s"} · {elapsed(live.startedAt)}</Text>
          <Text style={styles.name} numberOfLines={1}>{live.name}</Text>
        </View>
        <Text style={styles.count}>{doneSets}/{totalSets}</Text>
      </View>
      <View style={styles.progress}>
        <View style={[styles.progressFill, { width: (totalSets ? Math.round((doneSets / totalSets) * 100) : 0) + "%" }]} />
      </View>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        {live.items.map((item, ii) => (
          <ExerciseBlock
            key={item.id + "-" + ii}
            item={item}
            itemIndex={ii}
            total={live.items.length}
            active={ii === live.index}
            styles={styles}
            colors={colors}
            onToggle={(i) => toggleSet(ii, i)}
            onPatch={(i, patch) => {
              persistLoad(ii, i, patch);
              patchSet(ii, i, patch);
            }}
            onRemove={(i) => removeSet(ii, i)}
            onAdd={(type) => addSet(ii, type)}
            onLayout={(ev) => { blockY.current[ii] = ev.nativeEvent.layout.y; }}
          />
        ))}
        <View style={styles.finish}>
          <Button label="Concluir treino" onPress={() => setFinishOpen(true)} />
        </View>
      </ScrollView>
      {restStillRunning(live.rest) ? (
        <RestOverlay
          rest={live.rest}
          exerciseName={currentEx ? currentEx.name : current.id}
          hasNext={live.index < live.items.length - 1}
          minimized={restMini}
          onMinimize={() => setRestMini(true)}
          onExpand={() => setRestMini(false)}
          onSkip={skipRest}
          onNext={nextFromRest}
        />
      ) : null}
      <FinishSheet
        visible={finishOpen}
        live={live}
        busy={finishing}
        onClose={() => setFinishOpen(false)}
        onConfirm={confirmFinish}
      />
      <NumberDoneBar />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function elapsed(startedAt) {
  const min = Math.max(0, Math.floor((Date.now() - (Number(startedAt) || Date.now())) / 60000));
  if (min < 60) return min + " min";
  return Math.floor(min / 60) + "h" + String(min % 60).padStart(2, "0");
}

function styleFactory(c) {
  return {
  safe: { flex: 1, backgroundColor: c.bg, paddingHorizontal: 16, paddingTop: 8 },
  top: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: c.surface, alignItems: "center", justifyContent: "center" },
  kicker: { color: c.red, fontSize: 12, fontWeight: "700" },
  name: { color: c.text, fontWeight: "800", fontSize: 17 },
  count: { color: c.text, fontWeight: "800", fontSize: 15 },
  progress: { height: 4, borderRadius: 2, backgroundColor: c.surface2, overflow: "hidden", marginBottom: 4 },
  progressFill: { height: 4, borderRadius: 2, backgroundColor: c.red },
  muted: { color: c.muted },
  emptyWrap: { justifyContent: "center", alignItems: "center", paddingHorizontal: 32 },
  emptyT: { color: c.text, fontWeight: "800", fontSize: 18, marginTop: 12 },
  emptyS: { color: c.muted, textAlign: "center", marginTop: 6, marginBottom: 12, lineHeight: 20 },
  list: { paddingBottom: 140 },
  finish: { marginTop: 20 },
  block: { paddingVertical: 16, borderBottomWidth: 1, borderColor: c.line },
  blockOn: { borderLeftWidth: 3, borderLeftColor: c.red, paddingLeft: 10, marginLeft: -13 },
  blockTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  gifWrap: { height: 200, marginVertical: 8, borderRadius: 16, overflow: "hidden", backgroundColor: c.surface },
  gif: { width: "100%", height: 200, backgroundColor: "#fff" },
  gifSkel: { ...StyleSheet.absoluteFillObject },
  h: { color: c.text, fontSize: 22, fontWeight: "800", marginTop: 8 },
  head: { flexDirection: "row", alignItems: "center", marginTop: 16, gap: 6 },
  th: { color: c.muted, fontSize: 12 },
  thNum: { width: 28, textAlign: "center" },
  thType: { width: 36, textAlign: "center" },
  thFlex: { flex: 1, textAlign: "center" },
  set: { flexDirection: "row", alignItems: "center", marginTop: 8, gap: 6 },
  td: { width: 28, color: c.text, textAlign: "center" },
  tdType: { width: 36, color: c.text, textAlign: "center" },
  in: { flex: 1, height: 44, backgroundColor: c.surface, borderRadius: 10, paddingVertical: 0, paddingHorizontal: 6, borderWidth: 1, borderColor: "transparent", textAlign: "center" },
  inOn: { borderColor: c.red, backgroundColor: c.redSoft },
  inTxt: { color: c.text, fontWeight: "800", fontSize: 16 },
  acts: { width: 92, flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 8 },
  check: { width: 42, height: 42, borderRadius: 21, borderWidth: 2, borderColor: c.line, alignItems: "center", justifyContent: "center" },
  checkOn: { backgroundColor: c.red, borderColor: c.red },
  rm: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  rmOff: { opacity: 0.35 },
  row: { flexDirection: "row", gap: 16, marginTop: 12 },
  link: { color: c.muted2, fontWeight: "700" }
};
}
