import React, { forwardRef } from "react";
import { Image, Text, View } from "react-native";
import Svg, { Defs, LinearGradient, RadialGradient, Rect, Stop } from "react-native-svg";
import { fmtDuration, fmtInt } from "../../workout/stats.js";

// O card é desenhado sempre em 360×640 (proporção dos Stories). A prévia na tela
// só muda a escala, então a imagem exportada sai igual ao que o aluno vê.
export const CARD_W = 360;
export const CARD_H = 640;

export const TEMPLATES = [
  { id: "hero", label: "Destaque" },
  { id: "list", label: "Exercícios" },
  { id: "numbers", label: "Números" },
  { id: "minimal", label: "Mínimo" }
];

const RED = "#FF6A1A";
const WHITE = "#FFFFFF";
const SOFT = "rgba(255,255,255,0.72)";
const FAINT = "rgba(255,255,255,0.18)";
const MONTHS = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];

function dateLabel(value) {
  const d = value ? new Date(value) : new Date();
  if (isNaN(d.getTime())) return "";
  return String(d.getDate()).padStart(2, "0") + " " + MONTHS[d.getMonth()];
}

function Backdrop({ photo, template }) {
  if (photo) {
    const heavy = template === "list" || template === "numbers";
    return (
      <>
        <Image source={{ uri: photo }} style={styles.fill} resizeMode="cover" />
        <Svg style={styles.fill} width={CARD_W} height={CARD_H}>
          <Defs>
            <LinearGradient id="top" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#000" stopOpacity="0.55" />
              <Stop offset="1" stopColor="#000" stopOpacity="0" />
            </LinearGradient>
            <LinearGradient id="bottom" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#000" stopOpacity="0" />
              <Stop offset="0.55" stopColor="#000" stopOpacity={heavy ? "0.7" : "0.55"} />
              <Stop offset="1" stopColor="#000" stopOpacity="0.92" />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width={CARD_W} height="150" fill="url(#top)" />
          <Rect x="0" y={heavy ? 200 : 300} width={CARD_W} height={heavy ? 440 : 340} fill="url(#bottom)" />
        </Svg>
      </>
    );
  }
  return (
    <>
      <View style={[styles.fill, { backgroundColor: "#09090B" }]} />
      <Svg style={styles.fill} width={CARD_W} height={CARD_H}>
        <Defs>
          <RadialGradient id="glow" cx="0.85" cy="0.12" r="0.75">
            <Stop offset="0" stopColor={RED} stopOpacity="0.55" />
            <Stop offset="0.6" stopColor={RED} stopOpacity="0.08" />
            <Stop offset="1" stopColor={RED} stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="glow2" cx="0.05" cy="0.95" r="0.6">
            <Stop offset="0" stopColor={RED} stopOpacity="0.22" />
            <Stop offset="1" stopColor={RED} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width={CARD_W} height={CARD_H} fill="url(#glow)" />
        <Rect x="0" y="0" width={CARD_W} height={CARD_H} fill="url(#glow2)" />
      </Svg>
      <Image source={require("../../../assets/logo.png")} style={styles.watermark} />
    </>
  );
}

function TopBar({ date }) {
  return (
    <View style={styles.top}>
      <View style={styles.brand}>
        <Image source={require("../../../assets/logo.png")} style={styles.brandLogo} />
        <Text style={styles.brandTxt}>LUMENFIT</Text>
      </View>
      {date ? <Text style={styles.date}>{date}</Text> : null}
    </View>
  );
}

function Footer() {
  return (
    <View style={styles.footer}>
      <View style={styles.footerDot} />
      <Text style={styles.footerTxt}>Treine com o LumenFit · App Store</Text>
    </View>
  );
}

function Heading({ name, muscles, size }) {
  return (
    <>
      <Text style={styles.kicker}>TREINO CONCLUÍDO</Text>
      <Text style={[styles.name, size && { fontSize: size, lineHeight: size + 4 }]} numberOfLines={2}>
        {name}
      </Text>
      {muscles ? <Text style={styles.muscles} numberOfLines={1}>{muscles}</Text> : null}
    </>
  );
}

