import React, { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { SessionService } from "@shared/services/account/SessionService.js";
import { store } from "@shared/store/local-store.js";
import { Button, Field, Screen, Title } from "../src/components/ui.js";
import { useAppState } from "../src/state/AppState.js";
import { colors } from "../src/theme.js";

export default function Login() {
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
      if (isReg) await SessionService.register({ email: email.trim(), password, name: name.trim(), phone: phone.trim() });
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
    <Screen noNav>
      <View style={styles.center}>
        <Image source={require("../assets/logo.png")} style={styles.logo} />
        <Title>{isReg ? "Criar conta" : "Entrar"}</Title>
        <Text style={styles.muted}>Academia London Fitness</Text>
      </View>
      {isReg ? <Field label="Nome" value={name} onChangeText={setName} autoCapitalize="words" placeholder="Seu nome" /> : null}
      <Field label="E-mail" value={email} onChangeText={setEmail} keyboardType="email-address" placeholder="seu@email.com" />
      <Field label="Senha" value={password} onChangeText={setPassword} secureTextEntry placeholder={isReg ? "Mínimo 6 caracteres" : ""} />
      {isReg ? <Field label="Telefone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="11999999999" /> : null}
      {error ? <Text style={styles.err}>{error}</Text> : null}
      <Button label={busy ? "Aguarde..." : (isReg ? "Cadastrar" : "Entrar")} onPress={submit} disabled={busy} />
      <Button ghost label={isReg ? "Já tenho conta" : "Criar conta"} onPress={() => { setMode(isReg ? "login" : "register"); setError(""); }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", marginVertical: 20 },
  logo: { width: 110, height: 110, borderRadius: 55, marginBottom: 12 },
  muted: { color: colors.muted, marginTop: 6, marginBottom: 16 },
  err: { color: colors.red, marginBottom: 10, fontSize: 13 }
});
