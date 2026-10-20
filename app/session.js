import React, { useEffect, useRef, useState } from "react";
import { Alert, AppState, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler";
import { router } from "expo-router";
import { Image } from "expo-image";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../src/components/ui.js";
import { HapticPressable } from "../src/components/HapticPressable.js";
import { NumberWheel } from "../src/components/NumberWheel.js";
import { Skeleton } from "../src/components/Skeleton.js";
import { useAppState } from "../src/state/AppState.js";
import { useLive } from "../src/state/LiveSession.js";
import { exerciseOf, mediaUrl } from "../src/catalog.js";
import { cachedGif, warmGif } from "../src/media/GifCache.js";
import { updateDayItem, ensureDay } from "../src/plan.js";
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

function ExerciseBlock({ item, itemIndex, total, active, edit, styles, colors, onToggle, onEdit, onRemove, onAdd, onLayout }) {
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
      <View style={styles.head}><Text style={styles.th}>#</Text><Text style={styles.th}>Tipo</Text><Text style={styles.th}>kg</Text><Text style={styles.th}>Reps</Text><Text style={styles.th}></Text><Text style={styles.th}></Text></View>
      {item.sets.map((s, i) => {
        const here = edit && edit.item === itemIndex && edit.index === i;
        const onKg = here && edit.field === "kg";
        const onReps = here && edit.field === "reps";
        return (
          <Swipeable
            key={i}
            enabled={canRemove}
            renderRightActions={() => canRemove ? (
              <HapticPressable style={styles.setDel} onPress={() => onRemove(i)}>
                <Ionicons name="trash" size={16} color="#fff" />
              </HapticPressable>
            ) : null}
          >
            <View style={styles.set}>
              <Text style={styles.td}>{i + 1}</Text>
              <Text style={styles.td}>{s.type}</Text>
              <HapticPressable style={[styles.in, onKg && styles.inOn]} onPress={() => onEdit(i, "kg")}>
                <Text style={styles.inTxt}>{s.kg}</Text>
              </HapticPressable>
              <HapticPressable style={[styles.in, onReps && styles.inOn]} onPress={() => onEdit(i, "reps")}>
                <Text style={styles.inTxt}>{s.reps}</Text>
              </HapticPressable>
              <HapticPressable onPress={() => onToggle(i)} style={[styles.check, s.done && styles.checkOn]}><Text style={styles.checkT}>{s.done ? "✓" : ""}</Text></HapticPressable>
              <HapticPressable
                onPress={() => onRemove(i)}
                disabled={!canRemove}
                style={[styles.rm, !canRemove && styles.rmOff]}
              >
                <Ionicons name="trash-outline" size={16} color={canRemove ? colors.muted : colors.line} />
              </HapticPressable>
            </View>
          </Swipeable>
        );
      })}
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
  const [edit, setEdit] = useState(null);
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

  if (!live || !live.items || !live.items.length) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.muted}>Nenhuma sessão.</Text>
        <Button label="Voltar" onPress={() => router.replace("/(tabs)/home")} />
      </SafeAreaView>
    );
  }

  const current = live.items[live.index] || live.items[0];
  const currentEx = exerciseOf(current.id);
  const totalSets = live.items.reduce((n, it) => n + it.sets.length, 0);
  const doneSets = live.items.reduce((n, it) => n + it.sets.filter((s) => s.done).length, 0);
  const editItem = edit ? live.items[edit.item] : null;
  const editRow = editItem ? editItem.sets[edit.index] : null;

  function updateItem(itemIndex, fn) {
    setLive({
      ...live,
      items: live.items.map((it, ii) => (ii === itemIndex ? fn(it) : it))
    });
  }

  function persistLoad(itemIndex, patch) {
    const it = live.items[itemIndex];
    if (!it) return;
    const day = ensureDay(state);
    const idx = (day.items || []).findIndex((row) => row.id === it.id);
    if (idx >= 0) {
      updateDayItem(state, idx, patch);
      refresh();
    }
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
    if (edit && edit.item === itemIndex) {
      if (edit.index === i) setEdit(null);
      else if (edit.index > i) setEdit({ ...edit, index: edit.index - 1 });
    }
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

  async function confirmFinish(payload) {
    setFinishing(true);
    try {
      await finish(payload);
      router.replace("/summary");
    } catch (err) {
      setFinishing(false);
      Alert.alert("Não deu para salvar", "O treino precisa ir para o servidor. Confira a conexão e tente de novo.");
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.top}>
        <HapticPressable onPress={() => Alert.alert("Sair do treino?", "O progresso fica salvo para você continuar depois.", [
          { text: "Cancelar", style: "cancel" },
          { text: "Encerrar", style: "destructive", onPress: () => { quit(); router.replace("/(tabs)/home"); } },
          { text: "Continuar depois", onPress: () => router.replace("/(tabs)/home") }
        ])}><Text style={styles.back}>‹</Text></HapticPressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.kicker}>{live.items.length} exercícios</Text>
          <Text style={styles.name}>{live.name}</Text>
        </View>
        <Text style={styles.muted}>{doneSets}/{totalSets}</Text>
      </View>
      <ScrollView ref={scrollRef} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {live.items.map((item, ii) => (
          <ExerciseBlock
            key={item.id + "-" + ii}
            item={item}
            itemIndex={ii}
            total={live.items.length}
            active={ii === live.index}
            edit={edit}
            styles={styles}
            colors={colors}
            onToggle={(i) => toggleSet(ii, i)}
            onEdit={(i, field) => setEdit({ item: ii, index: i, field })}
            onRemove={(i) => removeSet(ii, i)}
            onAdd={(type) => addSet(ii, type)}
            onLayout={(ev) => { blockY.current[ii] = ev.nativeEvent.layout.y; }}
          />
        ))}
        <View style={styles.finish}>
          <Button label="Concluir treino" onPress={() => { setEdit(null); setFinishOpen(true); }} />
        </View>
      </ScrollView>
      <Modal visible={!!editRow} transparent animationType="slide" onRequestClose={() => setEdit(null)}>
        <GestureHandlerRootView style={styles.sheetBg}>
          <Pressable style={styles.sheetDim} onPress={() => setEdit(null)} />
          <View style={styles.sheet}>
            <View style={styles.sheetTop}>
              <Text style={styles.sheetTitle}>Série {edit ? edit.index + 1 : ""}</Text>
              <HapticPressable onPress={() => {
                if (editRow) persistLoad(edit.item, { kg: editRow.kg, reps: editRow.reps });
                setEdit(null);
              }}>
                <Text style={styles.sheetDone}>Pronto</Text>
              </HapticPressable>
            </View>
            {editRow ? (
              <View style={styles.wheels}>
                <View style={styles.wheelCol}>
                  <Text style={[styles.wheelLbl, edit.field === "kg" && styles.wheelLblOn]}>kg</Text>
                  <NumberWheel
                    key={"kg-" + edit.item + "-" + edit.index}
                    value={editRow.kg}
                    min={0}
                    max={200}
                    step={0.5}
                    onChange={(kg) => patchSet(edit.item, edit.index, { kg })}
                  />
                </View>
                <View style={styles.wheelCol}>
                  <Text style={[styles.wheelLbl, edit.field === "reps" && styles.wheelLblOn]}>Reps</Text>
                  <NumberWheel
                    key={"reps-" + edit.item + "-" + edit.index}
                    value={editRow.reps}
                    min={1}
                    max={40}
                    step={1}
                    onChange={(reps) => patchSet(edit.item, edit.index, { reps })}
                  />
                </View>
              </View>
            ) : null}
            {editItem && editItem.sets.length > 1 ? (
              <HapticPressable style={styles.sheetRm} onPress={() => removeSet(edit.item, edit.index)}>
                <Text style={styles.sheetRmTxt}>Remover esta série</Text>
              </HapticPressable>
            ) : null}
          </View>
        </GestureHandlerRootView>
      </Modal>
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
    </SafeAreaView>
  );
}

