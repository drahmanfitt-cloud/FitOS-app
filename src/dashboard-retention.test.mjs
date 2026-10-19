import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

// Exercise the actual existing helper without importing the screen's JSX or
// creating a Supabase client. Fail loudly if its source boundaries change.
const source=readFileSync(new URL("./retention.jsx",import.meta.url),"utf8");
const helper=source.match(/const DAY =[\s\S]*?(?=\/\/ ── Tiny SVG)/)?.[0];
assert.ok(helper,"retention helper source region must exist");
const now=Date.UTC(2026,6,15,12);
const context=vm.createContext({Date:class extends Date {static now(){return now;}}});
vm.runInContext(helper.replace("export function retentionBuckets","function retentionBuckets")+";this.buckets=retentionBuckets;",context);
const ago=days=>new Date(now-days*86400000).toISOString();
const client=(id,age=90,status="active")=>({id,name:id,status,createdAt:ago(age)});
const session=(clientId,days)=>({clientId,startedAt:ago(days)});
const ids=rows=>Array.from(rows,c=>c.id);

test("dashboard uses existing active-only 14 and 45 day thresholds",()=>{
  const clients=["fresh","risk","edge","lapsed"].map(id=>client(id));
  clients.push(client("inactive",90,"inactive"));
  const result=context.buckets(clients,[session("fresh",13),session("risk",14),session("edge",44),session("lapsed",45),session("inactive",1)]);
  assert.deepEqual(ids(result.engaged),["fresh"]);
  assert.deepEqual(ids(result.atRisk),["risk","edge"]);
  assert.deepEqual(ids(result.lapsed),["lapsed"]);
});
test("never-trained clients have grace then lapse without entering at-risk",()=>{
  const result=context.buckets([client("new",13),client("older",14),{id:"missing",status:"active"}],[]);
  assert.deepEqual(ids(result.engaged),["new","missing"]);
  assert.deepEqual(ids(result.lapsed),["older"]);
  assert.equal(result.atRisk.length,0);
  assert.equal(result.engaged[0].days,null);
  assert.equal(result.lapsed[0].sinceDays,Infinity);
});
test("latest session wins and creation timestamp is the existing fallback",()=>{
  const result=context.buckets([client("latest"),client("fallback")],[session("latest",60),session("latest",3),{clientId:"fallback",createdAt:ago(20)}]);
  assert.deepEqual(ids(result.engaged),["latest"]);
  assert.deepEqual(ids(result.atRisk),["fallback"]);
});
test("empty dataset yields no invented engagement",()=>{
  const result=context.buckets([],[]);
  assert.equal(result.engaged.length+result.atRisk.length+result.lapsed.length,0);
});
