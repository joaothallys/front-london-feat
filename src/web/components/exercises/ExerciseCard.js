import { ExerciseMedia } from "./ExerciseMedia.js";
import { FavoriteButton } from "./FavoriteButton.js";

export function ExerciseCard(exercise) {
  const ex = exercise || {};
  return `<article class="ex-card">
    <a class="ex-card-link" href="#/exercicios/${ex.id}">
      ${ExerciseMedia(ex, "ex-card-media")}
      <div class="ex-card-meta">
        <h3>${ex.displayName || ""}</h3>
      </div>
    </a>
    ${FavoriteButton(ex.id, "ex-card-fav")}
  </article>`;
}
