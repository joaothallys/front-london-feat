import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AppState } from "react-native";
import { api, unwrap } from "@shared/api/client.js";
import { SessionService } from "@shared/services/account/SessionService.js";
import { store } from "@shared/store/local-store.js";
import { useAppState } from "./AppState.js";
import { D, exerciseOf } from "../catalog.js";
import { computeWorkoutStats } from "../workout/stats.js";
import { keepWorkoutPhoto } from "../workout/pickPhoto.js";
import { beginRest, restStillRunning } from "../session/restClock.js";
import { endWorkoutLive, subscribeWorkoutLiveActions, syncWorkoutLive } from "../session/workoutLiveSync.js";
import { anySetDone, countedSets, finishBody } from "../session/finishPayload.js";
import { shareItem } from "../session/shareLink.js";
import { workoutName } from "@shared/domain/history.js";
import { flushPendingSessions, isRetryable, queueSession } from "../session/pendingSync.js";

const Ctx = createContext(null);

function buildItems(items, restDefault) {
  return items.filter((it) => exerciseOf(it.id)).map((it) => {
    const e = exerciseOf(it.id);
    const kg = Number(it.kg || e.kg) || 0;
    const reps = Number(it.reps || e.reps) || 10;
    const count = Math.max(1, Number(it.sets || e.sets) || 3);
    const sets = [];
    sets.push({ type: "W", kg: Math.max(0, Math.round(kg * 0.5)), reps: 12, done: false });
    for (let i = 0; i < count; i += 1) {
      sets.push({ type: "N", kg, reps, done: false });
    }
    return { id: it.id, rest: Number(it.rest || e.rest || restDefault) || 90, sets };
  });
}

function payload(live) {
  return completeExercises(live).map((row, i) => {
    const it = live.items[i];
    return Object.assign({}, row, {
      sets: row.sets.map((s, si) => Object.assign({}, s, {
        done: !!(it && it.sets[si] && it.sets[si].done)
      }))
    });
  });
}

function londonId(it) {
  const e = exerciseOf(it.id);
  return (e && e.id) || it.id;
}

function completeExercises(live) {
  return (live.items || []).map((it) => ({
    exerciseId: londonId(it),
    restSec: it.rest || 90,
    replacedFromExerciseId: it.replacedFrom || null,
    sets: (it.sets || []).map((s) => ({
      type: s.type || "N",
      kg: Number(s.kg) || 0,
      reps: Number(s.reps) || 0
    }))
  }));
}

function resolveId(id) {
  const e = exerciseOf(id);
  return (e && e.id) || id;
}

function musclesOf(live) {
  const muscles = {};
  (live.items || []).forEach((it) => {
    const e = exerciseOf(it.id) || D.byId[it.id];
    if (e && e.muscle) muscles[e.muscle] = true;
    (e && e.secondary || []).forEach((m) => { muscles[m] = true; });
  });
  return Object.keys(muscles);
}

function normalizeLive(live) {
  if (!live) return null;
  if (!live.rest) return live;
  if (live.rest.endsAt) return live;
  if (live.rest.left) return Object.assign({}, live, { rest: beginRest(live.rest.left) });
  return Object.assign({}, live, { rest: null });
}

// Séries realmente feitas, no formato do link compartilhado (lumenfit-web /t/<id>).
function completedShareItems(live) {
  const anyDone = anySetDone(live);
  return ((live && live.items) || [])
    .map((it) => ({ it, sets: countedSets(it, anyDone) }))
    .filter((row) => row.sets.length)
    .map((row) => shareItem(row.it.id, row.sets, row.it.rest));
}

