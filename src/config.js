import { setApiBaseUrl } from "@shared/platform/env.js";

const PROD = "https://back-lodon-feat-production.up.railway.app";

export function resolveApiUrl() {
  const env = process.env.EXPO_PUBLIC_API_URL;
  if (env && String(env).trim()) return String(env).trim().replace(/\/$/, "");
  return PROD;
}

export function applyApiUrl() {
  setApiBaseUrl(resolveApiUrl());
  return resolveApiUrl();
}
