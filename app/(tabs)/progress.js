import React, { useCallback, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import Svg, { Circle, Polyline } from "react-native-svg";
import { api, unwrap } from "@shared/api/client.js";
import { SessionService } from "@shared/services/account/SessionService.js";
import { Empty, Screen, Segmented } from "../../src/components/ui.js";
import { ExerciseThumb } from "../../src/components/ExerciseThumb.js";
import { HapticPressable } from "../../src/components/HapticPressable.js";
import { MuscleArt } from "../../src/components/MuscleArt.js";
import { exerciseOf } from "../../src/catalog.js";
import { useAppState } from "../../src/state/AppState.js";
import { useStyles, useTheme } from "../../src/theme.js";
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
  quadriceps: "Quadríceps",
  gluteos: "Glúteos",
  posterior: "Posteriores",
  abdomen: "Abdômen",
  adutores: "Adutores",
  abdutores: "Abdutores",
  panturrilha: "Panturrilhas",
  trapezio: "Trapézio",
  antebracos: "Antebraços",
  obliquos: "Oblíquos",
  lombar: "Lombar",
  pernas: "Quadríceps",
  outros: "Outros"
};

function fmtVol(n) {
  const v = Number(n) || 0;
  if (v >= 1000) return (v / 1000).toFixed(v >= 10000 ? 0 : 1).replace(".", ",") + "k";
  return String(Math.round(v));
}

function fmtKg(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return "—";
  const r = Math.round(v * 10) / 10;
  return String(r).replace(".", ",");
}

function kgOf(row) {
  return Number((row && (row.weightKg || row.weight)) || 0);
}

function muscleName(id) {
  return MUSCLE[id] || id;
}

