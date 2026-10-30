import { api, unwrap } from "@shared/api/client.js";
import { SessionService } from "@shared/services/account/SessionService.js";
import { store } from "@shared/store/local-store.js";
import { replaceHistoryRow } from "@shared/domain/history.js";

let flushing = null;

// Falha de rede, timeout, 401 (token renovando), 408, 429 e 5xx valem nova tentativa.
export function isRetryable(err) {
  const status = Number(err && err.status) || 0;
  if (!status) return true;
  return status === 401 || status === 408 || status === 429 || status >= 500;
}

export function queueSession(localId, body) {
  const S = store.get();
  const list = (S.pendingSessions || []).filter((row) => row.localId !== localId);
  list.push({ localId, body, at: Date.now() });
  S.pendingSessions = list;
  store.persist();
}

export function pendingCount() {
  return (store.get().pendingSessions || []).length;
}

async function sendOne(job) {
  try {
    return unwrap(await api.sessions.finish(job.body)) || {};
  } catch (err) {
    if (err && err.status === 404 && job.body.sessionId) {
      const body = Object.assign({}, job.body);
      delete body.sessionId;
      return unwrap(await api.sessions.finish(body)) || {};
    }
    throw err;
  }
}

export function flushPendingSessions() {
  if (flushing) return flushing;
  flushing = (async () => {
    let synced = 0;
    if (!SessionService.hasToken()) return synced;
    const S = store.get();
    const jobs = (S.pendingSessions || []).slice();
    for (const job of jobs) {
      try {
        const data = await sendOne(job);
        const mapped = SessionService.mapHistory(data);
        const local = (S.history || []).find((row) => String(row.id) === String(job.localId)) || {};
        const next = Object.assign({}, local, mapped, {
          id: mapped.id || local.id,
          volume: mapped.volume || local.volume,
          calories: mapped.calories || local.calories,
          duration: mapped.duration || local.duration,
          exercises: mapped.exercises || local.exercises,
          sets: mapped.sets || local.sets,
          pendingSync: false
        });
        S.history = replaceHistoryRow(S.history, job.localId, next);
        synced += 1;
      } catch (err) {
        if (isRetryable(err)) break;
        const row = (S.history || []).find((item) => String(item.id) === String(job.localId));
        if (row) row.pendingSync = false;
      }
      S.pendingSessions = (S.pendingSessions || []).filter((row) => row.localId !== job.localId);
      store.persist();
    }
    return synced;
  })().finally(() => { flushing = null; });
  return flushing;
}
