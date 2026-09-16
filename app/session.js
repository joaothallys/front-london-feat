import React, { useEffect, useState } from "react";
import { Alert, AppState, Modal, Pressable, StyleSheet, Text, View } from "react-native";
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

export default function Session() {
  const { colors } = useTheme();
  const styles = useStyles(styleFactory);
  const { state, refresh } = useAppState();
  const { live, setLive, finish, quit, skipRest, goToNext, startRest } = useLive();
  const [, setTick] = useState(0);
  const [gifUri, setGifUri] = useState("");
  const [gifReady, setGifReady] = useState(false);
  const [edit, setEdit] = useState(null);
  const [finishOpen, setFinishOpen] = useState(false);
  const [finishing, setFinishing] = useState(false);

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

  const item = live && live.items && live.items[live.index];
  const e = item ? exerciseOf(item.id) : null;
  const remote = mediaUrl(e, { preferGif: true });

  useEffect(() => {
    if (!e || !remote) {
      setGifUri("");
      setGifReady(false);
      return;
    }
    setGifReady(false);
    setGifUri(cachedGif(e.id) || remote);
    warmGif(e.id, remote).then((uri) => { if (uri) setGifUri(uri); }).catch(() => {});
    const next = live.items[live.index + 1];
    if (next) {
      const n = exerciseOf(next.id);
      const nUri = mediaUrl(n, { preferGif: true });
      if (n && nUri) warmGif(n.id, nUri).catch(() => {});
    }
  }, [e && e.id, remote, live && live.index]);

  if (!live || !live.items || !live.items.length) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.muted}>Nenhuma sessão.</Text>
        <Button label="Voltar" onPress={() => router.replace("/(tabs)/home")} />
      </SafeAreaView>
    );
  }

  const doneSets = item.sets.filter((s) => s.done).length;

  function toggleSet(i) {
    const s = item.sets[i];
    s.done = !s.done;
    if (s.done) startRest(item.rest || 60);
    else skipRest();
  }

  function persistLoad(patch) {
    const day = ensureDay(state);
    const idx = (day.items || []).findIndex((it) => it.id === item.id);
    if (idx >= 0) {
      updateDayItem(state, idx, patch);
      refresh();
    }
  }

  function patchSet(i, patch) {
    const next = {
      ...live,
      items: live.items.map((it, ii) => {
        if (ii !== live.index) return it;
        return {
          ...it,
          sets: it.sets.map((row) => ({ ...row, ...patch }))
        };
      })
    };
    setLive(next);
  }

  function addSet(type) {
    const last = item.sets[item.sets.length - 1] || { kg: 0, reps: 10 };
    const row = { type, kg: last.kg, reps: last.reps, done: false };
    setLive({
      ...live,
      items: live.items.map((it, ii) => (ii === live.index ? { ...it, sets: it.sets.concat(row) } : it))
    });
  }

  function removeSet(i) {
    if (!item.sets || item.sets.length <= 1) return;
    if (edit && edit.index === i) setEdit(null);
    else if (edit && edit.index > i) setEdit({ ...edit, index: edit.index - 1 });
    setLive({
      ...live,
      items: live.items.map((it, ii) => (ii === live.index ? { ...it, sets: it.sets.filter((_, ri) => ri !== i) } : it))
    });
  }

  async function next() {
    setEdit(null);
    if (!goToNext()) setFinishOpen(true);
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
    <SafeAreaView style={styles.safe}>
      <View style={styles.top}>
        <HapticPressable onPress={() => Alert.alert("Sair do treino?", "O progresso fica salvo para você continuar depois.", [
          { text: "Cancelar", style: "cancel" },
          { text: "Encerrar", style: "destructive", onPress: () => { quit(); router.replace("/(tabs)/home"); } },
          { text: "Continuar depois", onPress: () => router.replace("/(tabs)/home") }
        ])}><Text style={styles.back}>‹</Text></HapticPressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.kicker}>Exercício {live.index + 1}/{live.items.length}</Text>
          <Text style={styles.name}>{live.name}</Text>
        </View>
        <Text style={styles.muted}>{doneSets}/{item.sets.length}</Text>
      </View>
      <View style={styles.gifWrap}>
        {gifUri ? (
          <Image
            source={{ uri: gifUri }}
            style={styles.gif}
            contentFit="contain"
            cachePolicy="memory-disk"
            autoplay
            onLoad={() => setGifReady(true)}
          />
        ) : null}
        {!gifReady ? (
          <View style={styles.gifSkel}>
            <Skeleton width="100%" height={200} radius={16} />
          </View>
        ) : null}
      </View>
      <Text style={styles.h}>{e ? e.name : item.id}</Text>
      <Text style={styles.muted}>{e ? (e.equipment || "") : ""}</Text>
      <View style={styles.head}><Text style={styles.th}>#</Text><Text style={styles.th}>Tipo</Text><Text style={styles.th}>kg</Text><Text style={styles.th}>Reps</Text><Text style={styles.th}></Text><Text style={styles.th}></Text></View>
      {item.sets.map((s, i) => {
        const onKg = edit && edit.index === i && edit.field === "kg";
        const onReps = edit && edit.index === i && edit.field === "reps";
        const canRemove = item.sets.length > 1;
        return (
          <Swipeable
            key={i}
            enabled={canRemove}
            renderRightActions={() => canRemove ? (
              <HapticPressable style={styles.setDel} onPress={() => removeSet(i)}>
                <Ionicons name="trash" size={16} color="#fff" />
              </HapticPressable>
            ) : null}
          >
            <View style={styles.set}>
              <Text style={styles.td}>{i + 1}</Text>
              <Text style={styles.td}>{s.type}</Text>
              <HapticPressable style={[styles.in, onKg && styles.inOn]} onPress={() => setEdit({ index: i, field: "kg" })}>
                <Text style={styles.inTxt}>{s.kg}</Text>
              </HapticPressable>
              <HapticPressable style={[styles.in, onReps && styles.inOn]} onPress={() => setEdit({ index: i, field: "reps" })}>
                <Text style={styles.inTxt}>{s.reps}</Text>
              </HapticPressable>
              <HapticPressable onPress={() => toggleSet(i)} style={[styles.check, s.done && styles.checkOn]}><Text style={styles.checkT}>{s.done ? "✓" : ""}</Text></HapticPressable>
              <HapticPressable
                onPress={() => removeSet(i)}
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
        <HapticPressable onPress={() => addSet("N")}><Text style={styles.link}>+ Série</Text></HapticPressable>
        <HapticPressable onPress={() => addSet("D")}><Text style={styles.link}>+ Drop</Text></HapticPressable>
        <HapticPressable onPress={() => addSet("S")}><Text style={styles.link}>+ Super</Text></HapticPressable>
      </View>
      <Button label={live.index === live.items.length - 1 ? "Concluir treino" : "Próximo aparelho"} onPress={next} />
      <Modal visible={!!(edit && item.sets[edit.index])} transparent animationType="slide" onRequestClose={() => setEdit(null)}>
        <GestureHandlerRootView style={styles.sheetBg}>
          <Pressable style={styles.sheetDim} onPress={() => setEdit(null)} />
          <View style={styles.sheet}>
            <View style={styles.sheetTop}>
              <Text style={styles.sheetTitle}>Série {edit ? edit.index + 1 : ""} · todos os sets</Text>
              <HapticPressable onPress={() => {
                const row = item.sets[edit.index] || item.sets[0];
                if (row) persistLoad({ kg: row.kg, reps: row.reps });
                setEdit(null);
              }}>
                <Text style={styles.sheetDone}>Pronto</Text>
              </HapticPressable>
            </View>
            {edit && item.sets[edit.index] ? (
              <View style={styles.wheels}>
                <View style={styles.wheelCol}>
                  <Text style={[styles.wheelLbl, edit.field === "kg" && styles.wheelLblOn]}>kg</Text>
                  <NumberWheel
                    key={"kg-" + edit.index}
                    value={item.sets[edit.index].kg}
                    min={0}
                    max={200}
                    step={0.5}
                    onChange={(kg) => patchSet(edit.index, { kg })}
                  />
                </View>
                <View style={styles.wheelCol}>
                  <Text style={[styles.wheelLbl, edit.field === "reps" && styles.wheelLblOn]}>Reps</Text>
                  <NumberWheel
                    key={"reps-" + edit.index}
                    value={item.sets[edit.index].reps}
                    min={1}
                    max={40}
                    step={1}
                    onChange={(reps) => patchSet(edit.index, { reps })}
                  />
                </View>
              </View>
            ) : null}
            {edit && item.sets.length > 1 ? (
              <HapticPressable style={styles.sheetRm} onPress={() => removeSet(edit.index)}>
                <Text style={styles.sheetRmTxt}>Remover esta série</Text>
              </HapticPressable>
            ) : null}
          </View>
        </GestureHandlerRootView>
      </Modal>
      {restStillRunning(live.rest) ? (
        <RestOverlay
          rest={live.rest}
          exerciseName={e ? e.name : item.id}
          hasNext={live.index < live.items.length - 1}
          onSkip={skipRest}
          onNext={next}
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
  safe: { flex: 1, backgroundColor: c.bg, padding: 16 },
  top: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  back: { color: c.text, fontSize: 32 },
  kicker: { color: c.red, fontSize: 12, fontWeight: "700" },
  name: { color: c.text, fontWeight: "800" },
  muted: { color: c.muted },
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
  row: { flexDirection: "row", gap: 16, marginVertical: 12 },
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
