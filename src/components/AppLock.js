import React, { useCallback, useEffect, useRef, useState } from "react";
import { AppState, Image, Text, View } from "react-native";
import { SessionService } from "@shared/services/account/SessionService.js";
import { BiometricService } from "@shared/services/account/BiometricService.js";
import { HapticPressable } from "./HapticPressable.js";
import { useStyles } from "../theme.js";

const LOCK_AFTER_MS = 5 * 60 * 1000;

export function AppLock({ children }) {
  const styles = useStyles(styleFactory);
  const [locked, setLocked] = useState(false);
  const [label, setLabel] = useState("Face ID");
  const [busy, setBusy] = useState(false);
  const prompting = useRef(false);
  const leftAt = useRef(0);

  const shouldLock = useCallback(async () => {
    return SessionService.hasToken() && (await BiometricService.isEnabled());
  }, []);

  const unlock = useCallback(async () => {
    if (prompting.current) return;
    prompting.current = true;
    setBusy(true);
    try {
      const ok = await BiometricService.authenticate();
      if (ok) {
        leftAt.current = 0;
        setLocked(false);
      }
    } finally {
      setBusy(false);
      prompting.current = false;
    }
  }, []);

  useEffect(() => {
    let live = true;
    BiometricService.label().then((name) => {
      if (live) setLabel(name);
    });
    return () => { live = false; };
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener("change", async (next) => {
      if (next !== "active") {
        if (!leftAt.current) leftAt.current = Date.now();
        return;
      }
      const away = leftAt.current ? Date.now() - leftAt.current : 0;
      leftAt.current = 0;
      if (prompting.current || away < LOCK_AFTER_MS) return;
      if (!(await shouldLock())) return;
      setLocked(true);
      await unlock();
    });
    return () => sub.remove();
  }, [shouldLock, unlock]);

  return (
    <View style={styles.fill}>
      {children}
      {locked ? (
        <HapticPressable style={styles.cover} onPress={unlock} disabled={busy}>
          <Image source={require("../../assets/logo.png")} style={styles.logo} />
          <Text style={styles.title}>LumenFit</Text>
          <Text style={styles.sub}>
            {busy ? "Aguardando " + label + "…" : "Use " + label + " para continuar"}
          </Text>
        </HapticPressable>
      ) : null}
    </View>
  );
}

function styleFactory(c) {
  return {
    fill: { flex: 1 },
    cover: {
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      backgroundColor: c.bg,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 28
    },
    logo: { width: 96, height: 96, borderRadius: 28, marginBottom: 18 },
    title: { color: c.text, fontSize: 28, fontWeight: "800", letterSpacing: 0.6 },
    sub: { color: c.muted, marginTop: 10, textAlign: "center", fontSize: 15, lineHeight: 22 }
  };
}
