// FitOS — Group Classes screen
import React, { useState } from "react";
import { C, uid, now, fmtDate } from "./config.js";
import { Avatar, Pill, Btn, Card, SL, Input, Select, Modal, Confirm } from "./ui.jsx";

// GROUP CLASSES
// ═══════════════════════════════════════════════════════════════════════════════

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

export { ClassesScreen };