export function LiveSessionProvider({ children }) {
  const { state, refresh, tick } = useAppState();
  const [live, setLive] = useState(() => {
    try {
      return normalizeLive(store.get().liveSession || null);
    } catch (err) {
      return null;
    }
  });
  const [summary, setSummary] = useState(null);
  const timer = useRef(null);
  const liveRef = useRef(live);
  liveRef.current = live;

  useEffect(() => {
    const S = store.get();
    S.liveSession = live || null;
    store.persist();
    try {
      if (live) syncWorkoutLive(live);
      else endWorkoutLive();
    } catch (err) {}
  }, [live]);

  const push = useCallback((value) => {
    const next = typeof value === "function" ? value(liveRef.current) : value;
    liveRef.current = next;
    setLive(next);
    if (!next || !next.apiId || !SessionService.hasToken()) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      api.sessions.update(next.apiId, { exercises: payload(next) }).catch(() => {});
    }, 400);
  }, []);

  const skipRest = useCallback(() => {
    const cur = liveRef.current;
    if (!cur || !cur.rest) return;
    push(Object.assign({}, cur, { rest: null }));
  }, [push]);

  const goToNext = useCallback(() => {
    const cur = liveRef.current;
    if (!cur || !cur.items) return false;
    if (cur.index >= cur.items.length - 1) {
      push(Object.assign({}, cur, { rest: null }));
      return false;
    }
    push(Object.assign({}, cur, { index: cur.index + 1, rest: null }));
    return true;
  }, [push]);

  const completeCurrentSet = useCallback(() => {
    const cur = liveRef.current;
    if (!cur || !cur.items) return;
    if (restStillRunning(cur.rest)) {
      skipRest();
      return;
    }
    const item = cur.items[cur.index];
    if (!item) return;
    const idx = (item.sets || []).findIndex((s) => !s.done);
    if (idx < 0) {
      goToNext();
      return;
    }
    const items = cur.items.map((it, ii) => {
      if (ii !== cur.index) return it;
      return {
        ...it,
        sets: it.sets.map((s, si) => (si === idx ? Object.assign({}, s, { done: true }) : s))
      };
    });
    const rest = beginRest(item.rest || 60);
    push(Object.assign({}, cur, { items, rest }));
  }, [push, skipRest, goToNext]);

  const startRest = useCallback((seconds) => {
    const cur = liveRef.current;
    if (!cur) return;
    const rest = beginRest(seconds);
    push(Object.assign({}, cur, { rest }));
  }, [push]);

  const toggleSet = useCallback((itemIndex, setIndex) => {
    const cur = liveRef.current;
    const item = cur && cur.items && cur.items[itemIndex];
    if (!item || !item.sets || !item.sets[setIndex]) return;
    const done = !item.sets[setIndex].done;
    const items = cur.items.map((it, ii) => {
      if (ii !== itemIndex) return it;
      return { ...it, sets: it.sets.map((s, si) => (si === setIndex ? Object.assign({}, s, { done }) : s)) };
    });
    if (!done) {
      push(Object.assign({}, cur, { items, index: itemIndex, rest: null }));
      return;
    }
    const rest = beginRest(item.rest || 60);
    push(Object.assign({}, cur, { items, index: itemIndex, rest }));
  }, [push]);

  useEffect(() => {
    if (!live) return undefined;
    return subscribeWorkoutLiveActions({ skipRest, goToNext, completeCurrentSet });
  }, [live, skipRest, goToNext, completeCurrentSet]);

  useEffect(() => {
    flushPendingSessions().then((n) => { if (n) refresh(); }).catch(() => {});
    const sub = AppState.addEventListener("change", (status) => {
      if (status !== "active") return;
      const cur = liveRef.current;
      if (cur && cur.rest && !restStillRunning(cur.rest)) skipRest();
      flushPendingSessions().then((n) => { if (n) refresh(); }).catch(() => {});
    });
    return () => sub.remove();
  }, [skipRest, refresh]);

  useEffect(() => {
    if (!state.session && liveRef.current) {
      liveRef.current = null;
      setLive(null);
      setSummary(null);
    }
  }, [state, tick]);

  const start = useCallback((name, items, meta) => {
    const S = store.get();
    const built = {
      name,
      index: 0,
      startedAt: Date.now(),
      rest: null,
      apiId: null,
      meta: meta || { sourceType: "custom" },
      items: buildItems(items, S.profile.restDefault)
    };
    if (!built.items.length) return null;
    setLive(built);
    setSummary(null);
    if (SessionService.hasToken()) {
      api.sessions.start({
        sourceType: (meta && meta.sourceType) || "custom",
        sourceId: (meta && meta.sourceId) || null,
        name,
        exercises: SessionService.payloadItems(items)
      }).then((json) => {
        const res = unwrap(json) || {};
        const apiId = res.id || res.sessionId || null;
        if (!apiId) return;
        setLive((cur) => (cur && cur.startedAt === built.startedAt ? Object.assign({}, cur, { apiId }) : cur));
      }).catch(() => {});
    }
    return built;
  }, []);

  const finish = useCallback(async (extras) => {
    if (!live) return null;
    const S = store.get();
    const stats = computeWorkoutStats(live, extras && extras.durationMin);
    const muscles = stats.muscles.length ? stats.muscles : musclesOf(live);
    muscles.forEach((m) => { S.recovery[m] = Date.now(); });
    let rec = {
      id: "local-" + Date.now(),
      date: new Date().toISOString(),
      name: workoutName(live.name),
      duration: stats.duration,
      volume: stats.volume,
      calories: stats.calories,
      exercises: stats.completedCount,
      sets: stats.doneSets,
      totalReps: stats.reps,
      muscles: stats.muscleLabels,
      lines: stats.lines,
      photo: await keepWorkoutPhoto(extras && extras.photo),
      shareItems: completedShareItems(live)
    };

    if (SessionService.hasToken()) {
      const body = finishBody(live, { durationMin: stats.duration, muscles, resolveId });
      try {
        const data = unwrap(await api.sessions.finish(body)) || {};
        const mapped = SessionService.mapHistory(data);
        rec = Object.assign({}, rec, mapped, {
          id: mapped.id || rec.id,
          volume: mapped.volume || rec.volume,
          calories: mapped.calories || rec.calories,
          duration: mapped.duration || rec.duration,
          exercises: mapped.exercises || rec.exercises,
          sets: mapped.sets || rec.sets
        });
      } catch (err) {
        if (isRetryable(err)) {
          rec.pendingSync = true;
          queueSession(rec.id, body);
        }
      }
    }

    S.history = [rec].concat((S.history || []).filter((row) => row.id !== rec.id));
    store.persist();
    setSummary(rec);
    setLive(null);
    return rec;
  }, [live]);

  const quit = useCallback(() => {
    if (live && live.apiId && SessionService.hasToken()) {
      api.sessions.abandon(live.apiId).catch(() => {});
    }
    setLive(null);
  }, [live]);

  const value = useMemo(
    () => ({ live, setLive: push, start, finish, quit, skipRest, goToNext, completeCurrentSet, startRest, toggleSet, summary, setSummary }),
    [live, push, start, finish, quit, skipRest, goToNext, completeCurrentSet, startRest, toggleSet, summary]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLive() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLive precisa do LiveSessionProvider");
  return ctx;
}
