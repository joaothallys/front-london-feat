import { Platform } from "react-native";
import { readEnv } from "../platform/env.js";

const ANDROID = "1053297902526-tvi162hl38lg33fltjt2ousvlaulof2a.apps.googleusercontent.com";
const IOS = "1053297902526-k4ugspt500kb8re2u2jok3d2dv57v37h.apps.googleusercontent.com";
const WEB = "1053297902526-qenpb3q0jnc07e1jj4494nb4hftgisal.apps.googleusercontent.com";

export const GOOGLE_CLIENTS = {
  android: readEnv("EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID") || ANDROID,
  ios: readEnv("EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID") || IOS,
  web: readEnv("EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID") || WEB
};

export function googleClientId() {
  return Platform.select({
    ios: GOOGLE_CLIENTS.ios,
    android: GOOGLE_CLIENTS.android,
    default: GOOGLE_CLIENTS.web
  });
}

export function googleReversedIosScheme(clientId) {
  const id = String(clientId || GOOGLE_CLIENTS.ios).replace(".apps.googleusercontent.com", "");
  return "com.googleusercontent.apps." + id;
}

export function googleNativeRedirect() {
  if (Platform.OS === "ios") {
    return googleReversedIosScheme(GOOGLE_CLIENTS.ios) + ":/oauth2redirect";
  }
  if (Platform.OS === "android") {
    return "com.londonfitness.app:/oauth2redirect/google";
  }
  return "";
}
