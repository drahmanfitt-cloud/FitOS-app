export const DASHBOARD_MODULES = Object.freeze([
  { key:"metrics", label:"Metrics" },
  { key:"statistics", label:"Client Statistics" },
  { key:"retention", label:"Retention" },
  { key:"tasks", label:"Today's Tasks" },
  { key:"classes", label:"Upcoming Classes" },
  { key:"sessions", label:"Recent Sessions" },
  { key:"clients", label:"Active Clients" },
]);
export const DEFAULT_DASHBOARD_ORDER = Object.freeze(DASHBOARD_MODULES.map(m=>m.key));
export function dashboardStorageKey(userId) {
  return userId === undefined || userId === null || String(userId).trim() === "" ? null : `fitos:dashboard-order:v1:${encodeURIComponent(String(userId))}`;
}
export function validateDashboardOrder(value) {
  if (!Array.isArray(value) || value.some(key=>!DEFAULT_DASHBOARD_ORDER.includes(key)) || new Set(value).size !== value.length) {
    throw new Error("Invalid dashboard order");
  }
  return [...value, ...DEFAULT_DASHBOARD_ORDER.filter(key=>!value.includes(key))];
}
export function moveDashboardModule(order,key,direction) {
  const index=order.indexOf(key), target=index+direction;
  if (index<0 || ![-1,1].includes(direction) || target<0 || target>=order.length) return order;
  const next=[...order];
  [next[index],next[target]]=[next[target],next[index]];
  return next;
}
export function readDashboardOrder(storage,key) {
  if (!key) return {order:[...DEFAULT_DASHBOARD_ORDER],error:"Sign in to save a dashboard layout for your account. Changes here are temporary."};
  try {
    const raw=storage.getItem(key);
    return {order:raw===null?[...DEFAULT_DASHBOARD_ORDER]:validateDashboardOrder(JSON.parse(raw)),error:""};
  } catch {
    return {order:[...DEFAULT_DASHBOARD_ORDER],error:"Could not load your saved layout. Default order is shown; try saving again."};
  }
}
export function persistDashboardOrder(storage,key,order) {
  if (!key) return "Layout changed for this visit only. Sign in to save it for your account.";
  try {
    storage.setItem(key,JSON.stringify(validateDashboardOrder(order)));
    return "";
  } catch {
    return "Layout changed for this visit, but could not be saved in this browser. Check storage permissions and try again.";
  }
}
