import React, { useEffect, useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { SessionService } from "@shared/services/account/SessionService.js";
import { BiometricService } from "@shared/services/account/BiometricService.js";
import { store } from "@shared/store/local-store.js";
import { Button, Field } from "../src/components/ui.js";
import { useAppState } from "../src/state/AppState.js";
import { useStyles, useTheme } from "../src/theme.js";

function maskPhone(value) {
  const d = String(value || "").replace(/\D/g, "").slice(0, 11);
  if (!d) return "";
  if (d.length <= 2) return "(" + d;
  if (d.length <= 6) return "(" + d.slice(0, 2) + ") " + d.slice(2);
  if (d.length <= 10) return "(" + d.slice(0, 2) + ") " + d.slice(2, 6) + "-" + d.slice(6);
  return "(" + d.slice(0, 2) + ") " + d.slice(2, 7) + "-" + d.slice(7);
}

export default function Login() {
  const { colors } = useTheme();
  const styles = useStyles(styleFactory);
  const { state, refresh } = useAppState();
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState(state.profile.email && state.profile.email.indexOf("londonfitness.com") < 0 ? state.profile.email : "");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [faceLabel, setFaceLabel] = useState("");
  const [faceReady, setFaceReady] = useState(false);
  const isReg = mode === "register";

  useEffect(() => {
    let live = true;
    (async () => {
      const can = await BiometricService.canUse();
      const on = await BiometricService.isEnabled();
      const creds = await BiometricService.credentials();
      const label = await BiometricService.label();
      if (!live) return;
      setFaceLabel(label);
      setFaceReady(!!(can && on && creds));
    })();
    return () => { live = false; };
  }, []);

  async function submit() {
    setError("");
    if (!email.trim() || !password) {
      setError("Informe e-mail e senha.");
      return;
    }
    if (isReg && password.length < 6) {
      setError("A senha precisa ter no mínimo 6 caracteres.");
      return;
    }
    setBusy(true);
    try {
      if (isReg) await SessionService.register({ email: email.trim(), password, name: name.trim(), phone: phone.replace(/\D/g, "") });
      else await SessionService.login(email.trim(), password);
      await SessionService.hydrate(state);
      store.login({ userId: state.session && state.session.userId });
      refresh();
      const go = () => router.replace(state.onboardingDone ? "/(tabs)/home" : "/onboarding");
      if (await BiometricService.isEnabled()) {
        await BiometricService.rememberLogin(email.trim(), password);
        go();
        return;
      }
      if (await BiometricService.canUse()) {
        const label = faceLabel || (await BiometricService.label());
        Alert.alert("Desbloqueio com " + label, "Quer abrir o LumenFit com " + label + " da próxima vez?", [
          { text: "Agora não", onPress: go },
          {
            text: "Ativar",
            onPress: async () => {
              await BiometricService.enable(email.trim(), password);
              go();
            }
          }
        ]);
        return;
      }
      go();
    } catch (err) {
      setError((err && err.message) || "Não foi possível autenticar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        automaticallyAdjustKeyboardInsets
      >
          <View style={styles.center}>
            <Image source={require("../assets/logo.png")} style={styles.logo} />
            <Text style={styles.h}>{isReg ? "Criar conta" : "Entrar"}</Text>
            <Text style={styles.muted}>{isReg ? "Cadastre-se no LumenFit" : "Use o e-mail e a senha da sua conta"}</Text>
          </View>

          <View style={styles.tabs}>
            <Pressable style={[styles.tab, !isReg && styles.tabOn]} onPress={() => { setMode("login"); setError(""); }}>
              <Text style={[styles.tabTxt, !isReg && styles.tabTxtOn]}>Entrar</Text>
            </Pressable>
            <Pressable style={[styles.tab, isReg && styles.tabOn]} onPress={() => { setMode("register"); setError(""); }}>
              <Text style={[styles.tabTxt, isReg && styles.tabTxtOn]}>Criar conta</Text>
            </Pressable>
          </View>

          {isReg ? <Field label="Nome" value={name} onChangeText={setName} autoCapitalize="words" placeholder="Seu nome" /> : null}
          <Field label="E-mail" value={email} onChangeText={setEmail} keyboardType="email-address" placeholder="seu@email.com" autoComplete="email" />
          <Field label="Senha" value={password} onChangeText={setPassword} secureTextEntry placeholder={isReg ? "Mínimo 6 caracteres" : "Sua senha"} autoComplete={isReg ? "new-password" : "password"} />
          {isReg ? <Field label="Telefone" value={phone} onChangeText={(v) => setPhone(maskPhone(v))} keyboardType="phone-pad" placeholder="(11) 99999-9999" maxLength={16} /> : null}
          {error ? <Text style={styles.err}>{error}</Text> : null}
          <Button label={busy ? "Aguarde..." : (isReg ? "Cadastrar" : "Entrar")} onPress={submit} disabled={busy} />
          {!isReg && faceReady ? (
            <Button
              ghost
              label={"Entrar com " + faceLabel}
              disabled={busy}
              onPress={async () => {
                setError("");
                setBusy(true);
                try {
                  const creds = await BiometricService.credentials();
                  if (!creds) {
                    setError("Ative o " + faceLabel + " depois de entrar com a senha.");
                    return;
                  }
                  const ok = await BiometricService.authenticate("Entrar no LumenFit com " + faceLabel);
                  if (!ok) return;
                  setEmail(creds.email);
                  await SessionService.login(creds.email, creds.password);
                  await SessionService.hydrate(state);
                  store.login({ userId: state.session && state.session.userId });
                  refresh();
                  router.replace(state.onboardingDone ? "/(tabs)/home" : "/onboarding");
                } catch (err) {
                  setError((err && err.message) || "Não foi possível entrar com " + faceLabel + ".");
                } finally {
                  setBusy(false);
                }
              }}
            />
          ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function styleFactory(c) {
  return {
  safe: { flex: 1, backgroundColor: c.bg },
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 },
  center: { alignItems: "center", marginTop: 8, marginBottom: 20 },
  logo: { width: 96, height: 96, borderRadius: 48, marginBottom: 12 },
  h: { color: c.text, fontSize: 26, fontWeight: "800" },
  muted: { color: c.muted, marginTop: 6, textAlign: "center" },
  tabs: { flexDirection: "row", gap: 8, marginBottom: 16 },
  tab: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: c.line, backgroundColor: c.surface, alignItems: "center" },
  tabOn: { backgroundColor: c.redSoft, borderColor: c.red },
  tabTxt: { color: c.muted, fontWeight: "700", fontSize: 15 },
  tabTxtOn: { color: c.text },
  err: { color: c.red, marginBottom: 10, fontSize: 13 }
};
}
