import React, { useMemo, useRef, useState } from "react";
import { Alert, Dimensions, Share, Text, View } from "react-native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import * as Sharing from "expo-sharing";
import { captureRef } from "react-native-view-shot";
import { HapticPressable } from "../src/components/HapticPressable.js";
import { ShareCard, TEMPLATES } from "../src/components/workout/ShareCard.js";
import { useAppState } from "../src/state/AppState.js";
import { useLive } from "../src/state/LiveSession.js";
import { pickWorkoutPhoto } from "../src/workout/pickPhoto.js";
import { fmtClock, fmtInt } from "../src/workout/stats.js";
import { useStyles, useTheme } from "../src/theme.js";

const WIN = Dimensions.get("window");
const CARD_H = Math.min(WIN.height * 0.46, (WIN.width - 40) * (16 / 9));
const CARD_W = CARD_H * (9 / 16);

export default function Summary() {
  const { colors } = useTheme();
  const styles = useStyles(styleFactory);
  const { summary } = useLive();
  const { state, refresh } = useAppState();
  const cardRef = useRef(null);
  const exportRef = useRef(null);
  const [photo, setPhoto] = useState(() => (summary && summary.photo) || null);
  const [tpl, setTpl] = useState(0);
  const [busy, setBusy] = useState(false);

  const stats = useMemo(() => {
    if (!summary) return null;
    return {
      name: summary.name,
      duration: summary.duration,
      calories: summary.calories,
      volume: summary.volume,
      reps: summary.totalReps || 0,
      exerciseCount: summary.exercises,
      completedCount: summary.exercises,
      muscleLabels: summary.muscles || [],
      lines: summary.lines || []
    };
  }, [summary]);

  const count = ((state.history || []).length) || 1;
  const template = TEMPLATES[tpl] || TEMPLATES[0];

  function cycleTpl(dir) {
    setTpl((n) => (n + dir + TEMPLATES.length) % TEMPLATES.length);
  }

  const swipe = Gesture.Pan().onEnd((e) => {
    if (e.translationX < -36) runOnJS(cycleTpl)(1);
    else if (e.translationX > 36) runOnJS(cycleTpl)(-1);
  });

  function done() {
    refresh();
    router.replace("/(tabs)/home");
  }

  async function capture() {
    const node = exportRef.current || cardRef.current;
    if (!node) return null;
    try {
      return await captureRef(node, {
        format: "png",
        quality: 1,
        result: "tmpfile",
        width: 1080,
        height: 1920,
        pixelRatio: 1
      });
    } catch (err) {
      return null;
    }
  }

  async function shareCard() {
    setBusy(true);
    try {
      const uri = await capture();
      if (uri && await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: "image/png", dialogTitle: "Compartilhar treino" });
        return;
      }
      const msg = [
        (summary && summary.name) || "Treino",
        (stats && stats.duration) + " min · " + fmtInt(stats && stats.volume) + " kg · " + (stats && stats.calories) + " kcal",
        ((stats && stats.lines) || []).map((row) => row.name + " — " + row.detail).join("\n"),
        "London Fitness"
      ].filter(Boolean).join("\n");
      await Share.share({ message: msg, url: photo || undefined });
    } catch (err) {
      if (err && String(err.message || "").indexOf("User did not share") >= 0) return;
      Alert.alert("Não deu para compartilhar", "Tente de novo.");
    } finally {
      setBusy(false);
    }
  }

  async function changePhoto() {
    const uri = await pickWorkoutPhoto("gallery");
    if (uri) setPhoto(uri);
  }

  if (!summary || !stats) {
    return (
      <SafeAreaView style={styles.safe}>
        <HapticPressable onPress={done} style={styles.ctaRed}>
          <Text style={styles.ctaRedTxt}>Voltar</Text>
        </HapticPressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.head}>
        <Text style={styles.hi}>Bom trabalho! 🎉</Text>
        <Text style={styles.count}>Este é seu {count}º treino</Text>
      </View>

      <GestureDetector gesture={swipe}>
        <View style={styles.cardWrap}>
          <ShareCard ref={cardRef} photo={photo} stats={stats} template={template.id} />
        </View>
      </GestureDetector>

      <View style={styles.dots}>
        {TEMPLATES.map((row, i) => (
          <HapticPressable key={row.id} onPress={() => setTpl(i)} style={[styles.dot, i === tpl && styles.dotOn]} />
        ))}
      </View>

      <Text style={styles.ctaShare}>Compartilhe e seja repostado! Use @londonfitness</Text>

      <View style={styles.actions}>
        <Action icon="logo-instagram" label="Stories" onPress={shareCard} />
        <Action icon="create-outline" label="Editar imagem" onPress={changePhoto} />
        <Action icon="download-outline" label="Baixar imagem" onPress={shareCard} />
        <Action icon="ellipsis-horizontal" label="Mais" onPress={shareCard} />
      </View>

      <View style={styles.footLine}>
        <Text style={styles.footLbl}>Tempo total</Text>
        <Text style={styles.footVal}>{fmtClock(stats.duration)}</Text>
      </View>

      <View style={styles.export} pointerEvents="none" collapsable={false}>
        <ShareCard ref={exportRef} photo={photo} stats={stats} template={template.id} story />
      </View>

      <View style={styles.btns}>
        <HapticPressable style={styles.ctaWhite} onPress={shareCard} disabled={busy}>
          <Text style={styles.ctaWhiteTxt}>{busy ? "Aguarde…" : "Compartilhar"}</Text>
        </HapticPressable>
        <HapticPressable style={styles.ctaRed} onPress={done}>
          <Text style={styles.ctaRedTxt}>Concluir</Text>
        </HapticPressable>
      </View>
    </SafeAreaView>
  );
}

