import { Platform } from "react-native";
import { requireOptionalNativeModule } from "expo";
import { exerciseOf, mediaUrl } from "../catalog.js";
import { workoutLiveProps } from "./workoutLiveProps.js";

const SESSION_URL = "londonfitness://session";
const IDLE_PROPS = {
  phase: "work",
  exerciseName: "LumenFit",
  nextExerciseName: "",
  exerciseIndex: 0,
  exerciseCount: 0,
  setIndex: 0,
  setCount: 0,
  kg: "0",
  reps: "0",
  restSeconds: 60,
  startedAt: 0,
  endsAt: 0,
  totalRest: 0,
  thumbPath: "",
  pendingAction: ""
};

let api = null;
let activity = null;
let unavailable = false;
let thumbCache = { id: "", path: "" };
let thumbToken = 0;

function isIpadDevice() {
  if (Platform.OS !== "ios") return false;
  if (Platform.isPad) return true;
  const idiom = Platform.constants && Platform.constants.interfaceIdiom;
  return idiom === "pad" || idiom === "tablet";
}

function widgetsSupported() {
  return Platform.OS === "ios" && !isIpadDevice();
}

function widgetsApi() {
  if (unavailable) return null;
  if (api) return api;
  if (!widgetsSupported() || !requireOptionalNativeModule("ExpoWidgets")) {
    unavailable = true;
    return null;
  }
  try {
    api = {
      addUserInteractionListener: require("expo-widgets").addUserInteractionListener,
      widgetsDirectory: require("expo-widgets").widgetsDirectory,
      live: require("../widgets/WorkoutLiveActivity").default,
      lock: require("../widgets/WorkoutLockWidget").default
    };
    return api;
  } catch (err) {
    unavailable = true;
    return null;
  }
}

async function shareThumb(exercise) {
  const native = widgetsApi();
  const id = exercise && exercise.id;
  if (!native || !native.widgetsDirectory || !id) return "";
  if (thumbCache.id === id && thumbCache.path) return thumbCache.path;
  const url = mediaUrl(exercise);
  if (!url) return "";
  try {
    const FileSystem = require("expo-file-system/legacy");
    const dest = String(native.widgetsDirectory).replace(/\/?$/, "/") + "live-" + String(id).replace(/[^a-zA-Z0-9_-]/g, "_") + ".img";
    try {
      await FileSystem.deleteAsync(dest, { idempotent: true });
    } catch (err) {}
    if (/^file:|^\/|^ph:/i.test(url)) {
      await FileSystem.copyAsync({ from: url, to: dest });
    } else {
      await FileSystem.downloadAsync(url, dest);
    }
    return dest;
  } catch (err) {
    return "";
  }
}

function publish(native, props, live) {
  try {
    native.lock.updateSnapshot(props);
  } catch (err) {}
  try {
    if (!live) {
      endWorkoutLive();
      return;
    }
    if (!activity) {
      try {
        const existing = native.live.getInstances()[0];
        activity = existing || native.live.start(props, SESSION_URL);
        if (existing) existing.update(props).catch(() => {});
      } catch (err) {
        unavailable = true;
        activity = null;
      }
      return;
    }
    activity.update(props).catch(() => {});
  } catch (err) {}
}

export function subscribeWorkoutLiveActions(handlers) {
  if (!handlers || !widgetsSupported()) return () => {};
  const native = widgetsApi();
  if (!native) return () => {};
  try {
    const existing = native.live.getInstances()[0];
    if (existing) activity = existing;
    const sub = native.addUserInteractionListener((event) => {
      if (event.target === "skip") handlers.skipRest();
      else if (event.target === "complete") handlers.completeCurrentSet();
      else if (event.target === "next") handlers.goToNext();
    });
    return () => sub.remove();
  } catch (err) {
    unavailable = true;
    return () => {};
  }
}

export function syncWorkoutLive(live) {
  if (!live) {
    endWorkoutLive();
    return;
  }
  if (!widgetsSupported()) return;
  const native = widgetsApi();
  if (!native) return;
  const item = live.items && live.items[live.index];
  const exercise = item ? exerciseOf(item.id) : null;
  const cached = exercise && thumbCache.id === exercise.id ? thumbCache.path : "";
  const props = workoutLiveProps(live, { thumbPath: cached }) || Object.assign({}, IDLE_PROPS, { startedAt: Date.now() });
  publish(native, props, live);
  if (!exercise) return;
  const token = ++thumbToken;
  shareThumb(exercise).then((path) => {
    if (!path || token !== thumbToken) return;
    thumbCache = { id: exercise.id, path };
    const next = workoutLiveProps(live, { thumbPath: path });
    if (next) publish(native, next, live);
  });
}

export function endWorkoutLive() {
  const current = activity;
  activity = null;
  if (current && current.end) current.end("immediate").catch(() => {});
  const native = widgetsApi();
  if (!native) return;
  try {
    native.live.getInstances().forEach((instance) => {
      if (instance && instance.end) instance.end("immediate").catch(() => {});
    });
  } catch (err) {}
}
