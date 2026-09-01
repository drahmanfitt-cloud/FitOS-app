// FitOS — Group Classes screen
import React, { useEffect, useState } from "react";
import { C, uid, now, fmtDate, TAG_COLORS } from "./config.js";
import { Avatar, Pill, Btn, Card, SL, Input, Modal, Confirm } from "./ui.jsx";
import { ClassRunPanel } from "./display.jsx";
import { TaskForm } from "./tasks.jsx";

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

function ClassForm({initial,initialDate,onSubmit,onClose}){
  const EMPTY={name:"",date:"",time:"",duration:45,capacity:12,location:"",notes:"",focus:""};
  const editing=!!initial;
  const [f,setF]=useState(initial?{...EMPTY,...initial}:{...EMPTY,date:initialDate||""});
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

const DAY=86400000;
const dateOnly=s=>new Date(`${s}T00:00:00`);
const mondayOf=d=>{const x=new Date(d);x.setHours(0,0,0,0);x.setDate(x.getDate()-((x.getDay()+6)%7));return x;};
const addDays=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x;};
const minutes=t=>{const [h=0,m=0]=(t||"00:00").split(":").map(Number);return h*60+m;};
const dayLabel=d=>d.toLocaleDateString("en-US",{weekday:"short"}).toUpperCase();
const longDay=d=>d.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"});

