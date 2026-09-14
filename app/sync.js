import React, { useState } from "react";
import { Text, View } from "react-native";
import { api } from "@shared/api/client.js";
import { Button, Card, Screen, TopBar } from "../src/components/ui.js";
import { D } from "../src/catalog.js";
import { useStyles } from "../src/theme.js";

export default function Sync() {
  const styles = useStyles(styleFactory);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const count = D.exercises.length;

  async function run() {
    setBusy(true);
    setMsg("Sincronizando…");
    try {
      await api.sync();
      setMsg("Pedido enviado. O catálogo da API está sendo atualizado.");
    } catch (err) {
      setMsg((err && err.message) || "Não foi possível sincronizar agora.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <TopBar title="Catálogo" back stacked />
      <Card>
        <Text style={styles.kicker}>ExerciseDB</Text>
        <Text style={styles.count}>{count}</Text>
        <Text style={styles.countLbl}>{count === 1 ? "exercício no app" : "exercícios no app"}</Text>
        <Text style={styles.copy}>
          Peito, costas, ombros, bíceps e o restante do catálogo curado já vêm no app. A sincronização só atualiza o banco da API.
        </Text>
      </Card>
      <Button label={busy ? "Sincronizando…" : "Sincronizar"} onPress={run} disabled={busy} />
      {msg ? <Text style={styles.status}>{msg}</Text> : null}
    </Screen>
  );
}

function styleFactory(c) {
  return {
    kicker: { color: c.red, fontSize: 12, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" },
    count: { color: c.text, fontSize: 44, fontWeight: "800", marginTop: 10, letterSpacing: -1 },
    countLbl: { color: c.muted2, fontSize: 15, fontWeight: "700", marginTop: 2 },
    copy: { color: c.muted, fontSize: 14, lineHeight: 21, marginTop: 14 },
    status: { color: c.muted, fontSize: 13, lineHeight: 18, textAlign: "center", marginTop: 12 }
  };
}
