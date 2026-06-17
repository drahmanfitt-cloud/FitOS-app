// FitOS — Dashboard
import React from "react";
import { C, fmtDate, TAG_COLORS } from "./config.js";
import { Avatar, Pill, Card, SL } from "./ui.jsx";

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
        {[{label:"Active Clients",val:active.length,sub:`${clients.length} total`,color:C.green,icon:"👥",nav:"clients"},{label:"Sessions Logged",val:sessions.length,sub:"all time",color:C.blue,icon:"⚡",nav:"sessions"},{label:"Programs Built",val:programs.length,sub:`${formats.length} class formats`,color:C.purple,icon:"📋",nav:"programs"},{label:"PRs Logged",val:totalPRs,sub:"all time",color:C.amber,icon:"🏆",nav:"sessions"}].map(s=>(
          <Card key={s.label} onClick={()=>setView(s.nav)} style={{padding:"14px 16px",cursor:"pointer",transition:"border-color 0.15s"}} onMouseEnter={e=>e.currentTarget.style.borderColor=s.color} onMouseLeave={e=>e.currentTarget.style.borderColor=""}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:11,color:C.sub}}>{s.label}</span><span style={{fontSize:16}}>{s.icon}</span></div>
            <div style={{fontSize:30,fontWeight:800,color:C.text,lineHeight:1}}>{s.val}</div>
            <div style={{fontSize:11,color:s.color,fontWeight:600,marginTop:4}}>{s.sub} →</div>
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

export { Dashboard };
