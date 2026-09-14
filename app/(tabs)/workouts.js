import React, { useMemo, useState } from "react";
import { Alert, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ScrollView, Swipeable } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { Empty, Row } from "../../src/components/ui.js";
import { ExerciseThumb } from "../../src/components/ExerciseThumb.js";
import { HapticPressable } from "../../src/components/HapticPressable.js";
import { useAppState } from "../../src/state/AppState.js";
import { useLive } from "../../src/state/LiveSession.js";
import { D, exerciseOf } from "../../src/catalog.js";
import { SessionService } from "@shared/services/account/SessionService.js";
import { api } from "@shared/api/client.js";
import { removePlan, removePlanDay } from "../../src/plan.js";
import { useStyles, useTheme } from "../../src/theme.js";

const TABS = [
  ["done", "Treinos"],
  ["saved", "Salvos"],
  ["plans", "Planos"],
  ["programs", "Programas"]
];

function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR");
}

function DeleteAction({ onPress, styles }) {
  return (
    <HapticPressable style={styles.delete} onPress={onPress}>
      <Ionicons name="trash" size={18} color="#fff" />
      <Text style={styles.deleteTxt}>Apagar</Text>
    </HapticPressable>
  );
}

function EditBtn({ onPress, styles, colors }) {
  return (
    <HapticPressable style={styles.editBtn} onPress={onPress} hitSlop={8}>
      <Ionicons name="pencil-outline" size={16} color={colors.muted} />
    </HapticPressable>
  );
}

