import { useMemo } from "react";
import { Platform } from "react-native";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { googleClientId, googleNativeRedirect } from "../../auth/oauth.js";

WebBrowser.maybeCompleteAuthSession();

function decodeJwt(token) {
  try {
    const payload = String(token || "").split(".")[1];
    if (!payload) return {};
    const padded = payload.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - payload.length % 4) % 4);
    if (typeof atob !== "function") return {};
    return JSON.parse(atob(padded)) || {};
  } catch (err) {
    return {};
  }
}

function cancelErr() {
  const err = new Error("canceled");
  err.code = "canceled";
  return err;
}

export function useGoogleSignIn() {
  const clientId = googleClientId();
  const native = googleNativeRedirect();
  const redirectUri = AuthSession.makeRedirectUri(native ? { native } : {});
  const discovery = AuthSession.useAutoDiscovery("https://accounts.google.com");
  const config = useMemo(() => ({
    clientId,
    redirectUri,
    responseType: AuthSession.ResponseType.Code,
    usePKCE: true,
    scopes: ["openid", "profile", "email"]
  }), [clientId, redirectUri]);
  const [request, , promptAsync] = AuthSession.useAuthRequest(config, discovery);

  async function signIn() {
    if (!request || !discovery) {
      const err = new Error("Google Sign-In não está pronto.");
      err.status = 400;
      throw err;
    }
    const result = await promptAsync();
    if (!result || result.type === "cancel" || result.type === "dismiss") throw cancelErr();
    if (result.type !== "success" || !result.params || !result.params.code) {
      const err = new Error("Não foi possível validar o login. Tente de novo.");
      err.status = 401;
      throw err;
    }
    const tokens = await AuthSession.exchangeCodeAsync({
      clientId,
      code: result.params.code,
      redirectUri,
      extraParams: { code_verifier: request.codeVerifier }
    }, discovery);
    const idToken = tokens.idToken || "";
    const accessToken = tokens.accessToken || "";
    if (!idToken && !accessToken) {
      const err = new Error("idToken ou accessToken é obrigatório");
      err.status = 400;
      throw err;
    }
    const claims = decodeJwt(idToken);
    const name = claims.name || [claims.given_name, claims.family_name].filter(Boolean).join(" ").trim();
    return {
      idToken,
      accessToken,
      name,
      device: Platform.select({ ios: "ios", android: "android", default: "web" })
    };
  }

  return { ready: !!(request && discovery), signIn };
}
