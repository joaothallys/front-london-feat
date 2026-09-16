export function restLeft(rest) {
  if (!rest) return 0;
  if (rest.endsAt) return Math.max(0, Math.ceil((rest.endsAt - Date.now()) / 1000));
  return Math.max(0, Number(rest.left) || 0);
}

export function restProgress(rest) {
  const total = Number(rest && rest.total) || 0;
  if (!total) return 0;
  return Math.max(0, Math.min(1, restLeft(rest) / total));
}

export function formatRest(sec) {
  const s = Math.max(0, Math.ceil(Number(sec) || 0));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m + ":" + String(r).padStart(2, "0");
}

export function beginRest(seconds) {
  const total = Math.max(1, Number(seconds) || 60);
  const startedAt = Date.now();
  return {
    total,
    startedAt,
    endsAt: startedAt + total * 1000
  };
}

export function restStillRunning(rest) {
  return !!(rest && restLeft(rest) > 0);
}