function StatRow({ items }) {
  return (
    <View style={styles.statRow}>
      {items.map((it, i) => (
        <View key={it.label} style={[styles.stat, i > 0 && styles.statDivider]}>
          <Text style={styles.statVal} numberOfLines={1} adjustsFontSizeToFit>{it.value}</Text>
          <Text style={styles.statLbl}>{it.label}</Text>
        </View>
      ))}
    </View>
  );
}

export const ShareCard = forwardRef(function ShareCard({ photo, stats, template }, ref) {
  const s = stats || {};
  const tpl = template || "hero";
  const name = s.name || "Treino";
  const muscles = (s.muscleLabels || []).slice(0, 4).join(" · ");
  const date = dateLabel(s.date);
  const duration = fmtDuration(s.duration);
  const volume = fmtInt(s.volume);
  const sets = Number(s.sets) || 0;
  const lines = s.lines || [];
  const shown = lines.slice(0, 6);
  const more = lines.length - shown.length;

  return (
    <View ref={ref} collapsable={false} style={styles.card}>
      <Backdrop photo={photo} template={tpl} />
      <TopBar date={date} />

      {tpl === "hero" ? (
        <View style={styles.bottom}>
          <Heading name={name} muscles={muscles} />
          <StatRow
            items={[
              { label: "TEMPO", value: duration },
              { label: "VOLUME", value: volume + " kg" },
              { label: "SÉRIES", value: String(sets || s.exerciseCount || 0) }
            ]}
          />
          <Footer />
        </View>
      ) : null}

      {tpl === "list" ? (
        <View style={styles.bottom}>
          <Heading name={name} size={26} />
          <View style={styles.panel}>
            {shown.map((row, i) => (
              <View key={row.id || i} style={[styles.line, i > 0 && styles.lineDivider]}>
                <Text style={styles.lineIdx}>{String(i + 1).padStart(2, "0")}</Text>
                <Text style={styles.lineName} numberOfLines={1}>{row.name}</Text>
                <Text style={styles.lineMeta}>
                  {(row.sets || 0) + "×" + (row.typicalReps || 0) + (row.kg ? " · " + row.kg + " kg" : "")}
                </Text>
              </View>
            ))}
            {more > 0 ? <Text style={styles.more}>+{more} {more === 1 ? "exercício" : "exercícios"}</Text> : null}
            {!shown.length ? <Text style={styles.more}>Nenhuma série registrada</Text> : null}
          </View>
          <Text style={styles.summaryLine}>{duration} · {volume} kg · {sets} séries</Text>
          <Footer />
        </View>
      ) : null}

      {tpl === "numbers" ? (
        <View style={styles.bottom}>
          <Text style={styles.kicker}>{name.toUpperCase()}</Text>
          <Text style={styles.giant} numberOfLines={1} adjustsFontSizeToFit>{volume}</Text>
          <Text style={styles.giantLbl}>KG LEVANTADOS</Text>
          <View style={styles.numGrid}>
            <Num value={duration} label="Tempo" />
            <Num value={String(sets)} label="Séries" />
            <Num value={fmtInt(s.reps)} label="Repetições" />
            <Num value={fmtInt(s.calories)} label="kcal" />
          </View>
          <Footer />
        </View>
      ) : null}

      {tpl === "minimal" ? (
        <View style={styles.bottom}>
          <Text style={styles.minimalName} numberOfLines={2}>{name}</Text>
          <View style={styles.minimalRow}>
            <View style={styles.redBar} />
            <Text style={styles.minimalMeta}>{duration} · {volume} kg</Text>
          </View>
          <Footer />
        </View>
      ) : null}
    </View>
  );
});

function Num({ value, label }) {
  return (
    <View style={styles.num}>
      <Text style={styles.numVal} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
      <Text style={styles.numLbl}>{label.toUpperCase()}</Text>
    </View>
  );
}

