import React from "react";
import { Alert, Text, View } from "react-native";
import { router } from "expo-router";
import { api, unwrap } from "@shared/api/client.js";
import { SessionService } from "@shared/services/account/SessionService.js";
import { Button, Card, Screen, TopBar } from "../src/components/ui.js";
import { useAppState } from "../src/state/AppState.js";
import { useStyles } from "../src/theme.js";
import { ensurePartnerGyms, isLondonFit } from "@shared/domain/locations.js";

function typeLabel(type) {
  if (type === "gym") return "Academia";
  if (type === "home") return "Casa";
  if (type === "park") return "Parque";
  return type || "Local";
}

export default function Locations() {
  const styles = useStyles(styleFactory);
  const { state, refresh } = useAppState();
  const list = ensurePartnerGyms(state.locations || []);

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

  function activate(id) {
    state.activeLocationId = id;
    if (SessionService.hasToken()) api.locations.activate(id).catch(() => {});
    refresh();
  }

  return (
    <Screen>
      <TopBar title="Locais" back stacked />
      <Text style={styles.lead}>A London Fit já está homologada no app. Você pode treinar por conta ou marcar que é aluno de lá.</Text>
      {list.map((l) => {
        const on = state.activeLocationId === l.id;
        const n = (l.equipment || []).length;
        const partner = isLondonFit(l);
        return (
          <Card key={l.id} onPress={() => activate(l.id)} style={on ? styles.cardOn : null}>
            <View style={styles.locTop}>
              <Text style={styles.type}>{partner ? "Homologada" : typeLabel(l.type)}</Text>
              <View style={[styles.badge, on && styles.badgeOn]}>
                <Text style={[styles.badgeTxt, on && styles.badgeTxtOn]}>{on ? "Em uso" : "Usar"}</Text>
              </View>
            </View>
            <Text style={styles.name}>{l.name}</Text>
            <Text style={styles.meta}>{n} {n === 1 ? "equipamento" : "equipamentos"}</Text>
          </Card>
        );
      })}
      <View style={styles.actions}>
        <Button ghost label="Editar equipamentos" onPress={() => router.push("/equipment")} />
        <Button ghost label="Novo local" onPress={add} />
      </View>
    </Screen>
  );
}

function styleFactory(c) {
  return {
    lead: { color: c.muted, fontSize: 14, lineHeight: 21, marginBottom: 16 },
    cardOn: { borderColor: c.red, backgroundColor: c.redSoft },
    locTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
    type: { color: c.red, fontSize: 12, fontWeight: "700", letterSpacing: 0.8, textTransform: "uppercase" },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: c.surface2, borderWidth: 1, borderColor: c.line },
    badgeOn: { backgroundColor: c.red, borderColor: c.red },
    badgeTxt: { color: c.muted2, fontSize: 11, fontWeight: "700" },
    badgeTxtOn: { color: "#ffffff" },
    name: { color: c.text, fontSize: 20, fontWeight: "800" },
    meta: { color: c.muted, fontSize: 13, marginTop: 4 },
    actions: { marginTop: 8, gap: 4 }
  };
}
