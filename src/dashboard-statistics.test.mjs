import test from "node:test";
import assert from "node:assert/strict";
import { buildStatistics, dayNumber } from "./dashboard-statistics-data.mjs";

const now = new Date("2026-06-21T12:00:00");
const clients = [{ id: "a", name: "Mara", status: "active", programId: "p" }, { id: "b", name: "Jules", status: "inactive" }];
const programs = [{ id: "p", name: "Strength block", createdAt: "2026-06-01T12:00:00" }, { id: "undated" }];
const sessions = [
  { clientId: "a", startedAt: "2026-06-21T09:00:00", exercises: [{ sets: [{ pr: true, done: true }, { pr: true, done: false }, { pr: false, done: true }] }] },
  { clientId: "a", startedAt: "2026-05-24T12:00:00" },
  { clientId: "a", startedAt: null, createdAt: "2026-06-01T12:00:00" },
  { clientId: "missing", startedAt: "2026-06-03T12:00:00" },
  { clientId: "a", startedAt: "2026-06-22T12:00:00" },
];
const build = extra => buildStatistics({ clients, programs, sessions, now, ...extra });
test("finite period has inclusive calendar boundaries, actual PR sets, all clients and no invented dates", () => {
  const data = build();
  assert.equal(data.sessions, 2);
  assert.equal(data.prs, 1);
  assert.equal(data.rows.length, 2);
  assert.equal(data.rows[1].sessions, 0);
  assert.equal(data.rows[1].lastDay, null);
  assert.equal(data.rows[0].assignment, "Strength block");
  assert.equal(data.undated, 1);
  assert.equal(data.future, 1);
  assert.equal(data.unmatched, 1);
  assert.equal(data.programsBuilt, 1);
  assert.equal(data.buckets.reduce((sum, b) => sum + b.sessions, 0), 2);
});
test("all-time includes undated totals but never puts them on timeline or substitutes createdAt", () => {
  const data = build({ range: "all" });
  assert.equal(data.sessions, 4);
  assert.equal(data.buckets.reduce((sum, b) => sum + b.sessions, 0), 3);
  assert.equal(data.programsBuilt, 2);
  assert.equal(data.rows[0].lastDay, dayNumber("2026-06-21T09:00:00"));
});
test("client scope changes session trends only; library and all-client comparison remain global", () => {
  const data = build({ clientId: "b" });
  assert.equal(data.sessions, 0);
  assert.equal(data.prs, 0);
  assert.equal(data.rows[0].sessions, 1);
  assert.equal(data.programsBuilt, 1);
  assert.equal(data.assignedClients, 1);
  assert.deepEqual(data.status, [{ label: "active", value: 1 }, { label: "inactive", value: 1 }]);
});
test("empty inputs have a valid zero series and no synthetic history", () => {
  const data = buildStatistics({ now, range: "all" });
  assert.equal(data.buckets.length, 1);
  assert.equal(data.start, data.today);
  assert.deepEqual(data.rows, []);
  assert.equal(dayNumber(null), null);
  assert.equal(dayNumber("invalid"), null);
});
test("first and last calendar days are included; preceding day and tomorrow are excluded", () => {
  const data = build({ sessions: ["2026-05-24", "2026-05-25", "2026-06-21", "2026-06-22"].map(date => ({
    clientId: "a", startedAt: `${date}T12:00:00`,
  })) });
  assert.equal(data.sessions, 2);
  assert.equal(data.buckets[0].sessions, 1);
  assert.equal(data.buckets[data.buckets.length - 1].sessions, 1);
});
