import { ChestLibraryService } from "@shared/services/exercises/ChestLibraryService.js";
import { ExerciseSearch } from "../../components/exercises/ExerciseSearch.js";
import { ExerciseFilters, ExerciseSortBar } from "../../components/exercises/ExerciseFilters.js";
import { ExerciseGrid } from "../../components/exercises/ExerciseGrid.js";
import { observeExerciseMedia } from "../../components/exercises/ExerciseMedia.js";

export const chestState = {
  q: "",
  level: "todos",
  equipment: "todos",
  sort: "popularidade",
  sheet: ""
};

let timer = null;

export function renderChestLibrary(ctx) {
  const list = ChestLibraryService.query(chestState);
  ctx.root().innerHTML = `<div class="screen rise chest-screen">
    <div class="topbar">
      <button class="back-btn" data-go="#/library">${ctx.icons.back}</button>
      <h1 class="page-title grow">Peito</h1>
      <button class="icon-btn" data-act="chest-focus-search" aria-label="Pesquisar">${ctx.icons.search || "⌕"}</button>
    </div>
    ${ExerciseSearch(chestState.q)}
    ${ExerciseFilters(chestState)}
    ${ExerciseSortBar(list.length, chestState.sort)}
    ${ExerciseGrid(list)}
  </div>${ctx.nav("library")}`;

  observeExerciseMedia(ctx.root());
  const input = ctx.root().querySelector("#chest-q");
  if (input) {
    input.addEventListener("input", (ev) => {
      chestState.q = ev.target.value;
      clearTimeout(timer);
      timer = setTimeout(() => renderChestLibrary(ctx), 80);
    });
  }
}

export function handleChestAction(act, target, ctx) {
  if (act === "chest-focus-search") {
    const input = ctx.root().querySelector("#chest-q");
    if (input) input.focus();
    return true;
  }
  if (act === "chest-sheet") {
    const next = target.dataset.v;
    chestState.sheet = chestState.sheet === next ? "" : next;
    renderChestLibrary(ctx);
    return true;
  }
  if (act === "chest-filter") {
    const key = target.dataset.k;
    chestState[key] = target.dataset.v;
    chestState.sheet = "";
    renderChestLibrary(ctx);
    return true;
  }
  return false;
}

export async function bootChestLibrary(ctx) {
  if (typeof ctx.registerCatalog === "function") ctx.registerCatalog();
  renderChestLibrary(ctx);
  await ChestLibraryService.hydrate();
  if (typeof ctx.registerCatalog === "function") ctx.registerCatalog();
  if ((location.hash || "").indexOf("library/peito") >= 0) renderChestLibrary(ctx);
}