function periodCopy(range) {
  if (range === "year") return "neste ano";
  if (range === "all") return "em todo o histórico";
  return "neste mês";
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
  const { colors } = useTheme();
  const styles = useStyles(styleFactory);
  const { state } = useAppState();
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
  const pickedRow = picked ? byDate[picked] : null;
  const today = localDate();
  const muscleRank = useMemo(() => {
    return muscles
      .map((m) => ({ ...m, vol: Number(m.volumeKg) || 0 }))
      .filter((m) => m.vol > 0)
      .sort((a, b) => b.vol - a.vol);
  }, [muscles]);
  const muscleTotal = muscleRank.reduce((n, m) => n + m.vol, 0);
  const topMuscle = muscleRank[0] || null;
  const weightSeries = weights.map(kgOf).filter((n) => n > 0);
  const weightNow = weightSeries[weightSeries.length - 1] || 0;
  const weightDelta = weightSeries.length > 1 ? weightNow - weightSeries[0] : 0;
  const weightGoal = Number((state.bodyMeasures && state.bodyMeasures.weightGoal) || 0) || 0;
  const recs = useMemo(() => {
    return exercises.slice().sort((a, b) => {
      const aHit = Number(a.lastKg) === Number(a.bestKg) && Number(a.bestKg) > 0 ? 1 : 0;
      const bHit = Number(b.lastKg) === Number(b.bestKg) && Number(b.bestKg) > 0 ? 1 : 0;
      if (bHit !== aHit) return bHit - aHit;
      return (Number(b.bestKg) || 0) - (Number(a.bestKg) || 0);
    });
  }, [exercises]);

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
        <Segmented options={RANGES} value={range} onChange={setRange} />
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

      {muscleRank.length ? (
        <>
          <Block
            title="Volume por músculo"
            hint={"Carga somada (kg × reps) " + periodCopy(range) + ". O grupo no topo foi o mais trabalhado."}
          />
          {topMuscle ? (
            <View style={styles.hero}>
              <MuscleArt id={topMuscle.muscleId} width={72} height={72} />
              <View style={styles.grow}>
                <Text style={styles.heroK}>Mais trabalhado</Text>
                <Text style={styles.heroT}>{muscleName(topMuscle.muscleId)}</Text>
                <Text style={styles.heroS}>
                  {muscleTotal ? Math.round((topMuscle.vol / muscleTotal) * 100) : 0}% do volume  ·  {fmtVol(topMuscle.vol)} kg
                </Text>
              </View>
            </View>
          ) : null}
          {muscleRank.slice(1).map((m) => {
            const max = Math.max(1, muscleRank[0].vol);
            const share = muscleTotal ? Math.round((m.vol / muscleTotal) * 100) : 0;
            return (
              <View key={m.muscleId} style={styles.muscle}>
                <MuscleArt id={m.muscleId} width={40} height={40} />
                <View style={styles.grow}>
                  <View style={styles.muscleTop}>
                    <Text style={styles.muscleLbl}>{muscleName(m.muscleId)}</Text>
                    <Text style={styles.muscleVol}>{share}%</Text>
                  </View>
                  <View style={styles.muscleBar}>
                    <View style={[styles.muscleFill, { width: Math.max(8, (m.vol / max) * 100) + "%" }]} />
                  </View>
                </View>
                <Text style={styles.muscleKg}>{fmtVol(m.vol)}</Text>
              </View>
            );
          })}
        </>
      ) : null}

      <Block
        title="Peso corporal"
        hint="A linha mostra a tendência. O ponto é a medição mais recente."
      />
      {weightSeries.length ? (
        <View style={styles.card}>
          <View style={styles.weightHead}>
            <View style={styles.grow}>
              <Text style={styles.heroK}>Agora</Text>
              <Text style={styles.weightN}>{fmtKg(weightNow)} kg</Text>
              {weightSeries.length > 1 ? (
                <Text style={[styles.weightDelta, weightDelta < 0 ? styles.down : weightDelta > 0 ? styles.up : null]}>
                  {weightDelta === 0
                    ? "Estável nas medições"
                    : (weightDelta > 0 ? "+" : "") + fmtKg(weightDelta) + " kg no período"}
                </Text>
              ) : (
                <Text style={styles.heroS}>Registre de novo para ver a curva.</Text>
              )}
            </View>
            {weightGoal ? (
              <View style={styles.goalBox}>
                <Text style={styles.heroK}>Meta</Text>
                <Text style={styles.goalN}>{fmtKg(weightGoal)}</Text>
                <Text style={styles.heroS}>
                  {Math.abs(weightNow - weightGoal) < 0.05
                    ? "Na meta"
                    : (weightNow > weightGoal ? "+" : "") + fmtKg(weightNow - weightGoal) + " kg da meta"}
                </Text>
              </View>
            ) : null}
          </View>
          {weightSeries.length > 1 ? <TrendChart values={weightSeries} color={colors.red} /> : null}
          <HapticPressable onPress={() => router.push("/measures")}>
            <Text style={styles.cardLink}>Atualizar medidas</Text>
          </HapticPressable>
        </View>
      ) : (
        <HapticPressable style={styles.card} onPress={() => router.push("/measures")}>
          <Text style={styles.heroS}>Ainda sem medições. Toque para registrar o peso e acompanhar a tendência aqui.</Text>
        </HapticPressable>
      )}

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

      {recs.length ? (
        <>
          <Block
            title="Recordes por exercício"
            hint="Maior carga que você já fez. A barra compara com a última série."
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.prRow}>
            {recs.slice(0, 10).map((row) => {
              const best = Number(row.bestKg) || 0;
              const last = Number(row.lastKg) || 0;
              const atPr = best > 0 && last === best;
              const ratio = best > 0 ? Math.min(1, last / best) : 0;
              const ex = exerciseOf(row.exerciseId);
              return (
                <HapticPressable
                  key={row.exerciseId}
                  style={styles.prCard}
                  onPress={() => router.push("/exercise/" + encodeURIComponent(row.exerciseId))}
                >
                  <ExerciseThumb exercise={ex} size={52} showMuscle />
                  <Text style={styles.prName} numberOfLines={2}>{exerciseName(row)}</Text>
                  <Text style={styles.prN}>{best > 0 ? fmtKg(best) : (row.lastReps || "—")}</Text>
                  <Text style={styles.prU}>{best > 0 ? "kg recorde" : "reps"}</Text>
                  {atPr ? (
                    <View style={styles.prBadge}><Text style={styles.prBadgeT}>PR atual</Text></View>
                  ) : (
                    <>
                      <View style={styles.prBar}>
                        <View style={[styles.prFill, { width: Math.max(8, ratio * 100) + "%" }]} />
                      </View>
                      <Text style={styles.prLast}>último {fmtKg(last)} kg</Text>
                    </>
                  )}
                  {row.timesPerformed ? <Text style={styles.prTimes}>{row.timesPerformed}x</Text> : null}
                </HapticPressable>
              );
            })}
          </ScrollView>
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
  const { colors } = useTheme();
  const styles = useStyles(styleFactory);
  return (
    <View style={styles.stat}>
      <Text style={styles.statN}>{n}</Text>
      <Text style={styles.statL}>{l}</Text>
    </View>
  );
}

function Block({ title, hint }) {
  const { colors } = useTheme();
  const styles = useStyles(styleFactory);
  return (
    <View style={styles.block}>
      <Text style={styles.blockT}>{title}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

function TrendChart({ values, color }) {
  const { colors } = useTheme();
  const styles = useStyles(styleFactory);
  const [w, setW] = useState(0);
  const h = 88;
  const min = Math.min.apply(null, values);
  const max = Math.max.apply(null, values);
  const span = Math.max(0.4, max - min);
  const pad = 8;
  const pts = values.map((v, i) => {
    const x = pad + (i / Math.max(1, values.length - 1)) * Math.max(1, w - pad * 2);
    const y = pad + (1 - (v - min) / span) * (h - pad * 2);
    return x + "," + y;
  }).join(" ");
  const last = values[values.length - 1];
  const lastX = pad + Math.max(1, w - pad * 2);
  const lastY = pad + (1 - (last - min) / span) * (h - pad * 2);
  return (
    <View style={styles.trend} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      {w > 0 && values.length > 1 ? (
        <Svg width={w} height={h}>
          <Polyline
            points={pts}
            fill="none"
            stroke={color}
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <Circle cx={lastX} cy={lastY} r={4.5} fill={color} />
        </Svg>
      ) : null}
    </View>
  );
}

function styleFactory(c) {
  return {
  title: { color: c.text, fontSize: 26, fontWeight: "800", letterSpacing: 0.6, textTransform: "uppercase", marginBottom: 14 },
  monthRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  nav: { width: 36, height: 36, borderRadius: 18, backgroundColor: c.surface, alignItems: "center", justifyContent: "center" },
  month: { color: c.text, fontWeight: "800", fontSize: 16 },
  weekHead: { flexDirection: "row" },
  weekLbl: { flex: 1, textAlign: "center", color: c.muted, fontSize: 11, fontWeight: "700" },
  grid: { flexDirection: "row", flexWrap: "wrap", marginTop: 6, marginBottom: 8 },
  cell: { width: "14.28%", height: 40, alignItems: "center", justifyContent: "center" },
  dot: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  dotOn: { backgroundColor: c.red },
  dotPick: { borderWidth: 2, borderColor: "#fff" },
  dotToday: { borderWidth: 1, borderColor: c.red },
  dayTxt: { color: c.muted2, fontWeight: "700", fontSize: 13 },
  dayTxtOn: { color: "#fff" },
  session: { flexDirection: "row", alignItems: "center", backgroundColor: c.surface, borderRadius: 16, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: c.line },
  sessionName: { color: c.text, fontWeight: "800" },
  sessionMeta: { color: c.muted, fontSize: 12, marginTop: 3 },
  grow: { flex: 1 },
  chips: { flexDirection: "row", flexWrap: "wrap", marginTop: 8 },
  stats: { flexDirection: "row", gap: 8, marginBottom: 8 },
  stat: { flex: 1, backgroundColor: c.surface, borderRadius: 14, paddingVertical: 14, alignItems: "center", borderWidth: 1, borderColor: c.line },
  statN: { color: c.text, fontWeight: "800", fontSize: 20 },
  statL: { color: c.muted, fontSize: 11, marginTop: 4, textTransform: "uppercase", fontWeight: "700" },
  section: { color: c.muted, fontSize: 11, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase", marginTop: 14, marginBottom: 10 },
  block: { marginTop: 20, marginBottom: 10 },
  blockT: { color: c.muted, fontSize: 11, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 6 },
  hint: { color: c.muted, fontSize: 13, lineHeight: 18 },
  chart: { flexDirection: "row", alignItems: "flex-end", height: 128, gap: 6, paddingHorizontal: 4 },
  barCol: { flex: 1, alignItems: "center" },
  barTrack: { height: 100, width: "100%", justifyContent: "flex-end", alignItems: "center" },
  bar: { width: "70%", maxWidth: 22, borderRadius: 6, backgroundColor: c.red },
  barLbl: { color: c.muted, fontSize: 9, marginTop: 6, fontWeight: "700" },
  insight: { flexDirection: "row", gap: 8, marginTop: 16 },
  insightK: { color: c.muted, fontSize: 11, fontWeight: "700", textTransform: "uppercase" },
  insightV: { color: c.text, fontWeight: "800", fontSize: 18, marginTop: 4 },
  hero: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: c.surface, borderRadius: 18, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: c.line },
  heroK: { color: c.red, fontSize: 11, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.5 },
  heroT: { color: c.text, fontWeight: "800", fontSize: 20, marginTop: 2 },
  heroS: { color: c.muted, fontSize: 13, marginTop: 4, lineHeight: 18 },
  muscle: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  muscleTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 },
  muscleLbl: { color: c.text, fontWeight: "700", fontSize: 14 },
  muscleBar: { height: 10, backgroundColor: c.line, borderRadius: 6, overflow: "hidden" },
  muscleFill: { height: 10, backgroundColor: c.red, borderRadius: 6 },
  muscleVol: { color: c.muted2, fontSize: 12, fontWeight: "800" },
  muscleKg: { color: c.muted, width: 40, textAlign: "right", fontSize: 12, fontWeight: "700" },
  card: { backgroundColor: c.surface, borderRadius: 18, padding: 14, borderWidth: 1, borderColor: c.line },
  weightHead: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  weightN: { color: c.text, fontWeight: "800", fontSize: 32, marginTop: 2 },
  weightDelta: { color: c.muted2, fontSize: 13, fontWeight: "700", marginTop: 4 },
  down: { color: c.green },
  up: { color: c.amber },
  goalBox: { alignItems: "flex-end" },
  goalN: { color: c.text, fontWeight: "800", fontSize: 22, marginTop: 2 },
  trend: { height: 88, marginTop: 8, marginBottom: 4 },
  cardLink: { color: c.red, fontWeight: "800", fontSize: 13, marginTop: 6 },
  prRow: { gap: 10, paddingRight: 8 },
  prCard: { width: 148, backgroundColor: c.surface, borderRadius: 18, padding: 12, borderWidth: 1, borderColor: c.line },
  prName: { color: c.text, fontWeight: "800", fontSize: 13, marginTop: 10, minHeight: 34 },
  prN: { color: c.text, fontWeight: "800", fontSize: 28, marginTop: 4 },
  prU: { color: c.muted, fontSize: 11, fontWeight: "700", textTransform: "uppercase", marginBottom: 8 },
  prBar: { height: 6, backgroundColor: c.line, borderRadius: 4, overflow: "hidden" },
  prFill: { height: 6, backgroundColor: c.red, borderRadius: 4 },
  prLast: { color: c.muted, fontSize: 11, fontWeight: "700", marginTop: 6 },
  prBadge: { alignSelf: "flex-start", backgroundColor: c.redSoft, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  prBadgeT: { color: c.red, fontWeight: "800", fontSize: 11 },
  prTimes: { position: "absolute", top: 12, right: 12, color: c.muted, fontSize: 11, fontWeight: "800" },
  rank: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.line },
  rankN: { color: c.red, fontWeight: "900", width: 28 },
  rankVol: { color: c.text, fontWeight: "800" },
  link: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 14 },
  linkTxt: { color: c.text, fontWeight: "800", letterSpacing: 0.3, textTransform: "uppercase", fontSize: 13 }
};
}
