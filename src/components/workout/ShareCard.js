import React, { forwardRef } from "react";
import { Image, Text, View } from "react-native";
import { useStyles } from "../../theme.js";
import { fmtInt } from "../../workout/stats.js";

export const TEMPLATES = [
  { id: "grid", label: "Grade" },
  { id: "list", label: "Exercícios" },
  { id: "sets", label: "Séries" },
  { id: "banner", label: "Faixa" },
  { id: "minimal", label: "Mínimo" },
  { id: "side", label: "Lateral" }
];

function Brand({ compact }) {
  const styles = useStyles(styleFactory);
  return (
    <View style={styles.brand}>
      <Image source={require("../../../assets/logo.png")} style={compact ? styles.logoSm : styles.logo} />
      <Text style={styles.brandTxt}>LONDON FITNESS</Text>
    </View>
  );
}

function StatCell({ label, value }) {
  const styles = useStyles(styleFactory);
  return (
    <View style={styles.cell}>
      <Text style={styles.cellLbl}>{label}</Text>
      <Text style={styles.cellVal}>{value}</Text>
    </View>
  );
}

export const ShareCard = forwardRef(function ShareCard({ photo, stats, template, story }, ref) {
  const styles = useStyles(styleFactory);
  const s = stats || {};
  const lines = (s.lines || []).slice(0, 8);

  return (
    <View ref={ref} collapsable={false} style={[styles.card, story && styles.cardStory]}>
      {photo ? (
        <Image source={{ uri: photo }} style={styles.photo} resizeMode="cover" />
      ) : (
        <View style={styles.ph}>
          <Image source={require("../../../assets/logo.png")} style={styles.phLogo} />
        </View>
      )}
      {template === "minimal" ? (
        <View style={styles.bottom}>
          <Brand compact />
          <Text style={styles.big}>{s.duration || 0} MIN</Text>
        </View>
      ) : null}

      {template === "grid" || template === "banner" ? (
        <View style={template === "banner" ? styles.banner : styles.bottom}>
          <Brand compact />
          <View style={styles.grid}>
            <View style={styles.gridRow}>
              <StatCell label="Tempo" value={(s.duration || 0) + " MIN"} />
              <StatCell label="Exercícios" value={String(s.exerciseCount || 0)} />
            </View>
            <View style={styles.gridRow}>
              <StatCell label="Calorias" value={(s.calories || 0) + " KCAL"} />
              <StatCell label="Peso total (kg)" value={fmtInt(s.volume)} />
            </View>
          </View>
        </View>
      ) : null}

      {template === "list" ? (
        <View style={styles.bottom}>
          <Brand compact />
          {lines.map((row) => (
            <View key={row.id} style={styles.line}>
              <Text style={styles.lineName} numberOfLines={1}>{row.name}</Text>
              <Text style={styles.lineMeta}>{row.reps} reps</Text>
            </View>
          ))}
        </View>
      ) : null}

      {template === "sets" ? (
        <View style={styles.bottom}>
          <Brand compact />
          {lines.map((row) => (
            <View key={row.id} style={styles.line}>
              <Text style={styles.lineName} numberOfLines={1}>{row.name}</Text>
              <Text style={styles.lineMeta}>{row.detail}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {template === "side" ? (
        <View style={styles.side}>
          <Brand compact />
          <Text style={styles.sideVal}>{(s.duration || 0) + " MIN"}</Text>
          <Text style={styles.sideLbl}>Tempo</Text>
          <Text style={styles.sideVal}>{fmtInt(s.volume)}</Text>
          <Text style={styles.sideLbl}>Peso total (kg)</Text>
          <Text style={styles.sideVal}>{s.calories || 0}</Text>
          <Text style={styles.sideLbl}>kcal</Text>
          <Text style={styles.sideVal}>{s.exerciseCount || 0}</Text>
          <Text style={styles.sideLbl}>exercícios</Text>
        </View>
      ) : null}
    </View>
  );
});

function styleFactory(c) {
  return {
    card: { width: "100%", height: "100%", aspectRatio: 9 / 16, borderRadius: 22, overflow: "hidden", backgroundColor: "#050505" },
    cardStory: { borderRadius: 0, aspectRatio: undefined },
    photo: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, width: "100%", height: "100%" },
    ph: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#0b0b0b" },
    phLogo: { width: 88, height: 88, borderRadius: 44, opacity: 0.9 },
    bottom: { position: "absolute", left: 0, right: 0, bottom: 0, padding: 16, paddingBottom: 18 },
    banner: { position: "absolute", left: 0, right: 0, bottom: 0, padding: 16 },
    brand: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
    logo: { width: 22, height: 22, borderRadius: 11 },
    logoSm: { width: 18, height: 18, borderRadius: 9 },
    brandTxt: { color: "#fff", fontWeight: "900", letterSpacing: 1.1, fontSize: 11 },
    grid: { gap: 2 },
    gridRow: { flexDirection: "row" },
    cell: { flex: 1, paddingVertical: 0 },
    cellLbl: { color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.4, lineHeight: 14 },
    cellVal: { color: "#fff", fontSize: 22, fontWeight: "900", marginTop: 0, lineHeight: 26 },
    big: { color: "#fff", fontSize: 42, fontWeight: "900" },
    line: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 4, gap: 10 },
    lineName: { color: "#fff", fontWeight: "800", flex: 1, fontSize: 13 },
    lineMeta: { color: "#fff", fontWeight: "700", fontSize: 12 },
    side: { position: "absolute", left: 16, bottom: 18, right: 80 },
    sideVal: { color: "#fff", fontSize: 26, fontWeight: "900", marginTop: 10 },
    sideLbl: { color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: "700", textTransform: "uppercase" }
  };
}
