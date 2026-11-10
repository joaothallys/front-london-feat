import { setApiBaseUrl } from "@shared/platform/env.js";

const PROD = "https://back-lodon-feat-production.up.railway.app";
const WEB = "https://www.lumenfit.com.br";

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

// App ID da Meta (developers.facebook.com). O Instagram só abre o editor de
// Stories com a imagem pronta quando recebe esse ID; sem ele o app usa a
// folha de compartilhar do sistema.
export const FACEBOOK_APP_ID = (process.env.EXPO_PUBLIC_FACEBOOK_APP_ID || "").trim();

// Perfil do Instagram que reposta os treinos.
export const INSTAGRAM_HANDLE = (process.env.EXPO_PUBLIC_INSTAGRAM_HANDLE || "londonfitness").replace(/^@/, "");
