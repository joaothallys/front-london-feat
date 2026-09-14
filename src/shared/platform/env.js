let overrideBase = "";

export function setApiBaseUrl(url) {
  overrideBase = String(url || "").trim().replace(/\/$/, "");
}

function readViteEnv(name) {
  try {
    const env = Function("return typeof import.meta !== 'undefined' && import.meta.env || null")();
    if (env && env[name] != null) return String(env[name]);
  } catch (err) {}
  return "";
}

export function readEnv(name) {
  const fromVite = readViteEnv(name);
  if (fromVite) return fromVite;
  try {
    if (typeof process !== "undefined" && process.env && process.env[name] != null) {
      return String(process.env[name]);
    }
  } catch (err) {}
  return "";
}

export function apiBaseUrl() {
  if (overrideBase) return overrideBase;
  const raw = readEnv("EXPO_PUBLIC_API_URL") || readEnv("VITE_API_URL") || "";
  const value = String(raw || "").trim().replace(/\/$/, "");
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  return "https://" + value;
}

export function isReactNative() {
  return typeof navigator !== "undefined" && navigator.product === "ReactNative";
}

export function clientDevice() {
  try {
    const { Platform } = require("react-native");
    if (Platform && Platform.OS === "android") return "android";
    if (Platform && Platform.OS === "ios") return "ios";
    if (Platform && Platform.OS === "web") return "web";
  } catch (err) {}
  return isReactNative() ? "ios" : "web";
}
