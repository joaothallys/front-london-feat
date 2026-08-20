import { ExerciseCard } from "./ExerciseCard.js";

export function ExerciseGrid(list) {
  if (!list || !list.length) {
    return `<div class="empty">Nenhum exercício encontrado.</div>`;
  }
  return `<div class="ex-grid">${list.map(ExerciseCard).join("")}</div>`;
}
