import React, { useCallback, useState } from "react";
import { Empty, Row, Screen, TopBar } from "../../src/components/ui.js";
import { api, unwrap } from "@shared/api/client.js";
import { SessionService } from "@shared/services/account/SessionService.js";
import { useFocusEffect, router } from "expo-router";

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR");
}

function asList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (Array.isArray(value.data)) return value.data;
  if (Array.isArray(value.items)) return value.items;
  if (Array.isArray(value.sessions)) return value.sessions;
  return [];
}

export default function History() {
  const [list, setList] = useState([]);

  const load = useCallback(async () => {
    if (!SessionService.hasToken()) return;
    try {
      const data = unwrap(await api.history.list());
      setList(asList(data).map((row) => SessionService.mapHistory(row)));
    } catch (err) {}
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <Screen>
      <TopBar title="Histórico" back />
      {list.length ? list.map((h) => (
        <Row
          key={h.id}
          title={h.name}
          subtitle={fmtDate(h.date) + " · " + (h.duration || 0) + " min · " + Math.round(h.volume || 0) + " kg"}
          onPress={() => router.push("/history/" + h.id)}
        />
      )) : <Empty>Nenhum treino concluído.</Empty>}
    </Screen>
  );
}