const styles = {
  card: { width: CARD_W, height: CARD_H, overflow: "hidden", backgroundColor: "#050505" },
  fill: { position: "absolute", top: 0, left: 0, width: CARD_W, height: CARD_H },
  watermark: { position: "absolute", width: 300, height: 300, borderRadius: 150, right: -90, top: 120, opacity: 0.08 },

  top: { position: "absolute", top: 26, left: 24, right: 24, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  brand: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(0,0,0,0.35)", paddingVertical: 6, paddingLeft: 6, paddingRight: 12, borderRadius: 20 },
  brandLogo: { width: 22, height: 22, borderRadius: 11 },
  brandTxt: { color: WHITE, fontWeight: "900", letterSpacing: 2, fontSize: 11 },
  date: { color: WHITE, fontWeight: "800", letterSpacing: 1.5, fontSize: 11 },

  bottom: { position: "absolute", left: 24, right: 24, bottom: 26 },
  kicker: { color: RED, fontWeight: "900", letterSpacing: 2, fontSize: 11, marginBottom: 6 },
  name: { color: WHITE, fontWeight: "900", fontSize: 32, lineHeight: 36, letterSpacing: -0.5 },
  muscles: { color: SOFT, fontWeight: "600", fontSize: 13, marginTop: 6 },

  statRow: { flexDirection: "row", marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: FAINT },
  stat: { flex: 1, paddingRight: 8 },
  statDivider: { paddingLeft: 12, borderLeftWidth: 1, borderLeftColor: FAINT },
  statVal: { color: WHITE, fontWeight: "900", fontSize: 22, fontVariant: ["tabular-nums"] },
  statLbl: { color: SOFT, fontWeight: "800", fontSize: 10, letterSpacing: 1.2, marginTop: 3 },

  panel: { marginTop: 14, backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 18, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  line: { flexDirection: "row", alignItems: "center", paddingVertical: 9, gap: 10 },
  lineDivider: { borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.08)" },
  lineIdx: { color: RED, fontWeight: "900", fontSize: 11, width: 18, fontVariant: ["tabular-nums"] },
  lineName: { color: WHITE, fontWeight: "800", fontSize: 13, flex: 1 },
  lineMeta: { color: SOFT, fontWeight: "700", fontSize: 12, fontVariant: ["tabular-nums"] },
  more: { color: SOFT, fontWeight: "700", fontSize: 12, paddingVertical: 9, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.08)" },
  summaryLine: { color: WHITE, fontWeight: "800", fontSize: 13, marginTop: 12 },

  giant: { color: WHITE, fontWeight: "900", fontSize: 92, lineHeight: 96, letterSpacing: -3, fontVariant: ["tabular-nums"] },
  giantLbl: { color: RED, fontWeight: "900", fontSize: 13, letterSpacing: 2.5, marginTop: -2 },
  numGrid: { flexDirection: "row", flexWrap: "wrap", marginTop: 18, borderTopWidth: 1, borderTopColor: FAINT, paddingTop: 6 },
  num: { width: "50%", paddingVertical: 8 },
  numVal: { color: WHITE, fontWeight: "900", fontSize: 26, fontVariant: ["tabular-nums"] },
  numLbl: { color: SOFT, fontWeight: "800", fontSize: 10, letterSpacing: 1.2, marginTop: 2 },

  minimalName: { color: WHITE, fontWeight: "900", fontSize: 40, lineHeight: 44, letterSpacing: -1 },
  minimalRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 10 },
  redBar: { width: 28, height: 4, borderRadius: 2, backgroundColor: RED },
  minimalMeta: { color: WHITE, fontWeight: "800", fontSize: 15, fontVariant: ["tabular-nums"] },

  footer: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 18 },
  footerDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: RED },
  footerTxt: { color: SOFT, fontWeight: "700", fontSize: 11, letterSpacing: 0.3 }
};
