// Calendar-day aggregation. Never substitute record creation time for workout time.
const DAY = 86400000;
export function dayNumber(value) {
  if (!value || (typeof value !== "string" && !(value instanceof Date))) return null;
  const d = new Date(value);
  if (!Number.isFinite(d.getTime())) return null;
  return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAY;
}
export const countPRs = session => (session.exercises || []).reduce(
  (sum, exercise) => sum + (exercise.sets || []).filter(set => set.pr && set.done).length, 0);
export function buildStatistics({ clients = [], sessions = [], programs = [], range = "28", clientId = "", now = new Date() }) {
  const today = dayNumber(now);
  const dated = sessions.map(session => ({ session, day: dayNumber(session.startedAt) }));
  const programDates = programs.map(program => ({ program, day: dayNumber(program.createdAt) }));
  const validDays = [...dated, ...programDates].filter(item => item.day !== null && item.day <= today).map(item => item.day);
  const start = range === "all" ? Math.min(today, ...validDays) : today - Number(range) + 1;
  const inRange = day => day !== null && day >= start && day <= today;
  // All-time counts retain undated records; finite date windows cannot place them.
  const included = day => inRange(day) || (range === "all" && day === null);
  const scoped = dated.filter(({ session }) => !clientId || String(session.clientId) === String(clientId));
  const selected = scoped.filter(item => included(item.day));
  const span = today - start + 1;
  const bucketSize = Math.max(1, Math.ceil(span / (range === "28" ? 7 : 12)));
  const buckets = [];
  for (let first = start; first <= today; first += bucketSize) {
    buckets.push({ start: first, end: Math.min(today, first + bucketSize - 1), sessions: 0, prs: 0, programs: 0 });
  }
  scoped.forEach(({ session, day }) => {
    if (!inRange(day)) return;
    const bucket = buckets[Math.floor((day - start) / bucketSize)];
    bucket.sessions++;
    bucket.prs += countPRs(session);
  });
  programDates.forEach(({ day }) => {
    if (inRange(day)) buckets[Math.floor((day - start) / bucketSize)].programs++;
  });
  const rows = clients.map(client => {
    const history = dated.filter(({ session }) => String(session.clientId) === String(client.id));
    const period = history.filter(item => included(item.day));
    const recorded = history.filter(item => item.day !== null && item.day <= today);
    const assigned = programs.find(p => p.id === client.programId);
    return {
      client, sessions: period.length, prs: period.reduce((sum, item) => sum + countPRs(item.session), 0),
      lastDay: recorded.length ? Math.max(...recorded.map(item => item.day)) : null,
      undated: history.filter(item => item.day === null).length,
      assignment: assigned?.name || (client.programId ? "Assigned program unavailable" : "No current assignment"),
    };
  });
  const status = [...new Set(clients.map(c => c.status || "unknown"))].map(label => ({
    label, value: clients.filter(c => (c.status || "unknown") === label).length,
  }));
  return {
    start, today, buckets, rows, status,
    sessions: selected.length, prs: selected.reduce((sum, item) => sum + countPRs(item.session), 0),
    undated: scoped.filter(item => item.day === null).length,
    future: scoped.filter(item => item.day !== null && item.day > today).length,
    programsBuilt: programDates.filter(item => included(item.day)).length,
    undatedPrograms: programDates.filter(item => item.day === null).length,
    assignedClients: clients.filter(c => !!c.programId).length,
    unmatched: dated.filter(({ session, day }) => included(day) && !clients.some(c => String(c.id) === String(session.clientId))).length,
  };
}
export function formatDay(day) {
  return new Date(day * DAY).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}
