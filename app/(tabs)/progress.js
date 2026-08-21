import React, { useCallback, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { api, unwrap } from "@shared/api/client.js";
import { SessionService } from "@shared/services/account/SessionService.js";
import { Chip, Empty, Screen } from "../../src/components/ui.js";
import { HapticPressable } from "../../src/components/HapticPressable.js";
import { exerciseOf } from "../../src/catalog.js";
import { colors } from "../../src/theme.js";
import { daysInMonth, firstWeekday, monthLabel } from "../../src/stats.js";

const RANGES = [
  ["week", "Semana"],
  ["month", "Mês"],
  ["year", "Ano"],
  ["all", "Tudo"]
];
const WEEK = ["D", "S", "T", "Q", "Q", "S", "S"];
const MUSCLE = {
  peito: "Peito",
  costas: "Costas",
  ombros: "Ombros",
  biceps: "Bíceps",
  triceps: "Tríceps",
  gluteos: "Glúteos",
  pernas: "Pernas",
  panturrilha: "Panturrilha",
  abdomen: "Abdômen",
  outros: "Outros"
};

function fmtVol(n) {
  const v = Number(n) || 0;
  if (v >= 1000) return (v / 1000).toFixed(v >= 10000 ? 0 : 1).replace(".", ",") + "k";
  return String(Math.round(v));
}

function localDate(d) {
  const x = d || new Date();
  return x.getFullYear() + "-" + String(x.getMonth() + 1).padStart(2, "0") + "-" + String(x.getDate()).padStart(2, "0");
}

function asList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (Array.isArray(value.data)) return value.data;
  if (Array.isArray(value.items)) return value.items;
  return [];
}

function bucketLabel(bucket, range) {
  if (!bucket) return "";
  if (range === "all") {
    const parts = String(bucket).split("-");
    return Number(parts[1]) + "/" + String(parts[0]).slice(2);
  }
  const d = new Date(String(bucket).slice(0, 10) + "T12:00:00");
  if (Number.isNaN(d.getTime())) return String(bucket).slice(8, 10);
  if (range === "year") return d.getDate() + "/" + (d.getMonth() + 1);
  return String(d.getDate());
}

function exerciseName(row) {
  const e = exerciseOf(row.exerciseId);
  return (e && e.name) || row.displayName || row.exerciseId;
}

