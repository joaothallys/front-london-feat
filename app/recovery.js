import React from "react";
import { Text, View } from "react-native";
import { Screen, TopBar } from "../src/components/ui.js";
import { MuscleArt } from "../src/components/MuscleArt.js";
import { useAppState } from "../src/state/AppState.js";
import { D } from "../src/catalog.js";
import { useStyles, useTheme } from "../src/theme.js";

const FULL_HOURS = 48;

function statusOf(pct, colors) {
  if (pct >= 100) return { label: "Pronto", color: colors.green };
  if (pct >= 75) return { label: "Quase pronto", color: colors.green };
  if (pct >= 40) return { label: "Recuperando", color: colors.amber };
  return { label: "Descansar", color: colors.red };
}

function readyIn(hours) {
  const left = Math.ceil(FULL_HOURS - hours);
  if (left <= 0) return "";
  if (left < 24) return "pronto em " + left + "h";
  const days = Math.floor(left / 24);
  const rest = left % 24;
  return "pronto em " + days + "d" + (rest ? " " + rest + "h" : "");
}

function MuscleRow({ m, last, styles }) {
  return (
    <View style={[styles.row, !last && styles.rowLine]}>
      <View style={styles.art}>
        <MuscleArt id={m.id} width={40} height={40} compact color={m.status.color} />
      </View>
      <View style={styles.rowBody}>
        <View style={styles.rowTop}>
          <Text style={styles.label}>{m.label}</Text>
          <Text style={[styles.pct, { color: m.status.color }]}>{m.pct}%</Text>
        </View>
        <View style={styles.bar}>
          <View style={[styles.fill, { width: m.pct + "%", backgroundColor: m.status.color }]} />
        </View>
        <Text style={styles.sub}>
          {m.status.label}{m.eta ? " · " + m.eta : ""}
        </Text>
      </View>
    </View>
  );
}

export default function Recovery() {
  const { colors } = useTheme();
  const styles = useStyles(styleFactory);
  const { state } = useAppState();

  const muscles = D.muscles.map((m) => {
    const last = state.recovery && state.recovery[m.id];
    const hours = last ? (Date.now() - last) / 3600000 : FULL_HOURS;
    const pct = Math.max(0, Math.min(100, Math.round((hours / FULL_HOURS) * 100)));
    return { ...m, pct, status: statusOf(pct, colors), eta: readyIn(hours) };
  });
  const resting = muscles.filter((m) => m.pct < 100).sort((a, b) => a.pct - b.pct);
  const ready = muscles.filter((m) => m.pct >= 100);
  const avg = Math.round(muscles.reduce((n, m) => n + m.pct, 0) / (muscles.length || 1));
  const tired = muscles.filter((m) => m.pct < 40).length;
  const recovering = muscles.filter((m) => m.pct >= 40 && m.pct < 100).length;
  const hero = statusOf(avg, colors);
  const headline = !resting.length
    ? "Corpo todo recuperado"
    : tired
      ? "Alguns músculos precisam de descanso"
      : "Quase tudo pronto para treinar";

  return (
    <Screen>
      <TopBar title="Recuperação muscular" back />

      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroKicker}>Recuperação geral</Text>
            <Text style={styles.heroTitle}>{headline}</Text>
          </View>
          <Text style={[styles.heroPct, { color: hero.color }]}>{avg}%</Text>
        </View>
        <View style={styles.heroBar}>
          <View style={[styles.fill, { width: avg + "%", backgroundColor: hero.color }]} />
        </View>
        <View style={styles.stats}>
          {[
            { n: ready.length, label: "Prontos", color: colors.green },
            { n: recovering, label: "Recuperando", color: colors.amber },
            { n: tired, label: "Descansar", color: colors.red }
          ].map((s) => (
            <View key={s.label} style={styles.stat}>
              <View style={styles.statTop}>
                <View style={[styles.dot, { backgroundColor: s.color }]} />
                <Text style={styles.statNum}>{s.n}</Text>
              </View>
              <Text style={styles.statLbl} numberOfLines={1}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {resting.length ? (
        <>
          <Text style={styles.section}>Em recuperação</Text>
          <View style={styles.group}>
            {resting.map((m, i) => <MuscleRow key={m.id} m={m} last={i === resting.length - 1} styles={styles} />)}
          </View>
        </>
      ) : null}

      {ready.length ? (
        <>
          <Text style={styles.section}>Prontos para treinar</Text>
          <View style={styles.group}>
            {ready.map((m, i) => <MuscleRow key={m.id} m={m} last={i === ready.length - 1} styles={styles} />)}
          </View>
        </>
      ) : null}

      <Text style={styles.note}>Cada músculo leva cerca de {FULL_HOURS}h para se recuperar depois de treinado.</Text>
    </Screen>
  );
}

function styleFactory(c) {
  return {
  hero: { backgroundColor: c.surface, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: c.line, marginTop: 4 },
  heroTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  heroKicker: { color: c.muted, fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.8 },
  heroTitle: { color: c.text, fontSize: 18, fontWeight: "800", marginTop: 4 },
  heroPct: { fontSize: 44, fontWeight: "900", letterSpacing: -1 },
  heroBar: { height: 10, backgroundColor: c.surface3, borderRadius: 5, overflow: "hidden", marginTop: 14 },
  stats: { flexDirection: "row", marginTop: 16, gap: 8 },
  stat: { flex: 1, backgroundColor: c.surface2, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12 },
  statTop: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  statNum: { color: c.text, fontWeight: "900", fontSize: 20 },
  statLbl: { color: c.muted, fontSize: 12, marginTop: 2 },
  section: { color: c.muted, fontSize: 12, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.8, marginTop: 24, marginBottom: 8, marginLeft: 4 },
  group: { backgroundColor: c.surface, borderRadius: 18, borderWidth: 1, borderColor: c.line, paddingHorizontal: 14 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  rowLine: { borderBottomWidth: 1, borderColor: c.line },
  art: { width: 48, height: 48, borderRadius: 12, backgroundColor: c.surface2, alignItems: "center", justifyContent: "center" },
  rowBody: { flex: 1 },
  rowTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  label: { color: c.text, fontWeight: "800", fontSize: 15 },
  pct: { fontWeight: "800", fontSize: 14 },
  bar: { height: 6, backgroundColor: c.surface3, borderRadius: 3, overflow: "hidden", marginTop: 8 },
  fill: { height: "100%", borderRadius: 3 },
  sub: { color: c.muted, fontSize: 12, marginTop: 6 },
  note: { color: c.muted, fontSize: 12, textAlign: "center", marginTop: 20, paddingHorizontal: 16 }
};
}
