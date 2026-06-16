// FitOS — Classes, Programs & Dashboard
import React from 'react';
import { useState } from 'react';

function ClassForm({initial,onSave,onClose}){
  const EMPTY={name:"",date:"",time:"",duration:45,capacity:12,location:"",notes:""};
  const [f,setF]=useState(initial||EMPTY);
  const set=k=>v=>setF(p=>({...p,[k]:v}));
  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <Input label="Class name" value={f.name} onChange={set("name")} required/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Input label="Date" value={f.date} onChange={set("date")} type="date" required/>
        <Input label="Time" value={f.time} onChange={set("time")} type="time" required/>
        <Input label="Duration (min)" value={f.duration} onChange={set("duration")} type="number"/>
        <Input label="Max capacity" value={f.capacity} onChange={set("capacity")} type="number"/>
      </div>
      <Input label="Location" value={f.location} onChange={set("location")}/>
      <Input label="Notes" value={f.notes} onChange={set("notes")}/>
      <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}><Btn variant="outline" onClick={onClose}>Cancel</Btn><Btn disabled={!f.name.trim()||!f.date||!f.time} onClick={()=>onSave(f)}>Save Class</Btn></div>
    </div>
  );
}

function ClassesScreen({clients,classes,onAdd,onEdit,onDelete,formats}){
  const [selected,setSelected]=useState(null);
  const [modal,setModal]=useState(null);
  const [confirm,setConfirm]=useState(null);
  const [fmtModal,setFmtModal]=useState(false);
  const sorted=[...classes].sort((a,b)=>new Date(a.date+" "+a.time)-new Date(b.date+" "+b.time));
  const sel=classes.find(c=>c.id===selected);
  const selFmt=sel?formats.find(f=>f.id===sel.formatId):null;
  const AT={attended:C.green,"no-show":C.red,late:C.amber};

  const toggleBooking=async(clientId)=>{
    if(!sel)return;
    const has=sel.bookings.some(b=>b.clientId===clientId);
    if(!has&&sel.bookings.length>=Number(sel.capacity))return;
    const bookings=has?sel.bookings.filter(b=>b.clientId!==clientId):[...sel.bookings,{clientId,bookedAt:now(),attendance:null}];
    await onEdit(sel.id,{bookings});
  };
  const markAttendance=async(clientId,status)=>{
    if(!sel)return;
    const bookings=sel.bookings.map(b=>b.clientId!==clientId?b:{...b,attendance:b.attendance===status?null:status});
    await onEdit(sel.id,{bookings});
  };

  return(
    <div style={{display:"grid",gridTemplateColumns:"280px 1fr",gap:16,minHeight:500}}>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        <Btn onClick={()=>setModal("add")}>+ New Class</Btn>
        {sorted.length===0&&<Card style={{textAlign:"center",padding:32}}><div style={{fontSize:28,marginBottom:8}}>📅</div><div style={{color:C.muted,fontSize:13}}>No classes yet.</div></Card>}
        {sorted.map(c=>(
          <div key={c.id} onClick={()=>setSelected(c.id)} style={{background:C.surface,border:`1px solid ${selected===c.id?C.green:C.border}`,borderRadius:12,padding:14,cursor:"pointer",borderLeft:`3px solid ${c.status==="completed"?C.muted:C.green}`}}>
            <div style={{display:"flex",justifyContent:"space-between"}}><div style={{color:C.text,fontWeight:700,fontSize:14}}>{c.name}</div><Pill color={c.status==="completed"?C.muted:C.green}>{c.status}</Pill></div>
            <div style={{color:C.sub,fontSize:12,marginTop:4}}>{c.date} · {c.time} · {c.duration}min</div>
            <div style={{color:C.muted,fontSize:11,marginTop:2}}>{c.bookings?.length||0}/{c.capacity} enrolled</div>
            {c.formatId&&<div style={{marginTop:5}}><Pill color={C.teal}>{c.formatName}</Pill></div>}
          </div>
        ))}
      </div>

      {!sel?<Card style={{display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{textAlign:"center",color:C.muted}}><div style={{fontSize:32,marginBottom:10}}>📅</div>Select a class</div></Card>:(
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <Card>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
              <div><div style={{color:C.text,fontWeight:800,fontSize:18}}>{sel.name}</div><div style={{color:C.sub,fontSize:13,marginTop:2}}>{sel.date} · {sel.time} · {sel.duration}min{sel.location&&` · ${sel.location}`}</div></div>
              <div style={{display:"flex",gap:8}}>
                <Btn variant="ghost" color={C.blue} style={{padding:"6px 12px",fontSize:11}} onClick={()=>setModal({cls:sel})}>Edit</Btn>
                {sel.status==="scheduled"&&<Btn variant="ghost" color={C.green} style={{padding:"6px 12px",fontSize:11}} onClick={()=>onEdit(sel.id,{status:"completed"})}>✓ Complete</Btn>}
                <Btn variant="danger" style={{padding:"6px 12px",fontSize:11}} onClick={()=>setConfirm(sel.id)}>Delete</Btn>
              </div>
            </div>
            <div style={{background:C.s2,borderRadius:10,padding:"12px 14px",border:`1px solid ${selFmt?C.teal+"44":C.border}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div><SL style={{marginBottom:4}}>Class Format</SL>{selFmt?<div><div style={{color:C.text,fontWeight:700,fontSize:14}}>{selFmt.name}</div><div style={{color:C.muted,fontSize:11}}>{selFmt.stations?.length||0} stations</div></div>:<div style={{color:C.muted,fontSize:13}}>No format attached.</div>}</div>
                <div style={{display:"flex",gap:8}}>
                  {selFmt&&<Btn variant="danger" style={{padding:"5px 10px",fontSize:11}} onClick={()=>onEdit(sel.id,{format_id:null,format_name:null})}>Detach</Btn>}
                  {sel.status==="scheduled"&&<Btn variant="ghost" color={C.teal} style={{padding:"5px 10px",fontSize:11}} onClick={()=>setFmtModal(true)}>📋 Attach Format</Btn>}
                </div>
              </div>
            </div>
          </Card>

          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
            {[{label:"Enrolled",val:`${sel.bookings?.length||0}/${sel.capacity}`,color:C.text},{label:"Attended",val:(sel.bookings||[]).filter(b=>b.attendance==="attended").length,color:C.green},{label:"No-shows",val:(sel.bookings||[]).filter(b=>b.attendance==="no-show").length,color:C.red}].map(s=>(
              <div key={s.label} style={{background:C.s2,border:`1px solid ${C.border}`,borderRadius:9,padding:12,textAlign:"center"}}><div style={{color:C.muted,fontSize:10,textTransform:"uppercase",letterSpacing:"0.06em"}}>{s.label}</div><div style={{color:s.color,fontWeight:800,fontSize:22}}>{s.val}</div></div>
            ))}
          </div>

          <Card>
            <SL>Roster</SL>
            {(sel.bookings||[]).length===0&&<div style={{color:C.muted,fontSize:13,textAlign:"center",padding:"10px 0"}}>No one enrolled.</div>}
            <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:14}}>
              {(sel.bookings||[]).map(b=>{
                const cl=clients.find(c=>c.id===b.clientId);
                if(!cl)return null;
                return(
                  <div key={b.clientId} style={{display:"flex",alignItems:"center",gap:10,background:C.s2,borderRadius:9,padding:"10px 12px",border:`1px solid ${C.border}`}}>
                    <Avatar name={cl.name} size={28} color={TAG_COLORS[cl.tag]||C.sub}/>
                    <span style={{color:C.text,fontWeight:600,fontSize:13,flex:1}}>{cl.name}</span>
                    {sel.status==="scheduled"&&(
                      <div style={{display:"flex",gap:5}}>
                        {["attended","late","no-show"].map(s=>(
                          <button key={s} onClick={()=>markAttendance(b.clientId,s)} style={{padding:"3px 9px",borderRadius:6,border:`1px solid ${b.attendance===s?(AT[s]||C.green):C.border}`,background:b.attendance===s?(AT[s]||C.green)+"20":"transparent",color:b.attendance===s?(AT[s]||C.green):C.muted,fontSize:11,fontWeight:600,cursor:"pointer"}}>{s}</button>
                        ))}
                      </div>
                    )}
                    {b.attendance&&sel.status!=="scheduled"&&<Pill color={AT[b.attendance]||C.sub}>{b.attendance}</Pill>}
                    <button onClick={()=>toggleBooking(b.clientId)} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:16}}>×</button>
                  </div>
                );
              })}
            </div>
            {sel.status==="scheduled"&&(
              <><SL>Add Client</SL>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {clients.filter(c=>!(sel.bookings||[]).some(b=>b.clientId===c.id)).map(c=>(
                  <button key={c.id} onClick={()=>toggleBooking(c.id)} style={{display:"flex",alignItems:"center",gap:7,padding:"6px 12px",background:C.s2,border:`1px solid ${C.border}`,borderRadius:8,color:C.sub,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>
                    <Avatar name={c.name} size={20} color={TAG_COLORS[c.tag]||C.sub}/>{c.name}
                  </button>
                ))}
              </div></>
            )}
          </Card>
        </div>
      )}

      {fmtModal&&sel&&(
        <Modal title="Attach Class Format" onClose={()=>setFmtModal(false)} wide>
          {formats.length===0?<div style={{color:C.muted,textAlign:"center",padding:24}}>No formats yet. Build one in Programs → Class Formats.</div>:(
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {formats.map(f=>(
                <div key={f.id} style={{background:C.s2,borderRadius:10,padding:"12px 14px",border:`1px solid ${sel.formatId===f.id?C.teal+"55":C.border}`,cursor:"pointer"}} onClick={async()=>{await onEdit(sel.id,{format_id:f.id,format_name:f.name});setFmtModal(false);}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div><div style={{color:C.text,fontWeight:700,fontSize:14}}>{f.name}</div><div style={{color:C.muted,fontSize:11}}>{f.stations?.length||0} stations · {f.totalDuration}min</div></div>
                    {sel.formatId===f.id&&<Pill color={C.teal}>Attached</Pill>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}
      {(modal==="add"||modal?.cls)&&<Modal title={modal==="add"?"New Class":"Edit Class"} onClose={()=>setModal(null)} wide><ClassForm initial={modal?.cls} onSave={async f=>{if(modal==="add")await onAdd(f);else await onEdit(modal.cls.id,f);setModal(null);}} onClose={()=>setModal(null)}/></Modal>}
      {confirm&&<Confirm msg="Delete this class?" onConfirm={async()=>{await onDelete(confirm);if(selected===confirm)setSelected(null);setConfirm(null);}} onCancel={()=>setConfirm(null)}/>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROGRAMS HUB (inline — same as v3, but saving to Supabase)
// ═══════════════════════════════════════════════════════════════════════════════

const FORMAT_TYPES=[{value:"station",label:"Station Rotation"},{value:"circuit",label:"Circuit"},{value:"amrap",label:"AMRAP"},{value:"emom",label:"EMOM"},{value:"tabata",label:"Tabata"},{value:"custom",label:"Custom"}];

function ProgramBuilder({programs,onSave,onUpdate,onDelete,clients,onUpdateClient}){
  const [selected,setSelected]=useState(null);
  const [confirm,setConfirm]=useState(null);
  const [modal,setModal]=useState(null);
  const [exPicker,setExPicker]=useState(null);
  const prog=programs.find(p=>p.id===selected);

  const create=async()=>{
    const p={id:uid(),name:"New Program",description:"",weeks:4,daysPerWeek:3,days:[],assignedClients:[],createdAt:now()};
    await onSave(p); setSelected(p.id);
  };
  const upd=patch=>onUpdate(prog.id,{...prog,...patch});
  const addDay=()=>upd({days:[...(prog.days||[]),{id:uid(),label:`Day ${(prog.days?.length||0)+1}`,focus:"",exercises:[]}]});
  const updDay=(did,patch)=>upd({days:prog.days.map(d=>d.id===did?{...d,...patch}:d)});
  const rmDay=did=>upd({days:prog.days.filter(d=>d.id!==did)});
  const addEx=(did,name)=>updDay(did,{exercises:[...(prog.days.find(d=>d.id===did)?.exercises||[]),{id:uid(),name,sets:3,reps:"8-12",rest:90,notes:""}]});
  const updEx=(did,eid,patch)=>updDay(did,{exercises:prog.days.find(d=>d.id===did).exercises.map(e=>e.id===eid?{...e,...patch}:e)});
  const rmEx=(did,eid)=>updDay(did,{exercises:prog.days.find(d=>d.id===did).exercises.filter(e=>e.id!==eid)});
  const mvEx=(did,eid,dir)=>{
    const day=prog.days.find(d=>d.id===did);
    const arr=[...day.exercises]; const i=arr.findIndex(e=>e.id===eid); const ni=clamp(i+dir,0,arr.length-1);
    if(ni===i)return; [arr[i],arr[ni]]=[arr[ni],arr[i]]; updDay(did,{exercises:arr});
  };
  const toggleAssign=async(clientId)=>{
    const already=prog.assignedClients?.includes(clientId);
    const updated=already?prog.assignedClients.filter(id=>id!==clientId):[...(prog.assignedClients||[]),clientId];
    await upd({assignedClients:updated});
    await onUpdateClient(clientId,{program_id:already?null:prog.id});
  };

  return(
    <div style={{display:"grid",gridTemplateColumns:"240px 1fr",gap:16,minHeight:520}}>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        <Btn color={C.purple} onClick={create}>+ New Program</Btn>
        {programs.length===0&&<Card style={{textAlign:"center",padding:32}}><div style={{fontSize:28,marginBottom:8}}>📋</div><div style={{color:C.muted,fontSize:13}}>No programs yet.</div></Card>}
        {programs.map(p=>(
          <div key={p.id} onClick={()=>setSelected(p.id)} style={{background:C.surface,border:`1px solid ${selected===p.id?C.purple:C.border}`,borderRadius:12,padding:14,cursor:"pointer",borderLeft:`3px solid ${selected===p.id?C.purple:C.border}`}}>
            <div style={{color:C.text,fontWeight:700,fontSize:14}}>{p.name}</div>
            <div style={{color:C.muted,fontSize:11,marginTop:3}}>{p.weeks}wk · {p.daysPerWeek}d/wk · {p.days?.length||0} days</div>
            {p.assignedClients?.length>0&&<div style={{marginTop:5}}><Pill color={C.green}>{p.assignedClients.length} client{p.assignedClients.length>1?"s":""}</Pill></div>}
          </div>
        ))}
      </div>

      {!prog?<Card style={{display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{textAlign:"center",color:C.muted}}><div style={{fontSize:36,marginBottom:10}}>📋</div>Select or create a program</div></Card>:(
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <Card>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
              <SL>Program Settings</SL>
              <div style={{display:"flex",gap:8}}>
                <Btn variant="ghost" color={C.green} style={{padding:"5px 10px",fontSize:11}} onClick={()=>setModal("assign")}>👥 Assign</Btn>
                <Btn variant="danger" style={{padding:"5px 10px",fontSize:11}} onClick={()=>setConfirm(prog.id)}>Delete</Btn>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:12}}>
              <Input label="Program name" value={prog.name} onChange={v=>upd({name:v})} required/>
              <Input label="Weeks" type="number" value={prog.weeks} onChange={v=>upd({weeks:v})} min="1"/>
              <Input label="Days/week" type="number" value={prog.daysPerWeek} onChange={v=>upd({daysPerWeek:v})} min="1"/>
            </div>
            <div style={{marginTop:10}}><Input label="Description" value={prog.description} onChange={v=>upd({description:v})} placeholder="Goals, periodisation…"/></div>
            {prog.assignedClients?.length>0&&<div style={{marginTop:12,display:"flex",gap:6,flexWrap:"wrap"}}>{prog.assignedClients.map(id=>{const cl=clients.find(c=>c.id===id);return cl?<Pill key={id} color={C.green}>👤 {cl.name}</Pill>:null;})}</div>}
          </Card>

          {(prog.days||[]).map(day=>(
            <Card key={day.id} style={{borderColor:C.purple+"44"}}>
              <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:12}}>
                <input value={day.label} onChange={e=>updDay(day.id,{label:e.target.value})} style={{background:"none",border:"none",color:C.text,fontWeight:700,fontSize:15,outline:"none",fontFamily:"inherit",flex:1,padding:0}}/>
                <input value={day.focus} onChange={e=>updDay(day.id,{focus:e.target.value})} placeholder="Focus (Push, Lower…)" style={{background:C.s2,border:`1px solid ${C.border}`,borderRadius:7,padding:"5px 10px",color:C.sub,fontSize:12,outline:"none",fontFamily:"inherit",width:160}}/>
                <button onClick={()=>rmDay(day.id)} style={{background:"none",border:"none",color:C.muted,fontSize:18,cursor:"pointer",lineHeight:1}}>×</button>
              </div>
              {day.exercises?.length===0&&<div style={{color:C.muted,fontSize:12,textAlign:"center",padding:"10px 0"}}>No exercises yet.</div>}
              {day.exercises?.map((ex,ei)=>(
                <div key={ex.id} style={{background:C.s2,borderRadius:9,padding:"10px 12px",marginBottom:8,border:`1px solid ${C.border}`}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                    <div style={{display:"flex",flexDirection:"column",gap:2}}>
                      <button onClick={()=>mvEx(day.id,ex.id,-1)} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:12,lineHeight:1,padding:0}}>▲</button>
                      <button onClick={()=>mvEx(day.id,ex.id,1)} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:12,lineHeight:1,padding:0}}>▼</button>
                    </div>
                    <span style={{color:C.text,fontWeight:600,fontSize:13,flex:1}}>{ex.name}</span>
                    <button onClick={()=>rmEx(day.id,ex.id)} style={{background:"none",border:"none",color:C.muted,fontSize:16,cursor:"pointer",lineHeight:1}}>×</button>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"60px 80px 80px 1fr",gap:8}}>
                    {[{l:"Sets",f:"sets",t:"number"},{l:"Reps",f:"reps",t:"text"},{l:"Rest(s)",f:"rest",t:"number"}].map(fi=>(
                      <div key={fi.f}><div style={{color:C.muted,fontSize:10,marginBottom:3}}>{fi.l}</div><input type={fi.t} value={ex[fi.f]} onChange={e=>updEx(day.id,ex.id,{[fi.f]:e.target.value})} style={{width:"100%",background:C.s3,border:`1px solid ${C.border}`,borderRadius:6,padding:"5px 8px",color:C.text,fontSize:12,outline:"none",fontFamily:"inherit"}}/></div>
                    ))}
                    <div><div style={{color:C.muted,fontSize:10,marginBottom:3}}>Notes</div><input value={ex.notes} onChange={e=>updEx(day.id,ex.id,{notes:e.target.value})} placeholder="Cues…" style={{width:"100%",background:C.s3,border:`1px solid ${C.border}`,borderRadius:6,padding:"5px 8px",color:C.text,fontSize:12,outline:"none",fontFamily:"inherit"}}/></div>
                  </div>
                </div>
              ))}
              <Btn variant="ghost" color={C.purple} style={{padding:"5px 12px",fontSize:11,marginTop:4}} onClick={()=>setExPicker(day.id)}>+ Add Exercise</Btn>
            </Card>
          ))}

          <Btn variant="ghost" color={C.teal} onClick={addDay}>+ Add Training Day</Btn>

          {exPicker&&<Modal title="Add Exercise" onClose={()=>setExPicker(null)}><ExPicker onPick={name=>{addEx(exPicker,name);setExPicker(null);}} onClose={()=>setExPicker(null)}/></Modal>}
          {modal==="assign"&&(
            <Modal title={`Assign "${prog.name}"`} onClose={()=>setModal(null)} wide>
              <p style={{color:C.sub,fontSize:13,marginBottom:16}}>Assign this program to clients so they can load sessions from it.</p>
              {clients.length===0&&<div style={{color:C.muted,textAlign:"center",padding:24}}>No clients yet.</div>}
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {clients.map(cl=>{
                  const assigned=prog.assignedClients?.includes(cl.id);
                  return(
                    <div key={cl.id} style={{display:"flex",alignItems:"center",gap:12,background:C.s2,borderRadius:10,padding:"10px 14px",border:`1px solid ${assigned?C.green+"44":C.border}`}}>
                      <Avatar name={cl.name} size={30} color={TAG_COLORS[cl.tag]||C.sub}/>
                      <div style={{flex:1}}><div style={{color:C.text,fontWeight:600,fontSize:13}}>{cl.name}</div><div style={{color:C.muted,fontSize:11}}>{cl.tag} · {cl.status}</div></div>
                      <Btn variant={assigned?"danger":"ghost"} color={assigned?C.red:C.green} style={{padding:"5px 12px",fontSize:11}} onClick={()=>toggleAssign(cl.id)}>{assigned?"Unassign":"Assign"}</Btn>
                    </div>
                  );
                })}
              </div>
              <div style={{display:"flex",justifyContent:"flex-end",marginTop:16}}><Btn onClick={()=>setModal(null)}>Done</Btn></div>
            </Modal>
          )}
          {confirm&&<Confirm msg={`Delete "${prog.name}"?`} onConfirm={async()=>{await onDelete(confirm);setSelected(null);setConfirm(null);}} onCancel={()=>setConfirm(null)}/>}
        </div>
      )}
    </div>
  );
}

function ClassFormatBuilder({formats,onSave,onUpdate,onDelete,classes,onUpdateClass}){
  const [selected,setSelected]=useState(null);
  const [confirm,setConfirm]=useState(null);
  const [stPicker,setStPicker]=useState(false);
  const [loadModal,setLoadModal]=useState(false);
  const fmt=formats.find(f=>f.id===selected);

  const create=async()=>{
    const f={id:uid(),name:"New Class Format",type:"circuit",description:"",totalDuration:45,workSec:40,restSec:20,rounds:3,stations:[],createdAt:now()};
    await onSave(f); setSelected(f.id);
  };
  const upd=patch=>onUpdate(fmt.id,{...fmt,...patch});
  const addSt=name=>upd({stations:[...(fmt.stations||[]),{id:uid(),name,workSec:fmt.workSec,restSec:fmt.restSec,reps:"",notes:"",equipment:""}]});
  const updSt=(sid,patch)=>upd({stations:fmt.stations.map(s=>s.id===sid?{...s,...patch}:s)});
  const rmSt=sid=>upd({stations:fmt.stations.filter(s=>s.id!==sid)});
  const mvSt=(sid,dir)=>{
    const arr=[...fmt.stations]; const i=arr.findIndex(s=>s.id===sid); const ni=clamp(i+dir,0,arr.length-1);
    if(ni===i)return; [arr[i],arr[ni]]=[arr[ni],arr[i]]; upd({stations:arr});
  };
  const COLS=(i)=>[C.green,C.blue,C.purple,C.amber,C.red,C.teal][i%6];

  return(
    <div style={{display:"grid",gridTemplateColumns:"240px 1fr",gap:16,minHeight:520}}>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        <Btn color={C.teal} onClick={create}>+ New Class Format</Btn>
        {formats.length===0&&<Card style={{textAlign:"center",padding:32}}><div style={{fontSize:28,marginBottom:8}}>🏋️</div><div style={{color:C.muted,fontSize:13}}>No formats yet.</div></Card>}
        {formats.map(f=>(
          <div key={f.id} onClick={()=>setSelected(f.id)} style={{background:C.surface,border:`1px solid ${selected===f.id?C.teal:C.border}`,borderRadius:12,padding:14,cursor:"pointer",borderLeft:`3px solid ${selected===f.id?C.teal:C.border}`}}>
            <div style={{color:C.text,fontWeight:700,fontSize:14}}>{f.name}</div>
            <div style={{color:C.muted,fontSize:11,marginTop:3}}>{FORMAT_TYPES.find(t=>t.value===f.type)?.label} · {f.stations?.length||0} stations · {f.totalDuration}min</div>
          </div>
        ))}
      </div>

      {!fmt?<Card style={{display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{textAlign:"center",color:C.muted}}><div style={{fontSize:36,marginBottom:10}}>🏋️</div>Select or create a format</div></Card>:(
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <Card>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
              <SL>Format Settings</SL>
              <div style={{display:"flex",gap:8}}>
                <Btn variant="ghost" color={C.teal} style={{padding:"5px 10px",fontSize:11}} onClick={()=>setLoadModal(true)}>📅 Load into Class</Btn>
                <Btn variant="danger" style={{padding:"5px 10px",fontSize:11}} onClick={()=>setConfirm(fmt.id)}>Delete</Btn>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:12,marginBottom:12}}>
              <Input label="Format name" value={fmt.name} onChange={v=>upd({name:v})} required/>
              <Select label="Type" value={fmt.type} onChange={v=>upd({type:v})} options={FORMAT_TYPES}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:12}}>
              <Input label="Work (sec)" type="number" value={fmt.workSec} onChange={v=>upd({workSec:v})}/>
              <Input label="Rest (sec)" type="number" value={fmt.restSec} onChange={v=>upd({restSec:v})}/>
              <Input label="Rounds" type="number" value={fmt.rounds} onChange={v=>upd({rounds:v})}/>
              <Input label="Total (min)" type="number" value={fmt.totalDuration} onChange={v=>upd({totalDuration:v})}/>
            </div>
            <Input label="Description / coach notes" value={fmt.description} onChange={v=>upd({description:v})} placeholder="Class flow, music cues…"/>
          </Card>

          {fmt.stations?.length>0&&(
            <div style={{background:C.s2,border:`1px solid ${C.border}`,borderRadius:12,padding:"14px 16px"}}>
              <SL>Station Overview · {fmt.stations.length} stations</SL>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {fmt.stations.map((st,i)=>(
                  <div key={st.id} style={{background:COLS(i)+"18",border:`1px solid ${COLS(i)}44`,borderRadius:9,padding:"8px 12px",minWidth:100,textAlign:"center"}}>
                    <div style={{color:COLS(i),fontSize:10,fontWeight:700,marginBottom:2}}>#{i+1}</div>
                    <div style={{color:C.text,fontSize:12,fontWeight:600}}>{st.name}</div>
                    <div style={{color:C.muted,fontSize:10}}>{st.workSec}s on · {st.restSec}s off</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Card>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <SL>Stations / Exercises</SL>
              <Btn variant="ghost" color={C.teal} style={{padding:"5px 12px",fontSize:11}} onClick={()=>setStPicker(true)}>+ Add Station</Btn>
            </div>
            {fmt.stations?.length===0&&<div style={{color:C.muted,fontSize:13,textAlign:"center",padding:"20px 0"}}>No stations yet.</div>}
            {fmt.stations?.map((st,i)=>(
              <div key={st.id} style={{background:C.s2,borderRadius:10,padding:"12px 14px",marginBottom:10,border:`1px solid ${COLS(i)}33`}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                  <div style={{width:26,height:26,borderRadius:7,background:COLS(i)+"22",border:`1px solid ${COLS(i)}44`,display:"flex",alignItems:"center",justifyContent:"center",color:COLS(i),fontWeight:800,fontSize:12,flexShrink:0}}>{i+1}</div>
                  <input value={st.name} onChange={e=>updSt(st.id,{name:e.target.value})} style={{flex:1,background:"none",border:"none",color:C.text,fontWeight:700,fontSize:14,outline:"none",fontFamily:"inherit",padding:0}}/>
                  <div style={{display:"flex",gap:4}}>
                    <button onClick={()=>mvSt(st.id,-1)} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:13}}>▲</button>
                    <button onClick={()=>mvSt(st.id,1)} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:13}}>▼</button>
                    <button onClick={()=>rmSt(st.id)} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:16,lineHeight:1}}>×</button>
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"80px 80px 80px 1fr 1fr",gap:8}}>
                  {[{l:"Work (s)",f:"workSec",t:"number"},{l:"Rest (s)",f:"restSec",t:"number"},{l:"Reps",f:"reps",t:"text"},{l:"Equipment",f:"equipment",t:"text"},{l:"Coach cue",f:"notes",t:"text"}].map(fi=>(
                    <div key={fi.f}><div style={{color:C.muted,fontSize:10,marginBottom:3}}>{fi.l}</div><input type={fi.t} value={st[fi.f]} onChange={e=>updSt(st.id,{[fi.f]:e.target.value})} style={{width:"100%",background:C.s3,border:`1px solid ${C.border}`,borderRadius:6,padding:"5px 8px",color:fi.f==="workSec"?COLS(i):C.text,fontWeight:fi.f==="workSec"?700:400,fontSize:12,outline:"none",fontFamily:"inherit"}}/></div>
                  ))}
                </div>
              </div>
            ))}
          </Card>

          {stPicker&&<Modal title="Add Station" onClose={()=>setStPicker(false)}><ExPicker onPick={name=>{addSt(name);setStPicker(false);}} onClose={()=>setStPicker(false)}/></Modal>}
          {loadModal&&(
            <Modal title={`Load "${fmt.name}" into a Class`} onClose={()=>setLoadModal(false)} wide>
              {classes.filter(c=>c.status==="scheduled").length===0?<div style={{color:C.muted,textAlign:"center",padding:24}}>No upcoming classes.</div>:(
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {classes.filter(c=>c.status==="scheduled").map(cl=>(
                    <div key={cl.id} style={{background:C.s2,borderRadius:10,padding:"12px 14px",border:`1px solid ${cl.formatId===fmt.id?C.teal+"44":C.border}`,cursor:"pointer"}} onClick={async()=>{await onUpdateClass(cl.id,{format_id:fmt.id,format_name:fmt.name});setLoadModal(false);}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <div><div style={{color:C.text,fontWeight:700,fontSize:14}}>{cl.name}</div><div style={{color:C.muted,fontSize:11}}>{cl.date} · {cl.time}</div></div>
                        {cl.formatId===fmt.id&&<Pill color={C.teal}>Loaded ✓</Pill>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div style={{display:"flex",justifyContent:"flex-end",marginTop:16}}><Btn onClick={()=>setLoadModal(false)}>Done</Btn></div>
            </Modal>
          )}
          {confirm&&<Confirm msg={`Delete "${fmt.name}"?`} onConfirm={async()=>{await onDelete(confirm);setSelected(null);setConfirm(null);}} onCancel={()=>setConfirm(null)}/>}
        </div>
      )}
    </div>
  );
}

function ProgramsHub({programs,onSaveProgram,onUpdateProgram,onDeleteProgram,formats,onSaveFormat,onUpdateFormat,onDeleteFormat,clients,onUpdateClient,classes,onUpdateClass}){
  const [tab,setTab]=useState("programs");
  return(
    <div>
      <div style={{display:"flex",gap:2,marginBottom:20,borderBottom:`1px solid ${C.border}`}}>
        {[["programs","📋 Training Programs",C.purple],["formats","🏋️ Class Formats",C.teal]].map(([id,label,color])=>(
          <button key={id} onClick={()=>setTab(id)} style={{padding:"10px 18px",border:"none",background:"none",cursor:"pointer",color:tab===id?color:C.sub,fontWeight:tab===id?700:500,fontSize:14,borderBottom:`2px solid ${tab===id?color:"transparent"}`}}>{label}</button>
        ))}
      </div>
      {tab==="programs"&&<ProgramBuilder programs={programs} onSave={onSaveProgram} onUpdate={onUpdateProgram} onDelete={onDeleteProgram} clients={clients} onUpdateClient={onUpdateClient}/>}
      {tab==="formats"&&<ClassFormatBuilder formats={formats} onSave={onSaveFormat} onUpdate={onUpdateFormat} onDelete={onDeleteFormat} classes={classes} onUpdateClass={onUpdateClass}/>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════

function Dashboard({clients,sessions,classes,programs,formats,setView,setActiveClient}){
  const active=clients.filter(c=>c.status==="active");
  const upcoming=[...classes].filter(c=>c.status==="scheduled").sort((a,b)=>new Date(a.date+" "+a.time)-new Date(b.date+" "+b.time)).slice(0,4);
  const recent=[...sessions].sort((a,b)=>new Date(b.startedAt)-new Date(a.startedAt)).slice(0,5);
  const totalPRs=sessions.reduce((a,s)=>a+(s.exercises||[]).reduce((b,e)=>b+(e.sets||[]).filter(st=>st.pr&&st.done).length,0),0);
  return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
        {[{label:"Active Clients",val:active.length,sub:`${clients.length} total`,color:C.green,icon:"👥"},{label:"Sessions Logged",val:sessions.length,sub:"all time",color:C.blue,icon:"⚡"},{label:"Programs Built",val:programs.length,sub:`${formats.length} class formats`,color:C.purple,icon:"📋"},{label:"PRs Logged",val:totalPRs,sub:"all time",color:C.amber,icon:"🏆"}].map(s=>(
          <Card key={s.label} style={{padding:"14px 16px"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:11,color:C.sub}}>{s.label}</span><span style={{fontSize:16}}>{s.icon}</span></div>
            <div style={{fontSize:30,fontWeight:800,color:C.text,lineHeight:1}}>{s.val}</div>
            <div style={{fontSize:11,color:s.color,fontWeight:600,marginTop:4}}>{s.sub}</div>
          </Card>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <Card>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}><SL>Upcoming Classes</SL><span onClick={()=>setView("classes")} style={{color:C.green,fontSize:12,cursor:"pointer"}}>View all →</span></div>
          {upcoming.length===0?<div style={{color:C.muted,fontSize:13,textAlign:"center",padding:"16px 0"}}>No classes. <span onClick={()=>setView("classes")} style={{color:C.green,cursor:"pointer"}}>Add one →</span></div>:upcoming.map((c,i)=>(
            <div key={c.id} style={{display:"flex",gap:12,padding:"10px 0",borderBottom:i<upcoming.length-1?`1px solid ${C.border}`:"none"}}>
              <div style={{width:3,borderRadius:2,background:C.green,flexShrink:0,alignSelf:"stretch"}}/>
              <div style={{flex:1}}><div style={{color:C.text,fontWeight:600,fontSize:13}}>{c.name}</div><div style={{color:C.muted,fontSize:11}}>{c.date} · {c.time} · {c.bookings?.length||0}/{c.capacity}{c.formatId&&` · ${c.formatName}`}</div></div>
            </div>
          ))}
        </Card>
        <Card>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}><SL>Recent Sessions</SL><span onClick={()=>setView("sessions")} style={{color:C.green,fontSize:12,cursor:"pointer"}}>Log session →</span></div>
          {recent.length===0?<div style={{color:C.muted,fontSize:13,textAlign:"center",padding:"16px 0"}}>No sessions. <span onClick={()=>setView("sessions")} style={{color:C.green,cursor:"pointer"}}>Log first →</span></div>:recent.map((s,i)=>{
            const cl=clients.find(c=>c.id===s.clientId);
            const hasPR=s.exercises?.some(e=>e.sets?.some(st=>st.pr&&st.done));
            return(<div key={s.id} style={{display:"flex",gap:10,padding:"10px 0",borderBottom:i<recent.length-1?`1px solid ${C.border}`:"none",alignItems:"center"}}>
              {cl&&<Avatar name={cl.name} size={28} color={TAG_COLORS[cl.tag]||C.sub}/>}
              <div style={{flex:1}}><div style={{color:C.text,fontSize:13,fontWeight:600}}>{cl?.name||"?"} — {s.name}</div><div style={{color:C.muted,fontSize:11}}>{fmtDate(s.startedAt)}{s.programDay&&` · ${s.programDay}`}</div></div>
              {hasPR&&<Pill color={C.amber}>🏆</Pill>}
            </div>);
          })}
        </Card>
      </div>
      {active.length>0&&(
        <Card>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}><SL>Active Clients</SL><span onClick={()=>setView("clients")} style={{color:C.green,fontSize:12,cursor:"pointer"}}>All →</span></div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            {active.slice(0,10).map(c=>(
              <div key={c.id} onClick={()=>{setActiveClient(c);setView("client");}} style={{background:C.s2,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px",textAlign:"center",cursor:"pointer",minWidth:90}}>
                <Avatar name={c.name} size={34} color={TAG_COLORS[c.tag]||C.sub}/>
                <div style={{color:C.text,fontWeight:600,fontSize:12,marginTop:8}}>{c.name.split(" ")[0]}</div>
                {c.programId&&<div style={{marginTop:3}}><Pill color={C.purple}>📋</Pill></div>}
                <div style={{color:C.muted,fontSize:10,marginTop:2}}>{c.sessionCount||0} sessions</div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════════
// EXERCISE CATALOG
// ═══════════════════════════════════════════════════════════════════════════════