export default function Progress() {
  const now = new Date();
  const [cursor, setCursor] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [picked, setPicked] = useState(null);
  const [range, setRange] = useState("week");
  const [dash, setDash] = useState(null);
  const [calendar, setCalendar] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [muscles, setMuscles] = useState([]);
  const [weights, setWeights] = useState([]);
  const [busy, setBusy] = useState(true);

  const load = useCallback(async () => {
    if (!SessionService.hasToken()) {
      setBusy(false);
      return;
    }
    setBusy(true);
    try {
      const muscleRange = range === "week" ? "month" : range;
      const [p, cal, ex, mus, body] = await Promise.all([
        api.progress.get(range).then(unwrap),
        api.progress.calendar(cursor.y, cursor.m + 1).then(unwrap),
        api.progress.exercises("all").then(unwrap),
        api.progress.muscles(muscleRange).then(unwrap),
        api.body.get().then(unwrap).catch(() => null)
      ]);
      setDash(p && p.data ? p.data : p);
      setCalendar(asList(cal && cal.data ? cal.data : cal));
      setExercises(asList(ex && ex.data ? ex.data : ex));
      setMuscles(asList(mus && mus.data ? mus.data : mus));
      const bodyList = asList(body && body.history ? body.history : body);
      setWeights(bodyList.filter((row) => row && (row.weightKg || row.weight)).slice(-12));
    } catch (err) {
      setDash(null);
      setCalendar([]);
      setExercises([]);
      setMuscles([]);
    } finally {
      setBusy(false);
    }
  }, [range, cursor.y, cursor.m]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const summary = (dash && dash.summary) || {};
  const series = (dash && dash.series) || [];
  const top = (dash && dash.topSessions) || [];
  const byDate = useMemo(() => {
    const map = {};
    calendar.forEach((row) => { map[row.date] = row; });
    return map;
  }, [calendar]);
  const cells = useMemo(() => {
    const total = daysInMonth(cursor.y, cursor.m);
    const pad = firstWeekday(cursor.y, cursor.m);
    const out = [];
    for (let i = 0; i < pad; i += 1) out.push(null);
    for (let d = 1; d <= total; d += 1) out.push(d);
    return out;
  }, [cursor]);
  const maxBar = Math.max(1, ...series.map((p) => Number(p.volumeKg) || 0));
  const maxW = Math.max(1, ...weights.map((w) => Number(w.weightKg || w.weight) || 0));
  const pickedRow = picked ? byDate[picked] : null;
  const today = localDate();

  function pickDay(d) {
    if (!d) return;
    const key = cursor.y + "-" + String(cursor.m + 1).padStart(2, "0") + "-" + String(d).padStart(2, "0");
    setPicked(picked === key ? null : key);
  }

  function shiftMonth(delta) {
    const date = new Date(cursor.y, cursor.m + delta, 1);
    setCursor({ y: date.getFullYear(), m: date.getMonth() });
    setPicked(null);
  }

  function openSession(id) {
    if (!id) return;
    router.push("/history/" + id);
  }

  return (
    <Screen>
      <Text style={styles.title}>Progresso</Text>

      <View style={styles.monthRow}>
        <HapticPressable onPress={() => shiftMonth(-1)} style={styles.nav}>
          <Ionicons name="chevron-back" size={18} color={colors.text} />
        </HapticPressable>
        <Text style={styles.month}>{monthLabel(cursor.y, cursor.m)}</Text>
        <HapticPressable onPress={() => shiftMonth(1)} style={styles.nav}>
          <Ionicons name="chevron-forward" size={18} color={colors.text} />
        </HapticPressable>
      </View>

      <View style={styles.weekHead}>
        {WEEK.map((d, i) => <Text key={d + i} style={styles.weekLbl}>{d}</Text>)}
      </View>
      <View style={styles.grid}>
        {cells.map((d, i) => {
          if (!d) return <View key={"e" + i} style={styles.cell} />;
          const key = cursor.y + "-" + String(cursor.m + 1).padStart(2, "0") + "-" + String(d).padStart(2, "0");
          const hit = byDate[key];
          const on = picked === key;
          return (
            <HapticPressable key={key} style={styles.cell} onPress={() => pickDay(d)}>
              <View style={[styles.dot, hit ? styles.dotOn : null, on && styles.dotPick, key === today && !hit && styles.dotToday]}>
                <Text style={[styles.dayTxt, (hit || on) && styles.dayTxtOn]}>{d}</Text>
              </View>
            </HapticPressable>
          );
        })}
      </View>

      {pickedRow ? (
        <HapticPressable
          style={styles.session}
          onPress={() => openSession(pickedRow.sessionIds && pickedRow.sessionIds[0])}
        >
          <View style={styles.grow}>
            <Text style={styles.sessionName}>{pickedRow.workouts || (pickedRow.sessionIds || []).length || 1} treino{(pickedRow.workouts || 1) === 1 ? "" : "s"}</Text>
            <Text style={styles.sessionMeta}>{fmtVol(pickedRow.volumeKg)} kg</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.muted} />
        </HapticPressable>
      ) : null}

      <View style={styles.chips}>
        {RANGES.map(([id, label]) => (
          <Chip key={id} label={label} on={range === id} onPress={() => setRange(id)} />
        ))}
      </View>

      <View style={styles.stats}>
        <Stat n={summary.workouts || 0} l="Treinos" />
        <Stat n={summary.durationMin || 0} l="min" />
        <Stat n={fmtVol(summary.volumeKg)} l="kg" />
      </View>

      <Text style={styles.section}>Volume</Text>
      {series.length ? (
        <View style={styles.chart}>
          {series.map((p, i) => (
            <View key={(p.bucket || i) + "-" + i} style={styles.barCol}>
              <View style={styles.barTrack}>
                <View style={[styles.bar, { height: Math.max(4, ((Number(p.volumeKg) || 0) / maxBar) * 96) }]} />
              </View>
              <Text style={styles.barLbl}>{bucketLabel(p.bucket, range)}</Text>
            </View>
          ))}
        </View>
      ) : <Empty>{busy ? "Carregando..." : "Conclua um treino para ver o gráfico."}</Empty>}

      <View style={styles.insight}>
        <View style={styles.grow}>
          <Text style={styles.insightK}>Sequência</Text>
          <Text style={styles.insightV}>{(dash && dash.streakDays) || 0} dia{((dash && dash.streakDays) || 0) === 1 ? "" : "s"}</Text>
        </View>
        <View style={styles.grow}>
          <Text style={styles.insightK}>Meta da semana</Text>
          <Text style={styles.insightV}>
            {((dash && dash.weeklyGoal && dash.weeklyGoal.done) || 0)}/{((dash && dash.weeklyGoal && dash.weeklyGoal.goal) || 0)} treinos
          </Text>
        </View>
      </View>

      {muscles.length ? (
        <>
          <Text style={styles.section}>Volume por músculo</Text>
          {muscles.map((m) => {
            const max = Math.max(1, ...muscles.map((x) => Number(x.volumeKg) || 0));
            const pct = Math.round(((Number(m.volumeKg) || 0) / max) * 100);
            return (
              <View key={m.muscleId} style={styles.muscle}>
                <Text style={styles.muscleLbl}>{MUSCLE[m.muscleId] || m.muscleId}</Text>
                <View style={styles.muscleBar}><View style={[styles.muscleFill, { width: pct + "%" }]} /></View>
                <Text style={styles.muscleVol}>{fmtVol(m.volumeKg)}</Text>
              </View>
            );
          })}
        </>
      ) : null}

      {weights.length > 1 ? (
        <>
          <Text style={styles.section}>Peso corporal</Text>
          <View style={styles.chart}>
            {weights.map((w, i) => (
              <View key={"w-" + i + "-" + (w.id || w.measuredAt || "")} style={styles.barCol}>
                <View style={styles.barTrack}>
                  <View style={[styles.bar, styles.barW, { height: Math.max(4, ((Number(w.weightKg || w.weight) || 0) / maxW) * 96) }]} />
                </View>
                <Text style={styles.barLbl}>{Number(w.weightKg || w.weight)}</Text>
              </View>
            ))}
          </View>
        </>
      ) : null}

      <Text style={styles.section}>Melhores treinos</Text>
      {top.length ? top.map((h, i) => (
        <HapticPressable key={h.id || i} style={styles.rank} onPress={() => openSession(h.id)}>
          <Text style={styles.rankN}>{String(i + 1).padStart(2, "0")}</Text>
          <View style={styles.grow}>
            <Text style={styles.sessionName}>{h.name}</Text>
            <Text style={styles.sessionMeta}>{h.finishedAt ? new Date(h.finishedAt).toLocaleDateString("pt-BR") : ""}  ·  {h.durationMin || 0} min</Text>
          </View>
          <Text style={styles.rankVol}>{fmtVol(h.volumeKg)} kg</Text>
        </HapticPressable>
      )) : <Empty>Conclua um treino para ver os recordes.</Empty>}

      {exercises.length ? (
        <>
          <Text style={styles.section}>Recordes por exercício</Text>
          {exercises.slice(0, 12).map((row) => (
            <View key={row.exerciseId} style={styles.rank}>
              <View style={styles.grow}>
                <Text style={styles.sessionName}>{exerciseName(row)}</Text>
                <Text style={styles.sessionMeta}>Último {row.lastKg} kg × {row.lastReps}  ·  {row.timesPerformed}x</Text>
              </View>
              <Text style={styles.rankVol}>{row.bestKg} kg</Text>
            </View>
          ))}
        </>
      ) : null}

      <HapticPressable style={styles.link} onPress={() => router.push("/history")}>
        <Ionicons name="time-outline" size={18} color={colors.text} />
        <Text style={styles.linkTxt}>Histórico completo</Text>
      </HapticPressable>
      <HapticPressable style={styles.link} onPress={() => router.push("/recovery")}>
        <Ionicons name="fitness-outline" size={18} color={colors.text} />
        <Text style={styles.linkTxt}>Recuperação muscular</Text>
      </HapticPressable>
      <HapticPressable style={styles.link} onPress={() => router.push("/measures")}>
        <Ionicons name="body-outline" size={18} color={colors.text} />
        <Text style={styles.linkTxt}>Medidas corporais</Text>
      </HapticPressable>
    </Screen>
  );
}

