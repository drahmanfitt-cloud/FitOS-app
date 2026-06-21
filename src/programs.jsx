// FitOS — Programs Hub & Class Format Builder
import React, { useState } from "react";
import { C, uid, now, clamp, fmt, TAG_COLORS } from "./config.js";
import { Avatar, Pill, Btn, Card, SL, Input, Select, Modal, Confirm } from "./ui.jsx";
import { WarmupPlanner } from "./warmup.jsx";
import { FloorPlanEditor, FollowAlongDisplay, StationRotationDisplay } from "./display.jsx";
import { ExPicker } from "./catalog.jsx";

// PROGRAMS HUB (inline — same as v3, but saving to Supabase)
// ═══════════════════════════════════════════════════════════════════════════════

const FORMAT_TYPES=[{value:"station",label:"Station Rotation"},{value:"circuit",label:"Circuit"},{value:"amrap",label:"AMRAP"},{value:"emom",label:"EMOM"},{value:"tabata",label:"Tabata"},{value:"custom",label:"Custom"}];
const CLASS_TYPES=[
  {id:"hiit",     toggle:"🏋️ HIIT",     color:C.green,  item:"Station",  items:"Stations / Exercises", empty:"No stations yet.",  lead:"Follow-Along",  timer:true},
  {id:"yoga",     toggle:"🧘 Yoga",     color:C.purple, item:"Pose",     items:"Poses",                empty:"No poses yet.",     lead:"Lead Class",    timer:false},
  {id:"mobility", toggle:"🤸 Mobility", color:C.teal,   item:"Movement", items:"Movements",            empty:"No movements yet.", lead:"Lead Movement", timer:false},
];

