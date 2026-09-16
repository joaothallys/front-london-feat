import { AppState } from "react-native";
import { createAudioPlayer, setAudioModeAsync } from "expo-audio";
import * as Notifications from "expo-notifications";
import { store } from "@shared/store/local-store.js";

const NOTE_ID = "lumenfit-rest-done";
const SOUND = require("../../assets/sounds/rest-done.wav");

let player = null;
let playing = false;
let handlerReady = false;

function soundOn() {
  const s = store.get();
  if (s.profile && s.profile.sound === false) return false;
  if (s.settings && s.settings.sound === false) return false;
  return true;
}

export function isRestSoundOn() {
  return soundOn();
}

export function setRestSoundOn(on) {
  const s = store.get();
  if (!s.profile) s.profile = {};
  if (!s.settings) s.settings = {};
  s.profile.sound = !!on;
  s.settings.sound = !!on;
  if (!on) disarmRestAlert();
}

function ensureHandler() {
  if (handlerReady) return;
  handlerReady = true;
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => {
        const active = AppState.currentState === "active";
        return {
          shouldShowBanner: !active,
          shouldShowList: true,
          shouldPlaySound: !active,
          shouldSetBadge: false
        };
      }
    });
  } catch (err) {}
}

export async function requestRestAlertPermission() {
  ensureHandler();
  try {
    const cur = await Notifications.getPermissionsAsync();
    if (cur.status === "granted" || cur.granted) return true;
    const next = await Notifications.requestPermissionsAsync();
    return next.status === "granted" || !!next.granted;
  } catch (err) {
    return false;
  }
}

export async function armRestAlert(endsAt, body) {
  ensureHandler();
  await disarmRestAlert();
  if (!soundOn() || !endsAt) return;
  const seconds = Math.max(1, Math.round((Number(endsAt) - Date.now()) / 1000));
  try {
    const allowed = await requestRestAlertPermission();
    if (!allowed) return;
    await Notifications.scheduleNotificationAsync({
      identifier: NOTE_ID,
      content: {
        title: "Intervalo acabou",
        body: body || "Hora da próxima série",
        sound: "rest-done.wav",
        interruptionLevel: "timeSensitive"
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds,
        repeats: false
      }
    });
  } catch (err) {}
}

export async function disarmRestAlert() {
  try {
    await Notifications.cancelScheduledNotificationAsync(NOTE_ID);
  } catch (err) {}
}

export async function playRestAlertNow() {
  if (!soundOn() || playing) return;
  playing = true;
  try {
    await disarmRestAlert();
    await setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: "duckOthers",
      shouldPlayInBackground: false
    });
    if (player) {
      try { player.release(); } catch (err) {}
      player = null;
    }
    player = createAudioPlayer(SOUND);
    player.volume = 1;
    const sub = player.addListener("playbackStatusUpdate", (status) => {
      if (!(status && status.didJustFinish)) return;
      try { sub.remove(); } catch (err) {}
      try { player && player.release(); } catch (err) {}
      player = null;
      playing = false;
    });
    player.play();
  } catch (err) {
    playing = false;
  }
  setTimeout(() => { playing = false; }, 2500);
}
