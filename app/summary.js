import React, { useMemo, useRef, useState } from "react";
import { Alert, Linking, ScrollView, Share, Text, View, useWindowDimensions } from "react-native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { SafeAreaView } from "react-native-safe-area-context";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import * as Sharing from "expo-sharing";
import { captureRef } from "react-native-view-shot";
import { store } from "@shared/store/local-store.js";
import { HapticPressable } from "../src/components/HapticPressable.js";
import { CARD_H, CARD_W, ShareCard, TEMPLATES } from "../src/components/workout/ShareCard.js";
import { INSTAGRAM_HANDLE, resolveStoreUrl } from "../src/config.js";
import { createShareLink, shareUrl } from "../src/session/shareLink.js";
import { SessionService } from "@shared/services/account/SessionService.js";
import { useAppState } from "../src/state/AppState.js";
import { useLive } from "../src/state/LiveSession.js";
import { keepWorkoutPhoto, pickWorkoutPhoto } from "../src/workout/pickPhoto.js";
import { fmtDuration, fmtInt } from "../src/workout/stats.js";
import { useStyles, useTheme } from "../src/theme.js";

function cancelled(err) {
  const msg = String((err && err.message) || "");
  return msg.indexOf("User did not share") >= 0 || msg.indexOf("cancel") >= 0;
}