function ProgramBuilder({programs,onSave,onUpdate,onDelete,clients,onUpdateClient,mobile,catalog,onAddToCatalog}){
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

  const renderEditor=()=>!prog?null:(
    <div style={{display:"flex",flexDirection:"column",gap:14,overflowY:"auto",padding:"2px 6px 20px 2px",minHeight:0}}>
      <Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
          <SL>Program Settings</SL>
          <div style={{display:"flex",gap:8}}>
            <Btn variant="ghost" color={C.green} style={{padding:"5px 10px",fontSize:11}} onClick={()=>setModal("assign")}>👥 Assign</Btn>
            <Btn variant="danger" style={{padding:"5px 10px",fontSize:11}} onClick={()=>setConfirm(prog.id)}>Delete</Btn>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"2fr 1fr 1fr",gap:12}}>
          <Input label="Program name" value={prog.name} onChange={v=>upd({name:v})} required/>
          {mobile?(
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <Input label="Weeks" type="number" value={prog.weeks} onChange={v=>upd({weeks:v})} min="1"/>
              <Input label="Days/week" type="number" value={prog.daysPerWeek} onChange={v=>upd({daysPerWeek:v})} min="1"/>
            </div>
          ):(
            <>
              <Input label="Weeks" type="number" value={prog.weeks} onChange={v=>upd({weeks:v})} min="1"/>
              <Input label="Days/week" type="number" value={prog.daysPerWeek} onChange={v=>upd({daysPerWeek:v})} min="1"/>
            </>
          )}
        </div>
        <div style={{marginTop:10}}><Input label="Description" value={prog.description} onChange={v=>upd({description:v})} placeholder="Goals, periodisation…"/></div>
        {prog.assignedClients?.length>0&&<div style={{marginTop:12,display:"flex",gap:6,flexWrap:"wrap"}}>{prog.assignedClients.map(id=>{const cl=clients.find(c=>c.id===id);return cl?<Pill key={id} color={C.green}>👤 {cl.name}</Pill>:null;})}</div>}
      </Card>
      {(prog.days||[]).map(day=>(
        <Card key={day.id} style={{borderColor:C.purple+"33"}}>
          <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:14}}>
            <input value={day.label} onChange={e=>updDay(day.id,{label:e.target.value})} style={{background:"none",border:"none",color:C.text,fontWeight:700,fontSize:15,outline:"none",fontFamily:"inherit",flex:1,minWidth:0,padding:0}}/>
            <input value={day.focus} onChange={e=>updDay(day.id,{focus:e.target.value})} placeholder="Focus (Push, Lower…)" style={{background:C.s2,border:`1px solid ${C.border}`,borderRadius:7,padding:"5px 10px",color:C.sub,fontSize:12,outline:"none",fontFamily:"inherit",width:mobile?100:160,flexShrink:0,minWidth:0}}/>
            <button onClick={()=>rmDay(day.id)} style={{background:"none",border:"none",color:C.muted,fontSize:18,cursor:"pointer",lineHeight:1,flexShrink:0,padding:"0 2px"}}>×</button>
          </div>
          <div style={{marginBottom:14}}>
            <WarmupPlanner warmup={day.warmup||[]} setWarmup={w=>updDay(day.id,{warmup:w})}/>
          </div>
          <div style={{color:C.muted,fontSize:11,fontWeight:600,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:8}}>Exercises</div>
          {(day.exercises||[]).length===0&&<div style={{color:C.muted,fontSize:12,textAlign:"center",padding:"8px 0",marginBottom:8}}>No exercises yet.</div>}
          {(day.exercises||[]).map((ex)=>(
            <div key={ex.id} style={{background:C.s2,borderRadius:9,padding:"10px 12px",marginBottom:8,border:`1px solid ${C.border}`}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                <div style={{display:"flex",flexDirection:"column",gap:2}}>
                  <button onClick={()=>mvEx(day.id,ex.id,-1)} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:12,lineHeight:1,padding:0}}>▲</button>
                  <button onClick={()=>mvEx(day.id,ex.id,1)} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:12,lineHeight:1,padding:0}}>▼</button>
                </div>
                <span style={{color:C.text,fontWeight:600,fontSize:13,flex:1}}>{ex.name}</span>
                <button onClick={()=>rmEx(day.id,ex.id)} style={{background:"none",border:"none",color:C.muted,fontSize:16,cursor:"pointer",lineHeight:1}}>×</button>
              </div>
              <div style={{display:"grid",gridTemplateColumns:mobile?"1fr 1fr":"60px 80px 80px 1fr",gap:8}}>
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
      <Btn variant="ghost" color={C.purple} onClick={addDay}>+ Add Training Day</Btn>
      {exPicker&&<Modal title="Add Exercise" onClose={()=>setExPicker(null)}><ExPicker onPick={name=>{addEx(exPicker,name);setExPicker(null);}} onClose={()=>setExPicker(null)} catalog={catalog} onAddToCatalog={onAddToCatalog}/></Modal>}
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
  );

  // Mobile: show list OR editor, not side-by-side
  if(mobile&&prog){
    return(
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <Btn variant="outline" style={{alignSelf:"flex-start",padding:"6px 12px",fontSize:12}} onClick={()=>setSelected(null)}>← Programs</Btn>
        {renderEditor()}
      </div>
    );
  }
  if(mobile){
    return(
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        <Btn color={C.purple} onClick={create}>+ New Program</Btn>
        {programs.length===0&&<Card style={{textAlign:"center",padding:32}}><div style={{fontSize:28,marginBottom:8}}>📋</div><div style={{color:C.muted,fontSize:13}}>No programs yet.</div></Card>}
        {programs.map(p=>(
          <div key={p.id} onClick={()=>setSelected(p.id)} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:14,cursor:"pointer",borderLeft:`3px solid ${C.purple}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{color:C.text,fontWeight:700,fontSize:14}}>{p.name}</div>
              <span style={{color:C.muted,fontSize:18}}>›</span>
            </div>
            <div style={{color:C.muted,fontSize:11,marginTop:3}}>{p.weeks}wk · {p.daysPerWeek}d/wk · {p.days?.length||0} days</div>
            {p.assignedClients?.length>0&&<div style={{marginTop:5}}><Pill color={C.green}>{p.assignedClients.length} client{p.assignedClients.length>1?"s":""}</Pill></div>}
          </div>
        ))}
        {confirm&&<Confirm msg="Delete program?" onConfirm={async()=>{await onDelete(confirm);setSelected(null);setConfirm(null);}} onCancel={()=>setConfirm(null)}/>}
        {modal==="assign"&&prog&&<Modal title="Assign Clients" onClose={()=>setModal(null)}>{clients.map(cl=>{const on=prog.assignedClients?.includes(cl.id);return(<div key={cl.id} onClick={()=>toggleAssign(cl.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:8,cursor:"pointer",background:on?C.green+"12":C.s2,marginBottom:6,border:`1px solid ${on?C.green+"44":C.border}`}}><Avatar name={cl.name} size={28} color={TAG_COLORS[cl.tag]||C.sub}/><span style={{color:C.text,flex:1,fontSize:13}}>{cl.name}</span>{on&&<Pill color={C.green}>✓</Pill>}</div>);})}</Modal>}
        {exPicker&&<Modal title="Add Exercise" onClose={()=>setExPicker(null)} wide><ExPicker onPick={name=>{addEx(exPicker,name);setExPicker(null);}} onClose={()=>setExPicker(null)} catalog={catalog} onAddToCatalog={onAddToCatalog}/></Modal>}
      </div>
    );
  }

  return(
    <div style={{display:"grid",gridTemplateColumns:"240px 1fr",gap:16,height:"calc(100vh - 143px)",minHeight:0}}>
      <div style={{display:"flex",flexDirection:"column",gap:10,overflowY:"auto",padding:"6px 10px 20px 10px"}}>
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

      {!prog
        ?<Card style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:0}}><div style={{textAlign:"center",color:C.muted}}><div style={{fontSize:36,marginBottom:10}}>📋</div>Select or create a program</div></Card>
        :renderEditor()
      }
    </div>
  );
}

function ClassFormatBuilder({formats,onSave,onUpdate,onDelete,classes,onUpdateClass,catalog,onAddToCatalog,mobile}){
  const [selected,setSelected]=useState(null);
  const [confirm,setConfirm]=useState(null);
  const [stPicker,setStPicker]=useState(false);
  const [loadModal,setLoadModal]=useState(false);
  const [displayMode,setDisplayMode]=useState(null); // null | "followalong" | "rotation"
  const [classType,setClassType]=useState("hiit");   // "hiit" | "yoga" | "mobility"
  const [subTab,setSubTab]=useState("stations");      // "stations" | "floorplan"
  const fmt=formats.find(f=>f.id===selected);
  const typeCfg=CLASS_TYPES.find(t=>t.id===classType)||CLASS_TYPES[0];
  const allStations=fmt?.stations||[];
  const typeStations=allStations.filter(s=>(s.classType||"hiit")===classType);

  const create=async()=>{
    const f={id:uid(),name:"New Class Format",type:"circuit",description:"",totalDuration:45,workSec:40,restSec:20,rounds:3,stations:[],createdAt:now()};
    await onSave(f); setSelected(f.id);
  };
  const calcMin=(list,f)=>{
    const w=Number(f?.workSec)||0, r=Number(f?.restSec)||0, rounds=Number(f?.rounds)||1;
    const per=(list||[]).reduce((s,st)=>s+(st.sidesMode==="both"?(2*w+(Number(st.switchSec)||0)+r):(w+r)),0);
    return Math.round(per*rounds/60);
  };
  const calcTotalMin=(f)=>calcMin((f?.stations||[]).filter(s=>(s.classType||"hiit")===classType),f); // active type — live builder box
  // Persisted duration is computed across all stations so it never flips based on which type tab is open.
  const upd=patch=>{ const merged={...fmt,...patch}; merged.totalDuration=calcMin(merged.stations,merged); onUpdate(fmt.id,merged); };
  const addSt=name=>upd({stations:[...allStations,{id:uid(),name,workSec:fmt.workSec,restSec:fmt.restSec,reps:"",notes:"",equipment:"",classType}]});
  const updSt=(sid,patch)=>upd({stations:allStations.map(s=>s.id===sid?{...s,...patch}:s)});
  const rmSt=sid=>upd({stations:allStations.filter(s=>s.id!==sid)});
  const mvSt=(sid,dir)=>{
    const ids=typeStations.map(s=>s.id); const pos=ids.indexOf(sid); const npos=clamp(pos+dir,0,ids.length-1);
    if(npos===pos)return;
    const full=[...allStations]; const i=full.findIndex(s=>s.id===sid); const j=full.findIndex(s=>s.id===ids[npos]);
    [full[i],full[j]]=[full[j],full[i]]; upd({stations:full});
  };
  const COLS=(i)=>[C.green,C.blue,C.purple,C.amber,C.red,C.teal][i%6];

  // Stations — keep their saved floor-plan position (undefined = not yet placed)
  const stationsWithPos=typeStations.map(st=>({
    ...st,
    sidesMode:st.sidesMode||"none",
  }));

  // Display modes
  if(displayMode==="followalong") return <FollowAlongDisplay stations={stationsWithPos} classType={classType} mobile={mobile} onClose={()=>setDisplayMode(null)}/>;
  if(displayMode==="rotation")    return <StationRotationDisplay stations={stationsWithPos} workSec={Number(fmt?.workSec)||40} restSec={Number(fmt?.restSec)||20} mobile={mobile} onClose={()=>setDisplayMode(null)}/>;

  return(
    <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"240px 1fr",gap:16,minHeight:mobile?0:520}}>
      {(!mobile||!fmt)&&<div style={{display:"flex",flexDirection:"column",gap:10}}>
        <Btn color={C.teal} onClick={create}>+ New Class Format</Btn>
        {formats.length===0&&<Card style={{textAlign:"center",padding:32}}><div style={{fontSize:28,marginBottom:8}}>🏋️</div><div style={{color:C.muted,fontSize:13}}>No formats yet.</div></Card>}
        {formats.map(f=>(
          <div key={f.id} onClick={()=>setSelected(f.id)} style={{background:C.surface,border:`1px solid ${selected===f.id?C.teal:C.border}`,borderRadius:12,padding:14,cursor:"pointer",borderLeft:`3px solid ${selected===f.id?C.teal:C.border}`}}>
            <div style={{color:C.text,fontWeight:700,fontSize:14}}>{f.name}</div>
            <div style={{color:C.muted,fontSize:11,marginTop:3}}>{FORMAT_TYPES.find(t=>t.value===f.type)?.label} · {f.stations?.length||0} stations · {f.totalDuration}min</div>
          </div>
        ))}
      </div>}

      {mobile&&!fmt?null:!fmt?<Card style={{display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{textAlign:"center",color:C.muted}}><div style={{fontSize:36,marginBottom:10}}>🏋️</div>Select or create a format</div></Card>:(
        <div style={{display:"flex",flexDirection:"column",gap:mobile?10:14}}>
          {mobile&&<Btn variant="outline" style={{alignSelf:"flex-start",padding:"6px 12px",fontSize:12}} onClick={()=>setSelected(null)}>← All Formats</Btn>}
          <Card style={{padding:mobile?13:18}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:mobile?10:14}}>
              <SL>Format Settings</SL>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"flex-end"}}>
                <Btn variant="ghost" color={C.teal} style={{padding:"5px 10px",fontSize:11}} onClick={()=>setLoadModal(true)}>📅 Load into Class</Btn>
                <Btn variant="danger" style={{padding:"5px 10px",fontSize:11}} onClick={()=>setConfirm(fmt.id)}>Delete</Btn>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"2fr 1fr",gap:mobile?10:12,marginBottom:mobile?10:12}}>
              <Input label="Format name" value={fmt.name} onChange={v=>upd({name:v})} required/>
              <Select label="Type" value={fmt.type} onChange={v=>upd({type:v})} options={FORMAT_TYPES}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:mobile?"repeat(2,1fr)":"repeat(4,1fr)",gap:mobile?10:12,marginBottom:mobile?10:12}}>
              <Input label="Work (sec)" type="number" value={fmt.workSec} onChange={v=>upd({workSec:v})}/>
              <Input label="Rest (sec)" type="number" value={fmt.restSec} onChange={v=>upd({restSec:v})}/>
              <Input label="Rounds" type="number" value={fmt.rounds} onChange={v=>upd({rounds:v})}/>
              <div style={{display:"flex",flexDirection:"column",gap:5}}>
                <label style={{color:C.sub,fontSize:12,fontWeight:600}}>Total (min) <span style={{color:C.muted,fontWeight:500}}>· auto</span></label>
                <div style={{background:C.s3,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 12px",color:C.teal,fontSize:13,fontWeight:700}}>
                  ~{calcTotalMin(fmt)} min
                </div>
              </div>
            </div>
            <Input label="Description / coach notes" value={fmt.description} onChange={v=>upd({description:v})} placeholder="Class flow, music cues…"/>
          </Card>

          {typeStations.length>0&&(
            <div style={{background:C.s2,border:`1px solid ${C.border}`,borderRadius:12,padding:mobile?"11px 13px":"14px 16px"}}>
              <SL>{typeCfg.item} Overview · {typeStations.length}</SL>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {typeStations.map((st,i)=>(
                  <div key={st.id} style={{background:COLS(i)+"18",border:`1px solid ${COLS(i)}44`,borderRadius:9,padding:"8px 12px",minWidth:100,textAlign:"center"}}>
                    <div style={{color:COLS(i),fontSize:10,fontWeight:700,marginBottom:2}}>#{i+1}</div>
                    <div style={{color:C.text,fontSize:12,fontWeight:600}}>{st.name}</div>
                    <div style={{color:C.muted,fontSize:10}}>{st.workSec}s on · {st.restSec}s off</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Class type + display mode buttons */}
          <div style={{background:C.s2,borderRadius:12,padding:mobile?"10px 12px":"12px 14px",border:`1px solid ${C.border}`,display:"flex",flexDirection:"column",gap:mobile?8:10}}>
            <div style={{display:"flex",background:C.s3,borderRadius:8,padding:3}}>
              {CLASS_TYPES.map(t=>(
                <button key={t.id} onClick={()=>setClassType(t.id)}
                  style={{flex:1,padding:"7px",borderRadius:6,border:"none",cursor:"pointer",fontWeight:700,fontSize:mobile?11:12,background:classType===t.id?t.color:"transparent",color:classType===t.id?"#000":C.sub,transition:"all 0.15s"}}>
                  {t.toggle}
                </button>
              ))}
            </div>
            <div style={{display:"flex",gap:8}}>
              <Btn variant="ghost" color={typeCfg.color} style={{flex:1,justifyContent:"center",padding:"7px",fontSize:11}} onClick={()=>setDisplayMode("followalong")}>
                📖 {typeCfg.lead}
              </Btn>
              {typeCfg.timer&&<Btn variant="ghost" color={C.green} style={{flex:1,justifyContent:"center",padding:"7px",fontSize:11}} onClick={()=>setDisplayMode("rotation")}>
                ▶ Station Timer
              </Btn>}
            </div>
          </div>

          {/* Warmup & mobility planner — foam rolling, stretching, mobility, sport prep */}
          <WarmupPlanner warmup={fmt.warmup||[]} setWarmup={w=>upd({warmup:w})}/>

          {/* Sub tabs: Stations / Floor Plan */}
          <div style={{display:"flex",gap:2,borderBottom:`1px solid ${C.border}`}}>
            {[["stations","📋 Stations"],["floorplan","🗺 Floor Plan"]].map(([id,label])=>(
              <button key={id} onClick={()=>setSubTab(id)} style={{padding:"8px 14px",border:"none",background:"none",cursor:"pointer",color:subTab===id?C.teal:C.sub,fontWeight:subTab===id?700:500,fontSize:13,borderBottom:`2px solid ${subTab===id?C.teal:"transparent"}`}}>
                {label}
              </button>
            ))}
          </div>

          {subTab==="floorplan"&&<FloorPlanEditor stations={stationsWithPos} onUpdateStation={(id,patch)=>updSt(id,patch)}/>}

          {subTab==="stations"&&<Card style={{padding:mobile?13:18}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:mobile?10:14}}>
              <SL>{typeCfg.items}</SL>
              <Btn variant="ghost" color={C.teal} style={{padding:"5px 12px",fontSize:11}} onClick={()=>setStPicker(true)}>+ Add {typeCfg.item}</Btn>
            </div>
            {typeStations.length===0&&<div style={{color:C.muted,fontSize:13,textAlign:"center",padding:"20px 0"}}>{typeCfg.empty}</div>}
            {typeStations.map((st,i)=>(
              <div key={st.id} style={{background:C.s2,borderRadius:10,padding:mobile?"10px 11px":"12px 14px",marginBottom:mobile?8:10,border:`1px solid ${COLS(i)}33`}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:mobile?8:10}}>
                  <div style={{width:26,height:26,borderRadius:7,background:COLS(i)+"22",border:`1px solid ${COLS(i)}44`,display:"flex",alignItems:"center",justifyContent:"center",color:COLS(i),fontWeight:800,fontSize:12,flexShrink:0}}>{i+1}</div>
                  <input value={st.name} onChange={e=>updSt(st.id,{name:e.target.value})} style={{flex:1,background:"none",border:"none",color:C.text,fontWeight:700,fontSize:14,outline:"none",fontFamily:"inherit",padding:0}}/>
                  <div style={{display:"flex",gap:4}}>
                    <button onClick={()=>mvSt(st.id,-1)} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:13}}>▲</button>
                    <button onClick={()=>mvSt(st.id,1)} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:13}}>▼</button>
                    <button onClick={()=>rmSt(st.id)} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:16,lineHeight:1}}>×</button>
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:mobile?"repeat(3,1fr)":"80px 80px 80px 1fr 1fr",gap:8}}>
                  {[{l:"Work (s)",f:"workSec",t:"number"},{l:"Rest (s)",f:"restSec",t:"number"},{l:"Reps",f:"reps",t:"text"},{l:"Equipment",f:"equipment",t:"text"},{l:"Coach cue",f:"notes",t:"text"}].map(fi=>(
                    <div key={fi.f}><div style={{color:C.muted,fontSize:10,marginBottom:3}}>{fi.l}</div><input type={fi.t} value={st[fi.f]} onChange={e=>updSt(st.id,{[fi.f]:e.target.value})} style={{width:"100%",background:C.s3,border:`1px solid ${C.border}`,borderRadius:6,padding:"5px 8px",color:fi.f==="workSec"?COLS(i):C.text,fontWeight:fi.f==="workSec"?700:400,fontSize:12,outline:"none",fontFamily:"inherit"}}/></div>
                  ))}
                </div>
                <div style={{display:"flex",alignItems:"center",gap:10,marginTop:10,flexWrap:"wrap"}}>
                  <button onClick={()=>updSt(st.id,{sidesMode:st.sidesMode==="both"?"none":"both",switchSec:st.switchSec??5})}
                    style={{display:"flex",alignItems:"center",gap:7,background:"none",border:"none",cursor:"pointer",padding:0,fontFamily:"inherit"}}>
                    <div style={{width:34,height:20,borderRadius:10,background:st.sidesMode==="both"?COLS(i):C.s3,border:`1px solid ${st.sidesMode==="both"?COLS(i):C.border}`,position:"relative",transition:"background 0.15s",flexShrink:0}}>
                      <div style={{position:"absolute",top:2,left:st.sidesMode==="both"?16:2,width:14,height:14,borderRadius:"50%",background:st.sidesMode==="both"?"#000":C.muted,transition:"left 0.15s"}}/>
                    </div>
                    <span style={{color:st.sidesMode==="both"?C.text:C.muted,fontSize:12,fontWeight:600}}>Unilateral (per side)</span>
                  </button>
                  {st.sidesMode==="both"&&(
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <span style={{color:C.muted,fontSize:11}}>Side switch (s)</span>
                      <input type="number" min={1} value={st.switchSec??5} onChange={e=>updSt(st.id,{switchSec:e.target.value})}
                        style={{width:64,background:C.s3,border:`1px solid ${C.border}`,borderRadius:6,padding:"5px 8px",color:COLS(i),fontWeight:700,fontSize:12,outline:"none",fontFamily:"inherit"}}/>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </Card>}

          {stPicker&&<Modal title={`Add ${typeCfg.item}`} onClose={()=>setStPicker(false)}><ExPicker onPick={name=>{addSt(name);setStPicker(false);}} onClose={()=>setStPicker(false)} catalog={catalog} onAddToCatalog={onAddToCatalog}/></Modal>}
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

function ProgramsHub({programs,onSaveProgram,onUpdateProgram,onDeleteProgram,formats,onSaveFormat,onUpdateFormat,onDeleteFormat,clients,onUpdateClient,classes,onUpdateClass,mobile,catalog,onAddToCatalog}){
  const [tab,setTab]=useState("programs");
  return(
    <div>
      <div style={{display:"flex",gap:2,marginBottom:20,borderBottom:`1px solid ${C.border}`,overflowX:"auto"}}>
        {[["programs","📋 Training Programs",C.purple],["formats","🏋️ Class Formats",C.teal]].map(([id,label,color])=>(
          <button key={id} onClick={()=>setTab(id)} style={{padding:"10px 18px",border:"none",background:"none",cursor:"pointer",color:tab===id?color:C.sub,fontWeight:tab===id?700:500,fontSize:mobile?12:14,borderBottom:`2px solid ${tab===id?color:"transparent"}`,whiteSpace:"nowrap"}}>{label}</button>
        ))}
      </div>
      {tab==="programs"&&<ProgramBuilder programs={programs} onSave={onSaveProgram} onUpdate={onUpdateProgram} onDelete={onDeleteProgram} clients={clients} onUpdateClient={onUpdateClient} mobile={mobile} catalog={catalog} onAddToCatalog={onAddToCatalog}/>}
      {tab==="formats"&&<ClassFormatBuilder formats={formats} onSave={onSaveFormat} onUpdate={onUpdateFormat} onDelete={onDeleteFormat} classes={classes} onUpdateClass={onUpdateClass} catalog={catalog} onAddToCatalog={onAddToCatalog} mobile={mobile}/>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════

export { ProgramsHub };
