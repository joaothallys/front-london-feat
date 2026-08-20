import { resolveExerciseMedia } from "@shared/services/media/MediaResolver.js";

function escapeAttr(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

export function ExerciseMedia(exercise, cls, opts) {
  const media = resolveExerciseMedia(exercise);
  const name = (exercise && (exercise.displayName || exercise.name)) || "";
  const eager = opts && opts.eager;
  const boxClass = (cls || "ex-media") + (media.source === "placeholder" ? " lf-placeholder" : "");
  if (media.type === "video" && media.url) {
    return `<div class="${boxClass}" data-media="video">
      <video src="${escapeAttr(media.url)}" autoplay muted loop playsinline webkit-playsinline preload="${eager ? "auto" : "none"}"></video>
    </div>`;
  }
  if (media.url) {
    const srcAttr = eager ? `src="${escapeAttr(media.url)}"` : `data-src="${escapeAttr(media.url)}" loading="lazy"`;
    return `<div class="${boxClass}" data-media="gif">
      <img alt="${escapeAttr(name)}" ${srcAttr} onerror="window.LF_MEDIA && window.LF_MEDIA.onError(this)">
    </div>`;
  }
  return `<div class="${boxClass} lf-placeholder" data-media="placeholder" aria-hidden="true">
    <span>LF</span>
  </div>`;
}

export function observeExerciseMedia(root) {
  const imgs = (root || document).querySelectorAll("img[data-src]");
  if (!imgs.length) return;
  const load = (img) => {
    if (!img.dataset.src || img.src) return;
    img.src = img.dataset.src;
    img.removeAttribute("data-src");
  };
  if (!("IntersectionObserver" in window)) {
    imgs.forEach(load);
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      load(entry.target);
      io.unobserve(entry.target);
    });
  }, { rootMargin: "180px" });
  imgs.forEach((img) => io.observe(img));
}
