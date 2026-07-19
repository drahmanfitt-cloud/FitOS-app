// FitOS — Group Classes screen
import React, { useState } from "react";
import { C, uid, now, fmtDate, TAG_COLORS } from "./config.js";
import { Avatar, Pill, Btn, Card, SL, Input, Select, Modal, Confirm } from "./ui.jsx";
import { ClassRunPanel } from "./display.jsx";

// GROUP CLASSES
// ═══════════════════════════════════════════════════════════════════════════════

const FOCUS_OPTIONS=["Full Body","Upper Body","Lower Body","Push","Pull","Legs","Core","Conditioning","HIIT","Strength","Mobility","Cardio"];
const WEEKDAYS=[{lbl:"Mon",d:1},{lbl:"Tue",d:2},{lbl:"Wed",d:3},{lbl:"Thu",d:4},{lbl:"Fri",d:5},{lbl:"Sat",d:6},{lbl:"Sun",d:0}];
const isoDate=dt=>`${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,"0")}-${String(dt.getDate()).padStart(2,"0")}`;

function FocusPicker({value,onChange}){
  return(
    <div style={{display:"flex",flexDirection:"column",gap:6}}>
      <Input label="Focus" value={value} onChange={onChange} placeholder="e.g. Lower Body, Conditioning"/>
      <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
        {FOCUS_OPTIONS.map(o=>(
          <button key={o} type="button" onClick={()=>onChange(o)} style={{padding:"4px 9px",borderRadius:7,border:`1px solid ${value===o?C.teal:C.border}`,background:value===o?C.teal+"22":"transparent",color:value===o?C.teal:C.muted,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>{o}</button>
        ))}
      </div>
    </div>
  );
}

function ClassForm({initial,onSubmit,onClose}){
  const EMPTY={name:"",date:"",time:"",duration:45,capacity:12,location:"",notes:"",focus:""};
  const editing=!!initial;
  const [f,setF]=useState(initial?{...EMPTY,...initial}:EMPTY);
  const [rec,setRec]=useState({mode:"once",days:[],weeks:4,perDay:{}});
  const set=k=>v=>setF(p=>({...p,[k]:v}));
  const toggleDay=d=>setRec(p=>({...p,days:p.days.includes(d)?p.days.filter(x=>x!==d):[...p.days,d]}));
  const setPerDay=(d,v)=>setRec(p=>({...p,perDay:{...p.perDay,[d]:v}}));

  const buildOccurrences=()=>{
    if(!f.date)return[];
    const base=new Date(f.date+"T00:00:00");
    const out=[];
    rec.days.forEach(d=>{
      const diff=(d-base.getDay()+7)%7;
      const first=new Date(base); first.setDate(base.getDate()+diff);
      for(let w=0;w<Math.max(1,Number(rec.weeks)||1);w++){
        const dt=new Date(first); dt.setDate(first.getDate()+7*w);
        out.push({...f,date:isoDate(dt),focus:(rec.perDay[d]||"").trim()||f.focus});
      }
    });
    return out.sort((a,b)=>a.date.localeCompare(b.date));
  };

  const weeklyMode=rec.mode==="weekly";
  const recurring=weeklyMode&&rec.days.length>0;
  const count=recurring?buildOccurrences().length:0;
  const valid=f.name.trim()&&f.date&&f.time&&(!weeklyMode||count>0);
  const save=()=>{ if(!valid)return; if(recurring)onSubmit({mode:"series",occurrences:buildOccurrences(),base:f}); else onSubmit({mode:"single",base:f}); };

  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <Input label="Class name" value={f.name} onChange={set("name")} required/>
      <FocusPicker value={f.focus} onChange={set("focus")}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Input label={recurring?"Start date":"Date"} value={f.date} onChange={set("date")} type="date" required/>
        <Input label="Time" value={f.time} onChange={set("time")} type="time" required/>
        <Input label="Duration (min)" value={f.duration} onChange={set("duration")} type="number"/>
        <Input label="Max capacity" value={f.capacity} onChange={set("capacity")} type="number"/>
      </div>
      <Input label="Location" value={f.location} onChange={set("location")}/>
      <Input label="Notes" value={f.notes} onChange={set("notes")}/>

      {(
        <div style={{background:C.s2,border:`1px solid ${C.border}`,borderRadius:12,padding:14,display:"flex",flexDirection:"column",gap:12}}>
          <div style={{display:"flex",gap:8}}>
            {[{k:"once",l:editing?"Don't repeat":"One-off"},{k:"weekly",l:"↻ Repeat weekly"}].map(m=>(
              <button key={m.k} type="button" onClick={()=>setRec(p=>({...p,mode:m.k}))} style={{flex:1,padding:"8px 10px",borderRadius:8,border:`1px solid ${rec.mode===m.k?C.teal:C.border}`,background:rec.mode===m.k?C.teal+"1f":"transparent",color:rec.mode===m.k?C.teal:C.sub,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{m.l}</button>
            ))}
          </div>
          {editing&&rec.mode==="weekly"&&<div style={{color:C.muted,fontSize:11,lineHeight:1.5}}>This class becomes the start of the series; the extra dates are added as new linked classes.</div>}
          {rec.mode==="weekly"&&(
            <>
              <div>
                <SL style={{marginBottom:6}}>Repeat on</SL>
                <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                  {WEEKDAYS.map(w=>(
                    <button key={w.d} type="button" onClick={()=>toggleDay(w.d)} style={{width:42,padding:"7px 0",borderRadius:8,border:`1px solid ${rec.days.includes(w.d)?C.teal:C.border}`,background:rec.days.includes(w.d)?C.teal+"22":"transparent",color:rec.days.includes(w.d)?C.teal:C.muted,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{w.lbl}</button>
                  ))}
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{color:C.sub,fontSize:12,fontWeight:600}}>For</span>
                <div style={{width:80}}><Input value={rec.weeks} onChange={v=>setRec(p=>({...p,weeks:v}))} type="number"/></div>
                <span style={{color:C.sub,fontSize:12,fontWeight:600}}>weeks</span>
              </div>
              {rec.days.length>0&&(
                <div>
                  <SL style={{marginBottom:6}}>Focus per day <span style={{color:C.muted,fontWeight:400,textTransform:"none",letterSpacing:0}}>(optional — defaults to the focus above)</span></SL>
                  <div style={{display:"flex",flexDirection:"column",gap:6}}>
                    {[...rec.days].sort((a,b)=>((a+6)%7)-((b+6)%7)).map(d=>{
                      const w=WEEKDAYS.find(x=>x.d===d);
                      return(
                        <div key={d} style={{display:"flex",alignItems:"center",gap:10}}>
                          <span style={{color:C.text,fontSize:12,fontWeight:700,width:38}}>{w.lbl}</span>
                          <div style={{flex:1}}><Input value={rec.perDay[d]||""} onChange={v=>setPerDay(d,v)} placeholder={f.focus||"Focus for this day"}/></div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      <div style={{display:"flex",gap:10,justifyContent:"flex-end",alignItems:"center"}}>
        {recurring&&<span style={{color:C.muted,fontSize:12,marginRight:"auto"}}>{count} class{count===1?"":"es"} will be created</span>}
        {weeklyMode&&!rec.days.length&&<span style={{color:C.amber,fontSize:12,marginRight:"auto"}}>Pick at least one weekday</span>}
        <Btn variant="outline" onClick={onClose}>Cancel</Btn>
        <Btn disabled={!valid} onClick={save}>{recurring?(editing?`Save + Schedule ${count}`:`Schedule ${count} Classes`):"Save Class"}</Btn>
      </div>
    </div>
  );
}

function ClassesScreen({clients,classes,onAdd,onAddSeries,onEdit,onDelete,onDeleteSeries,formats,mobile}){
  const [selected,setSelected]=useState(null);
  const [modal,setModal]=useState(null);
  const [confirm,setConfirm]=useState(null);
  const [confirmSeries,setConfirmSeries]=useState(null);
  const [fmtModal,setFmtModal]=useState(false);
  const [showHistory,setShowHistory]=useState(false);
  const sorted=[...classes].sort((a,b)=>new Date(a.date+" "+a.time)-new Date(b.date+" "+b.time));
  const visible=showHistory?sorted.filter(c=>c.status==="completed").reverse():sorted.filter(c=>c.status!=="completed");
  const sel=classes.find(c=>c.id===selected);
  const selFmt=sel?formats.find(f=>f.id===sel.formatId):null;
  const seriesCount=sel?.seriesId?classes.filter(c=>c.seriesId===sel.seriesId).length:0;
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
  const submitClass=async payload=>{
    const isAdd=modal==="add";
    if(payload.mode==="single"){
      if(isAdd)await onAdd(payload.base); else await onEdit(modal.cls.id,payload.base);
    }else{ // series
      if(isAdd){ await onAddSeries(payload.occurrences); }
      else{
        const ex=modal.cls; const start=payload.base.date;
        const extra=payload.occurrences.filter(o=>o.date!==start);
        if(!extra.length){ await onEdit(ex.id,payload.base); }
        else{
          const seriesId=uid();
          const startOcc=payload.occurrences.find(o=>o.date===start);
          const ok=await onEdit(ex.id,{...payload.base,focus:startOcc?startOcc.focus:payload.base.focus,series_id:seriesId});
          if(ok)await onAddSeries(extra,seriesId);
        }
      }
    }
    setModal(null);
  };

  // On mobile: show list OR detail, not side-by-side
  if(mobile&&sel){
    return(
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <Btn variant="outline" style={{alignSelf:"flex-start",padding:"6px 12px",fontSize:12}} onClick={()=>setSelected(null)}>← Classes</Btn>
        <Card>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
            <div><div style={{color:C.text,fontWeight:800,fontSize:18}}>{sel.name}</div><div style={{color:C.sub,fontSize:13,marginTop:2}}>{sel.date} · {sel.time} · {sel.duration}min{sel.location&&` · ${sel.location}`}</div>
              {(sel.focus||sel.seriesId)&&<div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:6}}>{sel.focus&&<Pill color={C.purple||C.teal}>🎯 {sel.focus}</Pill>}{sel.seriesId&&<Pill color={C.amber}>↻ Recurring</Pill>}</div>}</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",justifyContent:"flex-end"}}>
              <Btn variant="ghost" color={C.blue} style={{padding:"6px 10px",fontSize:11}} onClick={()=>setModal({cls:sel})}>Edit</Btn>
              {sel.status==="scheduled"&&<Btn variant="ghost" color={C.green} style={{padding:"6px 10px",fontSize:11}} onClick={()=>onEdit(sel.id,{status:"completed"})}>✓ Done</Btn>}
              <Btn variant="danger" style={{padding:"6px 10px",fontSize:11}} onClick={()=>setConfirm(sel.id)}>Delete</Btn>
              {seriesCount>1&&<Btn variant="ghost" color={C.red} style={{padding:"6px 10px",fontSize:11}} onClick={()=>setConfirmSeries(sel.seriesId)}>Delete series</Btn>}
            </div>
          </div>
          <div style={{background:C.s2,borderRadius:10,padding:"12px 14px",border:`1px solid ${selFmt?C.teal+"44":C.border}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div><SL style={{marginBottom:4}}>Format</SL>{selFmt?<div><div style={{color:C.text,fontWeight:700,fontSize:14}}>{selFmt.name}</div><div style={{color:C.muted,fontSize:11}}>{selFmt.stations?.length||0} stations</div></div>:<div style={{color:C.muted,fontSize:13}}>No format attached.</div>}</div>
              <div style={{display:"flex",gap:6}}>
                {selFmt&&<Btn variant="danger" style={{padding:"5px 8px",fontSize:10}} onClick={()=>onEdit(sel.id,{format_id:null,format_name:null})}>Detach</Btn>}
                {sel.status==="scheduled"&&<Btn variant="ghost" color={C.teal} style={{padding:"5px 8px",fontSize:10}} onClick={()=>setFmtModal(true)}>📋 Attach</Btn>}
              </div>
            </div>
            {selFmt&&sel.status==="scheduled"&&<ClassRunPanel format={selFmt} mobile={mobile}/>}
          </div>
        </Card>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
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
                    <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                      {["attended","late","no-show"].map(s=>(
                        <button key={s} onClick={()=>markAttendance(b.clientId,s)} style={{padding:"3px 7px",borderRadius:6,border:`1px solid ${b.attendance===s?(AT[s]||C.green):C.border}`,background:b.attendance===s?(AT[s]||C.green)+"20":"transparent",color:b.attendance===s?(AT[s]||C.green):C.muted,fontSize:10,fontWeight:600,cursor:"pointer"}}>{s}</button>
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
        {fmtModal&&<Modal title="Attach Format" onClose={()=>setFmtModal(false)} wide>{formats.length===0?<div style={{color:C.muted,textAlign:"center",padding:24}}>No formats yet.</div>:<div style={{display:"flex",flexDirection:"column",gap:8}}>{formats.map(f=><div key={f.id} style={{background:C.s2,borderRadius:10,padding:"12px 14px",border:`1px solid ${sel.formatId===f.id?C.teal+"55":C.border}`,cursor:"pointer"}} onClick={async()=>{await onEdit(sel.id,{format_id:f.id,format_name:f.name});setFmtModal(false);}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{color:C.text,fontWeight:700,fontSize:14}}>{f.name}</div><div style={{color:C.muted,fontSize:11}}>{f.stations?.length||0} stations · {f.totalDuration}min</div></div>{sel.formatId===f.id&&<Pill color={C.teal}>Attached</Pill>}</div></div>)}</div>}</Modal>}
        {(modal==="add"||modal?.cls)&&<Modal title={modal==="add"?"New Class":"Edit Class"} onClose={()=>setModal(null)} wide><ClassForm initial={modal?.cls} onSubmit={submitClass} onClose={()=>setModal(null)}/></Modal>}
        {confirm&&<Confirm msg="Delete this class?" onConfirm={async()=>{await onDelete(confirm);if(selected===confirm)setSelected(null);setConfirm(null);}} onCancel={()=>setConfirm(null)}/>}
        {confirmSeries&&<Confirm msg={`Delete all ${seriesCount} classes in this recurring series?`} onConfirm={async()=>{await onDeleteSeries(confirmSeries);setSelected(null);setConfirmSeries(null);}} onCancel={()=>setConfirmSeries(null)}/>}
      </div>
    );
  }

  return(
    <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"280px 1fr",gap:16,minHeight:mobile?0:500}}>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        <div style={{display:"flex",gap:8}}>
          <Btn style={{flex:1,justifyContent:"center"}} onClick={()=>setModal("add")}>+ New Class</Btn>
          <Btn variant={showHistory?"ghost":"outline"} color={C.amber} onClick={()=>{setShowHistory(h=>!h);setSelected(null);}}>🕘 History</Btn>
        </div>
        {visible.length===0&&<Card style={{textAlign:"center",padding:32}}><div style={{fontSize:28,marginBottom:8}}>{showHistory?"🕘":"📅"}</div><div style={{color:C.muted,fontSize:13}}>{showHistory?"No completed classes yet.":"No upcoming classes."}</div></Card>}
        {visible.map(c=>(
          <div key={c.id} onClick={()=>setSelected(c.id)} style={{background:C.surface,border:`1px solid ${selected===c.id?C.green:C.border}`,borderRadius:12,padding:14,cursor:"pointer",borderLeft:`3px solid ${c.status==="completed"?C.muted:C.green}`}}>
            <div style={{display:"flex",justifyContent:"space-between"}}><div style={{color:C.text,fontWeight:700,fontSize:14,display:"flex",alignItems:"center",gap:5}}>{c.seriesId&&<span title="Recurring" style={{color:C.amber}}>↻</span>}{c.name}</div><Pill color={c.status==="completed"?C.muted:C.green}>{c.status}</Pill></div>
            <div style={{color:C.sub,fontSize:12,marginTop:4}}>{c.date} · {c.time} · {c.duration}min</div>
            <div style={{color:C.muted,fontSize:11,marginTop:2}}>{c.bookings?.length||0}/{c.capacity} enrolled</div>
            {(c.focus||c.formatId)&&<div style={{marginTop:5,display:"flex",gap:5,flexWrap:"wrap"}}>{c.focus&&<Pill color={C.purple}>{c.focus}</Pill>}{c.formatId&&<Pill color={C.teal}>{c.formatName}</Pill>}</div>}
          </div>
        ))}
      </div>

      {!sel?<Card style={{display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{textAlign:"center",color:C.muted}}><div style={{fontSize:32,marginBottom:10}}>📅</div>Select a class</div></Card>:(
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <Card>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
              <div><div style={{color:C.text,fontWeight:800,fontSize:18}}>{sel.name}</div><div style={{color:C.sub,fontSize:13,marginTop:2}}>{sel.date} · {sel.time} · {sel.duration}min{sel.location&&` · ${sel.location}`}</div>
                {(sel.focus||sel.seriesId)&&<div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:6}}>{sel.focus&&<Pill color={C.purple}>🎯 {sel.focus}</Pill>}{sel.seriesId&&<Pill color={C.amber}>↻ Recurring{seriesCount>1?` · ${seriesCount}`:""}</Pill>}</div>}</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"flex-end"}}>
                <Btn variant="ghost" color={C.blue} style={{padding:"6px 12px",fontSize:11}} onClick={()=>setModal({cls:sel})}>Edit</Btn>
                {sel.status==="scheduled"&&<Btn variant="ghost" color={C.green} style={{padding:"6px 12px",fontSize:11}} onClick={()=>onEdit(sel.id,{status:"completed"})}>✓ Complete</Btn>}
                <Btn variant="danger" style={{padding:"6px 12px",fontSize:11}} onClick={()=>setConfirm(sel.id)}>Delete</Btn>
                {seriesCount>1&&<Btn variant="ghost" color={C.red} style={{padding:"6px 12px",fontSize:11}} onClick={()=>setConfirmSeries(sel.seriesId)}>Delete series</Btn>}
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
              {selFmt&&sel.status==="scheduled"&&<ClassRunPanel format={selFmt} mobile={mobile}/>}
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
      {(modal==="add"||modal?.cls)&&<Modal title={modal==="add"?"New Class":"Edit Class"} onClose={()=>setModal(null)} wide><ClassForm initial={modal?.cls} onSubmit={submitClass} onClose={()=>setModal(null)}/></Modal>}
      {confirm&&<Confirm msg="Delete this class?" onConfirm={async()=>{await onDelete(confirm);if(selected===confirm)setSelected(null);setConfirm(null);}} onCancel={()=>setConfirm(null)}/>}
      {confirmSeries&&<Confirm msg={`Delete all ${seriesCount} classes in this recurring series?`} onConfirm={async()=>{await onDeleteSeries(confirmSeries);setSelected(null);setConfirmSeries(null);}} onCancel={()=>setConfirmSeries(null)}/>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════

export { ClassesScreen };
