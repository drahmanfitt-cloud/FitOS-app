// FitOS — Clients screen
import React, { useState } from "react";
import { C, uid, now, fmtDate, TAG_COLORS } from "./config.js";
import { Avatar, Pill, Btn, Card, SL, Input, Select, Modal, Confirm } from "./ui.jsx";

function ClientForm({initial,onSave,onClose}){
  const EMPTY={name:"",email:"",phone:"",dob:"",tag:"General",status:"active",notes:""};
  const [f,setF]=useState(initial||EMPTY);
  const set=k=>v=>setF(p=>({...p,[k]:v}));
  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Input label="Full name" value={f.name} onChange={set("name")} required/>
        <Input label="Email" value={f.email} onChange={set("email")} type="email"/>
        <Input label="Phone" value={f.phone} onChange={set("phone")}/>
        <Input label="Date of birth" value={f.dob} onChange={set("dob")} type="date"/>
        <Select label="Focus" value={f.tag} onChange={set("tag")} options={["General","Strength","Fat Loss","Hypertrophy","Endurance","Mobility","Rehab"]}/>
        <Select label="Status" value={f.status} onChange={set("status")} options={["active","inactive","prospect"]}/>
      </div>
      <Input label="Notes" value={f.notes} onChange={set("notes")} placeholder="Injuries, goals…"/>
      <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}><Btn variant="outline" onClick={onClose}>Cancel</Btn><Btn disabled={!f.name.trim()} onClick={()=>onSave(f)}>Save Client</Btn></div>
    </div>
  );
}

