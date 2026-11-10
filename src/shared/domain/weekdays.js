export const MAX_PLAN_DAYS = 7;

export const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

export const WEEKDAY_LABEL = {
  0: "Dom",
  1: "Seg",
  2: "Ter",
  3: "Qua",
  4: "Qui",
  5: "Sex",
  6: "Sáb"
};

export function normalizeWeekdays(value) {
  let list = value;
  if (typeof value === "string") {
    list = value.replace(/[{}]/g, "").split(",").map((part) => part.trim()).filter(Boolean);
  }
  if (!Array.isArray(list)) return [];
  const seen = new Set();
  list.forEach((raw) => {
    const n = Number(raw);
    if (!Number.isInteger(n) || n < 0 || n > 6) return;
    seen.add(n);
  });
  return WEEKDAY_ORDER.filter((day) => seen.has(day));
}

export function weekdaySummary(day) {
  return normalizeWeekdays(day && day.weekdays).map((id) => WEEKDAY_LABEL[id]).join(", ");
}

export function dayChipLabel(day, index) {
  const labels = normalizeWeekdays(day && day.weekdays).map((id) => WEEKDAY_LABEL[id].toUpperCase());
  if (!labels.length) return "DIA " + ((Number(index) || 0) + 1);
  if (labels.length <= 2) return labels.join(" · ");
  return labels.slice(0, 2).join(" · ") + " +" + (labels.length - 2);
}

export function buildPlanDays(nextDays) {
  return (Array.isArray(nextDays) ? nextDays : []).slice(0, MAX_PLAN_DAYS).map((day, index) => ({
    id: (day && day.id) || null,
    name: String((day && day.name) || "").trim() || ("Dia " + (index + 1)),
    focus: (day && day.focus) || [],
    items: (day && day.items) || [],
    weekdays: normalizeWeekdays(day && day.weekdays)
  }));
}
