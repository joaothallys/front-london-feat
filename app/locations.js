import React from "react";
import { Alert } from "react-native";
import { router } from "expo-router";
import { api, unwrap } from "@shared/api/client.js";
import { SessionService } from "@shared/services/account/SessionService.js";
import { Button, Card, Chip, Screen, TopBar } from "../src/components/ui.js";
import { useAppState } from "../src/state/AppState.js";
import { colors } from "../src/theme.js";
import { Text } from "react-native";

export default function Locations() {
  const { state, refresh } = useAppState();

  async function add() {
    Alert.prompt("Novo local", "Nome do local", async (name) => {
      if (!name) return;
      let id = "loc-" + Date.now();
      if (SessionService.hasToken()) {
        try {
          const created = unwrap(await api.locations.create({ name, type: "gym", equipment: [] }));
          id = created.id || id;
        } catch (err) {}
      }
      state.locations.push({ id, name, type: "gym", equipment: [] });
      refresh();
    });
  }

  return (
    <Screen>
      <TopBar title="Locais de treino" back />
      {(state.locations || []).map((l) => (
        <Card key={l.id}>
          <Text style={{ color: colors.red, fontWeight: "700" }}>{l.type === "gym" ? "Academia" : l.type}</Text>
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: "800", marginVertical: 6 }}>{l.name}</Text>
          <Text style={{ color: colors.muted }}>{(l.equipment || []).length} equipamentos</Text>
          <Chip label={state.activeLocationId === l.id ? "Em uso" : "Usar"} on={state.activeLocationId === l.id} onPress={() => {
            state.activeLocationId = l.id;
            if (SessionService.hasToken()) api.locations.activate(l.id).catch(() => {});
            refresh();
          }} />
        </Card>
      ))}
      <Button ghost label="Editar equipamento do local ativo" onPress={() => router.push("/equipment")} />
      <Button ghost label="+ Novo local de treino" onPress={add} />
    </Screen>
  );
}
