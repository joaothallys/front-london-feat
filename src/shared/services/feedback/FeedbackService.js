import { store } from "../../store/local-store.js";
import { api } from "../../api/client.js";
import { SessionService } from "../account/SessionService.js";

function normalize(raw, id) {
  if (!raw) return null;
  if (raw === "liked" || raw === "positive") {
    return { exerciseId: id, userId: "", feedback: "positive", createdAt: "" };
  }
  if (raw === "disliked" || raw === "negative") {
    return { exerciseId: id, userId: "", feedback: "negative", createdAt: "" };
  }
  if (raw.feedback === "positive" || raw.feedback === "negative") return raw;
  return null;
}

export const FeedbackService = {
  get(id) {
    const entry = normalize(store.get().feedback[id], id);
    return entry ? entry.feedback : "";
  },

  set(id, feedback) {
    if (!id || (feedback !== "positive" && feedback !== "negative")) return null;
    const state = store.get();
    if (!state.feedback) state.feedback = {};
    const entry = {
      exerciseId: id,
      userId: state.session ? "local-session" : "",
      feedback,
      createdAt: new Date().toISOString()
    };
    state.feedback[id] = entry;
    store.persist();
    if (SessionService.hasToken()) api.feedback.set(id, feedback).catch(() => {});
    return entry;
  }
};
