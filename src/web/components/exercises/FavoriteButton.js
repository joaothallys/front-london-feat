import { FavoriteService } from "@shared/services/favorites/FavoriteService.js";

export function FavoriteButton(id, extraClass) {
  const on = FavoriteService.has(id);
  return `<button type="button" class="fav-btn ${extraClass || ""} ${on ? "on" : ""}" data-act="fav-card" data-id="${id}" aria-label="${on ? "Remover dos favoritos" : "Favoritar"}">${on ? "★" : "☆"}</button>`;
}

export function syncFavoriteButton(root, id) {
  const on = FavoriteService.has(id);
  (root || document).querySelectorAll('.fav-btn[data-id="' + id + '"]').forEach((btn) => {
    btn.classList.toggle("on", on);
    btn.textContent = on ? "★" : "☆";
    btn.setAttribute("aria-label", on ? "Remover dos favoritos" : "Favoritar");
  });
}
