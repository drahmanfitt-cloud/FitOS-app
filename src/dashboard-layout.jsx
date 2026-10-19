import React, { useState } from "react";
import { DASHBOARD_MODULES, DEFAULT_DASHBOARD_ORDER, dashboardStorageKey, moveDashboardModule, readDashboardOrder, persistDashboardOrder } from "./dashboard-layout-data.mjs";
import "./dashboard-layout.css";

// Storage access itself can throw in private or restricted browsers.
function browserStorage() {
  try { return window.localStorage; } catch { return {getItem(){throw new Error("Storage unavailable");},setItem(){throw new Error("Storage unavailable");}}; }
}
export function DashboardLayout({userId,children}) {
  const storageKey=dashboardStorageKey(userId);
  const [layout,setLayout]=useState(()=>readDashboardOrder(browserStorage(),storageKey));
  const [customizing,setCustomizing]=useState(false);
  const [announcement,setAnnouncement]=useState("");
  function save(order,message) {
    const error=persistDashboardOrder(browserStorage(),storageKey,order);
    setLayout({order,error});
    setAnnouncement(error?message+" Not saved.":message+" Saved in this browser for your account.");
  }
  function move(key,direction) {
    const next=moveDashboardModule(layout.order,key,direction);
    const label=DASHBOARD_MODULES.find(m=>m.key===key).label;
    save(next,`${label} moved to position ${next.indexOf(key)+1} of ${next.length}.`);
  }
  return <div className="dashboard-shell" style={{display:"flex",flexDirection:"column",gap:16}}>
    <div className="dashboard-toolbar">
      <div><strong style={{fontSize:13}}>Your coaching overview</strong><p>Training activity, follow-ups, and the clients behind them.</p></div>
      <button type="button" className="dashboard-button" aria-expanded={customizing} aria-controls="dashboard-customizer" onClick={()=>setCustomizing(v=>!v)}>{customizing?"Done customizing":"Customize dashboard"}</button>
    </div>
    {layout.error&&<p className="dashboard-alert" role="alert">{layout.error} <button type="button" className="dashboard-button secondary" onClick={()=>save(layout.order,"Current layout applied.")}>Try saving layout</button></p>}
    {customizing&&<section id="dashboard-customizer" className="dashboard-customizer" aria-label="Customize dashboard order">
      <div className="dashboard-customizer-heading">
        <strong style={{fontSize:13}}>Section order</strong>
        <button type="button" className="dashboard-button secondary" onClick={()=>save([...DEFAULT_DASHBOARD_ORDER],"Default dashboard order restored.")}>Reset order</button>
      </div>
      <p className="dashboard-note">Use the arrows to reorder. Saved for your account in this browser.</p>
      <ol className="dashboard-order">{layout.order.map((key,index)=><li key={key}>
        <span aria-hidden="true" className="dashboard-position">{index+1}</span>
        <span className="dashboard-order-name">{DASHBOARD_MODULES.find(m=>m.key===key).label}</span>
        <button type="button" className="dashboard-button secondary" disabled={index===0} title="Move up" aria-label={`Move ${DASHBOARD_MODULES.find(m=>m.key===key).label} up`} onClick={()=>move(key,-1)}>↑</button>
        <button type="button" className="dashboard-button secondary" disabled={index===layout.order.length-1} title="Move down" aria-label={`Move ${DASHBOARD_MODULES.find(m=>m.key===key).label} down`} onClick={()=>move(key,1)}>↓</button>
      </li>)}</ol>
    </section>}
    <span className="dashboard-sr" role="status" aria-live="polite">{announcement}</span>
    <div className="dashboard-grid">{layout.order.map(key=><section key={key} className={`dashboard-module ${["classes","sessions"].includes(key)?"compact":""}`} aria-label={DASHBOARD_MODULES.find(m=>m.key===key).label}>{children[key]}</section>)}</div>
  </div>;
}
