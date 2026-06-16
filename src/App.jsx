// FitOS — Root App
import React from 'react';
import { useState, useEffect } from 'react';

function LoginScreen({onLogin}){
  const [mode,setMode]=useState("login"); // "login" | "signup"
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [name,setName]=useState("");
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");

  const submit=async()=>{
    if(!email.trim()||!password.trim())return;
    setLoading(true);setError("");
    try{
      if(mode==="signup"){
        if(!name.trim()){setError("Please enter your name.");setLoading(false);return;}
        await auth.signUp(email.trim(),password,name.trim());
        setError("✓ Account created! Check your email to confirm, then log in.");
        setMode("login");
      } else {
        const d=await auth.signIn(email.trim(),password);
        onLogin(d.user);
      }
    }catch(e){
      setError(e.message||"Something went wrong. Please try again.");
    }finally{setLoading(false);}
  };

  return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Inter',system-ui,sans-serif",padding:24}}>
      <div style={{width:"100%",maxWidth:380}}>
        {/* Logo */}
        <div style={{textAlign:"center",marginBottom:36}}>
          <div style={{width:56,height:56,borderRadius:14,background:C.green,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px"}}>
            <span style={{fontSize:28,fontWeight:900,color:"#000"}}>F</span>
          </div>
          <div style={{color:C.text,fontWeight:900,fontSize:24,letterSpacing:"-0.02em"}}>FitOS</div>
          <div style={{color:C.muted,fontSize:13,marginTop:4}}>Coach Portal</div>
        </div>

        {/* Card */}
        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:28}}>
          {/* Mode tabs */}
          <div style={{display:"flex",background:C.s2,borderRadius:10,padding:3,marginBottom:24}}>
            {[["login","Sign In"],["signup","Create Account"]].map(([m,l])=>(
              <button key={m} onClick={()=>{setMode(m);setError("");}}
                style={{flex:1,padding:"9px",borderRadius:8,border:"none",cursor:"pointer",fontWeight:700,fontSize:13,background:mode===m?C.green:"transparent",color:mode===m?"#000":C.sub,transition:"all 0.15s"}}>
                {l}
              </button>
            ))}
          </div>

          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            {mode==="signup"&&(
              <div>
                <label style={{color:C.sub,fontSize:12,fontWeight:600,display:"block",marginBottom:6}}>Your name</label>
                <input value={name} onChange={e=>setName(e.target.value)} placeholder="Jordan Reeves"
                  style={{width:"100%",background:C.s2,border:`1px solid ${C.border2}`,borderRadius:9,padding:"11px 14px",color:C.text,fontSize:15,outline:"none",fontFamily:"inherit"}}/>
              </div>
            )}
            <div>
              <label style={{color:C.sub,fontSize:12,fontWeight:600,display:"block",marginBottom:6}}>Email</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@email.com"
                onKeyDown={e=>{if(e.key==="Enter")submit();}}
                style={{width:"100%",background:C.s2,border:`1px solid ${C.border2}`,borderRadius:9,padding:"11px 14px",color:C.text,fontSize:15,outline:"none",fontFamily:"inherit"}}/>
            </div>
            <div>
              <label style={{color:C.sub,fontSize:12,fontWeight:600,display:"block",marginBottom:6}}>Password</label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••"
                onKeyDown={e=>{if(e.key==="Enter")submit();}}
                style={{width:"100%",background:C.s2,border:`1px solid ${C.border2}`,borderRadius:9,padding:"11px 14px",color:C.text,fontSize:15,outline:"none",fontFamily:"inherit"}}/>
            </div>

            {error&&(
              <div style={{background:error.startsWith("✓")?C.green+"18":C.red+"18",border:`1px solid ${error.startsWith("✓")?C.green:C.red}44`,borderRadius:8,padding:"10px 14px",color:error.startsWith("✓")?C.green:C.red,fontSize:13,lineHeight:1.5}}>
                {error}
              </div>
            )}

            <button onClick={submit} disabled={loading||!email||!password}
              style={{background:loading||!email||!password?C.muted:C.green,border:"none",borderRadius:9,padding:"13px",color:"#000",fontWeight:800,fontSize:15,cursor:loading?"not-allowed":"pointer",marginTop:4,opacity:loading||!email||!password?0.6:1}}>
              {loading?"Please wait…":mode==="login"?"Sign In →":"Create Account →"}
            </button>
          </div>
        </div>

        <div style={{textAlign:"center",marginTop:20,color:C.muted,fontSize:12}}>
          {mode==="login"?"Don't have an account? ":"Already have an account? "}
          <span onClick={()=>{setMode(mode==="login"?"signup":"login");setError("");}} style={{color:C.green,cursor:"pointer",fontWeight:600}}>
            {mode==="login"?"Sign up":"Sign in"}
          </span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT — loads all data from Supabase, passes CRUD handlers down
// ═══════════════════════════════════════════════════════════════════════════════

const NAV=[{id:"dashboard",label:"Dashboard",icon:"▦"},{id:"clients",label:"Clients",icon:"👥"},{id:"sessions",label:"Log Session",icon:"⚡"},{id:"classes",label:"Classes",icon:"📅"},{id:"programs",label:"Programs",icon:"📋"},{id:"catalog",label:"Exercise Catalog",icon:"📖"}];

// ── Error Boundary ───────────────────────────────────────────────────────────
class ErrorBoundary extends React.Component {
  constructor(props){super(props);this.state={error:null};}
  static getDerivedStateFromError(e){return{error:e};}
  componentDidCatch(e,info){console.error("FitOS Error:",e,info);}
  render(){
    if(this.state.error){
      return(
        <div style={{background:"#1A0A0A",border:"1px solid #F5445A44",borderRadius:14,padding:32,textAlign:"center"}}>
          <div style={{fontSize:28,marginBottom:12}}>⚠️</div>
          <div style={{color:"#F5445A",fontWeight:800,fontSize:18,marginBottom:8}}>Something went wrong</div>
          <div style={{color:"#8A92B2",fontSize:13,marginBottom:16,fontFamily:"monospace",background:"#0B0D11",padding:12,borderRadius:8,textAlign:"left",wordBreak:"break-all"}}>
            {this.state.error?.message||"Unknown error"}
          </div>
          <button onClick={()=>this.setState({error:null})} style={{background:"#22D98A",border:"none",borderRadius:8,padding:"10px 24px",color:"#000",fontWeight:700,fontSize:13,cursor:"pointer"}}>Try again</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Bottom nav for mobile ─────────────────────────────────────────────────────
function BottomNav({active,setActive,counts}){
  const visible=NAV.slice(0,5); // show first 5, "more" handles rest
  const [showMore,setShowMore]=useState(false);
  return(
    <>
      {/* More menu overlay */}
      {showMore&&(
        <div style={{position:"fixed",inset:0,zIndex:800}} onClick={()=>setShowMore(false)}>
          <div style={{position:"absolute",bottom:66,left:0,right:0,background:C.surface,borderTop:`1px solid ${C.border}`,padding:"8px 0"}} onClick={e=>e.stopPropagation()}>
            {NAV.slice(5).map(item=>{
              const isActive=active===item.id;
              const col=item.id==="programs"?C.purple:C.green;
              return(
                <button key={item.id} onClick={()=>{setActive(item.id);setShowMore(false);}}
                  style={{width:"100%",display:"flex",alignItems:"center",gap:14,padding:"14px 20px",background:isActive?col+"18":"transparent",border:"none",cursor:"pointer",textAlign:"left"}}>
                  <span style={{fontSize:20}}>{item.icon}</span>
                  <span style={{color:isActive?col:C.text,fontWeight:isActive?700:500,fontSize:15}}>{item.label}</span>
                  {counts[item.id]>0&&<span style={{marginLeft:"auto",background:col+"22",color:col,fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:10}}>{counts[item.id]}</span>}
                </button>
              );
            })}
            <button onClick={async()=>{await auth.signOut();window.location.reload();}}
              style={{width:"100%",display:"flex",alignItems:"center",gap:14,padding:"14px 20px",background:"transparent",border:"none",cursor:"pointer",textAlign:"left",borderTop:`1px solid ${C.border}`}}>
              <span style={{fontSize:20}}>🚪</span>
              <span style={{color:C.red,fontWeight:600,fontSize:15}}>Sign Out</span>
            </button>
          </div>
        </div>
      )}
      {/* Bottom bar */}
      <nav style={{position:"fixed",bottom:0,left:0,right:0,height:62,background:C.surface,borderTop:`1px solid ${C.border}`,display:"flex",alignItems:"stretch",zIndex:700,paddingBottom:"env(safe-area-inset-bottom)"}}>
        {visible.map(item=>{
          const isActive=active===item.id||(active==="client"&&item.id==="clients");
          const col=item.id==="programs"?C.purple:item.id==="catalog"?C.teal:C.green;
          return(
            <button key={item.id} onClick={()=>setActive(item.id)}
              style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3,border:"none",background:"transparent",cursor:"pointer",position:"relative"}}>
              <span style={{fontSize:20,lineHeight:1}}>{item.icon}</span>
              <span style={{fontSize:9,fontWeight:isActive?700:500,color:isActive?col:C.muted,letterSpacing:"0.02em"}}>{item.label.split(" ")[0]}</span>
              {isActive&&<div style={{position:"absolute",top:0,left:"20%",right:"20%",height:2,background:col,borderRadius:"0 0 2px 2px"}}/>}
              {counts[item.id]>0&&<div style={{position:"absolute",top:6,right:"20%",width:8,height:8,borderRadius:"50%",background:col}}/>}
            </button>
          );
        })}
        {/* More button if >5 items */}
        {NAV.length>5&&(
          <button onClick={()=>setShowMore(m=>!m)}
            style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3,border:"none",background:showMore?C.s2:"transparent",cursor:"pointer"}}>
            <span style={{fontSize:20,lineHeight:1}}>⋯</span>
            <span style={{fontSize:9,fontWeight:500,color:C.muted}}>More</span>
          </button>
        )}
      </nav>
    </>
  );
}

function Sidebar({active,setActive,counts,collapsed,setCollapsed,trainerName}){
  const w=collapsed?56:200;
  return(
    <aside style={{width:w,minWidth:w,background:C.surface,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",flexShrink:0,transition:"width 0.2s ease",overflow:"hidden"}}>
      {/* Logo + collapse button */}
      <div style={{padding:"14px 10px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:collapsed?"center":"space-between",gap:8,flexShrink:0}}>
        {!collapsed&&(
          <div style={{display:"flex",alignItems:"center",gap:9,minWidth:0}}>
            <div style={{width:28,height:28,borderRadius:7,background:C.green,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontSize:14,fontWeight:900,color:"#000"}}>F</span></div>
            <div style={{minWidth:0}}><div style={{color:C.text,fontWeight:800,fontSize:14}}>FitOS</div><div style={{color:C.muted,fontSize:10}}>Cloud ☁️</div></div>
          </div>
        )}
        {collapsed&&<div style={{width:28,height:28,borderRadius:7,background:C.green,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:14,fontWeight:900,color:"#000"}}>F</span></div>}
        <button onClick={()=>setCollapsed(c=>!c)} title={collapsed?"Expand sidebar":"Collapse sidebar"}
          style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:14,padding:4,borderRadius:6,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
          {collapsed?"→":"←"}
        </button>
      </div>
      <nav style={{padding:"10px 6px",flex:1,display:"flex",flexDirection:"column",gap:2}}>
        {NAV.map(item=>{
          const isActive=active===item.id||(active==="client"&&item.id==="clients");
          const col=item.id==="programs"?C.purple:C.green;
          return(
            <button key={item.id} onClick={()=>setActive(item.id)}
              title={collapsed?item.label:undefined}
              style={{display:"flex",alignItems:"center",gap:collapsed?0:9,padding:collapsed?"9px 0":"9px 10px",justifyContent:collapsed?"center":"flex-start",borderRadius:8,border:"none",cursor:"pointer",textAlign:"left",background:isActive?col+"18":"transparent",color:isActive?col:C.sub,fontWeight:isActive?700:500,fontSize:13,position:"relative",width:"100%"}}>
              <span style={{fontSize:collapsed?18:14,flexShrink:0}}>{item.icon}</span>
              {!collapsed&&<span style={{flex:1,textAlign:"left"}}>{item.label}</span>}
              {!collapsed&&counts[item.id]>0&&<span style={{marginLeft:"auto",background:col+"22",color:col,fontSize:10,fontWeight:700,padding:"1px 6px",borderRadius:10}}>{counts[item.id]}</span>}
              {collapsed&&counts[item.id]>0&&<span style={{position:"absolute",top:4,right:4,width:8,height:8,borderRadius:"50%",background:col}}/>}
            </button>
          );
        })}
      </nav>
      <div style={{padding:collapsed?"10px 0":"12px 14px",borderTop:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:collapsed?"center":"flex-start",gap:9}}>
        <Avatar name={trainerName||"?"} size={30} color={C.purple}/>
        {!collapsed&&<div style={{minWidth:0}}><div style={{color:C.text,fontSize:12,fontWeight:700,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{trainerName||"Trainer"}</div><div style={{color:C.muted,fontSize:10}}>Head Coach</div></div>}
      </div>
    </aside>
  );
}

export default function App(){
  const [appState,setAppState]=useState("ready"); // loading | setup | ready
  const [view,setView]=useState("dashboard");
  const [clients,setClients]=useState([]);
  const [sessions,setSessions]=useState([]);
  const [classes,setClasses]=useState([]);
  const [programs,setPrograms]=useState([]);
  const [formats,setFormats]=useState([]);
  const [activeClient,setActiveClient]=useState(null);
  const [toasts,toast]=useToast();
  const [sidebarCollapsed,setSidebarCollapsed]=useState(false);
  const [catalogExercises,setCatalogExercises]=useState([]);
  const [authUser,setAuthUser]=useState(null);
  const [authLoading,setAuthLoading]=useState(true);

  // Restore session on mount
  useEffect(()=>{
    const session=auth.restoreSession();
    if(session){
      auth.getUser().then(u=>{
        if(u&&!u.error){setAuthUser(u);} else {auth.signOut();}
        setAuthLoading(false);
      }).catch(()=>setAuthLoading(false));
    } else { setAuthLoading(false); }
  },[]);

  // Load data on mount — works on your Netlify domain (not on claude.ai due to CORS)
  useEffect(()=>{
    (async()=>{
      try {
        const [c,s,cl,p,f,cat]=await Promise.all([
          db.select("fitos_clients"),
          db.select("fitos_sessions"),
          db.select("fitos_classes"),
          db.select("fitos_programs"),
          db.select("fitos_formats"),
          db.select("fitos_catalog"),
        ]);
        setClients(c.map(mapClient));
        setSessions(s.map(mapSession));
        setClasses(cl.map(mapClass));
        setPrograms(p.map(mapProgram));
        setFormats(f.map(mapFormat));
        setCatalogExercises(cat.map(mapCatalog));
      } catch(e) {
        console.warn("Could not load from Supabase:", e.message);
      }
    })();
  },[]);

  const reload=async()=>{
    const [c,s,cl,p,f]=await Promise.all([
      db.select("fitos_clients"),db.select("fitos_sessions"),db.select("fitos_classes"),
      db.select("fitos_programs"),db.select("fitos_formats"),
    ]);
    setClients(c.map(mapClient)); setSessions(s.map(mapSession)); setClasses(cl.map(mapClass));
    setPrograms(p.map(mapProgram)); setFormats(f.map(mapFormat));
  };

  // ── Client CRUD
  const addClient=async f=>{
    const row={id:uid(),name:f.name,email:f.email,phone:f.phone,dob:f.dob,tag:f.tag,status:f.status,notes:f.notes,session_count:0};
    const r=await db.insert("fitos_clients",row);
    setClients(p=>[mapClient(r),...p]); toast("Client added ✓");
  };
  const editClient=async(id,f)=>{
    const patch={name:f.name,email:f.email,phone:f.phone,dob:f.dob,tag:f.tag,status:f.status,notes:f.notes};
    await db.update("fitos_clients",id,patch);
    setClients(p=>p.map(c=>c.id===id?{...c,...f}:c)); toast("Client updated ✓");
  };
  const deleteClient=async id=>{
    await db.delete("fitos_clients",id);
    setClients(p=>p.filter(c=>c.id!==id)); toast("Client deleted","error");
  };
  const updateClientRaw=async(id,patch)=>{
    await db.update("fitos_clients",id,patch);
    setClients(p=>p.map(c=>c.id===id?{...c,programId:patch.program_id}:c));
  };

  // ── Session CRUD
  const addSession=async s=>{
    const row={id:s.id,client_id:s.clientId,name:s.name,notes:s.notes,exercises:s.exercises,program_day:s.programDay,started_at:s.startedAt};
    const r=await db.insert("fitos_sessions",row);
    setSessions(p=>[mapSession(r),...p]);
    // increment session count
    const cl=clients.find(c=>c.id===s.clientId);
    if(cl){ await db.update("fitos_clients",s.clientId,{session_count:(cl.sessionCount||0)+1}); setClients(p=>p.map(c=>c.id===s.clientId?{...c,sessionCount:(c.sessionCount||0)+1}:c)); }
    toast("Session saved! 💪");
  };

  // ── Class CRUD
  const addClass=async f=>{
    const row={id:uid(),name:f.name,date:f.date,time:f.time,duration:Number(f.duration),capacity:Number(f.capacity),location:f.location,notes:f.notes,status:"scheduled",bookings:[]};
    const r=await db.insert("fitos_classes",row);
    setClasses(p=>[mapClass(r),...p]); toast("Class scheduled ✓");
  };
  const editClass=async(id,patch)=>{
    // convert camelCase fields to snake_case for DB
    const dbPatch={};
    if(patch.name!==undefined)dbPatch.name=patch.name;
    if(patch.date!==undefined)dbPatch.date=patch.date;
    if(patch.time!==undefined)dbPatch.time=patch.time;
    if(patch.duration!==undefined)dbPatch.duration=Number(patch.duration);
    if(patch.capacity!==undefined)dbPatch.capacity=Number(patch.capacity);
    if(patch.location!==undefined)dbPatch.location=patch.location;
    if(patch.notes!==undefined)dbPatch.notes=patch.notes;
    if(patch.status!==undefined)dbPatch.status=patch.status;
    if(patch.bookings!==undefined)dbPatch.bookings=patch.bookings;
    if(patch.format_id!==undefined){dbPatch.format_id=patch.format_id;dbPatch.format_name=patch.format_name;}
    await db.update("fitos_classes",id,dbPatch);
    setClasses(p=>p.map(c=>c.id!==id?c:{...c,...patch,formatId:patch.format_id??c.formatId,formatName:patch.format_name??c.formatName}));
    toast("Class updated ✓");
  };
  const deleteClass=async id=>{
    await db.delete("fitos_classes",id);
    setClasses(p=>p.filter(c=>c.id!==id)); toast("Class deleted","error");
  };

  // ── Program CRUD
  const addProgram=async p=>{
    const row={id:p.id,name:p.name,description:p.description,weeks:Number(p.weeks),days_per_week:Number(p.daysPerWeek),days:p.days,assigned_clients:p.assignedClients};
    const r=await db.insert("fitos_programs",row);
    setPrograms(ps=>[mapProgram(r),...ps]); toast("Program created ✓");
  };
  const updateProgram=async(id,p)=>{
    const patch={name:p.name,description:p.description,weeks:Number(p.weeks),days_per_week:Number(p.daysPerWeek),days:p.days,assigned_clients:p.assignedClients};
    await db.update("fitos_programs",id,patch);
    setPrograms(ps=>ps.map(pr=>pr.id===id?{...pr,...p}:pr));
  };
  const deleteProgram=async id=>{
    await db.delete("fitos_programs",id);
    setPrograms(ps=>ps.filter(p=>p.id!==id)); toast("Program deleted","error");
  };

  // ── Format CRUD
  const addFormat=async f=>{
    const row={id:f.id,name:f.name,type:f.type,description:f.description,total_duration:Number(f.totalDuration),work_sec:Number(f.workSec),rest_sec:Number(f.restSec),rounds:Number(f.rounds),stations:f.stations};
    const r=await db.insert("fitos_formats",row);
    setFormats(fs=>[mapFormat(r),...fs]); toast("Format created ✓");
  };
  const updateFormat=async(id,f)=>{
    const patch={name:f.name,type:f.type,description:f.description,total_duration:Number(f.totalDuration),work_sec:Number(f.workSec),rest_sec:Number(f.restSec),rounds:Number(f.rounds),stations:f.stations};
    await db.update("fitos_formats",id,patch);
    setFormats(fs=>fs.map(fmt=>fmt.id===id?{...fmt,...f}:fmt));
  };
  const deleteFormat=async id=>{
    await db.delete("fitos_formats",id);
    setFormats(fs=>fs.filter(f=>f.id!==id)); toast("Format deleted","error");
  };

  // ── Catalog CRUD (Supabase)
  const addCatalogExercise=async f=>{
    const row={id:uid(),name:f.name,category:f.category,muscles:f.muscles||[],equipment:f.equipment,difficulty:f.difficulty,purpose:f.purpose||"",instructions:f.instructions||"",video_url:f.videoUrl||"",trainer_notes:f.trainerNotes||"",tags:f.tags||[],photo_base64:f.photoBase64||""};
    const r=await db.insert("fitos_catalog",row);
    setCatalogExercises(p=>[mapCatalog(r),...p]);
    toast("Exercise added to catalog ✓");
  };
  const editCatalogExercise=async(id,f)=>{
    const patch={name:f.name,category:f.category,muscles:f.muscles||[],equipment:f.equipment,difficulty:f.difficulty,purpose:f.purpose||"",instructions:f.instructions||"",video_url:f.videoUrl||"",trainer_notes:f.trainerNotes||"",tags:f.tags||[],photo_base64:f.photoBase64||""};
    await db.update("fitos_catalog",id,patch);
    setCatalogExercises(p=>p.map(e=>e.id===id?{...e,...f}:e));
    toast("Exercise updated ✓");
  };
  const deleteCatalogExercise=async id=>{
    await db.delete("fitos_catalog",id);
    setCatalogExercises(p=>p.filter(e=>e.id!==id));
    toast("Exercise deleted","error");
  };

  const navigate=v=>{if(v==="clients")setActiveClient(null);setView(v);};
  const TITLES={dashboard:"Dashboard",clients:"Clients",client:"Client Profile",sessions:"Log Session",classes:"Group Classes",programs:"Programs & Formats",catalog:"Exercise Catalog"};
  const SUBS={dashboard:`${clients.filter(c=>c.status==="active").length} active clients`,clients:`${clients.length} clients`,client:activeClient?.name||"",sessions:"Track sets, reps & weight",classes:`${classes.filter(c=>c.status==="scheduled").length} upcoming`,programs:`${programs.length} programs · ${formats.length} class formats`,catalog:`${catalogExercises.length} exercises`};
  const counts={clients:clients.length,programs:programs.length+formats.length,dashboard:0,sessions:0,classes:classes.filter(c=>c.status==="scheduled").length};

  if(appState==="loading")return(<div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Inter',system-ui,sans-serif"}}><Spinner msg="Connecting to database…"/></div>);
  if(appState==="setup")return <SetupScreen onSetupDone={()=>{ setAppState("loading"); reload().then(()=>setAppState("ready")); }}/>;

  // Show loading spinner while checking auth
  if(authLoading) return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Inter',system-ui,sans-serif"}}>
      <div style={{textAlign:"center"}}>
        <div style={{width:36,height:36,border:`3px solid ${C.border}`,borderTop:`3px solid ${C.green}`,borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 14px"}}/>
        <div style={{color:C.sub,fontSize:13}}>Loading…</div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  // Show login if not authenticated
  if(!authUser) return <LoginScreen onLogin={user=>{setAuthUser(user);setAuthLoading(true);setTimeout(()=>setAuthLoading(false),100);}}/>;

  // Detect mobile — screens narrower than 768px get bottom nav
  const isMobile=typeof window!=="undefined"&&window.innerWidth<768;
  const [mobile,setMobile]=useState(isMobile);
  useEffect(()=>{
    const fn=()=>setMobile(window.innerWidth<768);
    window.addEventListener("resize",fn);
    return()=>window.removeEventListener("resize",fn);
  },[]);

  return(
    <div style={{display:"flex",height:"100vh",background:C.bg,overflow:"hidden",fontFamily:"'Inter',system-ui,sans-serif"}}>
      <style>{`
        input[type=number]::-webkit-inner-spin-button{opacity:0.3}
        *{box-sizing:border-box;}
        input,select,button{font-family:inherit;}
        input,select,textarea{font-size:16px!important;}
        @media(max-width:767px){
          .fitos-grid-2{grid-template-columns:1fr!important;}
          .fitos-grid-3{grid-template-columns:1fr!important;}
          .fitos-grid-4{grid-template-columns:1fr 1fr!important;}
          .fitos-hide-mobile{display:none!important;}
          .fitos-table-scroll{overflow-x:auto;}
        }
      `}</style>

      {/* Sidebar — desktop only */}
      {!mobile&&<Sidebar active={view} setActive={navigate} counts={counts} collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} trainerName={authUser?.user_metadata?.full_name||authUser?.email?.split("@")[0]}/>}

      <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
        {/* Top bar */}
        <div style={{height:54,borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",padding:mobile?"0 14px":"0 22px",background:C.bg,flexShrink:0}}>
          <div style={{minWidth:0,flex:1}}>
            <div style={{color:C.text,fontWeight:700,fontSize:mobile?15:16,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{TITLES[view]}</div>
            {!mobile&&<div style={{color:C.muted,fontSize:11}}>{SUBS[view]}</div>}
          </div>
          <div style={{display:"flex",gap:8,flexShrink:0,alignItems:"center"}}>
            {view==="client"&&<Btn variant="outline" style={{padding:"6px 10px",fontSize:11}} onClick={()=>navigate("clients")}>← Back</Btn>}
            {view==="dashboard"&&<Btn style={{padding:"6px 12px",fontSize:mobile?11:12}} onClick={()=>setView("sessions")}>⚡ Log</Btn>}
            {!mobile&&<button onClick={async()=>{await auth.signOut();setAuthUser(null);setClients([]);setSessions([]);setClasses([]);setPrograms([]);setFormats([]);}}
              style={{background:"none",border:`1px solid ${C.border}`,borderRadius:7,padding:"5px 10px",color:C.muted,fontSize:11,cursor:"pointer",fontWeight:600}}>Sign out</button>}
          </div>
        </div>

        {/* Main content */}
        <main style={{flex:1,overflowY:"auto",padding:mobile?12:20,paddingBottom:mobile?80:20}}>
          {view==="dashboard"&&<Dashboard clients={clients} sessions={sessions} classes={classes} programs={programs} formats={formats} setView={setView} setActiveClient={setActiveClient}/>}
          {view==="clients"&&<ClientsScreen clients={clients} onAdd={addClient} onEdit={editClient} onDelete={deleteClient} programs={programs} setView={setView} setActiveClient={setActiveClient}/>}
          {view==="client"&&activeClient&&<ClientProfile client={clients.find(c=>c.id===activeClient.id)||activeClient} sessions={sessions} programs={programs} onEdit={editClient} setView={setView} setActiveClient={setActiveClient}/>}
          {view==="sessions"&&<ErrorBoundary><SessionLogger clients={clients} sessions={sessions} onSave={addSession} activeClient={activeClient} programs={programs}/></ErrorBoundary>}
          {view==="classes"&&<ClassesScreen clients={clients} classes={classes} onAdd={addClass} onEdit={editClass} onDelete={deleteClass} formats={formats}/>}
          {view==="programs"&&<ProgramsHub programs={programs} onSaveProgram={addProgram} onUpdateProgram={updateProgram} onDeleteProgram={deleteProgram} formats={formats} onSaveFormat={addFormat} onUpdateFormat={updateFormat} onDeleteFormat={deleteFormat} clients={clients} onUpdateClient={updateClientRaw} classes={classes} onUpdateClass={editClass}/>}
          {view==="catalog"&&<ExerciseCatalogScreen catalogExercises={catalogExercises} onAdd={addCatalogExercise} onEdit={editCatalogExercise} onDelete={deleteCatalogExercise} sessions={sessions} clients={clients}/>}
        </main>
      </div>

      {/* Bottom nav — mobile only */}
      {mobile&&<BottomNav active={view} setActive={navigate} counts={counts}/>}

      <Toast toasts={toasts}/>
    </div>
  );
}
