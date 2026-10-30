import { api, unwrap } from "@shared/api/client.js";
import { exerciseOf, mediaUrl } from "../catalog.js";
import { resolveWebUrl } from "../config.js";

// Um exercício no formato que POST /api/shares espera (e a página web mostra).
export function shareItem(id, sets, rest) {
  const e = exerciseOf(id) || {};
  const gif = mediaUrl(e, { preferGif: true });
  return {
    id,
    sourceId: e.externalId || "",
    name: e.name || id,
    muscle: e.muscle || "",
    equipment: e.equipment || "",
    gifUrl: /^https:\/\//.test(gif || "") ? gif : "",
    rest: Number(rest || e.rest) || 90,
    sets: (sets || []).map((s) => ({ type: s.type || "N", kg: Number(s.kg) || 0, reps: Number(s.reps) || 0 }))
  };
}

// Salva o treino na API e devolve o link do site: <site>/t/<id>.
export async function createShareLink(body) {
  const created = unwrap(await api.shares.create(body));
  if (!created || !created.id) throw new Error("link não gerado");
  return { id: created.id, url: resolveWebUrl() + "/t/" + created.id };
}

export function shareUrl(id) {
  return resolveWebUrl() + "/t/" + id;
}
