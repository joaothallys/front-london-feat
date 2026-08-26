import React, { useMemo, useState } from "react";
import { Alert, Image, Modal, Pressable, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { HapticPressable } from "../HapticPressable.js";
import { useStyles, useTheme } from "../../theme.js";
import { computeWorkoutStats, fmtInt } from "../../workout/stats.js";
import { pickWorkoutPhoto } from "../../workout/pickPhoto.js";

export function FinishSheet({ visible, live, busy, onClose, onConfirm }) {
  const { colors } = useTheme();
  const styles = useStyles(styleFactory);
  const [photo, setPhoto] = useState(null);
  const [picker, setPicker] = useState(false);
  const [duration, setDuration] = useState(() => computeWorkoutStats(live).duration);
  const stats = useMemo(() => computeWorkoutStats(live, duration), [live, duration]);

  function editDuration() {
    Alert.prompt("Duração", "Minutos do treino", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "OK",
        onPress: (value) => {
          const n = Math.max(1, Math.round(Number(value) || duration));
          setDuration(n);
        }
      }
    ], "plain-text", String(duration), "numeric");
  }

  async function choose(source) {
    setPicker(false);
    const uri = await pickWorkoutPhoto(source);
    if (uri) setPhoto(uri);
  }

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="slide" presentationStyle="overFullScreen" onRequestClose={onClose}>
      <GestureHandlerRootView style={styles.wrap}>
        <Pressable style={styles.dim} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.head}>
            <Text style={styles.title}>Terminar e registrar seu treino?</Text>
            <HapticPressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={22} color={colors.text} />
            </HapticPressable>
          </View>

          {photo ? (
            <View style={styles.photoWrap}>
              <Image source={{ uri: photo }} style={styles.photo} />
              <HapticPressable style={styles.trash} onPress={() => setPhoto(null)}>
                <Ionicons name="trash" size={16} color="#fff" />
              </HapticPressable>
            </View>
          ) : (
            <HapticPressable style={styles.drop} onPress={() => setPicker(true)}>
              <Ionicons name="image-outline" size={28} color={colors.muted} />
              <Text style={styles.dropTxt}>Adicione uma imagem e compartilhe seu progresso (opcional)</Text>
            </HapticPressable>
          )}

          <View style={styles.topRow}>
            <HapticPressable style={styles.dur} onPress={editDuration}>
              <Text style={styles.durTxt}>{stats.duration}min</Text>
              <Ionicons name="pencil" size={14} color={colors.muted} />
            </HapticPressable>
            <View style={styles.doneRow}>
              <Text style={styles.doneTxt}>{stats.completedCount}/{stats.exerciseCount} exercícios</Text>
              <View style={styles.check}>
                <Ionicons name="checkmark" size={14} color="#fff" />
              </View>
            </View>
          </View>
          <View style={styles.rule} />
          <Text style={styles.muscles}>{stats.muscleLabels.join(" • ") || "Treino"}</Text>

          <View style={styles.metrics}>
            <Metric icon="barbell-outline" value={fmtInt(stats.volume)} label="Peso total (kg)" />
            <Metric icon="fitness-outline" value={fmtInt(stats.reps)} label="Total reps" />
            <Metric icon="flame-outline" value={fmtInt(stats.calories)} label="Calorias" />
          </View>

          <HapticPressable style={styles.cta} onPress={() => onConfirm({ photo, durationMin: stats.duration })} disabled={busy}>
            <Text style={styles.ctaTxt}>{busy ? "Salvando…" : "Finalizar treino"}</Text>
          </HapticPressable>
        </View>

        <Modal visible={picker} transparent animationType="slide" presentationStyle="overFullScreen" onRequestClose={() => setPicker(false)}>
          <GestureHandlerRootView style={styles.wrap}>
            <Pressable style={styles.dim} onPress={() => setPicker(false)} />
            <View style={styles.sheet}>
              <View style={styles.head}>
                <HapticPressable onPress={() => setPicker(false)}>
                  <Ionicons name="chevron-back" size={22} color={colors.text} />
                </HapticPressable>
                <Text style={styles.pickTitle}>Adicionar imagem</Text>
                <HapticPressable onPress={() => setPicker(false)}>
                  <Ionicons name="close" size={22} color={colors.text} />
                </HapticPressable>
              </View>
              <HapticPressable style={styles.opt} onPress={() => choose("camera")}>
                <Ionicons name="camera-outline" size={22} color={colors.text} />
                <Text style={styles.optTxt}>Tirar foto</Text>
              </HapticPressable>
              <HapticPressable style={styles.opt} onPress={() => choose("gallery")}>
                <Ionicons name="image-outline" size={22} color={colors.text} />
                <Text style={styles.optTxt}>Selecionar na biblioteca</Text>
              </HapticPressable>
            </View>
          </GestureHandlerRootView>
        </Modal>
      </GestureHandlerRootView>
    </Modal>
  );
}

