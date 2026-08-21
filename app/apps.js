import React from "react";
import { api } from "@shared/api/client.js";
import { SessionService } from "@shared/services/account/SessionService.js";
import { Chip, Row, Screen, TopBar } from "../src/components/ui.js";
import { useAppState } from "../src/state/AppState.js";

export default function Apps() {
  const { state, refresh } = useAppState();
  function tog(k) {
    state.connectedApps[k] = state.connectedApps[k] === "connected" ? "disconnected" : "connected";
    refresh();
    if (SessionService.hasToken()) {
      const app = k === "appleHealth" ? "apple_health" : k;
      api.apps.update(app, state.connectedApps[k]).catch(() => {});
    }
  }
  return (
    <Screen>
      <TopBar title="Apps conectados" back />
      <Row title="Apple Saúde" subtitle={state.connectedApps.appleHealth} right={<Chip label={state.connectedApps.appleHealth === "connected" ? "Desconectar" : "Conectar"} onPress={() => tog("appleHealth")} />} />
      <Row title="Strava" subtitle={state.connectedApps.strava} right={<Chip label={state.connectedApps.strava === "connected" ? "Desconectar" : "Conectar"} onPress={() => tog("strava")} />} />
    </Screen>
  );
}