function Stat({ n, l }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statN}>{n}</Text>
      <Text style={styles.statL}>{l}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 26, fontWeight: "800", letterSpacing: 0.6, textTransform: "uppercase", marginBottom: 14 },
  monthRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  nav: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  month: { color: colors.text, fontWeight: "800", fontSize: 16 },
  weekHead: { flexDirection: "row" },
  weekLbl: { flex: 1, textAlign: "center", color: colors.muted, fontSize: 11, fontWeight: "700" },
  grid: { flexDirection: "row", flexWrap: "wrap", marginTop: 6, marginBottom: 8 },
  cell: { width: "14.28%", height: 40, alignItems: "center", justifyContent: "center" },
  dot: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  dotOn: { backgroundColor: colors.red },
  dotPick: { borderWidth: 2, borderColor: "#fff" },
  dotToday: { borderWidth: 1, borderColor: colors.red },
  dayTxt: { color: colors.muted2, fontWeight: "700", fontSize: 13 },
  dayTxtOn: { color: "#fff" },
  session: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderRadius: 16, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: colors.line },
  sessionName: { color: colors.text, fontWeight: "800" },
  sessionMeta: { color: colors.muted, fontSize: 12, marginTop: 3 },
  grow: { flex: 1 },
  chips: { flexDirection: "row", flexWrap: "wrap", marginTop: 8 },
  stats: { flexDirection: "row", gap: 8, marginBottom: 8 },
  stat: { flex: 1, backgroundColor: colors.surface, borderRadius: 14, paddingVertical: 14, alignItems: "center", borderWidth: 1, borderColor: colors.line },
  statN: { color: colors.text, fontWeight: "800", fontSize: 20 },
  statL: { color: colors.muted, fontSize: 11, marginTop: 4, textTransform: "uppercase", fontWeight: "700" },
  section: { color: colors.muted, fontSize: 11, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase", marginTop: 14, marginBottom: 10 },
  chart: { flexDirection: "row", alignItems: "flex-end", height: 128, gap: 6, paddingHorizontal: 4 },
  barCol: { flex: 1, alignItems: "center" },
  barTrack: { height: 100, width: "100%", justifyContent: "flex-end", alignItems: "center" },
  bar: { width: "70%", maxWidth: 22, borderRadius: 6, backgroundColor: colors.red },
  barW: { backgroundColor: colors.muted2 },
  barLbl: { color: colors.muted, fontSize: 9, marginTop: 6, fontWeight: "700" },
  insight: { flexDirection: "row", gap: 8, marginTop: 16 },
  insightK: { color: colors.muted, fontSize: 11, fontWeight: "700", textTransform: "uppercase" },
  insightV: { color: colors.text, fontWeight: "800", fontSize: 18, marginTop: 4 },
  muscle: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  muscleLbl: { color: colors.text, width: 92, fontWeight: "700", fontSize: 13 },
  muscleBar: { flex: 1, height: 8, backgroundColor: colors.line, borderRadius: 4, overflow: "hidden" },
  muscleFill: { height: 8, backgroundColor: colors.red },
  muscleVol: { color: colors.muted, width: 44, textAlign: "right", fontSize: 12, fontWeight: "700" },
  rank: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  rankN: { color: colors.red, fontWeight: "900", width: 28 },
  rankVol: { color: colors.text, fontWeight: "800" },
  link: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 14 },
  linkTxt: { color: colors.text, fontWeight: "800", letterSpacing: 0.3, textTransform: "uppercase", fontSize: 13 }
});
