import React, { useState } from "react";
import { Text } from "react-native";
import { api } from "@shared/api/client.js";
import { Button, Card, Screen, TopBar } from "../src/components/ui.js";
import { D } from "../src/catalog.js";
import { colors } from "../src/theme.js";

export default function Sync() {
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function run() {
    setBusy(true);
    setMsg("Sincronizando...");
    try {
      await api.sync();
      setMsg("Pedido enviado ao backend.");
    } catch (err) {
      setMsg((err && err.message) || "Falha na sincronização");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <TopBar title="Catálogo ExerciseDB" back />
      <Card>
        <Text style={{ color: colors.text, fontWeight: "800" }}>{D.exercises.length} exercícios no app</Text>
        <Text style={{ color: colors.muted, marginTop: 8 }}>O catálogo curado (peito, costas, ombros e bíceps) já vem no app. A sync preenche o banco da API.</Text>
      </Card>
      {msg ? <Text style={{ color: colors.muted, marginBottom: 12 }}>{msg}</Text> : null}
      <Button label={busy ? "Aguarde..." : "Sincronizar ExerciseDB"} onPress={run} disabled={busy} />
    </Screen>
  );
}