function ClassInspector({sel,clients,formats,mobile,onEdit,onEditClass,onDeleteClass,onDeleteSeries,setFmtModal}){
  if(!sel)return <Card style={{minHeight:280,display:"grid",placeItems:"center"}}><div style={{color:C.muted,textAlign:"center"}}><div style={{fontSize:30,marginBottom:8}}>📅</div>Select a class to inspect</div></Card>;
  const fmt=formats.find(f=>f.id===sel.formatId);
  const AT={attended:C.green,"no-show":C.red,late:C.amber};
  const toggleBooking=async clientId=>{
    const bookings=sel.bookings||[];
    const has=bookings.some(b=>b.clientId===clientId);
    if(!has&&bookings.length>=Number(sel.capacity))return;
    await onEdit(sel.id,{bookings:has?bookings.filter(b=>b.clientId!==clientId):[...bookings,{clientId,bookedAt:now(),attendance:null}]});
  };
  const markAttendance=async(clientId,status)=>{
    await onEdit(sel.id,{bookings:(sel.bookings||[]).map(b=>b.clientId!==clientId?b:{...b,attendance:b.attendance===status?null:status})});
  };
  const booked=(sel.bookings||[]).length;
  return(
    <aside aria-label="Class details" style={{background:C.surface,border:`1px solid ${sel.status==="completed"?C.muted+"66":C.green+"55"}`,borderRadius:16,overflow:"hidden",minWidth:0}}>
      <div style={{padding:18,background:`linear-gradient(135deg, ${C.green}16, ${C.surface} 68%)`,borderBottom:`1px solid ${C.border}`}}>
        <div style={{color:sel.status==="completed"?C.muted:C.green,fontSize:10,fontWeight:900,letterSpacing:".12em",textTransform:"uppercase"}}>● {sel.status}</div>
        <div style={{color:C.text,fontSize:22,fontWeight:900,letterSpacing:"-.035em",marginTop:7}}>{sel.name}</div>
        <div style={{color:C.sub,fontSize:11,lineHeight:1.7,marginTop:5}}>{fmtDate(sel.date)} · {sel.time} · {sel.duration} min{sel.location?` · ${sel.location}`:""}</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:9}}>{sel.focus&&<Pill color={C.green}>{sel.focus}</Pill>}{sel.seriesId&&<Pill color={C.amber}>↻ Recurring</Pill>}</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:14}}>
          <Btn variant="ghost" color={C.blue} onClick={onEditClass}>Edit</Btn>
          {sel.status==="scheduled"&&<Btn variant="ghost" color={C.green} onClick={()=>onEdit(sel.id,{status:"completed"})}>✓ Complete</Btn>}
          <Btn variant="danger" onClick={onDeleteClass}>Delete</Btn>
          {sel.seriesId&&<Btn variant="ghost" color={C.red} onClick={onDeleteSeries}>Delete series</Btn>}
        </div>
      </div>
      <div style={{padding:16,borderBottom:`1px solid ${C.border}`}}>
        <SL>Class Format</SL>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:34,height:34,borderRadius:8,background:C.teal+"18",color:C.teal,display:"grid",placeItems:"center"}}>▦</div>
          <div style={{flex:1,minWidth:0}}>{fmt?<><div style={{color:C.text,fontWeight:700,fontSize:12}}>{fmt.name}</div><div style={{color:C.muted,fontSize:10}}>{fmt.stations?.length||0} stations · {fmt.totalDuration} min</div></>:<div style={{color:C.muted,fontSize:12}}>No format attached</div>}</div>
          {fmt&&<Btn variant="danger" style={{padding:"5px 7px",fontSize:10}} onClick={()=>onEdit(sel.id,{format_id:null,format_name:null})}>Detach</Btn>}
          {sel.status==="scheduled"&&<Btn variant="ghost" color={C.teal} style={{padding:"5px 7px",fontSize:10}} onClick={()=>setFmtModal(true)}>Attach</Btn>}
        </div>
        {fmt&&sel.status==="scheduled"&&<ClassRunPanel format={fmt} mobile={mobile}/>}
      </div>
      <div style={{padding:16,borderBottom:`1px solid ${C.border}`}}>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.sub,marginBottom:8}}><span>Enrollment</span><strong style={{color:C.text}}>{booked} / {sel.capacity}</strong></div>
        <div style={{height:6,background:C.s3,borderRadius:9,overflow:"hidden"}}><div style={{width:`${Math.min(100,booked/Math.max(1,Number(sel.capacity))*100)}%`,height:"100%",background:C.green}}/></div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,marginTop:12}}>
          {[["Enrolled",booked,C.text],["Attended",(sel.bookings||[]).filter(b=>b.attendance==="attended").length,C.green],["No-shows",(sel.bookings||[]).filter(b=>b.attendance==="no-show").length,C.red]].map(x=><div key={x[0]} style={{background:C.s2,borderRadius:8,padding:8,textAlign:"center"}}><div style={{color:C.muted,fontSize:8,textTransform:"uppercase"}}>{x[0]}</div><div style={{color:x[2],fontWeight:900,fontSize:17}}>{x[1]}</div></div>)}
        </div>
      </div>
      <div style={{padding:16}}>
        <SL>Roster</SL>
        {!booked&&<div style={{padding:12,textAlign:"center",background:C.s2,borderRadius:8,color:C.muted,fontSize:12}}>No one enrolled.</div>}
        <div style={{display:"flex",flexDirection:"column",gap:5}}>
          {(sel.bookings||[]).map(b=>{
            const cl=clients.find(c=>c.id===b.clientId); if(!cl)return null;
            return <div key={b.clientId} style={{display:"flex",alignItems:"center",gap:7,padding:"7px 8px",background:C.s2,borderRadius:8}}>
              <Avatar name={cl.name} size={24} color={TAG_COLORS[cl.tag]||C.sub}/><span style={{color:C.text,fontSize:11,fontWeight:700,flex:1}}>{cl.name}</span>
              {sel.status==="scheduled"?<div style={{display:"flex",gap:3,flexWrap:"wrap",justifyContent:"flex-end"}}>{["attended","late","no-show"].map(s=><button key={s} onClick={()=>markAttendance(b.clientId,s)} style={{padding:"3px 5px",borderRadius:5,border:`1px solid ${b.attendance===s?AT[s]:C.border}`,background:b.attendance===s?AT[s]+"20":"transparent",color:b.attendance===s?AT[s]:C.muted,fontSize:8,fontWeight:700,cursor:"pointer"}}>{s}</button>)}</div>:b.attendance&&<Pill color={AT[b.attendance]}>{b.attendance}</Pill>}
              <button aria-label={`Remove ${cl.name} from roster`} onClick={()=>toggleBooking(b.clientId)} style={{border:0,background:"transparent",color:C.muted,cursor:"pointer",fontSize:16}}>×</button>
            </div>;
          })}
        </div>
        {sel.status==="scheduled"&&<><SL style={{marginTop:14}}>Add Client</SL><div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{clients.filter(c=>!(sel.bookings||[]).some(b=>b.clientId===c.id)).map(c=><button key={c.id} onClick={()=>toggleBooking(c.id)} style={{display:"flex",alignItems:"center",gap:5,padding:"5px 8px",border:`1px solid ${C.border}`,borderRadius:7,background:C.s2,color:C.sub,fontSize:10,cursor:"pointer"}}><Avatar name={c.name} size={18} color={TAG_COLORS[c.tag]||C.sub}/>{c.name}</button>)}</div></>}
      </div>
    </aside>
  );
}

