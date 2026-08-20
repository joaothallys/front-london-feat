import { LEVELS, EQUIPMENT_FILTERS, SORT_OPTIONS } from "@shared/types/exercise.js";

function optionLabel(list, id) {
  const hit = list.find((item) => item.id === id);
  return hit ? hit.label : id;
}

export function ExerciseFilters(state) {
  const level = (state && state.level) || "todos";
  const equipment = (state && state.equipment) || "academia";
  const sort = (state && state.sort) || "popularidade";
  const sheet = state && state.sheet;
  return `
    <div class="chest-filters">
      <button type="button" class="filter-pill" data-act="chest-sheet" data-v="level">${optionLabel(LEVELS, level)}</button>
      <button type="button" class="filter-pill" data-act="chest-sheet" data-v="equipment">${optionLabel(EQUIPMENT_FILTERS, equipment)}</button>
    </div>
    ${sheet === "level" ? sheetList("level", LEVELS, level) : ""}
    ${sheet === "equipment" ? sheetList("equipment", EQUIPMENT_FILTERS, equipment) : ""}
    ${sheet === "sort" ? sheetList("sort", SORT_OPTIONS, sort) : ""}
  `;
}

function sheetList(key, items, current) {
  return `<div class="filter-sheet">
    ${items.map((item) => `<button type="button" class="filter-opt ${item.id === current ? "on" : ""}" data-act="chest-filter" data-k="${key}" data-v="${item.id}">${item.label}</button>`).join("")}
  </div>`;
}

export function ExerciseSortBar(count, sort) {
  const current = SORT_OPTIONS.find((item) => item.id === sort) || SORT_OPTIONS[0];
  return `<div class="chest-meta">
    <p>${count} exercício${count === 1 ? "" : "s"}</p>
    <button type="button" class="sort-link" data-act="chest-sheet" data-v="sort">Ordenado por ${current.label}</button>
  </div>`;
}
