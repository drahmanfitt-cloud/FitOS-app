// FitOS — Clients screen
import React, { useState } from "react";
import { C, uid, now, fmtDate, fmtTime, clamp, TAG_COLORS } from "./config.js";
import { Avatar, Pill, Btn, Card, SL, Input, Select, Modal, Confirm } from "./ui.jsx";

function ClientForm({initial,onSave,onClose,mobile}){
  const EMPTY={name:"",email:"",phone:"",dob:"",tag:"General",status:"active",notes:""};
  const [f,setF]=useState(initial||EMPTY);
  const set=k=>v=>setF(p=>({...p,[k]:v}));
  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"1fr 1fr",gap:12}}>
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

function ClientsScreen({clients,onAdd,onEdit,onDelete,programs,setView,setActiveClient,mobile}){
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
      ):mobile?(
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {filtered.map(c=>{
            const prog=programs.find(p=>p.id===c.programId);
            return(
              <div key={c.id} onClick={()=>{setActiveClient(c);setView("client");}}
                style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px 14px",cursor:"pointer",display:"flex",gap:12,alignItems:"center"}}>
                <Avatar name={c.name} size={38} color={TAG_COLORS[c.tag]||C.sub}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{color:C.text,fontWeight:700,fontSize:14}}>{c.name}</div>
                  <div style={{color:C.muted,fontSize:11,marginTop:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.email||"—"}</div>
                  <div style={{display:"flex",gap:5,flexWrap:"wrap",marginTop:6}}>
                    <Pill color={TAG_COLORS[c.tag]||C.sub}>{c.tag}</Pill>
                    <Pill color={SC[c.status]||C.sub}>{c.status}</Pill>
                    {prog&&<Pill color={C.purple}>{prog.name}</Pill>}
                  </div>
                </div>
                <div style={{color:C.muted,fontSize:11,textAlign:"right",flexShrink:0}} onClick={e=>e.stopPropagation()}>
                  <div style={{color:C.sub,fontWeight:700,fontSize:18,lineHeight:1}}>{c.sessionCount||0}</div>
                  <div style={{marginBottom:6}}>sessions</div>
                  <div style={{display:"flex",flexDirection:"column",gap:4}}>
                    <Btn variant="ghost" color={C.blue} style={{padding:"4px 8px",fontSize:10}} onClick={()=>setModal({client:c})}>Edit</Btn>
                    <Btn variant="danger" style={{padding:"4px 8px",fontSize:10}} onClick={()=>setConfirm(c.id)}>Delete</Btn>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
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
                    <td style={{padding:"12px 8px"}}><Pill color={TAG_COLORS[c.tag]||C.sub}>{c.tag}</Pill></td>
                    <td style={{padding:"12px 8px"}}><Pill color={SC[c.status]||C.sub}>{c.status}</Pill></td>
                    <td style={{padding:"12px 8px",maxWidth:140}}>{prog?<Pill color={C.purple} style={{display:"block",overflow:"hidden",textOverflow:"ellipsis",maxWidth:"100%"}}>{prog.name}</Pill>:<span style={{color:C.muted,fontSize:12}}>—</span>}</td>
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
      {(modal==="add"||modal?.client)&&<Modal title={modal==="add"?"New Client":"Edit Client"} onClose={()=>setModal(null)} wide><ClientForm initial={modal?.client} onSave={save} onClose={()=>setModal(null)} mobile={mobile}/></Modal>}
      {confirm&&<Confirm msg="Delete this client?" onConfirm={async()=>{await onDelete(confirm);setConfirm(null);}} onCancel={()=>setConfirm(null)}/>}
    </div>
  );
}

const GOAL_COLORS=[C.green,C.blue,C.purple,C.amber,C.teal,C.red];

function GoalEditor({initial,onSave,onClose}){
  const [f,setF]=useState(initial||{label:"",unit:"kg",current:"",target:"",color:C.green});
  const set=k=>v=>setF(p=>({...p,[k]:v}));
  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <Input label="Goal" value={f.label} onChange={set("label")} placeholder="e.g. Squat 1RM, Lose weight" required/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
        <Input label="Current" value={f.current} onChange={set("current")} type="number" placeholder="0"/>
        <Input label="Target" value={f.target} onChange={set("target")} type="number" placeholder="0"/>
        <Input label="Unit" value={f.unit} onChange={set("unit")} placeholder="kg"/>
      </div>
      <div>
        <label style={{color:C.sub,fontSize:12,fontWeight:600}}>Color</label>
        <div style={{display:"flex",gap:8,marginTop:6}}>
          {GOAL_COLORS.map(col=>(
            <button key={col} onClick={()=>set("color")(col)}
              style={{width:30,height:30,borderRadius:8,background:col,cursor:"pointer",border:f.color===col?`2px solid ${C.text}`:"2px solid transparent"}}/>
          ))}
        </div>
      </div>
      <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:4}}>
        <Btn variant="ghost" color={C.sub} onClick={onClose}>Cancel</Btn>
        <Btn onClick={()=>{if(!f.label.trim())return;onSave({id:f.id||uid(),label:f.label.trim(),unit:(f.unit||"").trim(),current:Number(f.current)||0,target:Number(f.target)||0,color:f.color||C.green});}}>Save Goal</Btn>
      </div>
    </div>
  );
}

