import { store } from "../../store/local-store.js";
import { ExerciseAnalytics } from "../analytics/ExerciseAnalytics.js";

function ids() {
  const state = store.get();
  if (!state.favorites) state.favorites = [];
  return state.favorites;
}

export const FavoriteService = {
  list() {
    return ids().slice();
  },

  has(id) {
    return ids().indexOf(id) >= 0;
  },

  toggle(id) {
    if (!id) return false;
    const list = ids();
    const i = list.indexOf(id);
    if (i >= 0) list.splice(i, 1);
    else list.push(id);
    store.persist();
    ExerciseAnalytics.track("exercise_favorite", id);
    return list.indexOf(id) >= 0;
  }
};
