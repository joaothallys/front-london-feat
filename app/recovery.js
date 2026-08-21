import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Screen, TopBar } from "../src/components/ui.js";
import { useAppState } from "../src/state/AppState.js";
import { D } from "../src/catalog.js";
import { colors } from "../src/theme.js";

export default function Recovery() {
  const { state } = useAppState();
  return (
    <Screen>
      <TopBar title="Recuperação muscular" back />
      {D.muscles.map((m) => {
        const last = state.recovery[m.id];
        const hours = last ? (Date.now() - last) / 3600000 : 48;
        const pct = Math.max(0, Math.min(100, Math.round((hours / 48) * 100)));
        return (
          <View key={m.id} style={styles.row}>
            <Text style={styles.label}>{m.label}</Text>
            <View style={styles.bar}><View style={[styles.fill, { width: pct + "%" }, pct < 40 && styles.low, pct < 75 && pct >= 40 && styles.warn]} /></View>
            <Text style={styles.pct}>{pct}%</Text>
          </View>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  label: { color: colors.text, width: 90, fontWeight: "700" },
  bar: { flex: 1, height: 8, backgroundColor: colors.line, borderRadius: 4, overflow: "hidden" },
  fill: { height: 8, backgroundColor: colors.green },
  low: { backgroundColor: colors.red },
  warn: { backgroundColor: colors.amber },
  pct: { color: colors.muted, width: 40, textAlign: "right" }
});
