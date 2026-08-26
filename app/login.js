import React, { useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { SessionService } from "@shared/services/account/SessionService.js";
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
  const isReg = mode === "register";

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
      router.replace(state.onboardingDone ? "/(tabs)/home" : "/onboarding");
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
            <Text style={styles.muted}>{isReg ? "Cadastre-se na Academia London Fitness" : "Use o e-mail e a senha da sua conta"}</Text>
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
