import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AppState } from "react-native";
import { api, unwrap } from "@shared/api/client.js";
import { SessionService } from "@shared/services/account/SessionService.js";
import { store } from "@shared/store/local-store.js";
import { D, exerciseOf } from "../catalog.js";
import { computeWorkoutStats } from "../workout/stats.js";
import { beginRest, restStillRunning } from "../session/restClock.js";
import { endWorkoutLive, subscribeWorkoutLiveActions, syncWorkoutLive } from "../session/workoutLiveSync.js";

const Ctx = createContext(null);

function buildItems(items, restDefault) {
  return items.filter((it) => exerciseOf(it.id)).map((it) => {
    const e = exerciseOf(it.id);
    const sets = [];
    sets.push({ type: "W", kg: Math.max(0, Math.round((it.kg || e.kg) * 0.5)), reps: 12, done: false });
    for (let i = 0; i < (it.sets || e.sets); i += 1) {
      sets.push({ type: "N", kg: it.kg || e.kg, reps: it.reps || e.reps, done: false });
    }
    return { id: it.id, rest: it.rest || e.rest || restDefault, sets };
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

export function LiveSessionProvider({ children }) {
  const [live, setLive] = useState(() => normalizeLive(store.get().liveSession || null));
  const [summary, setSummary] = useState(null);
  const timer = useRef(null);
  const liveRef = useRef(live);
  liveRef.current = live;

  useEffect(() => {
    const S = store.get();
    S.liveSession = live || null;
    store.persist();
    syncWorkoutLive(live);
    if (!live) endWorkoutLive();
  }, [live]);

  const push = useCallback((next) => {
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

  const startRest = useCallback((seconds) => {
    const cur = liveRef.current;
    if (!cur) return;
    push(Object.assign({}, cur, { rest: beginRest(seconds) }));
  }, [push]);

  useEffect(() => {
    return subscribeWorkoutLiveActions({ skipRest, goToNext });
  }, [skipRest, goToNext]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (status) => {
      if (status !== "active") return;
      const cur = liveRef.current;
      if (cur && cur.rest && !restStillRunning(cur.rest)) skipRest();
    });
    return () => sub.remove();
  }, [skipRest]);

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
      name: live.name,
      duration: stats.duration,
      volume: stats.volume,
      calories: stats.calories,
      exercises: stats.exerciseCount,
      sets: stats.totalSets,
      totalReps: stats.reps,
      muscles: stats.muscleLabels,
      lines: stats.lines,
      photo: (extras && extras.photo) || null
    };

    if (SessionService.hasToken()) {
      const body = {
        name: live.name,
        sourceType: (live.meta && live.meta.sourceType) || "custom",
        sourceId: (live.meta && live.meta.sourceId) || null,
        durationMin: stats.duration,
        muscles,
        saveAsWorkout: false,
        exercises: completeExercises(live)
      };
      if (live.apiId) body.sessionId = live.apiId;
      const data = unwrap(await api.sessions.finish(body)) || {};
      const mapped = SessionService.mapHistory(data);
      rec = Object.assign({}, rec, mapped, {
        volume: mapped.volume || rec.volume,
        calories: mapped.calories || rec.calories,
        duration: mapped.duration || rec.duration,
        photo: rec.photo,
        totalReps: rec.totalReps,
        muscles: rec.muscles,
        lines: rec.lines
      });
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
    () => ({ live, setLive: push, start, finish, quit, skipRest, goToNext, startRest, summary, setSummary }),
    [live, push, start, finish, quit, skipRest, goToNext, startRest, summary]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLive() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLive precisa do LiveSessionProvider");
  return ctx;
}