function CalendarTask({task,onToggle,onEdit,compact=false}){
  return(
    <div style={{display:"flex",alignItems:"center",gap:compact?5:7,minWidth:0,padding:compact?"4px 5px":"6px 7px",borderRadius:7,background:task.done?C.s2:C.green+"10",border:`1px solid ${task.done?C.border:C.green+"38"}`,opacity:task.done?0.58:1}}>
      <button type="button" aria-label={task.done?"Mark task as open":"Complete task"} title={task.done?"Mark as not done":"Mark as done"} onClick={()=>onToggle(task)}
        style={{width:compact?15:18,height:compact?15:18,borderRadius:4,flexShrink:0,padding:0,border:`1.5px solid ${task.done?C.green:C.green+"99"}`,background:task.done?C.green:"transparent",color:"#000",fontSize:10,fontWeight:900,lineHeight:1,cursor:"pointer",display:"grid",placeItems:"center"}}>
        {task.done?"✓":""}
      </button>
      <button type="button" onClick={()=>onEdit(task)} title={task.notes||task.title}
        style={{flex:1,minWidth:0,padding:0,border:0,background:"transparent",color:task.done?C.muted:C.text,textAlign:"left",fontSize:compact?9:11,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",textDecoration:task.done?"line-through":"none"}}>
        {task.title}
      </button>
    </div>
  );
}

function ClassesScreen({clients,classes,tasks=[],onAdd,onAddSeries,onEdit,onDelete,onDeleteSeries,onAddTask,onUpdateTask,onDeleteTask,formats,mobile}){
  const today=new Date();
  const [calendarCompact,setCalendarCompact]=useState(()=>typeof window!=="undefined"&&window.innerWidth<1180);
  const [selected,setSelected]=useState(null);
  const [selectedDate,setSelectedDate]=useState(isoDate(today));
  const [weekStart,setWeekStart]=useState(mondayOf(today));
  const [modal,setModal]=useState(null);
  const [confirm,setConfirm]=useState(null);
  const [confirmSeries,setConfirmSeries]=useState(null);
  const [fmtModal,setFmtModal]=useState(false);
  const [showHistory,setShowHistory]=useState(false);
  const [taskModal,setTaskModal]=useState(null);
  const [confirmTask,setConfirmTask]=useState(null);
  useEffect(()=>{
    const update=()=>setCalendarCompact(window.innerWidth<1180);
    window.addEventListener("resize",update);
    return()=>window.removeEventListener("resize",update);
  },[]);
  const agendaMode=mobile||calendarCompact;
  const weekDays=Array.from({length:7},(_,i)=>addDays(weekStart,i));
  const end=addDays(weekStart,7);
  const modeClasses=classes.filter(c=>showHistory?c.status==="completed":c.status!=="completed");
  const weekClasses=modeClasses.filter(c=>{const d=dateOnly(c.date);return d>=weekStart&&d<end;});
  const dayClasses=weekClasses.filter(c=>c.date===selectedDate).sort((a,b)=>minutes(a.time)-minutes(b.time));
  const selectedClass=classes.find(c=>c.id===selected);
  const sel=selectedClass&&(agendaMode?dayClasses:weekClasses).some(c=>c.id===selectedClass.id)?selectedClass:null;
  const seriesCount=sel?.seriesId?classes.filter(c=>c.seriesId===sel.seriesId).length:0;
  const weekTasks=tasks.filter(t=>t.dueDate&&dateOnly(t.dueDate)>=weekStart&&dateOnly(t.dueDate)<end);
  const dayTasks=tasks.filter(t=>t.dueDate===selectedDate);
  const relevant=agendaMode?dayClasses:weekClasses;
  const earliest=Math.min(6*60,...relevant.map(c=>minutes(c.time)));
  const latest=Math.max(19*60,...relevant.map(c=>minutes(c.time)+(Number(c.duration)||0)));
  const startHour=Math.max(0,Math.floor(earliest/60));
  const endHour=Math.min(24,Math.max(startHour+1,Math.ceil(latest/60)));
  const hours=Array.from({length:endHour-startHour},(_,i)=>startHour+i);
  const hourHeight=agendaMode?52:50;
  const gridHeight=hours.length*hourHeight;
  const rangeLabel=`${weekStart.toLocaleDateString("en-US",{month:"short",day:"numeric"})}–${addDays(weekStart,6).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}`;

  const chooseDate=d=>{setSelectedDate(isoDate(d));const first=modeClasses.filter(c=>c.date===isoDate(d)).sort((a,b)=>minutes(a.time)-minutes(b.time))[0];setSelected(first?.id||null);};
  const shiftWeek=n=>{const next=addDays(weekStart,n*7);setWeekStart(next);chooseDate(next);};
  const shiftDay=n=>{const next=addDays(dateOnly(selectedDate),n);setSelectedDate(isoDate(next));setWeekStart(mondayOf(next));const first=modeClasses.filter(c=>c.date===isoDate(next)).sort((a,b)=>minutes(a.time)-minutes(b.time))[0];setSelected(first?.id||null);};
  const submitClass=async payload=>{
    const isAdd=modal==="add";
    if(payload.mode==="single"){if(isAdd)await onAdd(payload.base);else await onEdit(modal.cls.id,payload.base);}
    else if(isAdd)await onAddSeries(payload.occurrences);
    else{
      const ex=modal.cls,start=payload.base.date,extra=payload.occurrences.filter(o=>o.date!==start);
      if(!extra.length)await onEdit(ex.id,payload.base);
      else{const seriesId=uid(),startOcc=payload.occurrences.find(o=>o.date===start);const ok=await onEdit(ex.id,{...payload.base,focus:startOcc?.focus||payload.base.focus,series_id:seriesId});if(ok)await onAddSeries(extra,seriesId);}
    }
    setModal(null);
  };
  const saveTask=async f=>{
    if(taskModal?.task)await onUpdateTask(taskModal.task.id,f);
    else await onAddTask({id:uid(),...f});
  };
  const openNewTask=()=>setTaskModal({date:selectedDate});
  const editTask=task=>setTaskModal({task});
  const toggleTask=task=>onUpdateTask(task.id,{done:!task.done});
  const overlays=<>
    {fmtModal&&sel&&<Modal title="Attach Class Format" onClose={()=>setFmtModal(false)} wide>{!formats.length?<div style={{color:C.muted,textAlign:"center",padding:24}}>No formats yet. Build one in Programs → Class Formats.</div>:<div style={{display:"flex",flexDirection:"column",gap:8}}>{formats.map(f=><button key={f.id} onClick={async()=>{await onEdit(sel.id,{format_id:f.id,format_name:f.name});setFmtModal(false);}} style={{textAlign:"left",background:C.s2,borderRadius:10,padding:"12px 14px",border:`1px solid ${sel.formatId===f.id?C.teal:C.border}`,cursor:"pointer",color:C.text}}><strong>{f.name}</strong><div style={{color:C.muted,fontSize:11,marginTop:3}}>{f.stations?.length||0} stations · {f.totalDuration} min</div></button>)}</div>}</Modal>}
    {(modal==="add"||modal?.cls)&&<Modal title={modal==="add"?"New Class":"Edit Class"} onClose={()=>setModal(null)} wide><ClassForm initial={modal?.cls} initialDate={selectedDate} onSubmit={submitClass} onClose={()=>setModal(null)}/></Modal>}
    {confirm&&<Confirm msg="Delete this class?" onConfirm={async()=>{await onDelete(confirm);if(selected===confirm)setSelected(null);setConfirm(null);}} onCancel={()=>setConfirm(null)}/>}
    {confirmSeries&&<Confirm msg={`Delete all ${seriesCount} classes in this recurring series?`} onConfirm={async()=>{await onDeleteSeries(confirmSeries);setSelected(null);setConfirmSeries(null);}} onCancel={()=>setConfirmSeries(null)}/>}
    {taskModal&&<Modal title={taskModal.task?"Edit Task":"New Task"} onClose={()=>setTaskModal(null)}>
      <TaskForm initial={taskModal.task} initialDate={taskModal.date||selectedDate} clients={clients} onSave={saveTask} onClose={()=>setTaskModal(null)}/>
      {taskModal.task&&<div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${C.border}`}}><Btn variant="danger" onClick={()=>setConfirmTask(taskModal.task)}>Delete task</Btn></div>}
    </Modal>}
    {confirmTask&&<Confirm msg={`Delete task "${confirmTask.title}"?`} onConfirm={async()=>{await onDeleteTask(confirmTask.id);setConfirmTask(null);setTaskModal(null);}} onCancel={()=>setConfirmTask(null)}/>}
  </>;
  const inspector=<ClassInspector sel={sel} clients={clients} formats={formats} mobile={agendaMode} onEdit={onEdit} onEditClass={()=>setModal({cls:sel})} onDeleteClass={()=>setConfirm(sel.id)} onDeleteSeries={()=>setConfirmSeries(sel.seriesId)} setFmtModal={setFmtModal}/>;

  if(agendaMode&&sel)return <div style={{display:"flex",flexDirection:"column",gap:12}}><Btn variant="outline" style={{alignSelf:"flex-start"}} onClick={()=>setSelected(null)}>← Schedule</Btn>{inspector}{overlays}</div>;

  return(
    <div>
      <header style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,marginBottom:18,flexWrap:"wrap"}}>
        <div><div style={{display:"flex",alignItems:"center",gap:7,color:C.green,fontSize:10,fontWeight:900,letterSpacing:".15em"}}><span style={{width:7,height:7,borderRadius:"50%",background:C.green}}/>SCHEDULE / {agendaMode?"DAY":"WEEK"} VIEW</div><div style={{color:C.text,fontWeight:900,fontSize:agendaMode?24:30,letterSpacing:"-.045em",marginTop:6}}>{showHistory?"Completed class history":"Run the week, not the spreadsheet."}</div>{showHistory&&<div style={{color:C.muted,fontSize:10,marginTop:3}}>Tasks remain shown by due date.</div>}</div>
        <div style={{display:"flex",gap:7}}>
          <Btn variant={showHistory?"ghost":"outline"} color={C.amber} onClick={()=>{setShowHistory(v=>!v);setSelected(null);}}>🕘 {showHistory?"Schedule":"History"}</Btn>
          <Btn onClick={()=>setModal("add")}>+ New Class</Btn>
        </div>
      </header>
      {agendaMode&&<nav aria-label="Schedule dates" style={{display:"grid",gridTemplateColumns:"30px repeat(7,1fr) 30px",gap:2,background:C.surface,border:`1px solid ${C.border}`,borderRadius:13,padding:5,marginBottom:12,overflowX:"auto"}}>
        <button aria-label="Previous week" onClick={()=>shiftWeek(-1)} style={{border:0,background:"transparent",color:C.sub,cursor:"pointer"}}>‹</button>
        {weekDays.map(d=>{const date=isoDate(d),active=date===selectedDate,classCount=modeClasses.filter(c=>c.date===date).length,taskCount=tasks.filter(t=>t.dueDate===date).length;return <button key={date} onClick={()=>chooseDate(d)} style={{border:0,borderRadius:9,background:active?C.s3:"transparent",color:active?C.text:C.sub,padding:"7px 2px",cursor:"pointer",minWidth:42}}><span style={{display:"block",fontSize:8,fontWeight:800,letterSpacing:".08em"}}>{dayLabel(d)}</span><strong style={{display:"block",fontSize:17,color:active?C.green:C.text}}>{d.getDate()}</strong><span style={{display:"block",fontSize:8,color:active?C.green:C.muted}}>{classCount}c · {taskCount}t</span></button>})}
        <button aria-label="Next week" onClick={()=>shiftWeek(1)} style={{border:0,background:"transparent",color:C.sub,cursor:"pointer"}}>›</button>
      </nav>}
      {!agendaMode&&<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{display:"flex",gap:6}}><button aria-label="Previous week" onClick={()=>shiftWeek(-1)} style={iconBtn}>‹</button><Btn variant="outline" onClick={()=>{const d=mondayOf(new Date());setWeekStart(d);chooseDate(new Date());}}>This week</Btn><button aria-label="Next week" onClick={()=>shiftWeek(1)} style={iconBtn}>›</button></div>
        <div style={{color:C.sub,fontSize:12,fontWeight:700}}>{rangeLabel} · <span style={{color:C.green}}>{weekClasses.length} class{weekClasses.length===1?"":"es"}</span> · <span style={{color:C.teal}}>{weekTasks.length} task{weekTasks.length===1?"":"s"}</span></div>
      </div>}
      <div style={{display:"grid",gridTemplateColumns:agendaMode?"1fr":"minmax(600px,1.65fr) minmax(300px,.72fr)",gap:16,alignItems:"start"}}>
        <section style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,overflow:"hidden",minWidth:0}}>
          {agendaMode?<div style={{padding:"13px 14px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><strong style={{color:C.text,fontSize:13}}>{longDay(dateOnly(selectedDate))}</strong><div style={{color:C.muted,fontSize:10,marginTop:2}}>{dayClasses.length} class{dayClasses.length===1?"":"es"} · {dayTasks.length} task{dayTasks.length===1?"":"s"}</div></div><div style={{display:"flex",gap:5}}><button aria-label="Previous day" onClick={()=>shiftDay(-1)} style={iconBtn}>‹</button><button aria-label="Next day" onClick={()=>shiftDay(1)} style={iconBtn}>›</button></div></div>:
          <div style={{display:"grid",gridTemplateColumns:"54px repeat(7,1fr)",background:C.bg+"66",borderBottom:`1px solid ${C.border}`,minWidth:690}}><div/>{weekDays.map(d=>{const active=isoDate(d)===selectedDate;return <button key={isoDate(d)} onClick={()=>chooseDate(d)} style={{border:0,borderLeft:`1px solid ${C.border}`,background:active?C.green+"0c":"transparent",padding:"9px 3px",color:C.sub,cursor:"pointer"}}><span style={{fontSize:9,fontWeight:900,letterSpacing:".08em",display:"block"}}>{dayLabel(d)}</span><strong style={{fontSize:16,color:active?C.green:C.text}}>{d.getDate()}</strong></button>})}</div>}
          {agendaMode?
            <div style={{padding:"9px 12px",borderBottom:`1px solid ${C.border}`,background:C.bg+"38"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,marginBottom:dayTasks.length?7:0}}>
                <span style={{color:C.teal,fontSize:9,fontWeight:900,letterSpacing:".1em",textTransform:"uppercase"}}>☑ Tasks · {dayTasks.length}</span>
                <button type="button" onClick={openNewTask} style={{border:`1px solid ${C.teal}44`,background:C.teal+"12",color:C.teal,borderRadius:6,padding:"3px 7px",fontSize:10,fontWeight:800,cursor:"pointer"}}>+ Add task</button>
              </div>
              {dayTasks.length>0&&<div style={{display:"flex",flexDirection:"column",gap:5}}>{dayTasks.map(t=><CalendarTask key={t.id} task={t} onToggle={toggleTask} onEdit={editTask}/>)}</div>}
            </div>:
            <div style={{overflowX:"auto",borderBottom:`1px solid ${C.border}`}}>
              <div style={{display:"grid",gridTemplateColumns:"54px repeat(7,1fr)",minWidth:690,background:C.bg+"38"}}>
                <div style={{padding:"8px 5px",color:C.teal,fontSize:8,fontWeight:900,textAlign:"center",letterSpacing:".06em"}}>TASKS</div>
                {weekDays.map(d=>{const date=isoDate(d),dateTasks=tasks.filter(t=>t.dueDate===date),active=date===selectedDate;return <div key={date} style={{minWidth:0,padding:"5px",borderLeft:`1px solid ${C.border}`,background:active?C.green+"07":"transparent",display:"flex",flexDirection:"column",gap:4}}>
                  {dateTasks.map(t=><CalendarTask key={t.id} task={t} compact onToggle={toggleTask} onEdit={editTask}/>)}
                  {active&&<button type="button" onClick={openNewTask} style={{padding:"3px 4px",border:`1px dashed ${C.teal}66`,borderRadius:6,background:"transparent",color:C.teal,fontSize:8,fontWeight:800,cursor:"pointer"}}>+ TASK</button>}
                </div>;})}
              </div>
            </div>}
          <div style={{overflowX:"auto"}}>
            <div style={{position:"relative",display:"grid",gridTemplateColumns:agendaMode?"58px 1fr":"54px repeat(7,1fr)",height:gridHeight,minWidth:agendaMode?0:690}}>
              <div style={{zIndex:2,background:C.surface}}>{hours.map(h=><div key={h} style={{height:hourHeight,padding:"5px 8px",boxSizing:"border-box",borderBottom:`1px solid ${C.s3}`,color:C.muted,fontSize:9,textAlign:"right"}}>{String(h).padStart(2,"0")}:00</div>)}</div>
              {(agendaMode?[dateOnly(selectedDate)]:weekDays).map(d=><div key={isoDate(d)} style={{position:"relative",overflow:"hidden",borderLeft:`1px solid ${C.border}`,background:isoDate(d)===isoDate(today)?C.green+"07":"transparent"}}>{hours.map(h=><div key={h} style={{height:hourHeight,boxSizing:"border-box",borderBottom:`1px solid ${C.s3}`}}/> )}
                {(agendaMode?dayClasses:weekClasses.filter(c=>c.date===isoDate(d))).map(c=>{const top=(minutes(c.time)-startHour*60)/60*hourHeight;const height=Math.max(30,(Number(c.duration)||0)/60*hourHeight-3);const active=c.id===selected;const accent=c.status==="completed"?C.muted:(c.formatId?C.teal:c.seriesId?C.green:C.purple);const edge=active?accent:C.border;return <button key={c.id} onClick={()=>setSelected(c.id)} style={{position:"absolute",left:5,right:5,top:top+2,height,overflow:"hidden",textAlign:"left",padding:agendaMode?"7px 9px":"5px 6px",borderRadius:7,borderTop:`1px solid ${edge}`,borderRight:`1px solid ${edge}`,borderBottom:`1px solid ${edge}`,borderLeft:`3px solid ${accent}`,background:active?accent+"20":C.s2,color:C.text,cursor:"pointer",boxShadow:active?`0 0 0 1px ${accent}44`:"none"}}><span style={{display:"block",fontSize:agendaMode?12:9,fontWeight:800,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c.seriesId&&<span style={{color:C.amber}}>↻ </span>}{c.name}</span><span style={{display:"block",fontSize:agendaMode?10:8,color:C.sub,marginTop:2}}>{c.time} · {(c.bookings||[]).length}/{c.capacity}{agendaMode?` enrolled · ${c.duration} min`:""}</span></button>})}
                {!(agendaMode?dayClasses:weekClasses.filter(c=>c.date===isoDate(d))).length&&agendaMode&&<div style={{position:"absolute",inset:0,display:"grid",placeItems:"center",color:C.muted,fontSize:12,textAlign:"center",padding:20}}>{dayTasks.length?"No classes scheduled. Today's tasks are listed above.":"A clear lane. Add a class or task, or use the day for programming and recovery."}</div>}
              </div>)}
            </div>
          </div>
        </section>
        {!agendaMode&&<div style={{position:"sticky",top:12}}>{inspector}</div>}
      </div>
      {overlays}
    </div>
  );
}

const iconBtn={width:34,height:34,display:"grid",placeItems:"center",background:C.s2,color:C.sub,border:`1px solid ${C.border}`,borderRadius:8,cursor:"pointer",fontSize:20};

// ═══════════════════════════════════════════════════════════════════════════════

export { ClassesScreen };