function Action({ icon, label, onPress }) {
  const { colors } = useTheme();
  const styles = useStyles(styleFactory);
  return (
    <HapticPressable style={styles.act} onPress={onPress}>
      <View style={styles.actIcon}>
        <Ionicons name={icon} size={20} color={colors.text} />
      </View>
      <Text style={styles.actLbl}>{label}</Text>
    </HapticPressable>
  );
}

function styleFactory(c) {
  return {
    safe: { flex: 1, backgroundColor: c.bg, paddingHorizontal: 20 },
    head: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8, marginBottom: 12 },
    hi: { color: c.text, fontWeight: "800", fontSize: 18 },
    count: { color: c.muted2, fontWeight: "700", fontSize: 13 },
    cardWrap: { width: CARD_W, height: CARD_H, alignSelf: "center" },
    dots: { flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 12, marginBottom: 10 },
    dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: c.line },
    dotOn: { backgroundColor: c.red, width: 16 },
    ctaShare: { color: c.muted, textAlign: "center", fontSize: 12, marginBottom: 12 },
    actions: { flexDirection: "row", justifyContent: "space-around", marginBottom: 16 },
    act: { alignItems: "center", width: 76 },
    actIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: c.surface3, alignItems: "center", justifyContent: "center", marginBottom: 6, borderWidth: 1, borderColor: c.line },
    actLbl: { color: c.muted2, fontSize: 10, fontWeight: "700", textAlign: "center" },
    footLine: { flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: c.line, paddingTop: 10, marginBottom: 12 },
    footLbl: { color: c.muted, fontWeight: "700" },
    footVal: { color: c.text, fontWeight: "800" },
    btns: { flexDirection: "row", gap: 10, marginBottom: 8 },
    ctaWhite: { flex: 1, height: 50, borderRadius: 25, backgroundColor: c.surface, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: c.line },
    ctaWhiteTxt: { color: c.text, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.4 },
    export: { position: "absolute", left: -420, top: 0, width: 360, height: 640, backgroundColor: "#000", overflow: "hidden" },
    ctaRed: { flex: 1, height: 50, borderRadius: 25, backgroundColor: c.red, alignItems: "center", justifyContent: "center" },
    ctaRedTxt: { color: "#fff", fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.4 }
  };
}