export default function Summary() {
  const { colors } = useTheme();
  const styles = useStyles(styleFactory);
  const win = useWindowDimensions();
  const { summary, setSummary } = useLive();
  const { state, refresh } = useAppState();
  const exportRef = useRef(null);
  const [photo, setPhoto] = useState(() => (summary && summary.photo) || null);
  const [tpl, setTpl] = useState(0);
  const [busy, setBusy] = useState("");

  // Prévia: o mesmo card de 360×640, só que em escala.
  const previewH = Math.min(win.height * 0.5, (win.width - 72) * (CARD_H / CARD_W));
  const scale = previewH / CARD_H;
  const previewW = CARD_W * scale;

  const stats = useMemo(() => {
    if (!summary) return null;
    return {
      name: summary.name,
      date: summary.date,
      duration: summary.duration,
      calories: summary.calories,
      volume: summary.volume,
      reps: summary.totalReps || 0,
      sets: summary.sets || 0,
      exerciseCount: summary.exercises,
      muscleLabels: summary.muscles || [],
      lines: summary.lines || []
    };
  }, [summary]);

  const count = ((state.history || []).length) || 1;
  const template = TEMPLATES[tpl] || TEMPLATES[0];

  function cycleTpl(dir) {
    setTpl((n) => (n + dir + TEMPLATES.length) % TEMPLATES.length);
  }

  const swipe = Gesture.Pan().activeOffsetX([-20, 20]).onEnd((e) => {
    if (e.translationX < -36) runOnJS(cycleTpl)(1);
    else if (e.translationX > 36) runOnJS(cycleTpl)(-1);
  });

  function done() {
    refresh();
    router.replace("/(tabs)/home");
  }

  function savePhoto(next) {
    setPhoto(next);
    if (!summary) return;
    const S = store.get();
    S.history = (S.history || []).map((row) => (row.id === summary.id ? Object.assign({}, row, { photo: next }) : row));
    store.persist();
    setSummary(Object.assign({}, summary, { photo: next }));
  }

  async function pick(source) {
    const uri = await pickWorkoutPhoto(source);
    if (uri) savePhoto(await keepWorkoutPhoto(uri));
  }

  function choosePhoto() {
    const buttons = [
      { text: "Tirar foto", onPress: () => pick("camera") },
      { text: "Escolher da galeria", onPress: () => pick("gallery") }
    ];
    if (photo) buttons.push({ text: "Remover foto", style: "destructive", onPress: () => savePhoto(null) });
    buttons.push({ text: "Cancelar", style: "cancel" });
    Alert.alert(photo ? "Trocar foto" : "Foto de fundo", "A foto fica atrás dos números do treino.", buttons);
  }

  async function capture() {
    if (!exportRef.current) return null;
    try {
      return await captureRef(exportRef.current, {
        format: "png",
        quality: 1,
        result: "tmpfile",
        width: 1080,
        height: 1920
      });
    } catch (err) {
      return null;
    }
  }

  function shareText(link) {
    const parts = [
      "Treino concluído no LumenFit 💪",
      stats ? stats.name + " · " + fmtDuration(stats.duration) + " · " + fmtInt(stats.volume) + " kg" : "",
      link ? "Veja o treino completo: " + link : "Baixe o app: " + resolveStoreUrl()
    ];
    return parts.filter(Boolean).join("\n");
  }

  // Salva o treino feito na API (uma vez só) e devolve o link <site>/t/<id>.
  async function workoutLink() {
    if (summary.shareId) return shareUrl(summary.shareId);
    if (!SessionService.hasToken() || !(summary.shareItems || []).length) return null;
    try {
      const { id, url } = await createShareLink({
        name: summary.name,
        author: ((state.profile && state.profile.name) || "").split(" ")[0],
        items: summary.shareItems,
        finishedAt: summary.date,
        durationMin: summary.duration,
        volumeKg: summary.volume
      });
      const S = store.get();
      S.history = (S.history || []).map((row) => (row.id === summary.id ? Object.assign({}, row, { shareId: id }) : row));
      store.persist();
      setSummary(Object.assign({}, summary, { shareId: id, photo }));
      return url;
    } catch (err) {
      return null;
    }
  }

  async function run(kind, task) {
    if (busy) return;
    setBusy(kind);
    try {
      const uri = await capture();
      if (!uri) {
        Alert.alert("Não deu para gerar a imagem", "Tente de novo.");
        return;
      }
      await task(uri);
    } catch (err) {
      if (!cancelled(err)) Alert.alert("Não deu certo", "Tente de novo.");
    } finally {
      setBusy("");
    }
  }

  // Só a imagem: o Instagram abre direto em Stories/Feed a partir da folha do iOS.
  const postStory = () => run("story", async (uri) => {
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, { mimeType: "image/png", UTI: "public.png", dialogTitle: "Postar nos Stories" });
    } else {
      await Share.share({ url: uri });
    }
  });

  // Imagem + link da página do treino (WhatsApp, Mensagens…).
  const send = () => run("send", async (uri) => {
    const link = await workoutLink();
    await Share.share({ url: uri, message: shareText(link) });
  });

  const saveToGallery = () => run("save", async (uri) => {
    let MediaLibrary = null;
    try {
      MediaLibrary = require("expo-media-library/legacy");
    } catch (err) {
      MediaLibrary = null;
    }
    try {
      if (!MediaLibrary) throw new Error("unavailable");
      const perm = await MediaLibrary.requestPermissionsAsync(true);
      if (!perm || !perm.granted) {
        Alert.alert("Permissão necessária", "Libere o acesso às fotos para salvar a imagem.", [
          { text: "Agora não", style: "cancel" },
          { text: "Abrir Ajustes", onPress: () => Linking.openSettings() }
        ]);
        return;
      }
      await MediaLibrary.saveToLibraryAsync(uri);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      Alert.alert("Salvo na galeria", "A imagem do treino está no app Fotos.");
    } catch (err) {
      // Build sem o módulo nativo: cai na folha do iOS, que tem "Salvar imagem".
      await Sharing.shareAsync(uri, { mimeType: "image/png", UTI: "public.png" });
    }
  });

  if (!summary || !stats) {
    return (
      <SafeAreaView style={[styles.safe, styles.empty]}>
        <Text style={styles.emptyTxt}>Nenhum treino para mostrar.</Text>
        <HapticPressable onPress={done} style={styles.primary}>
          <Text style={styles.primaryTxt}>Voltar ao início</Text>
        </HapticPressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.head}>
        <View style={styles.headText}>
          <Text style={styles.kicker}>SEU {count}º TREINO</Text>
          <Text style={styles.title}>Bom trabalho! 🎉</Text>
        </View>
        <HapticPressable onPress={done} hitSlop={10} style={styles.doneBtn} accessibilityLabel="Concluir">
          <Text style={styles.doneTxt}>Concluir</Text>
        </HapticPressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <GestureDetector gesture={swipe}>
          <View style={[styles.preview, { width: previewW, height: previewH }]}>
            <View style={{ width: CARD_W, height: CARD_H, transform: [{ scale }], transformOrigin: "top left" }}>
              <ShareCard photo={photo} stats={stats} template={template.id} />
            </View>
            <HapticPressable style={styles.photoBtn} onPress={choosePhoto} accessibilityLabel={photo ? "Trocar foto" : "Adicionar foto"}>
              <Ionicons name={photo ? "camera-reverse" : "camera"} size={16} color="#fff" />
              <Text style={styles.photoTxt}>{photo ? "Trocar foto" : "Adicionar foto"}</Text>
            </HapticPressable>
          </View>
        </GestureDetector>

        <View style={styles.chips}>
          {TEMPLATES.map((row, i) => (
            <HapticPressable
              key={row.id}
              onPress={() => setTpl(i)}
              style={[styles.chip, i === tpl && styles.chipOn]}
              accessibilityState={{ selected: i === tpl }}
            >
              <Text style={[styles.chipTxt, i === tpl && styles.chipTxtOn]}>{row.label}</Text>
            </HapticPressable>
          ))}
        </View>

        {INSTAGRAM_HANDLE ? (
          <Text style={styles.hint}>
            Poste e marque <Text style={styles.hintStrong}>@{INSTAGRAM_HANDLE}</Text> para ser repostado
          </Text>
        ) : null}

        {summary.pendingSync ? (
          <View style={styles.offline}>
            <Ionicons name="cloud-offline-outline" size={16} color={colors.amber} />
            <Text style={styles.offlineTxt}>Sem conexão: o treino ficou salvo no aparelho e sobe sozinho quando a internet voltar.</Text>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.actions}>
        <HapticPressable style={styles.primary} onPress={postStory} disabled={!!busy}>
          <Ionicons name="logo-instagram" size={20} color="#fff" />
          <Text style={styles.primaryTxt}>{busy === "story" ? "Gerando…" : "Postar nos Stories"}</Text>
        </HapticPressable>
        <View style={styles.row}>
          <HapticPressable style={styles.secondary} onPress={saveToGallery} disabled={!!busy}>
            <Ionicons name="download-outline" size={18} color={colors.text} />
            <Text style={styles.secondaryTxt}>{busy === "save" ? "Salvando…" : "Salvar na galeria"}</Text>
          </HapticPressable>
          <HapticPressable style={styles.secondary} onPress={send} disabled={!!busy}>
            <Ionicons name="paper-plane-outline" size={18} color={colors.text} />
            <Text style={styles.secondaryTxt}>{busy === "send" ? "Gerando link…" : "Enviar treino"}</Text>
          </HapticPressable>
        </View>
      </View>

      {/* Cópia fora da tela, em tamanho real, usada para gerar a imagem 1080×1920. */}
      <View style={styles.export} pointerEvents="none" collapsable={false}>
        <ShareCard ref={exportRef} photo={photo} stats={stats} template={template.id} />
      </View>
    </SafeAreaView>
  );
}