export default function Workouts() {
  const { colors } = useTheme();
  const styles = useStyles(styleFactory);
  const params = useLocalSearchParams();
  const { state, refresh } = useAppState();
  const { start } = useLive();
  const [tab, setTab] = useState(params.open === "saved" ? "saved" : "done");
  const saved = state.custom || [];
  const programs = D.programs || [];
  const done = useMemo(() => {
    return (state.history || []).slice().sort((a, b) => {
      return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
    });
  }, [state.history]);

  function startSplit(day) {
    const live = start(day.name, day.items, { sourceType: "plan_day", sourceId: day.id || (state.plan && state.plan.id) || null });
    if (live) router.push("/session");
  }

  function removeSaved(workout) {
    Alert.alert("Excluir treino?", workout.name + " vai sair da sua lista.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: () => {
          state.custom = (state.custom || []).filter((row) => row.id !== workout.id);
          refresh();
          if (SessionService.hasToken() && workout.id) {
            api.workouts.remove(workout.id).catch(() => {});
          }
        }
      }
    ]);
  }

  function removeDay(day, index) {
    Alert.alert("Excluir dia?", (day.name || "Este dia") + " sai do seu plano.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: () => {
          removePlanDay(state, index);
          refresh();
        }
      }
    ]);
  }

  function removeWholePlan() {
    Alert.alert("Excluir plano?", "Todos os dias do Meu Plano vão sair.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: () => {
          removePlan(state);
          refresh();
        }
      }
    ]);
  }

  function removeDone(row) {
    Alert.alert("Excluir treino?", (row.name || "Este treino") + " sai do histórico.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: () => {
          state.history = (state.history || []).filter((item) => String(item.id) !== String(row.id));
          refresh();
          if (SessionService.hasToken() && row.id && String(row.id).indexOf("local-") !== 0 && String(row.id).indexOf("w") !== 0) {
            api.history.remove(row.id).catch(() => {});
          }
        }
      }
    ]);
  }

  function countOf(id) {
    if (id === "done") return done.length;
    if (id === "saved") return saved.length;
    if (id === "plans") return state.plan && state.plan.split ? state.plan.split.length : 0;
    return programs.length;
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView style={styles.flex} contentContainerStyle={styles.pad} keyboardShouldPersistTaps="handled">
        <View style={styles.head}>
          <Text style={styles.title}>Treinos</Text>
          <HapticPressable style={styles.fast} onPress={() => router.push("/fast")}>
            <Ionicons name="flash-outline" size={16} color={colors.text} />
            <Text style={styles.fastTxt}>Rápidos</Text>
          </HapticPressable>
        </View>

        <View style={styles.tabs}>
          {TABS.map(([id, label]) => (
            <HapticPressable key={id} style={[styles.tab, tab === id && styles.tabOn]} onPress={() => setTab(id)}>
              <Text style={[styles.tabTxt, tab === id && styles.tabTxtOn]} numberOfLines={1}>{label}</Text>
              <Text style={[styles.tabN, tab === id && styles.tabNOn]}>{countOf(id)}</Text>
            </HapticPressable>
          ))}
        </View>

        {tab === "done" ? (
          done.length ? (
            <View style={styles.list}>
              {done.map((h) => (
                <Swipeable
                  key={h.id}
                  overshootRight={false}
                  renderRightActions={() => <DeleteAction styles={styles} onPress={() => removeDone(h)} />}
                >
                  <View style={styles.savedRow}>
                    <HapticPressable
                      style={styles.savedMain}
                      onPress={() => router.push("/history/" + encodeURIComponent(h.id))}
                    >
                      <View style={styles.grow}>
                        <Text style={styles.savedName}>{h.name || "Treino"}</Text>
                        <Text style={styles.savedMeta}>
                          {fmtDate(h.date) + " · " + (h.duration || 0) + " min · " + Math.round(h.volume || 0) + " kg"}
                        </Text>
                      </View>
                    </HapticPressable>
                    <EditBtn
                      styles={styles}
                      colors={colors}
                      onPress={() => router.push({ pathname: "/create", params: { history: h.id } })}
                    />
                  </View>
                </Swipeable>
              ))}
            </View>
          ) : (
            <View style={styles.blank}>
              <View style={styles.blankIcon}>
                <Ionicons name="barbell-outline" size={28} color={colors.muted} />
              </View>
              <Text style={styles.blankT}>Nenhum treino finalizado</Text>
              <Text style={styles.blankS}>Quando você concluir um treino, ele aparece aqui.</Text>
            </View>
          )
        ) : null}

        {tab === "saved" ? (
          <>
            <HapticPressable style={styles.create} onPress={() => router.push("/create")}>
              <View style={styles.createIcon}>
                <Ionicons name="add" size={22} color="#fff" />
              </View>
              <View style={styles.grow}>
                <Text style={styles.createT}>Criar treino</Text>
                <Text style={styles.createS}>Monte uma ficha com os exercícios que quiser</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.muted} />
            </HapticPressable>

            <Text style={styles.section}>Treinos salvos</Text>
            {saved.length ? (
              <View style={styles.list}>
                {saved.map((c) => (
                  <Swipeable
                    key={c.id}
                    overshootRight={false}
                    renderRightActions={() => <DeleteAction styles={styles} onPress={() => removeSaved(c)} />}
                  >
                    <View style={styles.savedRow}>
                      <HapticPressable
                        style={styles.savedMain}
                        onPress={() => router.push("/workout/" + encodeURIComponent(c.id))}
                      >
                        <ExerciseThumb exercise={exerciseOf(c.items[0] && c.items[0].id)} />
                        <View style={styles.grow}>
                          <Text style={styles.savedName}>{c.name}</Text>
                          <Text style={styles.savedMeta}>
                            {(c.items || []).length + " exercício" + ((c.items || []).length === 1 ? "" : "s")}
                          </Text>
                        </View>
                      </HapticPressable>
                      <EditBtn
                        styles={styles}
                        colors={colors}
                        onPress={() => router.push({ pathname: "/create", params: { id: c.id } })}
                      />
                    </View>
                  </Swipeable>
                ))}
              </View>
            ) : (
              <View style={styles.blank}>
                <View style={styles.blankIcon}>
                  <Ionicons name="bookmark-outline" size={28} color={colors.muted} />
                </View>
                <Text style={styles.blankT}>Nenhum treino salvo</Text>
                <Text style={styles.blankS}>Salve um dia do Meu Plano ou crie uma ficha para ver aqui.</Text>
              </View>
            )}
          </>
        ) : null}

        {tab === "plans" ? (
          state.plan && state.plan.split && state.plan.split.length ? (
            <View style={styles.list}>
              {state.plan.split.map((d, i) => (
                <Swipeable
                  key={(d.id || d.name || "day") + "-" + i}
                  overshootRight={false}
                  renderRightActions={() => <DeleteAction styles={styles} onPress={() => removeDay(d, i)} />}
                >
                  <Row
                    title={d.name}
                    subtitle={(d.items || []).length + " exercício" + ((d.items || []).length === 1 ? "" : "s")}
                    thumb={<ExerciseThumb exercise={exerciseOf(d.items && d.items[0] && d.items[0].id)} />}
                    onPress={() => startSplit(d)}
                    right={
                      <EditBtn
                        styles={styles}
                        colors={colors}
                        onPress={() => router.push({ pathname: "/create", params: { planDay: String(i) } })}
                      />
                    }
                  />
                </Swipeable>
              ))}
              <HapticPressable style={styles.wipe} onPress={removeWholePlan}>
                <Ionicons name="trash-outline" size={16} color={colors.red} />
                <Text style={styles.wipeTxt}>Apagar plano inteiro</Text>
              </HapticPressable>
            </View>
          ) : <Empty>Nenhum plano ainda.</Empty>
        ) : null}

        {tab === "programs" ? (
          programs.length ? (
            <View style={styles.list}>
              {programs.map((p) => (
                <Row
                  key={p.id}
                  title={p.name}
                  subtitle={(p.blurb || "") + " · " + p.days + " dias"}
                  onPress={() => router.push("/program/" + p.id)}
                  right={
                    <EditBtn
                      styles={styles}
                      colors={colors}
                      onPress={() => router.push({ pathname: "/create", params: { program: p.id } })}
                    />
                  }
                />
              ))}
            </View>
          ) : <Empty>Nenhum programa.</Empty>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function styleFactory(c) {
  return {
    safe: { flex: 1, backgroundColor: c.bg },
    flex: { flex: 1 },
    pad: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 108 },
    head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 },
    title: { color: c.text, fontSize: 26, fontWeight: "800", letterSpacing: 0.6, textTransform: "uppercase" },
    fast: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: c.surface, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: c.line },
    fastTxt: { color: c.text, fontWeight: "700", fontSize: 13 },
    tabs: { flexDirection: "row", backgroundColor: c.surface, borderRadius: 14, padding: 4, marginBottom: 20, borderWidth: 1, borderColor: c.line },
    tab: { flex: 1, alignItems: "center", paddingVertical: 8, borderRadius: 11, gap: 2 },
    tabOn: { backgroundColor: c.surface3 },
    tabTxt: { color: c.muted, fontWeight: "800", fontSize: 10, letterSpacing: 0.2 },
    tabTxtOn: { color: c.text },
    tabN: { color: c.muted, fontSize: 11, fontWeight: "700" },
    tabNOn: { color: c.red },
    create: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: c.surface, borderRadius: 18, padding: 14, marginBottom: 22, borderWidth: 1, borderColor: c.line },
    createIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: c.red, alignItems: "center", justifyContent: "center" },
    grow: { flex: 1 },
    createT: { color: c.text, fontWeight: "800", fontSize: 16 },
    createS: { color: c.muted, fontSize: 12, marginTop: 3, lineHeight: 16 },
    section: { color: c.muted, fontSize: 11, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 10 },
    list: { gap: 8 },
    savedRow: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: c.surface, borderRadius: 16, padding: 12, borderWidth: 1, borderColor: c.line },
    savedMain: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12 },
    savedName: { color: c.text, fontWeight: "700", fontSize: 15 },
    savedMeta: { color: c.muted, fontSize: 12, marginTop: 2 },
    editBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: c.surface3, alignItems: "center", justifyContent: "center" },
    wipe: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, marginTop: 8 },
    wipeTxt: { color: c.red, fontWeight: "800", fontSize: 13 },
    delete: { backgroundColor: c.red, width: 88, alignItems: "center", justifyContent: "center", borderRadius: 16, marginLeft: 8 },
    deleteTxt: { color: "#fff", fontWeight: "800", fontSize: 11, marginTop: 4, textTransform: "uppercase" },
    blank: { alignItems: "center", paddingVertical: 36, paddingHorizontal: 24 },
    blankIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: c.surface, alignItems: "center", justifyContent: "center", marginBottom: 14, borderWidth: 1, borderColor: c.line },
    blankT: { color: c.text, fontWeight: "800", fontSize: 17 },
    blankS: { color: c.muted, fontSize: 13, lineHeight: 19, textAlign: "center", marginTop: 6, maxWidth: 260 }
  };
}
