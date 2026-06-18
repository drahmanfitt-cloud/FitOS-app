// FitOS — Exercise Catalog
import React, { useState, useRef } from "react";
import { C, uid, now } from "./config.js";
import { Avatar, Pill, Btn, Card, SL, Modal, Confirm } from "./ui.jsx";
import { SEED_LIBRARY } from "./seedLibrary.js";

// EXERCISE CATALOG
// ═══════════════════════════════════════════════════════════════════════════════

const MUSCLE_GROUPS=["Chest","Back","Shoulders","Biceps","Triceps","Forearms","Quads","Hamstrings","Glutes","Calves","Core","Full Body"];
const EQUIPMENT_LIST=["Barbell","Dumbbell","Cable","Machine","Bodyweight","Kettlebell","Resistance Band","Box","TRX","Medicine Ball","Foam Roller","Other"];
const CATEGORIES=["Strength","Hypertrophy","Cardio","Mobility","Plyometric","Olympic","Rehabilitation","Core"];
const PURPOSE_TYPES=["Stretch","Mobility","Foam Rolling","Sport Specific","General","Warm Up","Cool Down","Injury Prevention","Recovery"];
const PURPOSE_COLORS={"Stretch":C.purple,"Mobility":C.teal,"Foam Rolling":C.blue,"Sport Specific":C.amber,"General":C.sub,"Warm Up":C.green,"Cool Down":C.blue,"Injury Prevention":C.red,"Recovery":C.purple};
// Warm-up movements get a colored dot on the catalog card, keyed by purpose.
// Colors mirror the WarmupPicker categories (stretching/mobility/foam-rolling/sport).
const WARMUP_DOT_PURPOSES={"Stretch":C.purple,"Mobility":C.teal,"Foam Rolling":C.blue,"Sport Specific":C.amber};
const DIFFICULTY=["Beginner","Intermediate","Advanced","Elite"];

// Leaderboard metric definitions
const LB_METRICS=[
  {key:"oneRM",     label:"1RM",               unit:"kg",   icon:"🏆", desc:"Heaviest single set"},
  {key:"volume",    label:"Total Volume",       unit:"kg",   icon:"📦", desc:"Most weight × reps in one session"},
  {key:"maxReps",   label:"Max Reps",           unit:"reps", icon:"🔁", desc:"Most reps in a single set"},
  {key:"fastestTime",label:"Fastest Time",      unit:"sec",  icon:"⚡", desc:"Lowest time logged for timed sets"},
  {key:"sessions",  label:"Sessions Logged",    unit:"",     icon:"📅", desc:"Most sessions featuring this exercise"},
];

// Compute leaderboard for an exercise from session data
function computeLeaderboard(exerciseName, sessions, clients){
  const clientMap={};
  clients.forEach(c=>{clientMap[c.id]=c;});

  // Per-client stats
  const stats={};
  sessions.forEach(s=>{
    const cl=clientMap[s.clientId];
    if(!cl)return;
    const exSets=(s.exercises||[]).filter(e=>e.name===exerciseName).flatMap(e=>e.sets||[]).filter(st=>st.done);
    if(!exSets.length)return;
    const cid=s.clientId;
    if(!stats[cid])stats[cid]={clientId:cid,name:cl.name,oneRM:0,volume:0,maxReps:0,fastestTime:null,sessions:0};
    stats[cid].sessions++;
    exSets.forEach(st=>{
      const load=Number(st.load||st.weight||0);
      const reps=Number(st.reps||0);
      const time=Number(st.time||0);
      // 1RM — heaviest single load × reps combo (Epley formula: load*(1+reps/30))
      if(reps>0&&load>0){
        const est1rm=reps===1?load:Math.round(load*(1+reps/30));
        if(est1rm>stats[cid].oneRM)stats[cid].oneRM=est1rm;
      }
      // Volume — load × reps
      stats[cid].volume=Math.max(stats[cid].volume,load*reps);
      // Max reps
      if(reps>stats[cid].maxReps)stats[cid].maxReps=reps;
      // Fastest time
      if(time>0&&(stats[cid].fastestTime===null||time<stats[cid].fastestTime))stats[cid].fastestTime=time;
    });
  });
  return Object.values(stats);
}

