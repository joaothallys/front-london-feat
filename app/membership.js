import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Card, Screen, Section, TopBar } from "../src/components/ui.js";
import { useAppState } from "../src/state/AppState.js";
import { useStyles, useTheme } from "../src/theme.js";

function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(String(iso).length === 10 ? iso + "T12:00:00" : iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("pt-BR");
}

export default function Membership() {
  const { colors } = useTheme();
  const styles = useStyles(styleFactory);
  const { state } = useAppState();
  const m = state.member || {};
  return (
    <Screen>
      <TopBar title="Matrícula" back />
      <Card>
        <Text style={styles.k}>{m.unit}</Text>
        <Text style={styles.h}>LONDON FITNESS</Text>
        <Text style={styles.p}>Aluno: {m.name}</Text>
        <Text style={styles.p}>Código: {m.code}</Text>
      </Card>
      <Card>
        <Line k="Status" v={m.status === "ativa" ? "Ativa" : (m.status || "—")} />
        <Line k="Plano" v={m.plan} />
        <Line k="Validade" v={fmtDate(m.expiresAt)} />
        <Line k="Próximo pagamento" v={fmtDate(m.nextPayment)} />
        <Line k="Valor" v={"R$ " + Number(m.amount || 0).toFixed(2)} />
      </Card>
      <Section>Pagamentos</Section>
      {(m.payments || []).map((p, i) => (
        <Card key={i}>
          <Line k={fmtDate(p.date)} v={"R$ " + Number(p.value || 0).toFixed(2)} />
          <Text style={styles.p}>{p.status}</Text>
        </Card>
      ))}
    </Screen>
  );
}

function Line({ k, v }) {
  const { colors } = useTheme();
  const styles = useStyles(styleFactory);
  return (
    <View style={styles.line}>
      <Text style={styles.p}>{k}</Text>
      <Text style={styles.b}>{v}</Text>
    </View>
  );
}

function styleFactory(c) {
  return {
  k: { color: c.red, fontWeight: "700" },
  h: { color: c.text, fontSize: 22, fontWeight: "800", marginVertical: 8 },
  p: { color: c.muted },
  b: { color: c.text, fontWeight: "700" },
  line: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }
};
}
