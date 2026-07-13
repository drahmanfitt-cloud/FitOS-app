// FitOS — Dashboard
import React from "react";
import { C, fmtDate, TAG_COLORS } from "./config.js";
import { Avatar, Pill, Card, SL } from "./ui.jsx";

// DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════

const todayYMD=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;};

function Dashboard({clients,sessions,classes,programs,formats,tasks=[],onToggleTask,setView,setActiveClient,mobile}){
  const active=clients.filter(c=>c.status==="active");
  const today=todayYMD();
  const openTasks=tasks.filter(t=>!t.done);
  const dueNow=[...openTasks.filter(t=>t.dueDate&&t.dueDate<today),...openTasks.filter(t=>t.dueDate===today)];
  const taskPreview=dueNow.slice(0,6);
  const upcoming=[...classes].filter(c=>c.status==="scheduled").sort((a,b)=>new Date(a.date+" "+a.time)-new Date(b.date+" "+b.time)).slice(0,4);
  const recent=[...sessions].sort((a,b)=>new Date(b.startedAt)-new Date(a.startedAt)).slice(0,5);
  const totalPRs=sessions.reduce((a,s)=>a+(s.exercises||[]).reduce((b,e)=>b+(e.sets||[]).filter(st=>st.pr&&st.done).length,0),0);
  return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{display:"grid",gridTemplateColumns:mobile?"repeat(2,1fr)":"repeat(4,minmax(130px,1fr))",gap:mobile?8:12}}>
        {[{label:"Active Clients",val:active.length,sub:`${clients.length} total`,color:C.green,icon:"👥",nav:"clients"},{label:"Sessions Logged",val:sessions.length,sub:"all time",color:C.blue,icon:"⚡",nav:"session-history"},{label:"Programs Built",val:programs.length,sub:`${formats.length} class formats`,color:C.purple,icon:"📋",nav:"programs"},{label:"PRs Logged",val:totalPRs,sub:"all time",color:C.amber,icon:"🏆",nav:"sessions"}].map(s=>(
          <Card key={s.label} onClick={()=>setView(s.nav)} style={{padding:"14px 16px",cursor:"pointer",transition:"border-color 0.15s",minWidth:0}} onMouseEnter={e=>e.currentTarget.style.borderColor=s.color} onMouseLeave={e=>e.currentTarget.style.borderColor=""}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6,gap:6}}>
              <span style={{fontSize:11,color:C.sub,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",minWidth:0}}>{s.label}</span>
              <span style={{fontSize:14,flexShrink:0}}>{s.icon}</span>
            </div>
            <div style={{fontSize:30,fontWeight:800,color:C.text,lineHeight:1}}>{s.val}</div>
            <div style={{fontSize:11,color:s.color,fontWeight:600,marginTop:6,whiteSpace:"nowrap"}}>{s.sub} →</div>
          </Card>
        ))}
      </div>
      <Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:taskPreview.length?12:0}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <SL>Today's Tasks</SL>
            {dueNow.length>0&&<span style={{background:C.green+"22",color:C.green,fontSize:10,fontWeight:700,padding:"1px 7px",borderRadius:10}}>{dueNow.length}</span>}
          </div>
          <span onClick={()=>setView("tasks")} style={{color:C.green,fontSize:12,cursor:"pointer"}}>View all →</span>
        </div>
        {taskPreview.length===0
          ?<div style={{color:C.muted,fontSize:13,textAlign:"center",padding:"14px 0"}}>Nothing due today. <span onClick={()=>setView("tasks")} style={{color:C.green,cursor:"pointer"}}>Plan your day →</span></div>
          :taskPreview.map((t,i)=>{
            const cl=clients.find(c=>c.id===t.clientId);
            const overdue=t.dueDate&&t.dueDate<today;
            return(
              <div key={t.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:i<taskPreview.length-1?`1px solid ${C.border}`:"none"}}>
                <button onClick={()=>onToggleTask&&onToggleTask(t.id)} title="Mark as done"
                  style={{width:20,height:20,borderRadius:"50%",flexShrink:0,cursor:"pointer",border:`2px solid ${C.border2}`,background:"transparent",padding:0}}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{color:C.text,fontWeight:600,fontSize:13,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{t.title}</div>
                  {cl&&<div style={{color:C.muted,fontSize:11}}>{cl.name}</div>}
                </div>
                {overdue&&<Pill color={C.red}>Overdue</Pill>}
              </div>
            );
          })}
        {dueNow.length>6&&<div onClick={()=>setView("tasks")} style={{color:C.green,fontSize:12,cursor:"pointer",textAlign:"center",paddingTop:10}}>+{dueNow.length-6} more →</div>}
      </Card>
      <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"1fr 1fr",gap:mobile?10:16}}>
        <Card onClick={()=>setView("classes")} style={{cursor:"pointer",transition:"border-color 0.15s"}} onMouseEnter={e=>e.currentTarget.style.borderColor=C.green} onMouseLeave={e=>e.currentTarget.style.borderColor=""}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}><SL>Upcoming Classes</SL><span style={{color:C.green,fontSize:12}}>View all →</span></div>
          {upcoming.length===0?<div style={{color:C.muted,fontSize:13,textAlign:"center",padding:"16px 0"}}>No classes. Add one →</div>:upcoming.map((c,i)=>(
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
        <Card onClick={()=>setView("clients")} style={{cursor:"pointer",transition:"border-color 0.15s"}} onMouseEnter={e=>e.currentTarget.style.borderColor=C.green} onMouseLeave={e=>e.currentTarget.style.borderColor=""}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}><SL>Active Clients</SL><span style={{color:C.green,fontSize:12}}>All →</span></div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            {active.slice(0,10).map(c=>(
              <div key={c.id} onClick={e=>{e.stopPropagation();setActiveClient(c);setView("client");}} onMouseEnter={e=>{e.stopPropagation();e.currentTarget.style.borderColor=TAG_COLORS[c.tag]||C.green;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;}} style={{background:C.s2,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px",textAlign:"center",cursor:"pointer",minWidth:90,transition:"border-color 0.15s"}}>
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

export { Dashboard };
