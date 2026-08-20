export function ExerciseSearch(value) {
  return `<div class="search chest-search">
    <span>⌕</span>
    <input id="chest-q" type="search" placeholder="Buscar exercício" value="${String(value || "").replace(/"/g, "&quot;")}">
  </div>`;
}
