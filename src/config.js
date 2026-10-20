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
