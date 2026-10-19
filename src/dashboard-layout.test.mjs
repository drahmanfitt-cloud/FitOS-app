import test from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_DASHBOARD_ORDER, dashboardStorageKey, validateDashboardOrder, moveDashboardModule, readDashboardOrder, persistDashboardOrder } from "./dashboard-layout-data.mjs";

function memoryStorage() {
  const values=new Map();
  return {getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};
}
test("default order preserves all seven independently movable sections",()=>{
  assert.deepEqual(DEFAULT_DASHBOARD_ORDER,["metrics","statistics","retention","tasks","classes","sessions","clients"]);
  for (const key of DEFAULT_DASHBOARD_ORDER) {
    const direction=key==="metrics"?1:-1;
    const next=moveDashboardModule(DEFAULT_DASHBOARD_ORDER,key,direction);
    assert.equal(next.indexOf(key),DEFAULT_DASHBOARD_ORDER.indexOf(key)+direction);
    assert.deepEqual([...next].sort(),[...DEFAULT_DASHBOARD_ORDER].sort());
  }
});
test("movement is immutable and bounded",()=>{
  const order=[...DEFAULT_DASHBOARD_ORDER];
  assert.equal(moveDashboardModule(order,"metrics",-1),order);
  assert.equal(moveDashboardModule(order,"clients",1),order);
  assert.equal(moveDashboardModule(order,"unknown",1),order);
  assert.equal(moveDashboardModule(order,"tasks",5),order);
  moveDashboardModule(order,"retention",-1);
  assert.deepEqual(order,DEFAULT_DASHBOARD_ORDER);
});
test("stored keys are validated, duplicates rejected, missing sections restored",()=>{
  assert.deepEqual(validateDashboardOrder(["retention","metrics"]),["retention","metrics","statistics","tasks","classes","sessions","clients"]);
  for (const value of [null,{},["metrics","metrics"],["unknown"],[12],["__proto__"]]) {
    assert.throws(()=>validateDashboardOrder(value));
  }
});
test("layouts persist and reset independently per account",()=>{
  const storage=memoryStorage(), a=dashboardStorageKey("trainer/a"), b=dashboardStorageKey("trainer/b");
  assert.notEqual(a,b);
  const order=moveDashboardModule(DEFAULT_DASHBOARD_ORDER,"retention",-1);
  assert.equal(persistDashboardOrder(storage,a,order),"");
  assert.deepEqual(readDashboardOrder(storage,a).order,order);
  assert.deepEqual(readDashboardOrder(storage,b).order,DEFAULT_DASHBOARD_ORDER);
  assert.equal(persistDashboardOrder(storage,a,DEFAULT_DASHBOARD_ORDER),"");
  assert.deepEqual(readDashboardOrder(storage,a).order,DEFAULT_DASHBOARD_ORDER);
});
test("corrupt storage and blocked storage surface errors rather than reporting save",()=>{
  const storage=memoryStorage(), key=dashboardStorageKey("trainer");
  for (const raw of ["broken",'["metrics","metrics"]','["retired-module"]']) {
    storage.setItem(key,raw);
    assert.ok(readDashboardOrder(storage,key).error);
    assert.deepEqual(readDashboardOrder(storage,key).order,DEFAULT_DASHBOARD_ORDER);
  }
  const blocked={getItem(){throw Error("denied");},setItem(){throw Error("quota");}};
  assert.ok(readDashboardOrder(blocked,key).error);
  assert.match(persistDashboardOrder(blocked,key,DEFAULT_DASHBOARD_ORDER),/could not be saved/);
});
test("missing account never reads or writes shared browser storage",()=>{
  const forbidden={getItem(){assert.fail("must not read");},setItem(){assert.fail("must not write");}};
  for (const id of [undefined,null,""," "]) {
    const key=dashboardStorageKey(id);
    assert.equal(key,null);
    assert.ok(readDashboardOrder(forbidden,key).error);
    assert.match(persistDashboardOrder(forbidden,key,DEFAULT_DASHBOARD_ORDER),/visit only/);
  }
});
