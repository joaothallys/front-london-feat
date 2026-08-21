function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function dayKey(value) {
  return startOfDay(value).toISOString().slice(0, 10);
}

export function monthLabel(year, month) {
  const raw = new Date(year, month, 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

export function firstWeekday(year, month) {
  const d = new Date(year, month, 1).getDay();
  return d;
}

export function inRange(date, range) {
  const t = startOfDay(date).getTime();
  const now = startOfDay(new Date());
  if (range === "week") {
    const from = new Date(now);
    const weekday = from.getDay();
    from.setDate(from.getDate() - (weekday === 0 ? 6 : weekday - 1));
    return t >= from.getTime();
  }
  if (range === "month") {
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }
  if (range === "year") {
    return date.getFullYear() === now.getFullYear();
  }
  return true;
}

export function summarize(history, range) {
  const rows = (history || []).filter((h) => inRange(new Date(h.date), range));
  return {
    workouts: rows.length,
    minutes: rows.reduce((a, h) => a + (h.duration || 0), 0),
    volume: rows.reduce((a, h) => a + (h.volume || 0), 0),
    calories: rows.reduce((a, h) => a + (h.calories || 0), 0),
    sets: rows.reduce((a, h) => a + (h.sets || 0), 0)
  };
}

export function byDay(history) {
  const map = {};
  (history || []).forEach((h) => {
    const key = dayKey(h.date);
    if (!map[key]) map[key] = [];
    map[key].push(h);
  });
  return map;
}

export function chartPoints(history, range) {
  const now = new Date();
  if (range === "week") {
    const monday = startOfDay(now);
    const weekday = monday.getDay();
    monday.setDate(monday.getDate() - (weekday === 0 ? 6 : weekday - 1));
    const labels = ["S", "T", "Q", "Q", "S", "S", "D"];
    return labels.map((label, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const key = dayKey(d);
      const volume = (history || []).filter((h) => dayKey(h.date) === key).reduce((a, h) => a + (h.volume || 0), 0);
      return { label, volume, key };
    });
  }
  if (range === "year") {
    return Array.from({ length: 12 }, (_, month) => {
      const volume = (history || []).filter((h) => {
        const d = new Date(h.date);
        return d.getFullYear() === now.getFullYear() && d.getMonth() === month;
      }).reduce((a, h) => a + (h.volume || 0), 0);
      return { label: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"][month], volume };
    });
  }
  const days = daysInMonth(now.getFullYear(), now.getMonth());
  const buckets = [];
  const size = Math.ceil(days / 4);
  for (let i = 0; i < 4; i += 1) {
    const from = 1 + i * size;
    const to = Math.min(days, (i + 1) * size);
    const volume = (history || []).filter((h) => {
      const d = new Date(h.date);
      const day = d.getDate();
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && day >= from && day <= to;
    }).reduce((a, h) => a + (h.volume || 0), 0);
    buckets.push({ label: from + "–" + to, volume });
  }
  if (range === "all") {
    const points = [];
    for (let i = 11; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const volume = (history || []).filter((h) => {
        const x = new Date(h.date);
        return x.getFullYear() === d.getFullYear() && x.getMonth() === d.getMonth();
      }).reduce((a, h) => a + (h.volume || 0), 0);
      points.push({ label: (d.getMonth() + 1) + "/" + String(d.getFullYear()).slice(2), volume });
    }
    return points;
  }
  return buckets;
}

export function calcStreak(history) {
  const keys = new Set((history || []).map((h) => dayKey(h.date)));
  let n = 0;
  const d = startOfDay(new Date());
  if (!keys.has(dayKey(d))) d.setDate(d.getDate() - 1);
  while (keys.has(dayKey(d))) {
    n += 1;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

export function weeklyGoal(history, goal) {
  const stats = summarize(history, "week");
  return { done: stats.workouts, goal: goal || 4 };
}