function Sparkline({data,color,height=56}){
  if(!data||data.length<2)return null;
  const W=300,PAD=6;
  const vals=data.map(d=>Number(d.weight)||0);
  const min=Math.min(...vals),max=Math.max(...vals),span=(max-min)||1;
  const X=i=>PAD+(i/(data.length-1))*(W-PAD*2);
  const Y=v=>PAD+(1-(v-min)/span)*(height-PAD*2);
  const line=data.map((d,i)=>`${X(i).toFixed(1)},${Y(Number(d.weight)).toFixed(1)}`).join(" ");
  const area=`${PAD.toFixed(1)},${(height-PAD).toFixed(1)} ${line} ${(W-PAD).toFixed(1)},${(height-PAD).toFixed(1)}`;
  return(
    <svg width="100%" viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none" style={{display:"block"}}>
      <polygon points={area} fill={color} opacity="0.13"/>
      <polyline points={line} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke"/>
    </svg>
  );
}

function ClientProfile({client,sessions,programs,onEdit,setView,setActiveClient,onLogDay,onUpdateGoals,onUpdateBodyweight}){
  const [modal,setModal]=useState(null);
  const [goalModal,setGoalModal]=useState(null);
  const [wDate,setWDate]=useState(()=>new Date().toISOString().slice(0,10));
  const [wVal,setWVal]=useState("");
  const prog=programs.find(p=>p.id===client.programId);
  const clientSessions=sessions.filter(s=>s.clientId===client.id).sort((a,b)=>new Date(b.startedAt)-new Date(a.startedAt));

  // ── Derived metrics ──
  const totalReps=clientSessions.reduce((a,s)=>a+(s.exercises||[]).reduce((ea,e)=>ea+(e.sets||[]).reduce((sa,st)=>sa+(Number(st.reps)||0),0),0),0);
  const WEEK=6048e5; // 7 days in ms
  const weekOf=ts=>{const d=new Date(ts);d.setHours(0,0,0,0);const day=(d.getDay()+6)%7;d.setDate(d.getDate()-day);return d.getTime();};
  const weekSet=new Set(clientSessions.map(s=>weekOf(s.startedAt)));
  let streak=0,cur=weekOf(Date.now());while(weekSet.has(cur)){streak++;cur-=WEEK;}
  const firstTs=clientSessions.length?new Date(clientSessions[clientSessions.length-1].startedAt).getTime():null;
  const weeksActive=firstTs?Math.max(1,(Date.now()-firstTs)/WEEK):1;
  const perWeek=clientSessions.length?(clientSessions.length/weeksActive):0;
  // Program adherence: planned sessions (weeks × days/wk) vs sessions logged against a program day
  const programmedTotal=prog?(Number(prog.weeks)||0)*(Number(prog.daysPerWeek)||0):0;
  const programLogged=clientSessions.filter(s=>s.programDay).length;
  const adherence=programmedTotal?clamp(programLogged/programmedTotal,0,1)*100:0;

  // ── Goals ──
  const goals=client.goals||[];
  const saveGoal=g=>{const next=goals.some(x=>x.id===g.id)?goals.map(x=>x.id===g.id?g:x):[...goals,g];onUpdateGoals(client.id,next);setGoalModal(null);};
  const removeGoal=gid=>onUpdateGoals(client.id,goals.filter(x=>x.id!==gid));

  // ── Bodyweight ──
  const bw=[...(client.bodyweightLog||[])].sort((a,b)=>new Date(a.date)-new Date(b.date));
  const latestBw=bw[bw.length-1],prevBw=bw[bw.length-2];
  const bwChange=latestBw&&prevBw?(latestBw.weight-prevBw.weight):null;
  const addWeight=()=>{if(wVal===""||isNaN(Number(wVal)))return;const entry={id:uid(),date:wDate,weight:Number(wVal)};const next=[...(client.bodyweightLog||[]).filter(e=>e.date!==wDate),entry];onUpdateBodyweight(client.id,next);setWVal("");};
  const removeWeight=eid=>onUpdateBodyweight(client.id,(client.bodyweightLog||[]).filter(e=>e.id!==eid));

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
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,alignItems:"start"}}>
        <Card style={{textAlign:"center",padding:"11px 10px"}}>
          <div style={{color:C.muted,fontSize:10,textTransform:"uppercase",letterSpacing:"0.05em"}}>Sessions</div>
          <div style={{color:C.green,fontWeight:800,fontSize:19,lineHeight:1.2}}>{clientSessions.length}</div>
          <div style={{color:C.sub,fontSize:10}}>{totalReps.toLocaleString()} reps</div>
        </Card>
        <Card style={{textAlign:"center",padding:"11px 10px"}}>
          <div style={{color:C.muted,fontSize:10,textTransform:"uppercase",letterSpacing:"0.05em"}}>Consistency</div>
          <div style={{color:C.amber,fontWeight:800,fontSize:19,lineHeight:1.2}}>{perWeek.toFixed(1)}<span style={{fontSize:11,color:C.muted,fontWeight:600}}>/wk</span></div>
          <div style={{color:C.sub,fontSize:10}}>{streak>0?`🔥 ${streak} wk`:"No streak"}</div>
          {prog?(
            <div style={{marginTop:7,paddingTop:7,borderTop:`1px solid ${C.border}`}}>
              <div style={{color:C.text,fontSize:11,fontWeight:600}}>{programLogged}<span style={{color:C.muted,fontWeight:400}}>/{programmedTotal} <span style={{fontSize:9}}>prog</span></span></div>
              <div style={{height:5,borderRadius:99,background:C.s2,overflow:"hidden",margin:"4px 0 2px"}}>
                <div style={{height:"100%",width:`${adherence}%`,background:C.amber,borderRadius:99,transition:"width 0.3s"}}/>
              </div>
              <div style={{color:C.muted,fontSize:9}}>{Math.round(adherence)}% logged</div>
            </div>
          ):(
            <div style={{marginTop:7,paddingTop:7,borderTop:`1px solid ${C.border}`,color:C.muted,fontSize:9}}>No program</div>
          )}
        </Card>
        <Card style={{textAlign:"center",padding:"11px 10px"}}>
          <div style={{color:C.muted,fontSize:10,textTransform:"uppercase",letterSpacing:"0.05em"}}>Activity</div>
          <div style={{color:C.blue,fontWeight:800,fontSize:14,lineHeight:1.3}}>{clientSessions[0]?fmtDate(clientSessions[0].startedAt):"Never"}</div>
          <div style={{color:C.sub,fontSize:10}}>since {fmtDate(client.createdAt)}</div>
        </Card>
      </div>

      {/* ── Goals ── */}
      <Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:goals.length?14:0}}>
          <SL style={{marginBottom:0}}>Goals</SL>
          <Btn variant="ghost" color={C.green} style={{padding:"5px 10px",fontSize:12}} onClick={()=>setGoalModal({})}>+ Add Goal</Btn>
        </div>
        {goals.length===0?(
          <div style={{textAlign:"center",padding:"14px 0",color:C.muted,fontSize:13}}>No goals yet — set a target to track progress.</div>
        ):(
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            {goals.map(g=>{
              const pct=g.target?clamp(g.current/g.target,0,1)*100:0;
              return(
                <div key={g.id}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:5,gap:8}}>
                    <span style={{color:C.text,fontWeight:600,fontSize:13}}>{g.label}</span>
                    <span style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
                      <span style={{color:g.color,fontWeight:700,fontSize:13}}>{g.current}<span style={{color:C.muted,fontWeight:400}}> / {g.target}{g.unit?` ${g.unit}`:""}</span></span>
                      <span onClick={()=>setGoalModal(g)} title="Edit" style={{color:C.muted,cursor:"pointer",fontSize:12}}>✎</span>
                      <span onClick={()=>removeGoal(g.id)} title="Remove" style={{color:C.muted,cursor:"pointer",fontSize:15}}>×</span>
                    </span>
                  </div>
                  <div style={{height:8,borderRadius:99,background:C.s2,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${pct}%`,background:g.color,borderRadius:99,transition:"width 0.3s"}}/>
                  </div>
                  <div style={{color:C.muted,fontSize:10,marginTop:3}}>{Math.round(pct)}%</div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* ── Bodyweight ── */}
      <Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <SL style={{marginBottom:0}}>Bodyweight</SL>
          {latestBw&&(
            <span style={{display:"flex",alignItems:"baseline",gap:8}}>
              <span style={{color:C.teal,fontWeight:800,fontSize:20}}>{latestBw.weight}<span style={{fontSize:12,color:C.muted,fontWeight:600}}> kg</span></span>
              {bwChange!=null&&bwChange!==0&&<span style={{color:bwChange<0?C.green:C.amber,fontSize:12,fontWeight:700}}>{bwChange<0?"▼":"▲"} {Math.abs(bwChange).toFixed(1)}</span>}
            </span>
          )}
        </div>
        {bw.length>=2&&(
          <div style={{background:C.s2,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 12px 8px",marginBottom:14}}>
            <Sparkline data={bw} color={C.teal}/>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:6,color:C.muted,fontSize:10}}>
              <span>{fmtDate(bw[0].date)}</span>
              <span>range {Math.min(...bw.map(e=>e.weight))}–{Math.max(...bw.map(e=>e.weight))} kg</span>
              <span>{fmtDate(bw[bw.length-1].date)}</span>
            </div>
          </div>
        )}
        <div style={{display:"flex",gap:8,alignItems:"flex-end",flexWrap:"wrap",marginBottom:bw.length?14:0}}>
          <div style={{width:150}}><Input label="Date" value={wDate} onChange={setWDate} type="date"/></div>
          <div style={{flex:1,minWidth:120}}><Input label="Weight (kg)" value={wVal} onChange={setWVal} type="number" placeholder="e.g. 72.5"/></div>
          <Btn color={C.teal} onClick={addWeight}>Log</Btn>
        </div>
        {bw.length>0&&(
          <div style={{display:"flex",flexDirection:"column",gap:4,maxHeight:170,overflowY:"auto"}}>
            {[...bw].reverse().map(e=>(
              <div key={e.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 10px",background:C.s2,borderRadius:8,border:`1px solid ${C.border}`}}>
                <span style={{color:C.sub,fontSize:12}}>{fmtDate(e.date)}</span>
                <span style={{display:"flex",alignItems:"center",gap:12}}>
                  <span style={{color:C.text,fontWeight:600,fontSize:13}}>{e.weight} kg</span>
                  <span onClick={()=>removeWeight(e.id)} title="Remove" style={{color:C.muted,cursor:"pointer",fontSize:15}}>×</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
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
      {goalModal&&<Modal title={goalModal.id?"Edit Goal":"New Goal"} onClose={()=>setGoalModal(null)}><GoalEditor initial={goalModal.id?goalModal:null} onSave={saveGoal} onClose={()=>setGoalModal(null)}/></Modal>}
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


export { ClientForm, ClientsScreen, ClientProfile, DEFAULT_SETTINGS, ResistanceToggle, Toggle, NumInput, modeFor };
