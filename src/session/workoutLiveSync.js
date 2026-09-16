import { Platform } from "react-native";
import { addUserInteractionListener } from "expo-widgets";
import WorkoutLiveActivity from "../widgets/WorkoutLiveActivity";
import WorkoutLockWidget from "../widgets/WorkoutLockWidget";
import { workoutLiveProps } from "./workoutLiveProps.js";

const SESSION_URL = "londonfitness://session";

let activity = null;

function iosReady() {
  return Platform.OS === "ios";
}

export function subscribeWorkoutLiveActions(handlers) {
  if (!iosReady()) return () => {};
  try {
    const existing = WorkoutLiveActivity.getInstances()[0];
    if (existing) activity = existing;
    const sub = addUserInteractionListener((event) => {
      if (event.target === "skip") handlers.skipRest();
      else if (event.target === "next") handlers.goToNext();
    });
    return () => sub.remove();
  } catch (err) {
    return () => {};
  }
}

export function syncWorkoutLive(live) {
  if (!iosReady()) return;
  const props = workoutLiveProps(live) || {
    phase: "work",
    exerciseName: "LumenFit",
    nextExerciseName: "",
    exerciseIndex: 0,
    exerciseCount: 0,
    setIndex: 0,
    setCount: 0,
    startedAt: Date.now(),
    endsAt: 0,
    totalRest: 0,
    pendingAction: ""
  };
  try {
    WorkoutLockWidget.updateSnapshot(props);
  } catch (err) {}
  try {
    if (!live) {
      endWorkoutLive();
      return;
    }
    if (!activity) {
      const existing = WorkoutLiveActivity.getInstances()[0];
      activity = existing || WorkoutLiveActivity.start(props, SESSION_URL);
      if (existing) existing.update(props).catch(() => {});
      return;
    }
    activity.update(props).catch(() => {});
  } catch (err) {}
}

export function endWorkoutLive() {
  if (!iosReady()) return;
  const current = activity || (WorkoutLiveActivity.getInstances && WorkoutLiveActivity.getInstances()[0]);
  activity = null;
  if (!current || !current.end) return;
  current.end("immediate").catch(() => {});
}
