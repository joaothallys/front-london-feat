import { catalog as D } from "@shared/catalog/index.js";
import { ChestLibraryService } from "@shared/services/exercises/ChestLibraryService.js";
import { catalogToAppView } from "@shared/data/exercises/exerciseCatalog.js";
import { getCached, isLondonId, stubView } from "@shared/services/exercises/LondonExercise.js";

export function registerCatalog() {
  ChestLibraryService.all().forEach((ex) => {
    const view = catalogToAppView(ex);
    if (!view) return;
    D.byId[ex.id] = view;
    if (ex.sourceId) D.byId[ex.sourceId] = view;
    if (!D.exercises.some((item) => item.id === view.id)) D.exercises.push(view);
  });
  return D;
}

export function exerciseOf(id) {
  if (!id) return null;
  const cached = getCached(id);
  if (cached) return cached;
  const local = D.byId[id] || catalogToAppView(ChestLibraryService.get(id));
  if (local) return local;
  return isLondonId(id) ? stubView(id) : null;
}

export function mediaUrl(ex, opts) {
  if (!ex) return "";
  const sizes = ex.imageUrls || {};
  const gif = ex.gifUrl || ex.gif || (ex.media && ex.media.type !== "image" ? ex.media.url : "") || "";
  const still = ex.imageUrl || sizes["480p"] || sizes["360p"] || "";
  if (opts && opts.preferGif) return gif || still || (ex.media && ex.media.url) || "";
  return still || gif || (ex.media && ex.media.url) || "";
}

export { D };
