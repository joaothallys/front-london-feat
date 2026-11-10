import { router } from "expo-router";
import { muscleArt } from "@shared/domain/muscle-art.js";
import { exerciseOf } from "../catalog.js";
import { shareItem } from "./shareLink.js";
import { summaryFromWorkout } from "./shareSummary.js";

export function presentSummary(local, remote) {
  const summary = summaryFromWorkout(local, remote);
  if (!summary) return null;
  const shareItems = (summary.shareItems || []).map((item) => {
    const built = shareItem(item.id, item.sets, item.rest);
    const keepName = item.name && item.name !== item.id;
    return Object.assign({}, built, item, {
      name: keepName ? item.name : (built.name || item.name),
      gifUrl: item.gifUrl || built.gifUrl,
      sourceId: item.sourceId || built.sourceId,
      muscle: item.muscle || built.muscle,
      equipment: item.equipment || built.equipment
    });
  });
  const lines = (summary.lines || []).map((line) => {
    const known = exerciseOf(line.id);
    if (!known || !known.name || (line.name && line.name !== line.id)) return line;
    return Object.assign({}, line, { name: known.name });
  });
  const muscles = (summary.muscles || []).slice();
  if (!muscles.length) {
    const seen = {};
    shareItems.forEach((item) => {
      const art = muscleArt(item.muscle);
      if (!art || seen[art.label]) return;
      seen[art.label] = true;
      muscles.push(art.label);
    });
  }
  return Object.assign({}, summary, { shareItems, lines, muscles });
}

export function openWorkoutShare(local, remote, setSummary) {
  const summary = presentSummary(local, remote);
  if (!summary || !summary.id || !setSummary) return;
  setSummary(summary);
  router.push({ pathname: "/summary", params: { history: String(summary.id) } });
}
