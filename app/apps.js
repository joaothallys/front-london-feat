import React from "react";
import { api } from "@shared/api/client.js";
import { SessionService } from "@shared/services/account/SessionService.js";
import { Cell, Group, Screen, TopBar } from "../src/components/ui.js";
import { useAppState } from "../src/state/AppState.js";

export default function Apps() {
  const { state, refresh } = useAppState();
  function tog(k, on) {
    state.connectedApps[k] = on ? "connected" : "disconnected";
    refresh();
    if (SessionService.hasToken()) {
      const app = k === "appleHealth" ? "apple_health" : k;
      api.apps.update(app, state.connectedApps[k]).catch(() => {});
    }
  }
  return (
    <Screen>
      <TopBar title="Apps conectados" back />
      <Group>
        <Cell
          title="Apple Saúde"
          subtitle={state.connectedApps.appleHealth === "connected" ? "Conectado" : "Desconectado"}
          switchOn={state.connectedApps.appleHealth === "connected"}
          onSwitch={(on) => tog("appleHealth", on)}
        />
        <Cell
          last
          title="Strava"
          subtitle={state.connectedApps.strava === "connected" ? "Conectado" : "Desconectado"}
          switchOn={state.connectedApps.strava === "connected"}
          onSwitch={(on) => tog("strava", on)}
        />
      </Group>
    </Screen>
  );
}
