/**
 * Tenor é fallback MANUAL.
 * Não chama a API do Tenor e não depende de TENOR_API_KEY.
 * Só devolve GIFs já cadastrados no catálogo/cache.
 */
const manual = new Map();

export const TenorMediaService = {
  save(exerciseId, media) {
    if (!exerciseId || !media || !media.url) return null;
    const entry = {
      exerciseId,
      source: "tenor",
      type: media.type || "gif",
      tenorId: media.tenorId || "",
      url: media.url,
      thumbnailUrl: media.thumbnailUrl || media.url,
      searchTerm: media.searchTerm || "",
      updatedAt: Date.now()
    };
    manual.set(exerciseId, entry);
    return entry;
  },

  get(exerciseId) {
    return manual.get(exerciseId) || null;
  },

  searchHints(displayName) {
    const name = String(displayName || "").trim();
    if (!name) return [];
    return [
      name + " exercise",
      name + " gym",
      name + " workout"
    ];
  }
};
