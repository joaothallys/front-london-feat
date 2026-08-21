import { store } from "../../store/local-store.js";
import { api } from "../../api/client.js";
import { SessionService } from "../account/SessionService.js";

const MAX = 200;

function queue() {
  const state = store.get();
  if (!state.analytics) state.analytics = [];
  return state.analytics;
}

export const ExerciseAnalytics = {
  track(event, exerciseId, extra) {
    const state = store.get();
    const item = Object.assign({
      event: event,
      exerciseId: exerciseId || "",
      userId: state.session ? "local-session" : "",
      timestamp: new Date().toISOString()
    }, extra || {});
    const list = queue();
    list.push(item);
    if (list.length > MAX) list.splice(0, list.length - MAX);
    store.persist();
    if (SessionService.hasToken()) {
      api.analytics.track({ event, exerciseId: exerciseId || "", payload: extra || {} }).catch(() => {});
    }
    return item;
  },

  list() {
    return queue().slice();
  }
};
