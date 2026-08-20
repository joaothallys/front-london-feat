export function setVolume(set) {
  if (!set || !set.done) return 0;
  return (Number(set.kg ?? set.actualWeight ?? set.weight) || 0)
    * (Number(set.reps ?? set.actualReps) || 0);
}

export function sessionVolume(items) {
  return (items || []).reduce((total, item) => {
    return total + (item.sets || []).reduce((sum, set) => sum + setVolume(set), 0);
  }, 0);
}

export function detectPersonalRecords(history, session) {
  const previous = history || [];
  const events = [];
  if (!session) return events;

  const bestWeight = Math.max(0, ...previous.map((h) => h.bestWeight || 0));
  const bestVolume = Math.max(0, ...previous.map((h) => h.volume || 0));
  const bestReps = Math.max(0, ...previous.map((h) => h.bestReps || 0));

  if ((session.bestWeight || 0) > bestWeight) {
    events.push({ type: "PERSONAL_RECORD_ACHIEVED", kind: "weight", value: session.bestWeight });
  }
  if ((session.volume || 0) > bestVolume) {
    events.push({ type: "PERSONAL_RECORD_ACHIEVED", kind: "volume", value: session.volume });
  }
  if ((session.bestReps || 0) > bestReps) {
    events.push({ type: "PERSONAL_RECORD_ACHIEVED", kind: "reps", value: session.bestReps });
  }
  return events;
}
