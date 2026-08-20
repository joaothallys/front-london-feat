function dayKey(value) {
  return new Date(value).toDateString();
}

export function calcStreak(history) {
  let n = 0;
  for (let i = 0; i < 365; i += 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const hit = (history || []).some((h) => dayKey(h.date) === d.toDateString());
    if (hit) n += 1;
    else if (i > 0) break;
  }
  return n;
}

export function weeklyCompleted(history, weeklyGoal) {
  const start = new Date();
  start.setDate(start.getDate() - start.getDay());
  start.setHours(0, 0, 0, 0);
  const days = new Set();
  (history || []).forEach((h) => {
    const d = new Date(h.date);
    if (d >= start) days.add(d.toDateString());
  });
  return {
    weeklyGoal: weeklyGoal || 0,
    weeklyCompleted: days.size,
    currentStreak: calcStreak(history)
  };
}
