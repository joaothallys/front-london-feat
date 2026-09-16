import { Platform } from "react-native";
import { requireOptionalNativeModule } from "expo";
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
  startedAt: 0,
  endsAt: 0,
  totalRest: 0,
  pendingAction: ""
};

let api = null;
let activity = null;
let unavailable = false;

function widgetsApi() {
  if (unavailable) return null;
  if (api) return api;
  if (Platform.OS !== "ios" || !requireOptionalNativeModule("ExpoWidgets")) {
    unavailable = true;
    return null;
  }
  try {
    api = {
      addUserInteractionListener: require("expo-widgets").addUserInteractionListener,
      live: require("../widgets/WorkoutLiveActivity").default,
      lock: require("../widgets/WorkoutLockWidget").default
    };
    return api;
  } catch (err) {
    unavailable = true;
    return null;
  }
}

export function subscribeWorkoutLiveActions(handlers) {
  const native = widgetsApi();
  if (!native) return () => {};
  try {
    const existing = native.live.getInstances()[0];
    if (existing) activity = existing;
    const sub = native.addUserInteractionListener((event) => {
      if (event.target === "skip") handlers.skipRest();
      else if (event.target === "next") handlers.goToNext();
    });
    return () => sub.remove();
  } catch (err) {
    return () => {};
  }
}

export function syncWorkoutLive(live) {
  const native = widgetsApi();
  if (!native) return;
  const props = workoutLiveProps(live) || Object.assign({}, IDLE_PROPS, { startedAt: Date.now() });
  try {
    native.lock.updateSnapshot(props);
  } catch (err) {}
  try {
    if (!live) {
      endWorkoutLive();
      return;
    }
    if (!activity) {
      const existing = native.live.getInstances()[0];
      activity = existing || native.live.start(props, SESSION_URL);
      if (existing) existing.update(props).catch(() => {});
      return;
    }
    activity.update(props).catch(() => {});
  } catch (err) {}
}

export function endWorkoutLive() {
  const native = widgetsApi();
  const current = activity || (native && native.live.getInstances()[0]);
  activity = null;
  if (!current || !current.end) return;
  current.end("immediate").catch(() => {});
}
