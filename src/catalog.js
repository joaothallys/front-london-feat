import { catalog as D } from "@shared/catalog/index.js";
import { ChestLibraryService } from "@shared/services/exercises/ChestLibraryService.js";
import { catalogToAppView } from "@shared/data/exercises/exerciseCatalog.js";

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
  return D.byId[id] || catalogToAppView(ChestLibraryService.get(id)) || null;
}

export function mediaUrl(ex) {
  if (!ex) return "";
  return ex.gifUrl || ex.gif || (ex.media && ex.media.url) || "";
}

export { D };
