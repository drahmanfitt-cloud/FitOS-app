import React, { useState } from "react";
import { C, TAG_COLORS } from "./config.js";
import { Avatar, Card, Pill } from "./ui.jsx";
import { retentionBuckets } from "./retention.jsx";

export function DashboardRetention({clients,sessions,setActiveClient,setView}) {
  const [filter,setFilter]=useState("all");
  const [expanded,setExpanded]=useState(false);
  const buckets=retentionBuckets(clients,sessions);
  const total=clients.filter(c=>c.status==="active").length;
  const attention=[...buckets.atRisk.map(c=>({...c,bucket:"At risk"})),...buckets.lapsed.map(c=>({...c,bucket:"Lapsed"}))]
    .sort((a,b)=>(b.sinceDays===Infinity?Number.MAX_VALUE:b.sinceDays)-(a.sinceDays===Infinity?Number.MAX_VALUE:a.sinceDays));
  const filtered=attention.filter(c=>filter==="all"||c.bucket===filter);
  const visible=expanded?filtered:filtered.slice(0,5);
  const grace=buckets.engaged.filter(c=>c.lastTs===null).length;
  return <Card style={{padding:20}}>
    <div style={{fontSize:10,fontWeight:700,letterSpacing:".12em",color:C.green,textTransform:"uppercase",marginBottom:6}}>Client continuity · current snapshot</div>
    <div className="dashboard-retention-heading">
      <div><h2 className="dashboard-retention-title">Retention</h2><p className="dashboard-note">A signal to start a conversation, not a historical retention rate.</p></div>
      <div><div className="dashboard-retention-rate">{total?`${Math.round(buckets.engaged.length/total*100)}%`:"—"}</div><div className="dashboard-note">Engagement proxy · {buckets.engaged.length} / {total} active clients</div></div>
    </div>
    <dl className="dashboard-retention-counts">
      {[["Engaged",buckets.engaged,C.green],["At risk",buckets.atRisk,C.amber],["Lapsed",buckets.lapsed,C.red]].map(([label,list,color])=><div key={label}><dt>{label}</dt><dd style={{color}}>{list.length}<span>{total?`${Math.round(list.length/total*100)}% of active`:"No active clients"}</span></dd></div>)}
    </dl>
    <p className="dashboard-note">Engaged: last session under 14 days ago. At risk: 14–44 days. Lapsed: 45+ days. Only currently active clients count; inactive clients are excluded.</p>
    <details style={{marginTop:10,fontSize:12,color:C.sub}}><summary style={{cursor:"pointer"}}>How never-trained clients count</summary>
      <p className="dashboard-note">Clients with no recorded session are engaged during their first 14 days, then lapsed—not at risk. If their creation date is missing, the existing rule treats them as in the grace period. These clients have not necessarily trained. {grace} engaged client{grace===1?"":"s"} currently {grace===1?"has":"have"} no recorded session.</p>
      <p className="dashboard-note">Uses the same rules as Retention analytics: session start date, falling back to creation date. No status history, churn, or historical retention is inferred. Invalid or future dates can affect this proxy.</p>
    </details>
    {!total?<div style={{padding:"24px 0 4px"}}><strong style={{fontSize:14}}>No active clients to assess yet</strong><p className="dashboard-note">Add a client or review client statuses to start monitoring engagement.</p><button type="button" className="dashboard-button" style={{marginTop:12}} onClick={()=>setView("clients")}>Go to clients →</button></div>:<>
      <div style={{borderTop:`1px solid ${C.border}`,marginTop:18,paddingTop:16,display:"flex",justifyContent:"space-between",gap:12,alignItems:"center"}}><h3 style={{fontSize:14,margin:0}}>Needs a follow-up</h3><span style={{fontSize:12,color:C.sub}}>{attention.length} active clients</span></div>
      {attention.length>0&&<div className="dashboard-retention-filters" role="group" aria-label="Filter retention follow-ups">{[["all","All"],["At risk",`At risk (${buckets.atRisk.length})`],["Lapsed",`Lapsed (${buckets.lapsed.length})`]].map(([value,label])=><button type="button" className="dashboard-button secondary" key={value} aria-pressed={filter===value} onClick={()=>{setFilter(value);setExpanded(false);}}>{label}</button>)}</div>}
      {visible.map(c=><button type="button" className="dashboard-retention-client" key={c.id} aria-label={`Open ${c.name}'s profile, ${c.bucket.toLowerCase()}`} onClick={()=>{setActiveClient(clients.find(client=>client.id===c.id));setView("client");}}>
        <Avatar name={c.name} size={32} color={TAG_COLORS[c.tag]||C.sub}/>
        <span style={{flex:1,minWidth:0}}><strong style={{fontSize:13,overflowWrap:"anywhere"}}>{c.name}</strong><span className="dashboard-note" style={{display:"block",marginTop:2}}>{c.days===null?"No session recorded":`Last session ${c.days} days ago`}</span></span>
        <Pill color={c.bucket==="Lapsed"?C.red:C.amber}>{c.bucket}</Pill><span aria-hidden="true" style={{color:C.sub}}>→</span>
      </button>)}
      {!visible.length&&<p className="dashboard-note" style={{padding:"16px 0"}}>{attention.length?"No clients in this group. Choose another filter.":`No active clients are currently at risk or lapsed.${grace?" Some are still in their new-client grace period.":" Keep supporting their training rhythm."}`}</p>}
      {filtered.length>5&&<button type="button" className="dashboard-button secondary" style={{marginTop:10}} onClick={()=>setExpanded(v=>!v)}>{expanded?"Show fewer":`Show all ${filtered.length} clients`}</button>}
    </>}
  </Card>;
}
