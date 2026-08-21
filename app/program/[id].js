import React from "react";
import { Text } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { api, unwrap } from "@shared/api/client.js";
import { SessionService } from "@shared/services/account/SessionService.js";
import { Button, Card, Screen, TopBar } from "../../src/components/ui.js";
import { useAppState } from "../../src/state/AppState.js";
import { useLive } from "../../src/state/LiveSession.js";
import { D, exerciseOf } from "../../src/catalog.js";
import { colors } from "../../src/theme.js";

export default function Program() {
  const { id } = useLocalSearchParams();
  const { state, refresh } = useAppState();
  const { start } = useLive();
  const p = D.programs.find((x) => x.id === id);
  if (!p) return <Screen><TopBar title="Programa" back /><Text style={{ color: colors.muted }}>Não encontrado.</Text></Screen>;

  async function usePlan() {
    state.plan = JSON.parse(JSON.stringify(p));
    refresh();
    if (SessionService.hasToken()) {
      api.plans.generate({
        name: p.name,
        source: "program",
        programId: p.id,
        goal: state.profile.goal,
        level: state.profile.level,
        daysPerWeek: state.profile.days
      }).then((json) => {
        const mapped = SessionService.mapPlan(unwrap(json));
        if (mapped) { state.plan = mapped; refresh(); }
      }).catch(() => {});
    }
    router.replace("/(tabs)/home");
  }

  return (
    <Screen>
      <TopBar title={p.name} back />
      <Text style={{ color: colors.muted, marginBottom: 12 }}>{p.blurb}</Text>
      {p.split.map((d, i) => (
        <Card key={i}>
          <Text style={{ color: colors.text, fontWeight: "800" }}>{d.name}</Text>
          <Text style={{ color: colors.muted, marginVertical: 8 }}>
            {d.items.map((it) => (exerciseOf(it.id) && exerciseOf(it.id).name) || it.id).join(" · ")}
          </Text>
          <Button label="Iniciar este dia" onPress={() => {
            const live = start(d.name, d.items, { sourceType: "plan_day", sourceId: p.id });
            if (live) router.push("/session");
          }} />
        </Card>
      ))}
      <Button ghost label="Usar como meu plano" onPress={usePlan} />
    </Screen>
  );
}
