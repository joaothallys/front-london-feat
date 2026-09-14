import * as AppleAuthentication from "expo-apple-authentication";
import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const NAME_KEY = "lumen.apple.name.";

function cancelErr() {
  const err = new Error("canceled");
  err.code = "canceled";
  return err;
}

async function rawNonce() {
  const bytes = await Crypto.getRandomBytesAsync(16);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function formatName(fullName) {
  if (!fullName) return "";
  try {
    const formatted = AppleAuthentication.formatFullName(fullName);
    if (formatted && String(formatted).trim()) return String(formatted).trim();
  } catch (err) {}
  return [fullName.givenName, fullName.middleName, fullName.familyName].filter(Boolean).join(" ").trim();
}

export async function appleAvailable() {
  return Platform.OS === "ios";
}

export async function signInWithApple() {
  if (Platform.OS !== "ios") {
    const err = new Error("A Apple só está disponível no iPhone.");
    err.code = "apple_unavailable";
    throw err;
  }
  let nativeOk = false;
  try {
    nativeOk = await AppleAuthentication.isAvailableAsync();
  } catch (err) {
    nativeOk = false;
  }
  if (!nativeOk) {
    const err = new Error("Para entrar com a Apple, use o app instalado (TestFlight ou App Store).");
    err.code = "apple_unavailable";
    throw err;
  }
  const nonce = await rawNonce();
  const hashedNonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, nonce);
  let credential;
  try {
    credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL
      ],
      nonce: hashedNonce
    });
  } catch (err) {
    const code = String(err && err.code || "");
    if (code === "ERR_REQUEST_CANCELED" || code === "ERR_CANCELED" || code === "1001") throw cancelErr();
    throw err;
  }
  if (!credential || !credential.identityToken) {
    const err = new Error("identityToken é obrigatório");
    err.status = 400;
    throw err;
  }
  let name = formatName(credential.fullName);
  if (credential.user) {
    try {
      if (name) await SecureStore.setItemAsync(NAME_KEY + credential.user, name);
      else name = (await SecureStore.getItemAsync(NAME_KEY + credential.user)) || "";
    } catch (err) {}
  }
  const payload = {
    identityToken: credential.identityToken,
    nonce,
    device: "ios"
  };
  if (name) payload.name = name;
  if (credential.email) payload.email = credential.email;
  return payload;
}
