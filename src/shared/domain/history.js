// Campos que só existem no aparelho (foto do card, linhas do resumo) e que o
// servidor não devolve na listagem.
const LOCAL_FIELDS = ["photo", "lines", "muscles", "totalReps", "shareItems", "shareId"];

// O plano nomeia os dias como "A · Peito e Bíceps"; a letra só organiza o plano.
// No histórico o treino fica "Peito e Bíceps".
export function workoutName(name) {
  const clean = String(name || "").replace(/^\s*(treino\s+)?[A-Za-z]\s*[·.\-–—:|]\s*/i, "").trim();
  return clean || String(name || "").trim() || "Treino";
}

function withCleanName(row) {
  if (!row || !row.name) return row;
  const name = workoutName(row.name);
  return name === row.name ? row : Object.assign({}, row, { name });
}

function time(row) {
  const t = new Date((row && row.date) || 0).getTime();
  return Number.isNaN(t) ? 0 : t;
}

export function sortHistory(list) {
  return (list || []).slice().sort((a, b) => time(b) - time(a));
}

// Junta o histórico do servidor com o local: mantém os extras locais das linhas
// que o servidor já conhece e preserva os treinos que ainda não subiram.
export function mergeHistory(remote, local) {
  const byId = {};
  (local || []).forEach((row) => {
    if (row && row.id != null) byId[String(row.id)] = row;
  });
  const merged = (remote || []).map((row) => {
    const mine = byId[String(row.id)];
    if (!mine) return row;
    const extras = {};
    LOCAL_FIELDS.forEach((key) => {
      if (mine[key] != null && row[key] == null) extras[key] = mine[key];
    });
    return Object.assign({}, row, extras);
  });
  const seen = new Set(merged.map((row) => String(row.id)));
  (local || []).forEach((row) => {
    if (row && row.pendingSync && !seen.has(String(row.id))) merged.push(row);
  });
  return sortHistory(merged).map(withCleanName);
}

export function replaceHistoryRow(list, localId, next) {
  const rest = (list || []).filter((row) => String(row.id) !== String(localId) && String(row.id) !== String(next.id));
  return sortHistory([next].concat(rest));
}
