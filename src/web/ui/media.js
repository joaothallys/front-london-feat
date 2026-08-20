import { api } from "@shared/api/client.js";

const pending = new Map();

function escapeAttr(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

export function gifBox(ex, cls) {
  const e = typeof ex === "string" ? { gifUrl: ex } : (ex || {});
  const name = e.originalName || e.name || "";
  if (e.videoUrl) {
    return `<div class="${cls}"><video src="${escapeAttr(e.videoUrl)}" poster="${escapeAttr(e.gifUrl || e.gif || "")}" controls muted playsinline webkit-playsinline preload="metadata"></video></div>`;
  }
  const src = e.gifUrl || e.gif;
  if (src) {
    return `<div class="${cls}"><img src="${escapeAttr(src)}" alt="${escapeAttr(name)}" data-q="${escapeAttr(name)}" onerror="window.LF_MEDIA && window.LF_MEDIA.onError(this)"></div>`;
  }
  return `<div class="${cls} gif-fallback" data-q="${escapeAttr(name)}"></div>`;
}

async function lookup(name) {
  if (!name) return null;
  if (pending.has(name)) return pending.get(name);
  const job = api.mediaFallback(name).then((res) => {
    return res && res.gifUrl ? res.gifUrl : null;
  }).catch(() => null);
  pending.set(name, job);
  return job;
}

export function onGifError(img) {
  if (!img || img.dataset.fallbackTried === "1") return;
  img.dataset.fallbackTried = "1";
  const box = img.parentNode;
  if (box) box.classList.add("gif-fallback");
  const name = img.getAttribute("data-q") || img.alt || "";
  lookup(name).then((url) => {
    if (!url || !img.isConnected) return;
    img.onload = () => {
      if (box) box.classList.remove("gif-fallback");
    };
    img.src = url;
  });
}

export function installMediaFallback() {
  window.LF_MEDIA = { onError: onGifError };
}
