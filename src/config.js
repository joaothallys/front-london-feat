import { setApiBaseUrl } from "@shared/platform/env.js";

const PROD = "https://back-lodon-feat-production.up.railway.app";
const WEB = "https://lumenfit-web.vercel.app";

export function resolveApiUrl() {
  const env = process.env.EXPO_PUBLIC_API_URL;
  if (env && String(env).trim()) return String(env).trim().replace(/\/$/, "");
  return PROD;
}

export function resolveWebUrl() {
  const env = process.env.EXPO_PUBLIC_WEB_URL;
  if (env && String(env).trim()) return String(env).trim().replace(/\/$/, "");
  return WEB;
}

export function applyApiUrl() {
  setApiBaseUrl(resolveApiUrl());
  return resolveApiUrl();
}

// Link do app no texto de compartilhamento. Defina EXPO_PUBLIC_APP_STORE_URL
// (https://apps.apple.com/br/app/...) quando tiver o link da loja; até lá usa o site.
export function resolveStoreUrl() {
  const env = process.env.EXPO_PUBLIC_APP_STORE_URL;
  if (env && String(env).trim()) return String(env).trim();
  return resolveWebUrl();
}

// Perfil do Instagram que reposta os treinos.
export const INSTAGRAM_HANDLE = (process.env.EXPO_PUBLIC_INSTAGRAM_HANDLE || "londonfitness").replace(/^@/, "");
