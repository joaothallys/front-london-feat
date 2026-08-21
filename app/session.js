import React, { useEffect, useState } from "react";
import { Alert, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { router } from "expo-router";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../src/components/ui.js";
import { HapticPressable } from "../src/components/HapticPressable.js";
import { NumberWheel } from "../src/components/NumberWheel.js";
import { Skeleton } from "../src/components/Skeleton.js";
import { useLive } from "../src/state/LiveSession.js";
import { exerciseOf, mediaUrl } from "../src/catalog.js";
import { cachedGif, warmGif } from "../src/media/GifCache.js";
import { colors } from "../src/theme.js";

export default function Session() {
  const { live, setLive, finish, quit } = useLive();
  const [, setTick] = useState(0);
  const [gifUri, setGifUri] = useState("");
  const [gifReady, setGifReady] = useState(false);
  const [edit, setEdit] = useState(null);

  useEffect(() => {
    if (!live || !live.rest) return undefined;
    const t = setInterval(() => {
      if (!live.rest) return;
      live.rest.left -= 1;
      if (live.rest.left <= 0) {
        live.rest = null;
      }
      setTick((n) => n + 1);
    }, 1000);
    return () => clearInterval(t);
  }, [live && live.rest]);

  const item = live && live.items && live.items[live.index];
  const e = item ? exerciseOf(item.id) : null;
  const remote = mediaUrl(e);

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
      const nUri = mediaUrl(n);
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
    if (s.done) {
      live.rest = { total: item.rest || 60, left: item.rest || 60 };
    } else live.rest = null;
    setLive({ ...live });
  }

  function patchSet(i, patch) {
    const next = {
      ...live,
      items: live.items.map((it, ii) => {
        if (ii !== live.index) return it;
        return {
          ...it,
          sets: it.sets.map((row, ri) => (ri === i ? { ...row, ...patch } : row))
        };
      })
    };
    setLive(next);
  }

  function addSet(type) {
    const last = item.sets[item.sets.length - 1] || { kg: 0, reps: 10 };
    item.sets.push({ type, kg: last.kg, reps: last.reps, done: false });
    setLive({ ...live });
  }

  async function next() {
    setEdit(null);
    if (live.index < live.items.length - 1) {
      live.index += 1;
      live.rest = null;
      setLive({ ...live });
    } else {
      try {
        await finish();
        router.replace("/summary");
      } catch (err) {
        Alert.alert("Não deu para salvar", "O treino precisa ir para o servidor. Confira a conexão e tente de novo.");
      }
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.top}>
        <HapticPressable onPress={() => Alert.alert("Encerrar treino?", "", [
          { text: "Cancelar" },
          { text: "Encerrar", style: "destructive", onPress: () => { quit(); router.replace("/(tabs)/home"); } }
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
      <View style={styles.head}><Text style={styles.th}>#</Text><Text style={styles.th}>Tipo</Text><Text style={styles.th}>kg</Text><Text style={styles.th}>Reps</Text><Text style={styles.th}></Text></View>
      {item.sets.map((s, i) => {
        const onKg = edit && edit.index === i && edit.field === "kg";
        const onReps = edit && edit.index === i && edit.field === "reps";
        return (
          <View key={i} style={styles.set}>
            <Text style={styles.td}>{i + 1}</Text>
            <Text style={styles.td}>{s.type}</Text>
            <HapticPressable style={[styles.in, onKg && styles.inOn]} onPress={() => setEdit({ index: i, field: "kg" })}>
              <Text style={styles.inTxt}>{s.kg}</Text>
            </HapticPressable>
            <HapticPressable style={[styles.in, onReps && styles.inOn]} onPress={() => setEdit({ index: i, field: "reps" })}>
              <Text style={styles.inTxt}>{s.reps}</Text>
            </HapticPressable>
            <HapticPressable onPress={() => toggleSet(i)} style={[styles.check, s.done && styles.checkOn]}><Text style={styles.checkT}>{s.done ? "✓" : ""}</Text></HapticPressable>
          </View>
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
              <Text style={styles.sheetTitle}>Série {edit ? edit.index + 1 : ""}</Text>
              <HapticPressable onPress={() => setEdit(null)}>
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
          </View>
        </GestureHandlerRootView>
      </Modal>
      {live.rest ? (
        <View style={styles.rest}>
          <Text style={styles.kicker}>Descanso</Text>
          <Text style={styles.timer}>{live.rest.left}s</Text>
          <Button ghost label="Pular" onPress={() => { live.rest = null; setLive({ ...live }); }} />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg, padding: 16 },
  top: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  back: { color: colors.text, fontSize: 32 },
  kicker: { color: colors.red, fontSize: 12, fontWeight: "700" },
  name: { color: colors.text, fontWeight: "800" },
  muted: { color: colors.muted },
  gifWrap: { height: 200, marginVertical: 8, borderRadius: 16, overflow: "hidden", backgroundColor: colors.surface },
  gif: { width: "100%", height: 200, backgroundColor: "#fff" },
  gifSkel: { ...StyleSheet.absoluteFillObject },
  h: { color: colors.text, fontSize: 22, fontWeight: "800", marginTop: 8 },
  head: { flexDirection: "row", marginTop: 16, paddingHorizontal: 4 },
  th: { flex: 1, color: colors.muted, fontSize: 12 },
  set: { flexDirection: "row", alignItems: "center", marginTop: 8, gap: 6 },
  td: { width: 36, color: colors.text },
  in: { flex: 1, backgroundColor: colors.surface, borderRadius: 8, paddingVertical: 10, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "transparent" },
  inOn: { borderColor: colors.red, backgroundColor: colors.redSoft },
  inTxt: { color: colors.text, fontWeight: "800", fontSize: 16 },
  check: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: colors.line, alignItems: "center", justifyContent: "center" },
  checkOn: { backgroundColor: colors.red, borderColor: colors.red },
  checkT: { color: colors.text, fontWeight: "800" },
  row: { flexDirection: "row", gap: 16, marginVertical: 12 },
  link: { color: colors.muted2, fontWeight: "700" },
  sheetBg: { flex: 1, justifyContent: "flex-end" },
  sheetDim: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.55)" },
  sheet: { backgroundColor: colors.bg2, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 28, borderTopWidth: 1, borderColor: colors.line },
  sheetTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  sheetTitle: { color: colors.text, fontWeight: "800", fontSize: 16 },
  sheetDone: { color: colors.red, fontWeight: "800" },
  wheels: { flexDirection: "row", gap: 12 },
  wheelCol: { flex: 1 },
  wheelLbl: { color: colors.muted, textAlign: "center", fontWeight: "700", marginBottom: 4, textTransform: "uppercase", fontSize: 11, letterSpacing: 0.6 },
  wheelLblOn: { color: colors.red },
  rest: { position: "absolute", left: 16, right: 16, bottom: 24, backgroundColor: colors.surface, borderRadius: 20, padding: 20, alignItems: "center", borderWidth: 1, borderColor: colors.line },
  timer: { color: colors.text, fontSize: 48, fontWeight: "800", marginVertical: 8 }
});
