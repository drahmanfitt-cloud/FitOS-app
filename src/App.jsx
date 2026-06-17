// FitOS — Root App
import React, { useState, useEffect, useRef } from "react";
import { C, uid, now, fmtDate, db, supabase, mapClient, mapSession, mapClass, mapProgram, mapFormat, mapCatalog, TAG_COLORS } from "./config.js";
import { Avatar, Pill, Btn, Card, SL, Modal, useToast, Toast, ErrorBoundary } from "./ui.jsx";
import { ClientsScreen, ClientProfile } from "./clients.jsx";
import { SessionLogger } from "./session.jsx";
import { ClassesScreen } from "./classes.jsx";
import { ProgramsHub } from "./programs.jsx";
import { Dashboard } from "./dashboard.jsx";
import { ExerciseCatalogScreen } from "./catalog.jsx";
import { AuthScreen } from "./auth.jsx";
import { ProfileSetup, ProfileEditor } from "./profile.jsx";
import { SEED_LIBRARY } from "./seedLibrary.js";

// ═══════════════════════════════════════════════════════════════════════════════

const NAV=[{id:"dashboard",label:"Dashboard",icon:"▦"},{id:"clients",label:"Clients",icon:"👥"},{id:"sessions",label:"Log Session",icon:"⚡"},{id:"classes",label:"Classes",icon:"📅"},{id:"programs",label:"Programs",icon:"📋"},{id:"catalog",label:"Exercise Catalog",icon:"📖"}];

// ── Bottom nav for mobile ─────────────────────────────────────────────────────
function BottomNav({active,setActive,counts}){
  const visible=NAV.slice(0,5);
  const [showMore,setShowMore]=useState(false);
  const touchStart=useRef(null);
  const [swipeDir,setSwipeDir]=useState(null);
  const navIds=NAV.map(n=>n.id);

  const onTouchStart=e=>{touchStart.current={x:e.touches[0].clientX,y:e.touches[0].clientY};setSwipeDir(null);};
  const onTouchMove=e=>{
    if(!touchStart.current)return;
    const dx=e.touches[0].clientX-touchStart.current.x;
    const dy=e.touches[0].clientY-touchStart.current.y;
    if(Math.abs(dx)>Math.abs(dy)&&Math.abs(dx)>15){
      setSwipeDir(dx<0?"left":"right");
      if(e.cancelable)e.preventDefault(); // only hijack clear horizontal swipes; vertical scroll passes through
    }
  };
  const onTouchEnd=e=>{
    if(!touchStart.current){setSwipeDir(null);return;}
    const dx=e.changedTouches[0].clientX-touchStart.current.x;
    const dy=e.changedTouches[0].clientY-touchStart.current.y;
    setSwipeDir(null);touchStart.current=null;
    if(Math.abs(dx)>Math.abs(dy)&&Math.abs(dx)>50){
      const cur=navIds.indexOf(active);const total=navIds.length;
      if(dx<0)setActive(navIds[(cur+1)%total]);else setActive(navIds[(cur-1+total)%total]);
    }
  };
  return(
    <>
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
          </div>
        </div>
      )}
      <nav onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
        style={{position:"fixed",bottom:0,left:0,right:0,height:62,background:C.surface,borderTop:`1px solid ${C.border}`,display:"flex",alignItems:"stretch",zIndex:700,paddingBottom:"env(safe-area-inset-bottom)",touchAction:"pan-y"}}>
        {swipeDir&&(
          <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.3)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:5,pointerEvents:"none"}}>
            <div style={{color:"#fff",fontSize:22,fontWeight:900}}>{swipeDir==="left"?"→":"←"}</div>
          </div>
        )}
        {visible.map(item=>{
          const isActive=active===item.id||(active==="client"&&item.id==="clients");
          const col=item.id==="programs"?C.purple:item.id==="catalog"?C.teal:C.green;
          const cur=navIds.indexOf(active);const total=navIds.length;
          const idx=navIds.indexOf(item.id);
          const dist=cur<0?1:Math.min((idx-cur+total)%total,(cur-idx+total)%total);
          const opacity=dist===0?1:dist===1?0.6:0.38;
          return(
            <button key={item.id} onClick={()=>setActive(item.id)}
              style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3,border:"none",background:"transparent",cursor:"pointer",position:"relative",opacity,transition:"opacity 0.2s"}}>
              <span style={{fontSize:20,lineHeight:1}}>{item.icon}</span>
              <span style={{fontSize:9,fontWeight:isActive?700:500,color:isActive?col:C.muted,letterSpacing:"0.02em"}}>{item.label.split(" ")[0]}</span>
              {isActive&&<div style={{position:"absolute",top:0,left:"20%",right:"20%",height:2,background:col,borderRadius:"0 0 2px 2px"}}/>}
              {counts[item.id]>0&&<div style={{position:"absolute",top:6,right:"20%",width:8,height:8,borderRadius:"50%",background:col}}/>}
            </button>
          );
        })}
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

