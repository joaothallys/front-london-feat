export function fmtDuration(min) {
  const n = Math.max(0, Math.round(Number(min) || 0));
  if (n < 60) return n + " min";
  const h = Math.floor(n / 60);
  const m = n % 60;
  return m ? h + "h " + String(m).padStart(2, "0") : h + "h";
}

// Acima disso o treino ficou esquecido aberto: o relógio não vale mais.
export const MAX_AUTO_MIN = 240;

export function autoDuration(live, doneSets) {
  const startedAt = Number(live && live.startedAt) || Date.now();
  const elapsed = Math.round((Date.now() - startedAt) / 60000);
  if (elapsed <= MAX_AUTO_MIN) return Math.max(1, elapsed);
  const items = (live && live.items) || [];
  const rest = items.length ? items.reduce((a, it) => a + (Number(it.rest) || 90), 0) / items.length : 90;
  // ~45s por série mais o descanso configurado
  return Math.max(1, Math.min(MAX_AUTO_MIN, Math.round((doneSets * (45 + rest)) / 60)));
}

// Mesma fórmula do backend (modules/sessions/routes.js), para o número não mudar depois de sincronizar.
export function estimateCalories(durationMin, volumeKg) {
  return Math.max(0, Math.round((Number(durationMin) || 0) * 5.5 + (Number(volumeKg) || 0) * 0.035));
}
