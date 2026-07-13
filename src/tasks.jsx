// FitOS — Task Planner (day planner with client links)
import React, { useState } from "react";
import { C, uid } from "./config.js";
import { Btn, Card, Pill, Modal, Confirm, Avatar } from "./ui.jsx";

// ── Date helpers (local-time YYYY-MM-DD strings) ──────────────────────────────
const toYMD=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const todayStr=()=>toYMD(new Date());
const shiftDays=(ymd,n)=>{const[y,m,d]=ymd.split("-").map(Number);const dt=new Date(y,m-1,d);dt.setDate(dt.getDate()+n);return toYMD(dt);};
const dayLabel=ymd=>{const[y,m,d]=ymd.split("-").map(Number);return new Date(y,m-1,d).toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"});};

// ── Add / edit form (rendered inside a Modal) ─────────────────────────────────
function TaskForm({initial,clients,onSave,onClose}){
  const [title,setTitle]=useState(initial?.title||"");
  const [dueDate,setDueDate]=useState(initial?.dueDate??todayStr());
  const [clientId,setClientId]=useState(initial?.clientId||"");
  const [notes,setNotes]=useState(initial?.notes||"");
  const inputStyle={width:"100%",background:C.s2,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 12px",color:C.text,fontSize:13,outline:"none",fontFamily:"inherit"};
  const label=t=><div style={{color:C.muted,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6}}>{t}</div>;
  const save=()=>{
    const clean=title.trim();
    if(!clean)return;
    onSave({title:clean,dueDate:dueDate||"",clientId:clientId||null,notes:notes.trim()});
    onClose();
  };
  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div>
        {label("Task *")}
        <input autoFocus value={title} onChange={e=>setTitle(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")save();}} placeholder="e.g. Update Sarah's program" style={inputStyle}/>
      </div>
      <div className="fitos-grid-2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <div>
          {label("Due date")}
          <input type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)} style={inputStyle}/>
        </div>
        <div>
          {label("Client (optional)")}
          <select value={clientId} onChange={e=>setClientId(e.target.value)} style={{...inputStyle,cursor:"pointer"}}>
            <option value="">— No client —</option>
            {clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>
      <div>
        {label("Notes")}
        <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={2} placeholder="Details, reminders…" style={{...inputStyle,resize:"vertical",lineHeight:1.5}}/>
      </div>
      <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
        <Btn variant="outline" onClick={onClose}>Cancel</Btn>
        <Btn onClick={save} disabled={!title.trim()}>{initial?"Save changes":"Add task"}</Btn>
      </div>
    </div>
  );
}

// ── Single task row ───────────────────────────────────────────────────────────
function TaskRow({task,client,overdue,onToggle,onEdit,onDelete,onOpenClient,showDate}){
  const [confirmDel,setConfirmDel]=useState(false);
  return(
    <div style={{display:"flex",alignItems:"center",gap:11,padding:"10px 12px",background:C.s2,border:`1px solid ${task.done?C.border:overdue?C.red+"44":C.border}`,borderRadius:10,marginBottom:8,opacity:task.done?0.55:1,flexShrink:0}}>
      {confirmDel&&<Confirm msg={`Delete task "${task.title}"?`} onConfirm={()=>{setConfirmDel(false);onDelete();}} onCancel={()=>setConfirmDel(false)}/>}
      <button onClick={onToggle} title={task.done?"Mark as not done":"Mark as done"}
        style={{width:22,height:22,borderRadius:"50%",flexShrink:0,cursor:"pointer",border:`2px solid ${task.done?C.green:C.border2}`,background:task.done?C.green:"transparent",color:"#000",fontSize:12,fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1,padding:0}}>
        {task.done?"✓":""}
      </button>
      <div onClick={onEdit} style={{flex:1,minWidth:0,cursor:"pointer"}}>
        <div style={{color:C.text,fontWeight:600,fontSize:13,textDecoration:task.done?"line-through":"none",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{task.title}</div>
        {(task.notes||showDate&&task.dueDate)&&(
          <div style={{color:C.muted,fontSize:11,marginTop:1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
            {showDate&&task.dueDate?dayLabel(task.dueDate):""}{showDate&&task.dueDate&&task.notes?" · ":""}{task.notes}
          </div>
        )}
      </div>
      {overdue&&!task.done&&<Pill color={C.red}>Overdue</Pill>}
      {client&&(
        <div onClick={e=>{e.stopPropagation();onOpenClient&&onOpenClient(client);}} title={`Open ${client.name}'s profile`}
          style={{display:"flex",alignItems:"center",gap:6,cursor:onOpenClient?"pointer":"default",background:C.blue+"14",border:`1px solid ${C.blue}33`,borderRadius:20,padding:"3px 9px 3px 4px",flexShrink:0,maxWidth:150}}>
          <Avatar name={client.name} size={18} color={C.blue}/>
          <span style={{color:C.blue,fontSize:11,fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{client.name}</span>
        </div>
      )}
      <button onClick={()=>setConfirmDel(true)} title="Delete task" style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:16,lineHeight:1,flexShrink:0,padding:2}}>×</button>
    </div>
  );
}

// ── Group header ──────────────────────────────────────────────────────────────
function GroupHeader({label,color,count,right}){
  return(
    <div style={{display:"flex",alignItems:"center",gap:8,margin:"4px 2px 8px"}}>
      <span style={{color,fontWeight:800,fontSize:12,textTransform:"uppercase",letterSpacing:"0.08em"}}>{label}</span>
      {count>0&&<span style={{background:color+"22",color,fontSize:10,fontWeight:700,padding:"1px 7px",borderRadius:10}}>{count}</span>}
      <div style={{flex:1,height:1,background:C.border}}/>
      {right}
    </div>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export function TasksScreen({tasks,clients,onAdd,onUpdate,onDelete,onOpenClient,mobile}){
  const [showForm,setShowForm]=useState(false);
  const [editTask,setEditTask]=useState(null);
  const [showDone,setShowDone]=useState(false);
  const today=todayStr(),tomorrow=shiftDays(today,1);
  const clientOf=t=>clients.find(c=>c.id===t.clientId)||null;

  const open=tasks.filter(t=>!t.done);
  const done=tasks.filter(t=>t.done);
  const overdue=open.filter(t=>t.dueDate&&t.dueDate<today).sort((a,b)=>a.dueDate.localeCompare(b.dueDate));
  const todays=open.filter(t=>t.dueDate===today);
  const tomorrows=open.filter(t=>t.dueDate===tomorrow);
  const upcoming=open.filter(t=>t.dueDate&&t.dueDate>tomorrow).sort((a,b)=>a.dueDate.localeCompare(b.dueDate));
  const noDate=open.filter(t=>!t.dueDate);
  // Upcoming grouped by date, in order
  const upcomingByDate=[];
  upcoming.forEach(t=>{const g=upcomingByDate.find(x=>x.date===t.dueDate);if(g)g.items.push(t);else upcomingByDate.push({date:t.dueDate,items:[t]});});

  const row=(t,showDate=false)=>(
    <TaskRow key={t.id} task={t} client={clientOf(t)} overdue={!!(t.dueDate&&t.dueDate<today)} showDate={showDate}
      onToggle={()=>onUpdate(t.id,{done:!t.done})}
      onEdit={()=>{setEditTask(t);setShowForm(true);}}
      onDelete={()=>onDelete(t.id)}
      onOpenClient={onOpenClient}/>
  );

  return(
    <div style={{maxWidth:760,margin:"0 auto",display:"flex",flexDirection:"column",gap:16}}>
      {showForm&&(
        <Modal title={editTask?"Edit Task":"New Task"} onClose={()=>{setShowForm(false);setEditTask(null);}}>
          <TaskForm initial={editTask} clients={clients}
            onSave={f=>{
              if(editTask)onUpdate(editTask.id,f);
              else onAdd({id:uid(),...f});
            }}
            onClose={()=>{setShowForm(false);setEditTask(null);}}/>
        </Modal>
      )}

      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,flexShrink:0}}>
        <div>
          <div style={{color:C.text,fontWeight:800,fontSize:mobile?16:18}}>{new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}</div>
          <div style={{color:C.muted,fontSize:12,marginTop:2}}>{todays.length===0?"Nothing due today":`${todays.filter(t=>!t.done).length} task${todays.length===1?"":"s"} due today`}{overdue.length>0&&<span style={{color:C.red}}> · {overdue.length} overdue</span>}</div>
        </div>
        <Btn onClick={()=>{setEditTask(null);setShowForm(true);}}>+ Add Task</Btn>
      </div>

      {tasks.length===0&&(
        <Card style={{textAlign:"center",padding:"46px 20px"}}>
          <div style={{fontSize:30,marginBottom:10}}>☑️</div>
          <div style={{color:C.text,fontWeight:700,fontSize:15,marginBottom:4}}>Plan your day</div>
          <div style={{color:C.muted,fontSize:13,marginBottom:16}}>Add tasks with due dates and link them to clients — like "Update Sarah's program".</div>
          <Btn onClick={()=>{setEditTask(null);setShowForm(true);}}>+ Add your first task</Btn>
        </Card>
      )}

      {overdue.length>0&&(
        <div>
          <GroupHeader label="Overdue" color={C.red} count={overdue.length}/>
          {overdue.map(t=>row(t,true))}
        </div>
      )}

      {tasks.length>0&&(
        <div>
          <GroupHeader label="Today" color={C.green} count={todays.length}/>
          {todays.length===0
            ?<div style={{color:C.muted,fontSize:12,padding:"6px 2px 2px"}}>Nothing due today — <span onClick={()=>{setEditTask(null);setShowForm(true);}} style={{color:C.green,cursor:"pointer",fontWeight:600}}>add a task</span></div>
            :todays.map(t=>row(t))}
        </div>
      )}

      {tomorrows.length>0&&(
        <div>
          <GroupHeader label="Tomorrow" color={C.blue} count={tomorrows.length}/>
          {tomorrows.map(t=>row(t))}
        </div>
      )}

      {upcomingByDate.map(g=>(
        <div key={g.date}>
          <GroupHeader label={dayLabel(g.date)} color={C.sub} count={g.items.length}/>
          {g.items.map(t=>row(t))}
        </div>
      ))}

      {noDate.length>0&&(
        <div>
          <GroupHeader label="No date" color={C.muted} count={noDate.length}/>
          {noDate.map(t=>row(t))}
        </div>
      )}

      {done.length>0&&(
        <div>
          <GroupHeader label="Completed" color={C.muted} count={done.length}
            right={<button onClick={()=>setShowDone(s=>!s)} style={{background:"none",border:`1px solid ${C.border}`,borderRadius:6,color:C.muted,fontSize:11,cursor:"pointer",padding:"2px 8px"}}>{showDone?"Hide":"Show"}</button>}/>
          {showDone&&done.map(t=>row(t,true))}
        </div>
      )}
    </div>
  );
}