function LeaderboardTable({metric,data,sessions,clients}){
  const sorted=[...data].sort((a,b)=>{
    if(metric.key==="fastestTime"){
      if(a.fastestTime===null&&b.fastestTime===null)return 0;
      if(a.fastestTime===null)return 1;
      if(b.fastestTime===null)return -1;
      return a.fastestTime-b.fastestTime;
    }
    return (b[metric.key]||0)-(a[metric.key]||0);
  }).filter(d=>metric.key==="fastestTime"?d.fastestTime!==null:(d[metric.key]||0)>0);

  if(!sorted.length)return(
    <div style={{textAlign:"center",padding:"24px 0",color:C.muted,fontSize:13}}>No data yet — log sessions with this exercise to see rankings.</div>
  );

  const medalColors=["#FFD700","#C0C0C0","#CD7F32"];

  return(
    <div style={{display:"flex",flexDirection:"column",gap:6}}>
      {sorted.map((d,i)=>{
        const val=metric.key==="fastestTime"?`${d.fastestTime}s`:metric.key==="volume"?`${d.volume} kg·reps`:metric.key==="sessions"?`${d.sessions} sessions`:`${d[metric.key]||0} ${metric.unit}`;
        const isTop=i<3;
        return(
          <div key={d.clientId} style={{display:"flex",alignItems:"center",gap:12,background:isTop?C.s2:C.surface,borderRadius:10,padding:"10px 14px",border:`1px solid ${isTop?C.border2:C.border}`}}>
            <div style={{width:28,height:28,borderRadius:"50%",background:isTop?medalColors[i]+"22":"transparent",border:`2px solid ${isTop?medalColors[i]:C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:13,color:isTop?medalColors[i]:C.muted,flexShrink:0}}>
              {i+1}
            </div>
            <Avatar name={d.name} size={30} color={C.blue}/>
            <span style={{color:C.text,fontWeight:600,fontSize:13,flex:1}}>{d.name}</span>
            <span style={{color:isTop?C.green:C.sub,fontWeight:800,fontSize:14}}>{val}</span>
          </div>
        );
      })}
    </div>
  );
}

function ExerciseCatalogForm({initial,onSave,onClose}){
  const EMPTY={name:"",category:"Strength",muscles:[],equipment:"Barbell",difficulty:"Intermediate",instructions:"",videoUrl:"",trainerNotes:"",tags:[],photoBase64:""};
  const [f,setF]=useState(initial||EMPTY);
  const [uploading,setUploading]=useState(false);
  const set=k=>v=>setF(p=>({...p,[k]:v}));
  const toggleArr=(key,val)=>setF(p=>({...p,[key]:p[key].includes(val)?p[key].filter(x=>x!==val):[...p[key],val]}));

  const handlePhoto=async e=>{
    const file=e.target.files?.[0];
    if(!file)return;
    setUploading(true);
    const reader=new FileReader();
    reader.onload=ev=>{set("photoBase64")(ev.target.result);setUploading(false);};
    reader.readAsDataURL(file);
  };

  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      {/* Photo */}
      <div>
        <div style={{color:C.sub,fontSize:12,fontWeight:600,marginBottom:8}}>Exercise Photo</div>
        <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
          {f.photoBase64?(
            <img src={f.photoBase64} alt="exercise" style={{width:100,height:100,objectFit:"cover",borderRadius:10,border:`1px solid ${C.border}`,flexShrink:0}}/>
          ):(
            <div style={{width:100,height:100,borderRadius:10,border:`2px dashed ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",color:C.muted,fontSize:24,flexShrink:0}}>📷</div>
          )}
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            <label style={{background:C.s2,border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 14px",color:C.sub,fontSize:12,fontWeight:600,cursor:"pointer",display:"inline-block"}}>
              {uploading?"Processing…":"Upload Photo"}
              <input type="file" accept="image/*" onChange={handlePhoto} style={{display:"none"}}/>
            </label>
            {f.photoBase64&&<button onClick={()=>set("photoBase64")("")} style={{background:"none",border:"none",color:C.red,fontSize:12,cursor:"pointer",textAlign:"left"}}>Remove photo</button>}
          </div>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <div style={{gridColumn:"1/-1"}}>
          <div style={{color:C.sub,fontSize:12,fontWeight:600,marginBottom:5}}>Exercise name <span style={{color:C.red}}>*</span></div>
          <input value={f.name} onChange={e=>set("name")(e.target.value)} placeholder="e.g. Back Squat"
            style={{width:"100%",background:C.s2,border:`1px solid ${C.border2}`,borderRadius:8,padding:"9px 12px",color:C.text,fontSize:13,outline:"none",fontFamily:"inherit"}}/>
        </div>

        <div>
          <div style={{color:C.sub,fontSize:12,fontWeight:600,marginBottom:5}}>Category</div>
          <select value={f.category} onChange={e=>set("category")(e.target.value)}
            style={{width:"100%",background:C.s2,border:`1px solid ${C.border2}`,borderRadius:8,padding:"9px 12px",color:C.text,fontSize:13,outline:"none",fontFamily:"inherit"}}>
            {CATEGORIES.map(c=><option key={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <div style={{color:C.sub,fontSize:12,fontWeight:600,marginBottom:5}}>Equipment</div>
          <select value={f.equipment} onChange={e=>set("equipment")(e.target.value)}
            style={{width:"100%",background:C.s2,border:`1px solid ${C.border2}`,borderRadius:8,padding:"9px 12px",color:C.text,fontSize:13,outline:"none",fontFamily:"inherit"}}>
            {EQUIPMENT_LIST.map(e=><option key={e}>{e}</option>)}
          </select>
        </div>

        <div>
          <div style={{color:C.sub,fontSize:12,fontWeight:600,marginBottom:5}}>Difficulty</div>
          <select value={f.difficulty} onChange={e=>set("difficulty")(e.target.value)}
            style={{width:"100%",background:C.s2,border:`1px solid ${C.border2}`,borderRadius:8,padding:"9px 12px",color:C.text,fontSize:13,outline:"none",fontFamily:"inherit"}}>
            {DIFFICULTY.map(d=><option key={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <div style={{color:C.sub,fontSize:12,fontWeight:600,marginBottom:5}}>Purpose</div>
          <select value={f.purpose||""} onChange={e=>set("purpose")(e.target.value)}
            style={{width:"100%",background:C.s2,border:`1px solid ${C.border2}`,borderRadius:8,padding:"9px 12px",color:C.text,fontSize:13,outline:"none",fontFamily:"inherit"}}>
            <option value="">— Select purpose —</option>
            {PURPOSE_TYPES.map(p=><option key={p}>{p}</option>)}
          </select>
        </div>

        <div>
          <div style={{color:C.sub,fontSize:12,fontWeight:600,marginBottom:5}}>Video URL (optional)</div>
          <input value={f.videoUrl} onChange={e=>set("videoUrl")(e.target.value)} placeholder="https://youtube.com/…"
            style={{width:"100%",background:C.s2,border:`1px solid ${C.border2}`,borderRadius:8,padding:"9px 12px",color:C.text,fontSize:13,outline:"none",fontFamily:"inherit"}}/>
        </div>
      </div>

      {/* Muscle groups */}
      <div>
        <div style={{color:C.sub,fontSize:12,fontWeight:600,marginBottom:8}}>Muscle groups</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
          {MUSCLE_GROUPS.map(m=>(
            <button key={m} onClick={()=>toggleArr("muscles",m)} style={{padding:"4px 10px",borderRadius:20,fontSize:11,fontWeight:600,cursor:"pointer",border:`1px solid ${f.muscles.includes(m)?C.blue:C.border}`,background:f.muscles.includes(m)?C.blue+"18":"transparent",color:f.muscles.includes(m)?C.blue:C.muted}}>
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div>
        <div style={{color:C.sub,fontSize:12,fontWeight:600,marginBottom:5}}>Instructions</div>
        <textarea value={f.instructions} onChange={e=>set("instructions")(e.target.value)} placeholder="Step-by-step technique cues…" rows={3}
          style={{width:"100%",background:C.s2,border:`1px solid ${C.border2}`,borderRadius:8,padding:"9px 12px",color:C.text,fontSize:13,outline:"none",fontFamily:"inherit",resize:"vertical",lineHeight:1.6}}/>
      </div>

      {/* Trainer notes */}
      <div>
        <div style={{color:C.sub,fontSize:12,fontWeight:600,marginBottom:5}}>Trainer notes</div>
        <textarea value={f.trainerNotes} onChange={e=>set("trainerNotes")(e.target.value)} placeholder="Progressions, regressions, common mistakes, coaching cues…" rows={2}
          style={{width:"100%",background:C.s2,border:`1px solid ${C.border2}`,borderRadius:8,padding:"9px 12px",color:C.text,fontSize:13,outline:"none",fontFamily:"inherit",resize:"vertical",lineHeight:1.6}}/>
      </div>

      <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
        <Btn variant="outline" onClick={onClose}>Cancel</Btn>
        <Btn disabled={!f.name.trim()} onClick={()=>onSave(f)}>Save Exercise</Btn>
      </div>
    </div>
  );
}

function ExerciseCard({ex,onEdit,onDelete,sessions,clients}){
  const [showLB,setShowLB]=useState(false);
  const [lbMetric,setLbMetric]=useState(LB_METRICS[0]);
  const lbData=showLB?computeLeaderboard(ex.name,sessions,clients):[];
  const warmupDot=WARMUP_DOT_PURPOSES[ex.purpose];

  const DIFF_COLORS={Beginner:C.green,Intermediate:C.blue,Advanced:C.amber,Elite:C.red};
  const CAT_COLORS={Strength:C.blue,Hypertrophy:C.purple,Cardio:C.green,Mobility:C.teal,Plyometric:C.amber,Olympic:C.amber,Rehabilitation:C.sub,Core:C.teal};

  return(
    <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,overflow:"hidden",position:"relative"}}>
      {warmupDot&&<div title={`Warm-up: ${ex.purpose}`} style={{position:"absolute",top:"50%",right:10,transform:"translateY(-50%)",width:12,height:12,borderRadius:"50%",background:warmupDot,boxShadow:`0 0 0 4px ${warmupDot}22`,zIndex:2,pointerEvents:"none"}}/>}
      {/* Photo + header */}
      <div style={{display:"flex",gap:0}}>
        {ex.photoBase64?(
          <img src={ex.photoBase64} alt={ex.name} style={{width:100,height:100,objectFit:"cover",flexShrink:0}}/>
        ):(
          <div style={{width:100,height:100,background:C.s2,display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,flexShrink:0}}>🏋️</div>
        )}
        <div style={{flex:1,padding:"12px 14px",minWidth:0}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,marginBottom:6}}>
            <div style={{color:C.text,fontWeight:800,fontSize:15,minWidth:0}}>{ex.name}</div>
            <div style={{display:"flex",gap:6,flexShrink:0}}>
              <Btn variant="ghost" color={C.blue} style={{padding:"4px 9px",fontSize:10}} onClick={()=>onEdit(ex)}>Edit</Btn>
              <Btn variant="danger" style={{padding:"4px 9px",fontSize:10}} onClick={()=>onDelete(ex.id)}>Delete</Btn>
            </div>
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:6}}>
            <Pill color={CAT_COLORS[ex.category]||C.blue}>{ex.category}</Pill>
            <Pill color={DIFF_COLORS[ex.difficulty]||C.sub}>{ex.difficulty}</Pill>
            <Pill color={C.sub}>{ex.equipment}</Pill>
            {ex.purpose&&<Pill color={PURPOSE_COLORS[ex.purpose]||C.sub}>{ex.purpose}</Pill>}
            {(ex.muscles||[]).slice(0,3).map(m=><Pill key={m} color={C.blue+"88"}>{m}</Pill>)}
            {(ex.muscles||[]).length>3&&<Pill color={C.muted}>+{ex.muscles.length-3}</Pill>}
          </div>
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            {ex.videoUrl&&<a href={ex.videoUrl} target="_blank" rel="noopener noreferrer" style={{color:C.teal,fontSize:11,fontWeight:700,textDecoration:"none"}}>▶ Video</a>}
            <button onClick={()=>setShowLB(l=>!l)} style={{background:showLB?C.amber+"18":"transparent",border:`1px solid ${showLB?C.amber:C.border}`,borderRadius:6,padding:"3px 10px",color:showLB?C.amber:C.muted,fontSize:11,fontWeight:700,cursor:"pointer"}}>
              🏆 {showLB?"Hide":"Leaderboard"}
            </button>
          </div>
        </div>
      </div>

      {/* Instructions / notes */}
      {(ex.instructions||ex.trainerNotes)&&(
        <div style={{borderTop:`1px solid ${C.border}`,padding:"10px 14px",display:"flex",flexDirection:"column",gap:8}}>
          {ex.instructions&&<div style={{color:C.sub,fontSize:12,lineHeight:1.6}}>{ex.instructions}</div>}
          {ex.trainerNotes&&<div style={{color:C.amber,fontSize:11,fontStyle:"italic",background:C.amber+"0A",padding:"6px 10px",borderRadius:7}}>💡 {ex.trainerNotes}</div>}
        </div>
      )}

      {/* Leaderboard */}
      {showLB&&(
        <div style={{borderTop:`1px solid ${C.border}`,padding:"14px"}}>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
            {LB_METRICS.map(m=>(
              <button key={m.key} onClick={()=>setLbMetric(m)} style={{padding:"5px 12px",borderRadius:7,fontSize:11,fontWeight:700,cursor:"pointer",border:`1px solid ${lbMetric.key===m.key?C.amber:C.border}`,background:lbMetric.key===m.key?C.amber+"18":"transparent",color:lbMetric.key===m.key?C.amber:C.muted}}>
                {m.icon} {m.label}
              </button>
            ))}
          </div>
          <div style={{color:C.muted,fontSize:11,marginBottom:10}}>{lbMetric.desc}</div>
          <LeaderboardTable metric={lbMetric} data={computeLeaderboard(ex.name,sessions,clients)} sessions={sessions} clients={clients}/>
        </div>
      )}
    </div>
  );
}


// ── Filter option manager ─────────────────────────────────────────────────────
function FilterEditor({label,color,options,onUpdate,onClose}){
  const [items,setItems]=useState([...options]);
  const [newVal,setNewVal]=useState("");
  const [editIdx,setEditIdx]=useState(null);
  const [editVal,setEditVal]=useState("");

  const add=()=>{
    const v=newVal.trim();
    if(!v||items.includes(v))return;
    setItems(p=>[...p,v]);
    setNewVal("");
  };
  const remove=idx=>setItems(p=>p.filter((_,i)=>i!==idx));
  const startEdit=(idx)=>{setEditIdx(idx);setEditVal(items[idx]);};
  const saveEdit=()=>{
    if(!editVal.trim())return;
    setItems(p=>p.map((v,i)=>i===editIdx?editVal.trim():v));
    setEditIdx(null);setEditVal("");
  };
  const move=(idx,dir)=>{
    const arr=[...items];
    const ni=idx+dir;
    if(ni<0||ni>=arr.length)return;
    [arr[idx],arr[ni]]=[arr[ni],arr[idx]];
    setItems(arr);
  };

  return(
    <div style={{position:"absolute",top:"calc(100% + 6px)",left:0,zIndex:300,background:C.surface,border:`1px solid ${color}55`,borderRadius:12,padding:16,width:280,boxShadow:"0 8px 32px rgba(0,0,0,0.6)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <span style={{color,fontWeight:800,fontSize:13}}>⚙ Edit {label}</span>
        <button onClick={()=>{onUpdate(items);onClose();}} style={{background:C.green,border:"none",borderRadius:6,padding:"4px 12px",color:"#000",fontWeight:700,fontSize:11,cursor:"pointer"}}>Save</button>
      </div>

      {/* Option list */}
      <div style={{display:"flex",flexDirection:"column",gap:4,marginBottom:12,maxHeight:200,overflowY:"auto"}}>
        {items.map((item,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:6,background:C.s2,borderRadius:7,padding:"5px 8px",border:`1px solid ${C.border}`}}>
            {editIdx===i?(
              <input autoFocus value={editVal} onChange={e=>setEditVal(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter")saveEdit();if(e.key==="Escape"){setEditIdx(null);}}}
                style={{flex:1,background:"none",border:"none",color:C.text,fontSize:12,outline:"none",fontFamily:"inherit"}}/>
            ):(
              <span style={{flex:1,color:C.text,fontSize:12}}>{item}</span>
            )}
            <div style={{display:"flex",gap:2}}>
              <button onClick={()=>move(i,-1)} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:11,padding:"0 2px"}}>▲</button>
              <button onClick={()=>move(i,1)} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:11,padding:"0 2px"}}>▼</button>
              {editIdx===i?(
                <button onClick={saveEdit} style={{background:C.green+"20",border:`1px solid ${C.green}44`,borderRadius:4,padding:"1px 6px",color:C.green,fontSize:10,cursor:"pointer",fontWeight:700}}>✓</button>
              ):(
                <button onClick={()=>startEdit(i)} style={{background:C.blue+"15",border:`1px solid ${C.blue}33`,borderRadius:4,padding:"1px 6px",color:C.blue,fontSize:10,cursor:"pointer"}}>Edit</button>
              )}
              <button onClick={()=>remove(i)} style={{background:C.red+"15",border:`1px solid ${C.red}33`,borderRadius:4,padding:"1px 6px",color:C.red,fontSize:10,cursor:"pointer"}}>✕</button>
            </div>
          </div>
        ))}
        {items.length===0&&<div style={{color:C.muted,fontSize:12,textAlign:"center",padding:"8px 0"}}>No options yet</div>}
      </div>

      {/* Add new */}
      <div style={{display:"flex",gap:6}}>
        <input value={newVal} onChange={e=>setNewVal(e.target.value)}
          onKeyDown={e=>{if(e.key==="Enter")add();}}
          placeholder={`Add ${label.toLowerCase()} option…`}
          style={{flex:1,background:C.s2,border:`1px solid ${color}44`,borderRadius:7,padding:"7px 10px",color:C.text,fontSize:12,outline:"none",fontFamily:"inherit"}}/>
        <button onClick={add} style={{background:color+"20",border:`1px solid ${color}44`,borderRadius:7,padding:"7px 12px",color,fontSize:13,fontWeight:900,cursor:"pointer"}}>+</button>
      </div>
      <div style={{color:C.muted,fontSize:10,marginTop:6}}>Press Enter to add · Click Edit to rename · Drag ▲▼ to reorder</div>
    </div>
  );
}

function ExerciseCatalogScreen({catalogExercises,onAdd,onEdit,onDelete,onSeed,sessions,clients}){
  const [search,setSearch]=useState("");
  const [seeding,setSeeding]=useState(false);
  const seedLock=useRef(false);
  const handleSeed=async()=>{
    if(seedLock.current)return;
    seedLock.current=true;
    setSeeding(true);
    try{await onSeed?.(SEED_LIBRARY);}catch(e){console.error("seed catalog failed",e);}
    finally{seedLock.current=false;setSeeding(false);}
  };
  const [filterCat,setFilterCat]=useState("");
  const [filterMuscle,setFilterMuscle]=useState("");
  const [filterEquip,setFilterEquip]=useState("");
  const [filterPurpose,setFilterPurpose]=useState("");
  const [modal,setModal]=useState(null);
  const [confirm,setConfirm]=useState(null);
  const [editingFilter,setEditingFilter]=useState(null); // "cat"|"muscle"|"equip"|"purpose"

  // Custom filter options — start from defaults, saved to localStorage
  const loadOpts=(key,def)=>{try{const s=localStorage.getItem("fitos_filter_"+key);return s?JSON.parse(s):def;}catch{return def;}};
  const saveOpts=(key,arr)=>{try{localStorage.setItem("fitos_filter_"+key,JSON.stringify(arr));}catch{}};
  const [catOpts,setCatOpts]=useState(()=>loadOpts("cat",CATEGORIES));
  const [muscleOpts,setMuscleOpts]=useState(()=>loadOpts("muscle",MUSCLE_GROUPS));
  const [equipOpts,setEquipOpts]=useState(()=>loadOpts("equip",EQUIPMENT_LIST));
  const [purposeOpts,setPurposeOpts]=useState(()=>loadOpts("purpose",PURPOSE_TYPES));

  const updateCat=arr=>{setCatOpts(arr);saveOpts("cat",arr);};
  const updateMuscle=arr=>{setMuscleOpts(arr);saveOpts("muscle",arr);};
  const updateEquip=arr=>{setEquipOpts(arr);saveOpts("equip",arr);};
  const updatePurpose=arr=>{setPurposeOpts(arr);saveOpts("purpose",arr);};

  const filtered=(catalogExercises||[]).filter(ex=>{
    const matchSearch=!search||ex.name.toLowerCase().includes(search.toLowerCase());
    const matchCat=!filterCat||ex.category===filterCat;
    const matchMuscle=!filterMuscle||(ex.muscles||[]).includes(filterMuscle);
    const matchEquip=!filterEquip||ex.equipment===filterEquip;
    const matchPurpose=!filterPurpose||(ex.purpose||"")===filterPurpose;
    return matchSearch&&matchCat&&matchMuscle&&matchEquip&&matchPurpose;
  });

  const save=async f=>{
    if(modal==="add") await onAdd(f);
    else await onEdit(modal.ex.id,f);
    setModal(null);
  };

  return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      {/* Search + filters */}
      <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:16}}>
        <div style={{display:"flex",gap:10,marginBottom:12,flexWrap:"wrap"}}>
          <div style={{flex:1,minWidth:200,background:C.s2,border:`1px solid ${C.border}`,borderRadius:9,padding:"10px 14px",display:"flex",alignItems:"center",gap:8}}>
            <span style={{color:C.muted}}>🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search exercises…"
              style={{background:"none",border:"none",color:C.text,fontSize:14,flex:1,outline:"none",fontFamily:"inherit"}}/>
          </div>
          <Btn onClick={()=>setModal("add")}>+ Add Exercise</Btn>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center",rowGap:10}}>
          {/* Category filter + gear */}
          <div style={{position:"relative",display:"flex",alignItems:"center",gap:4}}>
            <select value={filterCat} onChange={e=>setFilterCat(e.target.value)}
              style={{background:filterCat?C.blue+"18":C.s2,border:`1px solid ${filterCat?C.blue:C.border}`,borderRadius:8,padding:"6px 12px",color:filterCat?C.blue:C.sub,fontSize:12,outline:"none",fontFamily:"inherit",cursor:"pointer"}}>
              <option value="">All categories</option>
              {catOpts.map(c=><option key={c}>{c}</option>)}
            </select>
            <button onClick={()=>setEditingFilter(editingFilter==="cat"?null:"cat")} title="Edit categories" className="fitos-btn"
              style={{"--btn-col":C.blue,background:editingFilter==="cat"?C.blue+"22":C.s2,border:`1px solid ${editingFilter==="cat"?C.blue:C.border}`,borderRadius:6,width:26,height:26,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:editingFilter==="cat"?C.blue:C.muted,fontSize:13,transition:"border-color 0.15s"}}>⚙</button>
            {editingFilter==="cat"&&<FilterEditor label="Categories" color={C.blue} options={catOpts} onUpdate={arr=>{updateCat(arr);if(!arr.includes(filterCat))setFilterCat("");}} onClose={()=>setEditingFilter(null)}/>}
          </div>

          {/* Muscle filter + gear */}
          <div style={{position:"relative",display:"flex",alignItems:"center",gap:4}}>
            <select value={filterMuscle} onChange={e=>setFilterMuscle(e.target.value)}
              style={{background:filterMuscle?C.purple+"18":C.s2,border:`1px solid ${filterMuscle?C.purple:C.border}`,borderRadius:8,padding:"6px 12px",color:filterMuscle?C.purple:C.sub,fontSize:12,outline:"none",fontFamily:"inherit",cursor:"pointer"}}>
              <option value="">All muscles</option>
              {muscleOpts.map(m=><option key={m}>{m}</option>)}
            </select>
            <button onClick={()=>setEditingFilter(editingFilter==="muscle"?null:"muscle")} title="Edit muscle groups" className="fitos-btn"
              style={{"--btn-col":C.purple,background:editingFilter==="muscle"?C.purple+"22":C.s2,border:`1px solid ${editingFilter==="muscle"?C.purple:C.border}`,borderRadius:6,width:26,height:26,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:editingFilter==="muscle"?C.purple:C.muted,fontSize:13,transition:"border-color 0.15s"}}>⚙</button>
            {editingFilter==="muscle"&&<FilterEditor label="Muscle Groups" color={C.purple} options={muscleOpts} onUpdate={arr=>{updateMuscle(arr);if(!arr.includes(filterMuscle))setFilterMuscle("");}} onClose={()=>setEditingFilter(null)}/>}
          </div>

          {/* Equipment filter + gear */}
          <div style={{position:"relative",display:"flex",alignItems:"center",gap:4}}>
            <select value={filterEquip} onChange={e=>setFilterEquip(e.target.value)}
              style={{background:filterEquip?C.amber+"18":C.s2,border:`1px solid ${filterEquip?C.amber:C.border}`,borderRadius:8,padding:"6px 12px",color:filterEquip?C.amber:C.sub,fontSize:12,outline:"none",fontFamily:"inherit",cursor:"pointer"}}>
              <option value="">All equipment</option>
              {equipOpts.map(e=><option key={e}>{e}</option>)}
            </select>
            <button onClick={()=>setEditingFilter(editingFilter==="equip"?null:"equip")} title="Edit equipment" className="fitos-btn"
              style={{"--btn-col":C.amber,background:editingFilter==="equip"?C.amber+"22":C.s2,border:`1px solid ${editingFilter==="equip"?C.amber:C.border}`,borderRadius:6,width:26,height:26,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:editingFilter==="equip"?C.amber:C.muted,fontSize:13,transition:"border-color 0.15s"}}>⚙</button>
            {editingFilter==="equip"&&<FilterEditor label="Equipment" color={C.amber} options={equipOpts} onUpdate={arr=>{updateEquip(arr);if(!arr.includes(filterEquip))setFilterEquip("");}} onClose={()=>setEditingFilter(null)}/>}
          </div>

          {/* Purpose filter + gear */}
          <div style={{position:"relative",display:"flex",alignItems:"center",gap:4}}>
            <select value={filterPurpose} onChange={e=>setFilterPurpose(e.target.value)}
              style={{background:filterPurpose?(PURPOSE_COLORS[filterPurpose]||C.green)+"18":C.s2,border:`1px solid ${filterPurpose?(PURPOSE_COLORS[filterPurpose]||C.green):C.border}`,borderRadius:8,padding:"6px 12px",color:filterPurpose?(PURPOSE_COLORS[filterPurpose]||C.green):C.sub,fontSize:12,outline:"none",fontFamily:"inherit",cursor:"pointer"}}>
              <option value="">All purposes</option>
              {purposeOpts.map(p=><option key={p}>{p}</option>)}
            </select>
            <button onClick={()=>setEditingFilter(editingFilter==="purpose"?null:"purpose")} title="Edit purposes" className="fitos-btn"
              style={{"--btn-col":C.green,background:editingFilter==="purpose"?C.green+"22":C.s2,border:`1px solid ${editingFilter==="purpose"?C.green:C.border}`,borderRadius:6,width:26,height:26,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:editingFilter==="purpose"?C.green:C.muted,fontSize:13,transition:"border-color 0.15s"}}>⚙</button>
            {editingFilter==="purpose"&&<FilterEditor label="Purposes" color={C.green} options={purposeOpts} onUpdate={arr=>{updatePurpose(arr);if(!arr.includes(filterPurpose))setFilterPurpose("");}} onClose={()=>setEditingFilter(null)}/>}
          </div>

          {(filterCat||filterMuscle||filterEquip||filterPurpose)&&(
            <button onClick={()=>{setFilterCat("");setFilterMuscle("");setFilterEquip("");setFilterPurpose("");}} style={{background:"none",border:"none",color:C.red,fontSize:12,cursor:"pointer",fontWeight:600}}>Clear filters ×</button>
          )}
        </div>
      </div>

      {/* Results count */}
      <div style={{color:C.muted,fontSize:12}}>{filtered.length} exercise{filtered.length!==1?"s":""}{search||filterCat||filterMuscle||filterEquip?" matching filters":""}</div>

      {/* Exercise grid */}
      {filtered.length===0?(
        <Card style={{textAlign:"center",padding:48}}>
          <div style={{fontSize:32,marginBottom:10}}>🏋️</div>
          <div style={{color:C.sub,marginBottom:16}}>{search||filterCat||filterMuscle||filterEquip?"No exercises match your filters.":"Your catalog is empty. Add your first exercise or load the starter library."}</div>
          {!search&&!filterCat&&!filterMuscle&&!filterEquip&&(
            <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
              <Btn variant="outline" color={C.teal} onClick={handleSeed} disabled={seeding}>{seeding?"Adding…":"📥 Load Starter Library"}</Btn>
              <Btn onClick={()=>setModal("add")}>+ Add First Exercise</Btn>
            </div>
          )}
        </Card>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {filtered.map(ex=>(
            <ExerciseCard key={ex.id} ex={ex} sessions={sessions} clients={clients}
              onEdit={ex=>setModal({ex})} onDelete={id=>setConfirm(id)}/>
          ))}
        </div>
      )}

      {(modal==="add"||modal?.ex)&&(
        <Modal title={modal==="add"?"Add Exercise":"Edit Exercise"} onClose={()=>setModal(null)} wide>
          <ExerciseCatalogForm initial={modal?.ex} onSave={save} onClose={()=>setModal(null)}/>
        </Modal>
      )}
      {confirm&&<Confirm msg="Delete this exercise from the catalog?" onConfirm={async()=>{await onDelete(confirm);setConfirm(null);}} onCancel={()=>setConfirm(null)}/>}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════════
// EXERCISE PICKER (shared across session logger, programs, class formats)
// ═══════════════════════════════════════════════════════════════════════════════

const EXERCISES = [
  "Back Squat","Front Squat","Deadlift","Romanian Deadlift","Sumo Deadlift",
  "Bench Press","Incline DB Press","Decline Press","Overhead Press","Push Press",
  "Pull-up","Chin-up","Barbell Row","Cable Row","Lat Pulldown",
  "Leg Press","Leg Curl","Leg Extension","Hip Thrust","Glute Bridge",
  "Goblet Squat","Split Squat","Lunge","Step-up","Box Jump",
  "Dumbbell Curl","Hammer Curl","Tricep Pushdown","Skull Crusher","Dip",
  "Lateral Raise","Face Pull","Band Pull-apart","Cable Fly","Pec Deck",
  "KB Swing","KB Clean","KB Snatch","Battle Ropes","Sled Push",
  "Plank","Dead Bug","Pallof Press","Ab Wheel","Hanging Leg Raise",
  "Burpee","Mountain Climber","Jump Squat","High Knees","Jumping Jack",
  "Bike Sprint","Row Sprint","Ski Erg","Assault Bike","Treadmill Sprint",
];

function ExPicker({onPick,onSelect,onClose,catalog=[],onAddToCatalog}){
  const [q,setQ]=useState("");
  const pickFn=onPick||onSelect||(()=>{});
  // Merge saved catalog names with the built-in list (catalog first), case-insensitive dedupe
  const catNames=(catalog||[]).map(c=>typeof c==="string"?c:c?.name).filter(Boolean);
  const seen=new Set();
  const allNames=[];
  [...catNames,...EXERCISES].forEach(n=>{const k=n.toLowerCase().trim();if(k&&!seen.has(k)){seen.add(k);allNames.push(n);}});
  const catSet=new Set(catNames.map(n=>n.toLowerCase().trim()));
  const hits=allNames.filter(e=>e.toLowerCase().includes(q.toLowerCase()));
  const exists=q&&allNames.some(n=>n.toLowerCase()===q.toLowerCase().trim());
  const choose=name=>{pickFn(name);onClose?.();};
  const chooseCustom=async()=>{
    const clean=q.trim();
    if(!clean)return;
    if(onAddToCatalog){try{await onAddToCatalog(clean);}catch(e){console.error("save to catalog failed",e);}}
    pickFn(clean);
    onClose?.();
  };
  return(
    <div>
      <input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder="Search or type custom name…"
        style={{width:"100%",background:C.s2,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 12px",color:C.text,fontSize:13,outline:"none",fontFamily:"inherit",marginBottom:10}}/>
      <div style={{maxHeight:240,overflowY:"auto",display:"flex",flexDirection:"column",gap:2}}>
        {q&&!exists&&<div onClick={chooseCustom} style={{padding:"8px 10px",borderRadius:7,cursor:"pointer",color:C.green,fontSize:13,display:"flex",gap:8,alignItems:"center"}}><Pill color={C.purple}>{onAddToCatalog?"+ save to catalog":"custom"}</Pill>{q}</div>}
        {hits.map(e=><div key={e} onClick={()=>choose(e)} style={{padding:"8px 10px",borderRadius:7,cursor:"pointer",color:C.text,fontSize:13,display:"flex",gap:8,alignItems:"center"}} onMouseEnter={el=>el.currentTarget.style.background=C.s2} onMouseLeave={el=>el.currentTarget.style.background="transparent"}>{catSet.has(e.toLowerCase().trim())&&<Pill color={C.teal}>catalog</Pill>}{e}</div>)}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════

export { ExerciseCatalogScreen, ExPicker, EXERCISES };