function Sidebar({active,setActive,counts,collapsed,setCollapsed,profile,onProfileClick}){
  const w=collapsed?56:200;
  const navIds=NAV.map(n=>n.id);
  const sideRef=useRef(null);
  const activeRef=useRef(active); activeRef.current=active;
  const setActiveRef=useRef(setActive); setActiveRef.current=setActive;
  const wheelLock=useRef({locked:false,timer:null});

  // Scroll over the nav switches sections — panel itself stays fixed
  useEffect(()=>{
    const el=sideRef.current; if(!el) return;
    const handler=e=>{
      if(Math.abs(e.deltaY)<6||Math.abs(e.deltaX)>Math.abs(e.deltaY))return;
      e.preventDefault();
      if(wheelLock.current.locked)return;
      wheelLock.current.locked=true;
      clearTimeout(wheelLock.current.timer);
      wheelLock.current.timer=setTimeout(()=>{wheelLock.current.locked=false;},250);
      const cur=navIds.indexOf(activeRef.current);const total=navIds.length;const base=cur<0?0:cur;
      const next=e.deltaY>0?navIds[(base+1)%total]:navIds[(base-1+total)%total];
      setActiveRef.current(next);
    };
    el.addEventListener("wheel",handler,{passive:false});
    return()=>el.removeEventListener("wheel",handler);
  },[]);

  return(
    <aside ref={sideRef} style={{width:w,minWidth:w,background:C.surface,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",flexShrink:0,transition:"width 0.2s ease",overflow:"hidden",position:"relative"}}>
      <div style={{padding:"14px 10px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:collapsed?"center":"space-between",gap:8,flexShrink:0}}>
        <div style={{width:28,height:28,borderRadius:7,background:C.green,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <span style={{fontSize:14,fontWeight:900,color:"#000"}}>F</span>
        </div>
        {!collapsed&&(
          <div style={{minWidth:0,flex:1}}>
            <div style={{color:C.text,fontWeight:800,fontSize:14}}>FitOS</div>
            <div style={{color:C.muted,fontSize:10}}>Cloud ☁️</div>
          </div>
        )}
        <button onClick={()=>setCollapsed(c=>!c)} title={collapsed?"Expand":"Collapse"}
          style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:14,padding:4,borderRadius:6,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
          {collapsed?"→":"←"}
        </button>
      </div>
      <nav style={{padding:"10px 6px",flex:1,display:"flex",flexDirection:"column",gap:2,overflowY:"auto"}}>
        {NAV.map(item=>{
          const isActive=active===item.id||(active==="client"&&item.id==="clients");
          const col=item.id==="programs"?C.purple:item.id==="catalog"?C.teal:C.green;
          return(
            <button key={item.id} onClick={()=>setActive(item.id)} title={collapsed?item.label:undefined}
              style={{display:"flex",alignItems:"center",gap:collapsed?0:9,padding:collapsed?"9px 0":"9px 10px",justifyContent:collapsed?"center":"flex-start",borderRadius:8,border:"none",cursor:"pointer",textAlign:"left",background:isActive?col+"18":"transparent",color:isActive?col:C.sub,fontWeight:isActive?700:500,fontSize:13,position:"relative",width:"100%",transition:"background 0.15s,color 0.15s"}}>
              <span style={{fontSize:collapsed?18:14,flexShrink:0}}>{item.icon}</span>
              {!collapsed&&<span style={{flex:1,textAlign:"left"}}>{item.label}</span>}
              {!collapsed&&counts[item.id]>0&&<span style={{marginLeft:"auto",background:col+"22",color:col,fontSize:10,fontWeight:700,padding:"1px 6px",borderRadius:10}}>{counts[item.id]}</span>}
              {collapsed&&counts[item.id]>0&&<span style={{position:"absolute",top:4,right:4,width:8,height:8,borderRadius:"50%",background:col}}/>}
            </button>
          );
        })}
      </nav>
      {/* Trainer profile footer — click to open editor */}
      <button onClick={onProfileClick} title="Edit profile / Sign out"
        style={{padding:collapsed?"10px 0":"12px 14px",borderLeft:"none",borderRight:"none",borderBottom:"none",borderTop:`1px solid ${C.border}`,outline:"none",WebkitTapHighlightColor:"transparent",display:"flex",alignItems:"center",justifyContent:collapsed?"center":"flex-start",gap:9,background:"transparent",cursor:"pointer",width:"100%",textAlign:"left"}}>
        <Avatar name={profile?.name||"?"} size={30} color={C.purple}/>
        {!collapsed&&(
          <div style={{minWidth:0,flex:1}}>
            <div style={{color:C.text,fontSize:12,fontWeight:700,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{profile?.name||"Trainer"}</div>
            <div style={{color:C.muted,fontSize:10}}>{profile?.role||"Coach"}</div>
          </div>
        )}
        {!collapsed&&<span style={{color:C.muted,fontSize:11,flexShrink:0}}>⚙</span>}
      </button>
    </aside>
  );
}

// Simple full-screen spinner
function Spinner({msg="Loading…"}){
  return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16,fontFamily:"'Inter',system-ui,sans-serif"}}>
      <div style={{width:36,height:36,border:`3px solid ${C.border}`,borderTop:`3px solid ${C.green}`,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
      <div style={{color:C.sub,fontSize:13}}>{msg}</div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

export default function App(){
  // ── Auth state
  const [authLoading, setAuthLoading] = useState(true);
  const [authUser, setAuthUser]       = useState(null);
  const [profile, setProfile]         = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [showProfileEditor, setShowProfileEditor] = useState(false);

  // ── App data state
  const [view,setView]=useState("dashboard");
  const [clients,setClients]=useState([]);
  const [sessions,setSessions]=useState([]);
  const [classes,setClasses]=useState([]);
  const [programs,setPrograms]=useState([]);
  const [formats,setFormats]=useState([]);
  const [activeClient,setActiveClient]=useState(null);
  const [toasts,toast]=useToast();
  const [sidebarCollapsed,setSidebarCollapsed]=useState(false);
  const [preloadDay,setPreloadDay]=useState(null);
  const [catalogExercises,setCatalogExercises]=useState([]);
  const seededRef=useRef(false);
  const [mobile,setMobile]=useState(typeof window!=="undefined"&&window.innerWidth<768);

  // ── Fetch trainer profile from DB
  const fetchProfile = async (userId) => {
    setProfileLoading(true);
    try {
      const { data, error } = await supabase
        .from("fitos_trainer_profiles")
        .select("*")
        .eq("id", userId)
        .single();
      if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows
      setProfile(data || null);
    } catch(e) {
      console.warn("Profile fetch error:", e.message);
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  };

  // ── Auth listener — fires on login, logout, token refresh
  useEffect(()=>{
    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user || null;
      setAuthUser(user);
      if (user) fetchProfile(user.id);
      else setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user || null;
      setAuthUser(user);
      if (user) {
        fetchProfile(user.id);
      } else {
        setProfile(null);
        setAuthLoading(false);
      }
    });
    return () => subscription.unsubscribe();
  },[]);

  // ── Once profile is resolved, load app data
  useEffect(()=>{
    if (profileLoading) return;
    if (!authUser) { setAuthLoading(false); return; }
    if (!profile)  { setAuthLoading(false); return; } // will show ProfileSetup
    setAuthLoading(false);
    loadAll();
  },[profile, profileLoading, authUser]);

  const loadAll = async () => {
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
      // Auto-preload the shared catalog the first time it's empty
      if(cat.length===0 && !seededRef.current){
        seededRef.current=true;
        try{
          const rows=SEED_LIBRARY.map(x=>({id:uid(),name:x.name,category:x.category||"Strength",muscles:x.muscles||[],equipment:x.equipment||"Barbell",difficulty:x.difficulty||"Intermediate",purpose:x.purpose||"",instructions:x.instructions||"",video_url:"",trainer_notes:"",tags:x.tags||[],photo_base64:""}));
          const inserted=await db.insertMany("fitos_catalog",rows);
          setCatalogExercises(inserted.map(mapCatalog));
        }catch(seedErr){
          console.warn("Catalog auto-preload skipped:", seedErr.message);
          seededRef.current=false;
        }
      }
    } catch(e) {
      console.warn("Could not load from Supabase:", e.message);
    }
  };

  const reload=async()=>{
    const [c,s,cl,p,f]=await Promise.all([
      db.select("fitos_clients"),db.select("fitos_sessions"),db.select("fitos_classes"),
      db.select("fitos_programs"),db.select("fitos_formats"),
    ]);
    setClients(c.map(mapClient));setSessions(s.map(mapSession));setClasses(cl.map(mapClass));
    setPrograms(p.map(mapProgram));setFormats(f.map(mapFormat));
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setClients([]);setSessions([]);setClasses([]);setPrograms([]);setFormats([]);setCatalogExercises([]);
    setView("dashboard");setActiveClient(null);setShowProfileEditor(false);
  };

  // ── Mobile resize listener
  useEffect(()=>{
    const fn=()=>setMobile(window.innerWidth<768);
    window.addEventListener("resize",fn);
    return()=>window.removeEventListener("resize",fn);
  },[]);

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
    const row={id:p.id,name:p.name,description:p.description,weeks:Number(p.weeks),days_per_week:Number(p.daysPerWeek),days:p.days,warmup:p.warmup||[],assigned_clients:p.assignedClients};
    const r=await db.insert("fitos_programs",row);
    setPrograms(ps=>[mapProgram(r),...ps]); toast("Program created ✓");
  };
  const updateProgram=async(id,p)=>{
    const patch={name:p.name,description:p.description,weeks:Number(p.weeks),days_per_week:Number(p.daysPerWeek),days:p.days,warmup:p.warmup||[],assigned_clients:p.assignedClients};
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

  // ── Catalog CRUD
  const addCatalogExercise=async f=>{
    const row={id:uid(),name:f.name,category:f.category,muscles:f.muscles||[],equipment:f.equipment,difficulty:f.difficulty,purpose:f.purpose||"",instructions:f.instructions||"",video_url:f.videoUrl||"",trainer_notes:f.trainerNotes||"",tags:f.tags||[],photo_base64:f.photoBase64||""};
    const r=await db.insert("fitos_catalog",row);
    setCatalogExercises(p=>[mapCatalog(r),...p]);
    toast("Exercise added to catalog ✓");
  };
  const seedCatalogExercises=async lib=>{
    const have=new Set((catalogExercises||[]).map(e=>e.name.toLowerCase().trim()));
    const missing=lib.filter(e=>!have.has(e.name.toLowerCase().trim()));
    if(!missing.length){toast("Catalog already has the full starter library ✓");return 0;}
    const rows=missing.map(f=>({id:uid(),name:f.name,category:f.category||"Strength",muscles:f.muscles||[],equipment:f.equipment||"Barbell",difficulty:f.difficulty||"Intermediate",purpose:f.purpose||"",instructions:f.instructions||"",video_url:"",trainer_notes:"",tags:f.tags||[],photo_base64:""}));
    try{
      const inserted=await db.insertMany("fitos_catalog",rows);
      setCatalogExercises(p=>[...inserted.map(mapCatalog),...p]);
      toast(`Added ${inserted.length} exercises & stretches to catalog ✓`);
      return inserted.length;
    }catch(e){
      console.error("seed catalog failed",e);
      toast("Could not add starter library — make sure you're signed in");
      return 0;
    }
  };
  const quickAddCatalog=async name=>{
    const clean=(name||"").trim();
    if(!clean)return;
    if((catalogExercises||[]).some(e=>e.name.toLowerCase().trim()===clean.toLowerCase()))return;
    const row={id:uid(),name:clean,category:"Strength",muscles:[],equipment:"Other",difficulty:"Intermediate",purpose:"",instructions:"",video_url:"",trainer_notes:"",tags:[],photo_base64:""};
    try{
      const r=await db.insert("fitos_catalog",row);
      setCatalogExercises(p=>[mapCatalog(r),...p]);
      toast(`Saved "${clean}" to catalog ✓`);
    }catch(e){console.warn("quick add catalog failed:",e.message);toast(`Couldn't save "${clean}" to catalog — added to this session only`);}
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

  // ── Auth gate
  if (authLoading) return <Spinner msg="Connecting…"/>;
  if (!authUser)   return <AuthScreen/>;
  if (!profile)    return <ProfileSetup user={authUser} onComplete={p => { setProfile(p); }}/>;

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

      {!mobile&&<Sidebar active={view} setActive={navigate} counts={counts} collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} profile={profile} onProfileClick={()=>setShowProfileEditor(true)}/>}

      <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
        <div style={{height:54,borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",padding:mobile?"0 14px":"0 22px",background:C.bg,flexShrink:0}}>
          <div style={{minWidth:0,flex:1}}>
            <div style={{color:C.text,fontWeight:700,fontSize:mobile?15:16,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{TITLES[view]}</div>
            {!mobile&&<div style={{color:C.muted,fontSize:11}}>{SUBS[view]}</div>}
          </div>
          <div style={{display:"flex",gap:8,flexShrink:0,alignItems:"center"}}>
            {view==="client"&&<Btn variant="outline" style={{padding:"6px 10px",fontSize:11}} onClick={()=>navigate("clients")}>← Back</Btn>}
            {view==="dashboard"&&<Btn style={{padding:"6px 12px",fontSize:mobile?11:12}} onClick={()=>setView("sessions")}>⚡ Log</Btn>}
            {mobile&&(
              <button onClick={()=>setShowProfileEditor(true)} title="Profile / Sign out"
                style={{width:32,height:32,borderRadius:"50%",background:C.purple+"22",border:`1px solid ${C.purple}44`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:C.purple,fontWeight:800,fontSize:13}}>
                {(profile?.name||"?").charAt(0).toUpperCase()}
              </button>
            )}
          </div>
        </div>

        <main style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",overscrollBehavior:"contain",touchAction:"auto",padding:mobile?12:20,paddingBottom:mobile?80:20}}>
          {view==="dashboard"&&<Dashboard clients={clients} sessions={sessions} classes={classes} programs={programs} formats={formats} setView={setView} setActiveClient={setActiveClient} mobile={mobile}/>}
          {view==="clients"&&<ClientsScreen clients={clients} onAdd={addClient} onEdit={editClient} onDelete={deleteClient} programs={programs} setView={setView} setActiveClient={setActiveClient} mobile={mobile}/>}
          {view==="client"&&activeClient&&<ClientProfile client={clients.find(c=>c.id===activeClient.id)||activeClient} sessions={sessions} programs={programs} onEdit={editClient} setView={setView} setActiveClient={setActiveClient} onLogDay={day=>{setPreloadDay(day);setView("sessions");}}/>}
          {view==="sessions"&&<ErrorBoundary><SessionLogger clients={clients} sessions={sessions} onSave={addSession} activeClient={activeClient} programs={programs} initialDay={preloadDay} catalog={catalogExercises} onAddToCatalog={quickAddCatalog}/></ErrorBoundary>}
          {view==="classes"&&<ClassesScreen clients={clients} classes={classes} onAdd={addClass} onEdit={editClass} onDelete={deleteClass} formats={formats} mobile={mobile}/>}
          {view==="programs"&&<ProgramsHub programs={programs} onSaveProgram={addProgram} onUpdateProgram={updateProgram} onDeleteProgram={deleteProgram} formats={formats} onSaveFormat={addFormat} onUpdateFormat={updateFormat} onDeleteFormat={deleteFormat} clients={clients} onUpdateClient={updateClientRaw} classes={classes} onUpdateClass={editClass} mobile={mobile} catalog={catalogExercises} onAddToCatalog={quickAddCatalog}/>}
          {view==="catalog"&&<ExerciseCatalogScreen catalogExercises={catalogExercises} onAdd={addCatalogExercise} onEdit={editCatalogExercise} onDelete={deleteCatalogExercise} onSeed={seedCatalogExercises} sessions={sessions} clients={clients}/>}
        </main>
      </div>

      {mobile&&<BottomNav active={view} setActive={navigate} counts={counts}/>}

      {showProfileEditor&&(
        <ProfileEditor
          profile={profile}
          onSave={p=>setProfile(p)}
          onClose={()=>setShowProfileEditor(false)}
          onSignOut={signOut}
        />
      )}

      <Toast toasts={toasts}/>
    </div>
  );
}
