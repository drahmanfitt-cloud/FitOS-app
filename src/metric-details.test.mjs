import test from "node:test";
import assert from "node:assert/strict";
import { buildMetricDetails } from "./metric-details-data.mjs";

const now = new Date("2026-06-20T12:00:00");
const clients = [
  {id:"a",name:"Mara",status:"active",programId:"p"},
  {id:"b",name:"Eli",status:"inactive"},
  {id:"zero",name:"No activity",status:"active",programId:"deleted"},
];
const exercise = sets => [{name:"Squat",sets}];
const sessions = [
  {id:"dated",clientId:"a",startedAt:"2026-06-18T12:00:00",exercises:exercise([{pr:true,done:true,load:"42"},{pr:true,done:false},{pr:false,done:true}])},
  {id:"undated",clientId:"a",startedAt:null,createdAt:"2026-06-19",exercises:exercise([{pr:true,done:true}])},
  {id:"orphan",clientId:"removed",startedAt:"2026-06-19T12:00:00",exercises:exercise([{pr:true,done:true}])},
  {id:"future",clientId:"b",startedAt:"2026-07-01T12:00:00",exercises:exercise([{pr:true,done:true}])},
  {id:"old",clientId:"a",startedAt:"2024-01-01T12:00:00",exercises:[]},
];
const programs = [
  {id:"p",name:"Strength",createdAt:"2026-06-15",assignedClients:["b","removed"]},
  {id:"no-date",createdAt:"invalid"},
  {id:"future",createdAt:"2027-01-01"},
];
const build = patch => buildMetricDetails({clients,sessions,programs,now,...patch});
test("all-time totals reconcile with cards, retaining undated and future records",()=>{
  const s=build({});
  assert.equal(s.sessions,sessions.length);
  assert.equal(s.programsBuilt,programs.length);
  assert.equal(s.active,2);
  assert.equal(s.prs,4);
  assert.equal(s.records.length,4);
  assert.equal(s.buckets.reduce((n,b)=>n+b.prs,0),2);
  assert.equal(s.undatedPRs,1);
  assert.equal(s.futurePRs,1);
});
test("finite windows exclude unknown, future and old dates without creation-time substitution",()=>{
  for (const range of ["28","90","365"]) {
    const s=build({range});
    assert.equal(s.sessions,2);
    assert.equal(s.prs,2);
    assert.equal(s.programsBuilt,1);
    assert.equal(s.undated,1);
  }
});
test("client scope retains zero-activity clients and isolates records",()=>{
  const all=build({});
  assert.equal(all.rows.length,3);
  assert.equal(all.rows.find(r=>r.client.id==="zero").sessions,0);
  assert.equal(all.unknownSessions,1);
  assert.equal(all.unknownPRs,1);
  const a=build({clientId:"a"});
  assert.equal(a.sessions,3);
  assert.equal(a.prs,2);
  assert.equal(a.rows.length,1);
  assert.equal(a.programsBuilt,3,"global program creation ignores client scope");
  assert.equal(a.records[0].set.load,"42","recorded loads retained without inferred units");
});
test("assignments use current client references and disclose stale saved rosters",()=>{
  const s=build({});
  assert.equal(s.assigned,2);
  assert.equal(s.unavailableAssignments,1);
  const p=s.programRows.find(r=>r.program.id==="p");
  assert.deepEqual(p.assigned.map(c=>c.id),["a"]);
  assert.deepEqual(p.rosterOnly,["b","removed"]);
  assert.equal(p.missingFromRoster,1);
});
test("empty collections are valid and PR flag alone does not create a record",()=>{
  const empty=buildMetricDetails({now});
  assert.equal(empty.sessions,0);
  assert.equal(empty.prs,0);
  assert.deepEqual(empty.rows,[]);
  assert.equal(empty.buckets.length,1);
});
