import { buildStatistics, countPRs, dayNumber } from "./dashboard-statistics-data.mjs";

const same = (a, b) => a != null && b != null && String(a) === String(b);
export function buildMetricDetails({ clients = [], sessions = [], programs = [], range = "all", clientId = "", now = new Date() } = {}) {
  const stats = buildStatistics({ clients, sessions, programs, range, clientId, now });
  const today = dayNumber(now);
  // All time means every saved record, matching dashboard cards (including future dates).
  const include = day => range === "all" || (day !== null && day >= stats.start && day <= today);
  const scoped = sessions.filter(s => !clientId || same(s.clientId, clientId));
  const selected = scoped.filter(s => include(dayNumber(s.startedAt)));
  const selectedPrograms = programs.filter(p => include(dayNumber(p.createdAt)));
  const knownClient = id => clients.find(c => same(c.id, id));
  const records = selected.flatMap((session, sessionIndex) => (session.exercises || []).flatMap((exercise, exerciseIndex) =>
    (exercise.sets || []).flatMap((set, setIndex) => set.pr && set.done ? [{
      key: `${session.id || sessionIndex}-${exerciseIndex}-${setIndex}`,
      session, client: knownClient(session.clientId), exercise: exercise.name || "Unnamed exercise",
      set, setNumber: setIndex + 1, day: dayNumber(session.startedAt),
    }] : []))).sort((a,b) => (b.day ?? -Infinity) - (a.day ?? -Infinity));
  const rows = stats.rows.filter(r => !clientId || same(r.client.id, clientId)).map(row => {
    const period = selected.filter(s => same(s.clientId, row.client.id));
    const age = row.lastDay === null ? null : today - row.lastDay;
    const assignedProgram = programs.find(p => same(p.id, row.client.programId));
    return { ...row, sessions: period.length, prs: period.reduce((sum,s) => sum + countPRs(s),0),
      assignment: assignedProgram?.name || (row.client.programId ? "Assigned program unavailable" : "No current assignment"),
      engagement: age === null ? (row.undated ? "Only undated activity" : "No dated activity") : age < 14 ? "Trained within 14 days" : age < 45 ? "14–44 days since training" : "45+ days since training" };
  });
  const programRows = selectedPrograms.map(program => {
    const assigned = clients.filter(c => same(c.programId, program.id));
    const roster = [...new Set((program.assignedClients || []).map(String))];
    return { program, assigned,
      rosterOnly: roster.filter(id => !assigned.some(c => same(c.id,id))),
      missingFromRoster: assigned.filter(c => !roster.includes(String(c.id))).length };
  });
  const unknown = selected.filter(s => !knownClient(s.clientId));
  const assignments = clients.filter(c => c.programId != null && c.programId !== "");
  return { ...stats, selected, selectedPrograms, records, rows, programRows,
    sessions: selected.length, prs: records.length, programsBuilt: selectedPrograms.length,
    unknownSessions: unknown.length, unknownPRs: unknown.reduce((sum,s) => sum + countPRs(s),0),
    active: clients.filter(c => c.status === "active").length,
    assigned: assignments.length,
    unavailableAssignments: assignments.filter(c => !programs.some(p => same(p.id,c.programId))).length,
    trained: rows.filter(r => r.sessions > 0).length,
    undatedPRs: records.filter(r => r.day === null).length,
    futurePRs: records.filter(r => r.day !== null && r.day > today).length,
    futurePrograms: programs.filter(p => dayNumber(p.createdAt) > today).length,
    recent: [...selected].sort((a,b) => (dayNumber(b.startedAt) ?? -Infinity) - (dayNumber(a.startedAt) ?? -Infinity)),
  };
}
