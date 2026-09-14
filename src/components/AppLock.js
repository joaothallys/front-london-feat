import React, { useCallback, useEffect, useRef, useState } from "react";
import { AppState, Image, Text, View } from "react-native";
import { SessionService } from "@shared/services/account/SessionService.js";
import { BiometricService } from "@shared/services/account/BiometricService.js";
import { Button } from "./ui.js";
import { useStyles } from "../theme.js";

export function AppLock({ children }) {
  const styles = useStyles(styleFactory);
  const [locked, setLocked] = useState(false);
  const [label, setLabel] = useState("Face ID");
  const [busy, setBusy] = useState(false);
  const unlocked = useRef(false);
  const prompting = useRef(false);

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
        unlocked.current = true;
        setLocked(false);
      }
    } finally {
      setBusy(false);
      prompting.current = false;
    }
  }, []);

  useEffect(() => {
    let live = true;
    (async () => {
      setLabel(await BiometricService.label());
      if (!(await shouldLock())) return;
      if (!live) return;
      setLocked(true);
      await unlock();
    })();
    return () => { live = false; };
  }, [shouldLock, unlock]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", async (next) => {
      if (next === "background") {
        if (await shouldLock()) {
          unlocked.current = false;
          setLocked(true);
        }
        return;
      }
      if (next === "active" && !unlocked.current && (await shouldLock())) {
        setLocked(true);
        await unlock();
      }
    });
    return () => sub.remove();
  }, [shouldLock, unlock]);

  return (
    <View style={styles.fill}>
      {children}
      {locked ? (
        <View style={styles.cover}>
          <Image source={require("../../assets/logo.png")} style={styles.logo} />
          <Text style={styles.title}>LumenFit</Text>
          <Text style={styles.sub}>Desbloqueie com {label} para continuar</Text>
          <View style={styles.btn}>
            <Button
              label={busy ? "Aguardando…" : "Desbloquear com " + label}
              onPress={unlock}
              disabled={busy}
            />
          </View>
        </View>
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
    sub: { color: c.muted, marginTop: 10, textAlign: "center", fontSize: 15, lineHeight: 22 },
    btn: { alignSelf: "stretch", marginTop: 28 }
  };
}