function Metric({ icon, value, label }) {
  const { colors } = useTheme();
  const styles = useStyles(styleFactory);
  return (
    <View style={styles.metric}>
      <Ionicons name={icon} size={18} color={colors.text} />
      <Text style={styles.metricVal}>{value}</Text>
      <Text style={styles.metricLbl}>{label}</Text>
    </View>
  );
}

function styleFactory(c) {
  return {
    wrap: { flex: 1, justifyContent: "flex-end" },
    dim: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.45)" },
    sheet: { backgroundColor: c.bg2, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 18, paddingBottom: 28, borderTopWidth: 1, borderColor: c.line },
    head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14, gap: 10 },
    title: { color: c.text, fontWeight: "800", fontSize: 16, flex: 1 },
    pickTitle: { color: c.text, fontWeight: "800", fontSize: 16, flex: 1, textAlign: "center" },
    drop: { borderWidth: 1.5, borderStyle: "dashed", borderColor: c.line, borderRadius: 16, minHeight: 120, alignItems: "center", justifyContent: "center", padding: 16, marginBottom: 16, backgroundColor: c.surface2 },
    dropTxt: { color: c.muted2, textAlign: "center", marginTop: 8, fontSize: 13, lineHeight: 18 },
    photoWrap: { height: 168, borderRadius: 16, overflow: "hidden", marginBottom: 16, backgroundColor: c.surface3 },
    photo: { width: "100%", height: "100%" },
    trash: { position: "absolute", right: 10, bottom: 10, width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(0,0,0,0.65)", alignItems: "center", justifyContent: "center" },
    topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    dur: { flexDirection: "row", alignItems: "center", gap: 6 },
    durTxt: { color: c.text, fontWeight: "800", fontSize: 18 },
    doneRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    doneTxt: { color: c.text, fontWeight: "700" },
    check: { width: 22, height: 22, borderRadius: 11, backgroundColor: c.red, alignItems: "center", justifyContent: "center" },
    rule: { height: 2, backgroundColor: c.red, marginTop: 12, marginBottom: 10, borderRadius: 2 },
    muscles: { color: c.muted2, fontSize: 13, marginBottom: 16 },
    metrics: { flexDirection: "row", marginBottom: 18 },
    metric: { flex: 1, alignItems: "center", gap: 4 },
    metricVal: { color: c.text, fontWeight: "900", fontSize: 20 },
    metricLbl: { color: c.muted, fontSize: 11, textAlign: "center" },
    cta: { height: 52, borderRadius: 26, backgroundColor: c.red, alignItems: "center", justifyContent: "center" },
    ctaTxt: { color: "#fff", fontWeight: "900", letterSpacing: 0.8, textTransform: "uppercase" },
    opt: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: c.surface2, borderRadius: 16, padding: 16, marginBottom: 10 },
    optTxt: { color: c.text, fontWeight: "800", fontSize: 15 }
  };
}