function styleFactory(c) {
  return {
  safe: { flex: 1, backgroundColor: c.bg, paddingHorizontal: 16, paddingTop: 16 },
  top: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  back: { color: c.text, fontSize: 32 },
  kicker: { color: c.red, fontSize: 12, fontWeight: "700" },
  name: { color: c.text, fontWeight: "800" },
  muted: { color: c.muted },
  list: { paddingBottom: 140 },
  finish: { marginTop: 20 },
  block: { paddingVertical: 16, borderBottomWidth: 1, borderColor: c.line },
  blockOn: { borderLeftWidth: 3, borderLeftColor: c.red, paddingLeft: 10, marginLeft: -13 },
  blockTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  gifWrap: { height: 200, marginVertical: 8, borderRadius: 16, overflow: "hidden", backgroundColor: c.surface },
  gif: { width: "100%", height: 200, backgroundColor: "#fff" },
  gifSkel: { ...StyleSheet.absoluteFillObject },
  h: { color: c.text, fontSize: 22, fontWeight: "800", marginTop: 8 },
  head: { flexDirection: "row", marginTop: 16, paddingHorizontal: 4 },
  th: { flex: 1, color: c.muted, fontSize: 12 },
  set: { flexDirection: "row", alignItems: "center", marginTop: 8, gap: 6 },
  td: { width: 36, color: c.text },
  in: { flex: 1, backgroundColor: c.surface, borderRadius: 8, paddingVertical: 10, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "transparent" },
  inOn: { borderColor: c.red, backgroundColor: c.redSoft },
  inTxt: { color: c.text, fontWeight: "800", fontSize: 16 },
  check: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: c.line, alignItems: "center", justifyContent: "center" },
  checkOn: { backgroundColor: c.red, borderColor: c.red },
  checkT: { color: c.text, fontWeight: "800" },
  rm: { width: 32, height: 36, alignItems: "center", justifyContent: "center" },
  rmOff: { opacity: 0.35 },
  setDel: { backgroundColor: c.red, width: 56, alignItems: "center", justifyContent: "center", borderRadius: 8, marginTop: 8 },
  sheetRm: { marginTop: 16, alignItems: "center", paddingVertical: 10 },
  sheetRmTxt: { color: c.red, fontWeight: "800" },
  row: { flexDirection: "row", gap: 16, marginTop: 12 },
  link: { color: c.muted2, fontWeight: "700" },
  sheetBg: { flex: 1, justifyContent: "flex-end" },
  sheetDim: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.55)" },
  sheet: { backgroundColor: c.bg2, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 28, borderTopWidth: 1, borderColor: c.line },
  sheetTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  sheetTitle: { color: c.text, fontWeight: "800", fontSize: 16 },
  sheetDone: { color: c.red, fontWeight: "800" },
  wheels: { flexDirection: "row", gap: 12 },
  wheelCol: { flex: 1 },
  wheelLbl: { color: c.muted, textAlign: "center", fontWeight: "700", marginBottom: 4, textTransform: "uppercase", fontSize: 11, letterSpacing: 0.6 },
  wheelLblOn: { color: c.red }
};
}