function styleFactory(c) {
  return {
    safe: { flex: 1, backgroundColor: c.bg },
    empty: { alignItems: "center", justifyContent: "center", paddingHorizontal: 24, gap: 16 },
    emptyTxt: { color: c.muted2, fontSize: 15 },
    head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
    headText: { flex: 1 },
    kicker: { color: c.red, fontWeight: "900", fontSize: 11, letterSpacing: 1.6 },
    title: { color: c.text, fontWeight: "900", fontSize: 24, marginTop: 2 },
    doneBtn: { paddingHorizontal: 14, height: 36, borderRadius: 18, backgroundColor: c.surface, borderWidth: 1, borderColor: "transparent", alignItems: "center", justifyContent: "center" },
    doneTxt: { color: c.text, fontWeight: "800", fontSize: 14 },
    scroll: { alignItems: "center", paddingHorizontal: 20, paddingBottom: 12 },
    preview: {
      borderRadius: 22,
      overflow: "hidden",
      backgroundColor: "#050505",
      shadowColor: "#000",
      shadowOpacity: 0.45,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 10 }
    },
    photoBtn: {
      position: "absolute",
      top: 12,
      right: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 12,
      height: 34,
      borderRadius: 17,
      backgroundColor: "rgba(0,0,0,0.6)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.18)"
    },
    photoTxt: { color: "#fff", fontWeight: "800", fontSize: 12 },
    chips: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8, marginTop: 16 },
    chip: { paddingHorizontal: 14, height: 34, borderRadius: 17, backgroundColor: c.surface, borderWidth: 1, borderColor: "transparent", alignItems: "center", justifyContent: "center" },
    chipOn: { backgroundColor: c.red, borderColor: c.red },
    chipTxt: { color: c.muted2, fontWeight: "800", fontSize: 13 },
    chipTxtOn: { color: "#fff" },
    hint: { color: c.muted, textAlign: "center", fontSize: 13, marginTop: 14 },
    hintStrong: { color: c.text, fontWeight: "800" },
    offline: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: c.surface, borderRadius: 12, padding: 10, marginTop: 14, borderWidth: 1, borderColor: "transparent", alignSelf: "stretch" },
    offlineTxt: { flex: 1, color: c.muted2, fontSize: 12, lineHeight: 17 },
    actions: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 8, gap: 10, borderTopWidth: 1, borderTopColor: c.line },
    primary: { height: 54, borderRadius: 27, backgroundColor: c.red, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, alignSelf: "stretch" },
    primaryTxt: { color: "#fff", fontWeight: "900", fontSize: 16 },
    row: { flexDirection: "row", gap: 10 },
    secondary: { flex: 1, height: 48, borderRadius: 24, backgroundColor: c.surface, borderWidth: 1, borderColor: "transparent", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
    secondaryTxt: { color: c.text, fontWeight: "800", fontSize: 14 },
    export: { position: "absolute", left: -CARD_W * 3, top: 0, width: CARD_W, height: CARD_H }
  };
}
