import React, { useEffect, useState } from "react";
import { Alert, Image, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { SessionService } from "@shared/services/account/SessionService.js";
import { BiometricService } from "@shared/services/account/BiometricService.js";
import { useGoogleSignIn } from "@shared/services/account/GoogleAuthService.js";
import { signInWithApple } from "@shared/services/account/AppleAuthService.js";
import { isAuthCanceled, isExistingSocialAccount, passwordAuthMessage, socialAuthMessage } from "@shared/services/account/socialAuth.js";
import { applyGymChoice, LONDON_FIT_ID } from "@shared/domain/locations.js";
import { store } from "@shared/store/local-store.js";
import { Button, Field } from "../src/components/ui.js";
import { HapticPressable } from "../src/components/HapticPressable.js";
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
  const { scheme } = useTheme();
  const styles = useStyles(styleFactory);
  const { state, refresh } = useAppState();
  const google = useGoogleSignIn();
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState(state.profile.email && state.profile.email.indexOf("londonfitness.com") < 0 ? state.profile.email : "");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [gymId, setGymId] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [busy, setBusy] = useState("");
  const [faceLabel, setFaceLabel] = useState("Face ID");
  const isReg = mode === "register";
  const locked = !!busy;
  const showApple = Platform.OS === "ios";

  async function afterAuth(json, chosenGym) {
    if (isExistingSocialAccount(json)) {
      setMode("login");
      setToast("Você já tem uma conta. Entrando…");
      await new Promise((ok) => setTimeout(ok, 900));
    }
    await SessionService.hydrate(state);
    if (chosenGym !== undefined) applyGymChoice(state, chosenGym);
    store.login({ userId: state.session && state.session.userId });
    refresh();
    const done = !!(state.onboardingDone || (json && json.data && json.data.onboardingDone));
    router.replace(done ? "/(tabs)/home" : "/onboarding");
  }

  useEffect(() => {
    let live = true;
    (async () => {
      const label = await BiometricService.label();
      if (!live) return;
      setFaceLabel(label);
      const can = await BiometricService.canUse();
      const on = await BiometricService.isEnabled();
      const creds = await BiometricService.credentials();
      if (!live || !can || !on || !creds) return;
      if (!BiometricService.consumeAutoLogin()) return;
      setBusy("face");
      try {
        const ok = await BiometricService.authenticate("Entrar no LumenFit com " + label);
        if (!live || !ok) return;
        await SessionService.login(creds.email, creds.password);
        if (!live) return;
        await afterAuth();
      } catch (err) {
        if (live) setError(passwordAuthMessage(err));
      } finally {
        if (live) setBusy("");
      }
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
    setBusy("email");
    try {
      if (isReg) {
        await SessionService.register({
          email: email.trim(),
          password,
          name: name.trim(),
          phone: phone.replace(/\D/g, ""),
          gymUnitId: gymId || undefined,
          gymName: gymId === LONDON_FIT_ID ? "Academia London Fit" : undefined
        });
      } else {
        await SessionService.login(email.trim(), password);
      }
      await SessionService.hydrate(state);
      if (isReg) applyGymChoice(state, gymId);
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
      if (isReg && err && err.status === 409) setMode("login");
      setError(passwordAuthMessage(err));
    } finally {
      setBusy("");
    }
  }

  async function onGoogle() {
    if (locked || !google.ready) return;
    setError("");
    setBusy("google");
    try {
      const tokens = await google.signIn();
      const json = await SessionService.loginWithGoogle(tokens);
      await afterAuth(json, isReg ? gymId : undefined);
    } catch (err) {
      if (!isAuthCanceled(err)) setError(socialAuthMessage(err));
    } finally {
      setBusy("");
    }
  }

  async function onApple() {
    if (locked) return;
    setError("");
    setBusy("apple");
    try {
      const payload = await signInWithApple();
      const json = await SessionService.loginWithApple(payload);
      await afterAuth(json, isReg ? gymId : undefined);
    } catch (err) {
      if (!isAuthCanceled(err)) setError(socialAuthMessage(err));
    } finally {
      setBusy("");
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
          {isReg ? (
            <View style={styles.gymBlock}>
              <Text style={styles.gymLabel}>Academia</Text>
              <Text style={styles.gymHint}>Opcional. Você pode entrar sem vincular, ou dizer que é aluno da London Fit.</Text>
              <View style={styles.gymRow}>
                <HapticPressable
                  style={[styles.gymCard, !gymId && styles.gymCardOn]}
                  onPress={() => setGymId("")}
                >
                  <Text style={[styles.gymTitle, !gymId && styles.gymTitleOn]}>Nenhuma</Text>
                  <Text style={styles.gymSub}>Sem academia específica</Text>
                </HapticPressable>
                <HapticPressable
                  style={[styles.gymCard, gymId === LONDON_FIT_ID && styles.gymCardOn]}
                  onPress={() => setGymId(LONDON_FIT_ID)}
                >
                  <Text style={styles.gymTag}>Homologada</Text>
                  <Text style={[styles.gymTitle, gymId === LONDON_FIT_ID && styles.gymTitleOn]}>London Fit</Text>
                  <Text style={styles.gymSub}>Sou aluno de lá</Text>
                </HapticPressable>
              </View>
            </View>
          ) : null}
          {error ? <Text style={styles.err}>{error}</Text> : null}
          <Button label={busy === "email" ? "Aguarde..." : (isReg ? "Cadastrar" : "Entrar")} onPress={submit} disabled={locked} />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerTxt}>ou</Text>
            <View style={styles.dividerLine} />
          </View>

          <Text style={styles.socialHint}>
            {showApple
              ? "No iPhone você pode entrar com Google ou com a Apple."
              : "Entre também com a sua conta Google."}
          </Text>

          <View style={[styles.socialRow, !showApple && styles.socialStack]}>
            <HapticPressable
              style={[styles.social, styles.google, showApple ? styles.socialHalf : styles.socialFull, (locked || !google.ready) && styles.socialOff]}
              disabled={locked || !google.ready}
              onPress={onGoogle}
            >
              <Ionicons name="logo-google" size={15} color="#1f1f1f" />
              <Text style={styles.googleTxt}>{busy === "google" ? "Aguarde..." : "Google"}</Text>
            </HapticPressable>

            {showApple ? (
              <HapticPressable
                style={[
                  styles.social,
                  styles.socialHalf,
                  scheme === "light" ? styles.appleLight : styles.appleDark,
                  locked && styles.socialOff
                ]}
                disabled={locked}
                onPress={onApple}
              >
                <Ionicons name="logo-apple" size={16} color={scheme === "light" ? "#ffffff" : "#1f1f1f"} />
                <Text style={scheme === "light" ? styles.appleTxtLight : styles.appleTxtDark}>
                  {busy === "apple" ? "Aguarde..." : "Apple"}
                </Text>
              </HapticPressable>
            ) : null}
          </View>
      </ScrollView>
      {toast ? (
        <View pointerEvents="none" style={styles.toastWrap}>
          <View style={styles.toast}>
            <Text style={styles.toastTxt}>{toast}</Text>
          </View>
        </View>
      ) : null}
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
  err: { color: c.red, marginBottom: 10, fontSize: 13 },
  gymBlock: { marginBottom: 14 },
  gymLabel: { color: c.muted, fontSize: 12, fontWeight: "600", marginBottom: 6 },
  gymHint: { color: c.muted, fontSize: 12, lineHeight: 17, marginBottom: 10 },
  gymRow: { flexDirection: "row", gap: 8 },
  gymCard: { flex: 1, backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, borderRadius: 14, padding: 12 },
  gymCardOn: { borderColor: c.red, backgroundColor: c.redSoft },
  gymTag: { color: c.red, fontSize: 10, fontWeight: "800", letterSpacing: 0.6, textTransform: "uppercase", marginBottom: 4 },
  gymTitle: { color: c.text, fontWeight: "800", fontSize: 15 },
  gymTitleOn: { color: c.text },
  gymSub: { color: c.muted, fontSize: 12, marginTop: 4, lineHeight: 16 },
  divider: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 18, marginBottom: 8 },
  dividerLine: { flex: 1, height: 1, backgroundColor: c.line },
  dividerTxt: { color: c.muted, fontSize: 12, fontWeight: "700", letterSpacing: 0.8, textTransform: "uppercase" },
  socialHint: { color: c.muted, fontSize: 13, textAlign: "center", lineHeight: 18, marginBottom: 10 },
  socialRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  socialStack: { flexDirection: "column" },
  social: { height: 40, borderRadius: 10, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  socialHalf: { flex: 1 },
  socialFull: { alignSelf: "stretch" },
  socialOff: { opacity: 0.5 },
  google: { backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#ffffff" },
  googleTxt: { color: "#1f1f1f", fontWeight: "700", fontSize: 13 },
  appleDark: { backgroundColor: "#ffffff" },
  appleLight: { backgroundColor: "#000000" },
  appleTxtDark: { color: "#1f1f1f", fontWeight: "700", fontSize: 13 },
  appleTxtLight: { color: "#ffffff", fontWeight: "700", fontSize: 13 },
  toastWrap: { position: "absolute", left: 16, right: 16, bottom: 28, alignItems: "center" },
  toast: { backgroundColor: c.surface3, borderWidth: 1, borderColor: c.line, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, maxWidth: 360 },
  toastTxt: { color: c.text, fontWeight: "700", fontSize: 14, textAlign: "center" }
};
}