function ClientsScreen({clients,onAdd,onEdit,onDelete,programs,setView,setActiveClient}){
  const [search,setSearch]=useState("");
  const [modal,setModal]=useState(null);
  const [confirm,setConfirm]=useState(null);
  const [saving,setSaving]=useState(false);
  const SC={active:C.green,inactive:C.red,prospect:C.amber};
  const filtered=clients.filter(c=>(c.name||"").toLowerCase().includes(search.toLowerCase())||(c.email||"").toLowerCase().includes(search.toLowerCase()));

  const save=async(f)=>{ setSaving(true); if(modal==="add") await onAdd(f); else await onEdit(modal.client.id,f); setSaving(false); setModal(null); };

  return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{display:"flex",gap:10}}>
        <div style={{flex:1,background:C.surface,border:`1px solid ${C.border}`,borderRadius:9,padding:"10px 14px",display:"flex",alignItems:"center",gap:8}}>
          <span style={{color:C.muted}}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search clients…" style={{background:"none",border:"none",color:C.text,fontSize:14,flex:1,outline:"none",fontFamily:"inherit"}}/>
        </div>
        <Btn onClick={()=>setModal("add")}>+ New Client</Btn>
      </div>
      {filtered.length===0?(
        <Card style={{textAlign:"center",padding:48}}>
          <div style={{fontSize:32,marginBottom:10}}>👥</div>
          <div style={{color:C.sub,marginBottom:16}}>{search?"No matches.":"Add your first client."}</div>
          {!search&&<Btn onClick={()=>setModal("add")}>+ Add Client</Btn>}
        </Card>
      ):(
        <Card style={{padding:0,overflow:"hidden"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead style={{background:C.s2}}>
              <tr>{["Client","Focus","Status","Program","Sessions","Added",""].map(h=><th key={h} style={{textAlign:"left",color:C.muted,fontSize:11,fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",padding:"12px 16px",borderBottom:`1px solid ${C.border}`}}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.map(c=>{
                const prog=programs.find(p=>p.id===c.programId);
                return(
                  <tr key={c.id} style={{borderBottom:`1px solid ${C.border}`,cursor:"pointer"}}
                    onMouseEnter={e=>e.currentTarget.style.background=C.s2} onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                    onClick={()=>{setActiveClient(c);setView("client");}}>
                    <td style={{padding:"12px 16px"}}><div style={{display:"flex",alignItems:"center",gap:10}}><Avatar name={c.name} size={30} color={TAG_COLORS[c.tag]||C.sub}/><div><div style={{color:C.text,fontWeight:600,fontSize:14}}>{c.name}</div><div style={{color:C.muted,fontSize:11}}>{c.email||"—"}</div></div></div></td>
                    <td style={{padding:"12px 16px"}}><Pill color={TAG_COLORS[c.tag]||C.sub}>{c.tag}</Pill></td>
                    <td style={{padding:"12px 16px"}}><Pill color={SC[c.status]||C.sub}>{c.status}</Pill></td>
                    <td style={{padding:"12px 16px"}}>{prog?<Pill color={C.purple}>{prog.name}</Pill>:<span style={{color:C.muted,fontSize:12}}>—</span>}</td>
                    <td style={{padding:"12px 16px",color:C.sub,fontSize:14}}>{c.sessionCount||0}</td>
                    <td style={{padding:"12px 16px",color:C.muted,fontSize:13}}>{fmtDate(c.createdAt)}</td>
                    <td style={{padding:"12px 16px"}}><div style={{display:"flex",gap:6}} onClick={e=>e.stopPropagation()}>
                      <Btn variant="ghost" color={C.blue} style={{padding:"5px 10px",fontSize:11}} onClick={()=>setModal({client:c})}>Edit</Btn>
                      <Btn variant="danger" style={{padding:"5px 10px",fontSize:11}} onClick={()=>setConfirm(c.id)}>Delete</Btn>
                    </div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
      {(modal==="add"||modal?.client)&&<Modal title={modal==="add"?"New Client":"Edit Client"} onClose={()=>setModal(null)} wide><ClientForm initial={modal?.client} onSave={save} onClose={()=>setModal(null)}/></Modal>}
      {confirm&&<Confirm msg="Delete this client?" onConfirm={async()=>{await onDelete(confirm);setConfirm(null);}} onCancel={()=>setConfirm(null)}/>}
    </div>
  );
}

function ClientProfile({client,sessions,programs,onEdit,setView,setActiveClient,onLogDay}){
  const [modal,setModal]=useState(null);
  const prog=programs.find(p=>p.id===client.programId);
  const clientSessions=sessions.filter(s=>s.clientId===client.id).sort((a,b)=>new Date(b.startedAt)-new Date(a.startedAt));
  return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <Card style={{display:"flex",alignItems:"flex-start",gap:16}}>
        <Avatar name={client.name} size={56} color={TAG_COLORS[client.tag]||C.sub}/>
        <div style={{flex:1}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4,flexWrap:"wrap"}}>
            <span style={{color:C.text,fontWeight:800,fontSize:20}}>{client.name}</span>
            <Pill color={client.status==="active"?C.green:client.status==="inactive"?C.red:C.amber}>{client.status}</Pill>
            <Pill color={TAG_COLORS[client.tag]||C.sub}>{client.tag}</Pill>
            {prog&&<Pill color={C.purple}>📋 {prog.name}</Pill>}
          </div>
          <div style={{color:C.sub,fontSize:13}}>{client.email||"No email"} {client.phone&&`· ${client.phone}`}</div>
          {client.notes&&<div style={{color:C.muted,fontSize:12,marginTop:6,fontStyle:"italic"}}>"{client.notes}"</div>}
        </div>
        <div style={{display:"flex",gap:8}}>
          <Btn variant="ghost" color={C.blue} onClick={()=>setModal("edit")}>Edit</Btn>
          <Btn onClick={()=>setView("sessions")}>+ Log Session</Btn>
        </div>
      </Card>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
        {[{label:"Sessions",val:clientSessions.length,color:C.green},{label:"Last Session",val:clientSessions[0]?fmtDate(clientSessions[0].startedAt):"Never",color:C.blue},{label:"Client Since",val:fmtDate(client.createdAt),color:C.sub}].map(s=>(
          <Card key={s.label} style={{textAlign:"center",padding:16}}><div style={{color:C.muted,fontSize:11,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4}}>{s.label}</div><div style={{color:s.color,fontWeight:800,fontSize:22}}>{s.val}</div></Card>
        ))}
      </div>
      {prog&&(
        <Card style={{borderColor:C.purple+"44"}}>
          <SL>Assigned Program — {prog.name}</SL>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:8}}>
            {prog.days?.map(d=>(
              <div key={d.id} onClick={()=>onLogDay&&onLogDay(d)}
                style={{background:C.s2,borderRadius:9,padding:"10px 12px",border:`1px solid ${C.border}`,cursor:onLogDay?"pointer":"default",transition:"border-color 0.15s"}}
                onMouseEnter={e=>{if(onLogDay)e.currentTarget.style.borderColor=C.green;}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;}}>
                <div style={{color:C.text,fontWeight:700,fontSize:13,marginBottom:2}}>{d.label}</div>
                {d.focus&&<div style={{marginBottom:6}}><Pill color={C.purple}>{d.focus}</Pill></div>}
                {d.exercises?.slice(0,3).map(e=><div key={e.id} style={{color:C.sub,fontSize:11,marginTop:2}}>· {e.name} {e.sets}×{e.reps}</div>)}
                {d.exercises?.length>3&&<div style={{color:C.muted,fontSize:10,marginTop:2}}>+{d.exercises.length-3} more</div>}
                {onLogDay&&<div style={{color:C.green,fontSize:10,fontWeight:600,marginTop:6}}>⚡ Log this day →</div>}
              </div>
            ))}
          </div>
        </Card>
      )}
      <Card>
        <SL>Session History</SL>
        {clientSessions.length===0?<div style={{textAlign:"center",padding:"24px 0",color:C.muted}}>No sessions yet. <span onClick={()=>setView("sessions")} style={{color:C.green,cursor:"pointer"}}>Log the first one →</span></div>:(
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {clientSessions.map(s=>(
              <div key={s.id} style={{background:C.s2,borderRadius:10,padding:"12px 14px",border:`1px solid ${C.border}`}}>
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <div><div style={{color:C.text,fontWeight:700,fontSize:14}}>{s.name||"Untitled"}</div><div style={{color:C.muted,fontSize:12,marginTop:2}}>{fmtDate(s.startedAt)} · {s.exercises?.length||0} exercises · {s.exercises?.reduce((a,e)=>a+(e.sets?.length||0),0)||0} sets{s.programDay?` · ${s.programDay}`:""}</div></div>
                  <span style={{color:C.muted,fontSize:11}}>{fmtTime(s.startedAt)}</span>
                </div>
                {s.notes&&<div style={{color:C.sub,fontSize:12,marginTop:6,fontStyle:"italic"}}>{s.notes}</div>}
                {s.exercises?.some(e=>e.sets?.some(st=>st.pr))&&(
                  <div style={{marginTop:8,display:"flex",gap:6,flexWrap:"wrap"}}>
                    {s.exercises.flatMap(e=>e.sets?.filter(st=>st.pr).map(st=><Pill key={st.id} color={C.amber}>🏆 {e.name}: {st.weight}kg×{st.reps}</Pill>))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
      {modal==="edit"&&<Modal title="Edit Client" onClose={()=>setModal(null)} wide><ClientForm initial={client} onSave={async f=>{await onEdit(client.id,f);setActiveClient(p=>({...p,...f}));setModal(null);}} onClose={()=>setModal(null)}/></Modal>}
    </div>
  );
}



const RESISTANCE_MODES = [
  { value:"weighted",  label:"Weighted",  unit:"kg",  color:C.blue   },
  { value:"resisted",  label:"Resisted",  unit:"kg",  color:C.amber  },
  { value:"assisted",  label:"Assisted",  unit:"kg",  color:C.purple },
  { value:"bodyweight",label:"Bodyweight",unit:null,  color:C.green  },
];
const modeFor = v => RESISTANCE_MODES.find(m=>m.value===v)||RESISTANCE_MODES[0];

// Default settings
const DEFAULT_SETTINGS = {
  restTimerPosition: "bottom",   // "top" | "bottom"
  weightUnit: "kg",              // "kg" | "lbs"
  defaultRestSec: 90,
  setTimerSec: 0,                // 0 = off
  defaultWarmupHoldSec: 30,
  defaultWarmupReps: "10",
  defaultWarmupResistance: "bodyweight",
  warmupAutoTimer: false,
  warmupRestSec: 30,
};

function Toggle({value,onChange,color=C.green}){
  return(
    <div onClick={()=>onChange(!value)} style={{width:40,height:22,borderRadius:11,background:value?color:C.s3,border:`1px solid ${value?color:C.border}`,cursor:"pointer",position:"relative",transition:"all 0.2s",flexShrink:0}}>
      <div style={{position:"absolute",top:3,left:value?20:3,width:16,height:16,borderRadius:"50%",background:"#fff",transition:"left 0.2s"}}/>
    </div>
  );
}

function NumInput({value,onChange,min=0,max=9999,width=60}){
  return(
    <input type="number" value={value} min={min} max={max} onChange={e=>onChange(Number(e.target.value))}
      style={{width,background:C.s3,border:`1px solid ${C.border}`,borderRadius:7,padding:"6px 8px",color:C.text,fontSize:13,outline:"none",fontFamily:"inherit",textAlign:"center"}}/>
  );
}

function ResistanceToggle({value,onChange}){
  return(
    <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
      {RESISTANCE_MODES.map(m=>(
        <button key={m.value} onClick={()=>onChange(m.value)} style={{padding:"3px 9px",borderRadius:6,fontSize:11,fontWeight:700,cursor:"pointer",border:`1px solid ${value===m.value?m.color:C.border}`,background:value===m.value?m.color+"18":"transparent",color:value===m.value?m.color:C.muted,transition:"all 0.12s"}}>{m.label}</button>
      ))}
    </div>
  );
}


export { ClientForm, ClientsScreen, ClientProfile, DEFAULT_SETTINGS, ResistanceToggle, Toggle, NumInput };
