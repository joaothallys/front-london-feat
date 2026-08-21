import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { EQUIPMENT_CATEGORIES } from "@shared/domain/locations.js";
import { api } from "@shared/api/client.js";
import { SessionService } from "@shared/services/account/SessionService.js";
import { Button, Screen, TopBar } from "../src/components/ui.js";
import { useAppState } from "../src/state/AppState.js";
import { colors } from "../src/theme.js";

export default function Equipment() {
  const { state, refresh } = useAppState();
  const loc = (state.locations || []).find((l) => l.id === state.activeLocationId) || (state.locations || [])[0];
  if (!loc) return <Screen><TopBar title="Equipamento" back /><Text style={{ color: colors.muted }}>Nenhum local.</Text></Screen>;
  const enabled = new Set(loc.equipment || []);

  function save() {
    if (SessionService.hasToken() && loc.id) api.locations.equipment(loc.id, loc.equipment).catch(() => {});
    refresh();
  }

  return (
    <Screen>
      <TopBar title="Editar equipamento" back="/locations" />
      {EQUIPMENT_CATEGORIES.map((cat) => (
        <View key={cat.id} style={{ marginBottom: 16 }}>
          <Text style={styles.cat}>{cat.label}</Text>
          {cat.items.map((item) => (
            <Pressable
              key={item.id}
              style={styles.row}
              onPress={() => {
                if (enabled.has(item.id)) enabled.delete(item.id);
                else enabled.add(item.id);
                loc.equipment = Array.from(enabled);
                save();
              }}
            >
              <Text style={styles.label}>{item.label}</Text>
              <View style={[styles.toggle, enabled.has(item.id) && styles.on]} />
            </Pressable>
          ))}
        </View>
      ))}
      <Button label="Concluir" onPress={() => refresh()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  cat: { color: colors.text, fontWeight: "800", marginBottom: 8 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.line },
  label: { color: colors.muted2 },
  toggle: { width: 40, height: 22, borderRadius: 11, backgroundColor: colors.line },
  on: { backgroundColor: colors.red }
});
