import { createAudioPlayer, setAudioModeAsync } from "expo-audio";
import { store } from "@shared/store/local-store.js";

const SOUND = require("../../assets/sounds/rest-done.wav");

let player = null;
let playing = false;

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
}

export async function playRestAlertNow() {
  if (!soundOn() || playing) return;
  playing = true;
  try {
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
