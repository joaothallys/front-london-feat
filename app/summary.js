import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Button, Screen } from "../src/components/ui.js";
import { useLive } from "../src/state/LiveSession.js";
import { useAppState } from "../src/state/AppState.js";
import { colors } from "../src/theme.js";

export default function Summary() {
  const { summary } = useLive();
  const { refresh } = useAppState();
  if (!summary) {
    return <Screen noNav><Button label="Voltar" onPress={() => router.replace("/(tabs)/home")} /></Screen>;
  }
  return (
    <Screen noNav>
      <View style={styles.center}>
        <Image source={require("../assets/logo.png")} style={styles.logo} />
        <Text style={styles.k}>Treino concluído</Text>
        <Text style={styles.h}>{summary.name}</Text>
        <View style={styles.stats}>
          <Stat n={summary.duration} l="min" />
          <Stat n={Math.round(summary.volume || 0)} l="kg" />
          <Stat n={summary.calories} l="kcal" />
        </View>
        <Text style={styles.p}>Séries marcadas: {summary.sets} · Aparelhos: {summary.exercises}</Text>
      </View>
      <Button label="Voltar ao início" onPress={() => { refresh(); router.replace("/(tabs)/home"); }} />
    </Screen>
  );
}

function Stat({ n, l }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.n}>{n}</Text>
      <Text style={styles.l}>{l}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", marginTop: 32 },
  logo: { width: 96, height: 96, borderRadius: 48, marginBottom: 12 },
  k: { color: colors.red, fontWeight: "700", letterSpacing: 1 },
  h: { color: colors.text, fontSize: 26, fontWeight: "800", textAlign: "center", marginVertical: 10 },
  stats: { flexDirection: "row", gap: 8, marginVertical: 16 },
  stat: { backgroundColor: colors.surface, borderRadius: 14, padding: 14, minWidth: 90, alignItems: "center" },
  n: { color: colors.text, fontWeight: "800", fontSize: 20 },
  l: { color: colors.muted, fontSize: 12, marginTop: 4 },
  p: { color: colors.muted, textAlign: "center" }
});
