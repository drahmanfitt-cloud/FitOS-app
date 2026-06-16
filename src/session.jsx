// FitOS — Session Logger
import React, { useState, useEffect, useRef, useCallback } from 'react';


function WarmupSection({warmup,setWarmup,settings,onRestStart}){
  const [open,setOpen]=useState(false);
  const addItem=cat=>setWarmup(w=>[...w,{id:uid(),name:`New ${cat==='sport-specific'?'Sport Specific':cat}`,category:cat==='sport-specific'?'mobility':cat,purpose:cat==='sport-specific'?'sport-specific':'',holdSec:settings.defaultWarmupHoldSec,reps:settings.defaultWarmupReps,resistanceMode:settings.defaultWarmupResistance,resistanceVal:"",sides:false,description:"",expanded:true}]);
  const updateItem=(id,patch)=>setWarmup(w=>w.map(i=>i.id===id?{...i,...patch}:i));
  const removeItem=id=>setWarmup(w=>w.filter(i=>i.id!==id));
  const stretches=warmup.filter(i=>i.category==="stretching");
  const mobility=warmup.filter(i=>i.category==="mobility");
  const totalSec=warmup.reduce((a,i)=>a+(i.sides?(i.holdSec||0)*2:(i.holdSec||0)),0);
  return(
    <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,overflow:"hidden"}}>
      <button onClick={()=>setOpen(o=>!o)} style={{width:"100%",padding:"14px 18px",background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:12,textAlign:"left"}}>
        <div style={{width:32,height:32,borderRadius:8,background:C.purple+"18",border:`1px solid ${C.purple}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>🧘</div>
        <div style={{flex:1}}>
          <div style={{color:C.text,fontWeight:700,fontSize:14}}>Warmup</div>
          <div style={{color:C.muted,fontSize:11,marginTop:1}}>{warmup.length===0?"No exercises added yet":`${stretches.length} stretches · ${mobility.length} mobility · ${warmup.filter(i=>i.purpose==="sport-specific").length} sport · ~${Math.round(totalSec/60)} min`}</div>
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          {warmup.length>0&&<Pill color={C.purple}>{warmup.length} exercises</Pill>}
          <span style={{color:C.muted,fontSize:13}}>{open?"▲":"▼"}</span>
        </div>
      </button>
      {open&&(
        <div style={{borderTop:`1px solid ${C.border}`,padding:"16px 18px"}}>
          {/* Purpose filter tabs */}
          {warmup.length>0&&(
            <WarmupPurposeFilter warmup={warmup} updateItem={updateItem}/>
          )}

          {/* ── Stretching subsection ── */}
          <WarmupSubsection
            label="Stretching" color={C.purple} icon="🧘"
            items={stretches}
            onAdd={()=>addItem("stretching")}
            onRemoveAll={(id,mode)=>{if(mode==="last")removeItem(id);else setWarmup(w=>w.filter(i=>i.category!=="stretching"));}}
            renderItem={item=><WarmupItem key={item.id} item={item} onUpdate={p=>updateItem(item.id,p)} onRemove={()=>removeItem(item.id)} settings={settings} onRestStart={onRestStart}/>}
          />

          {/* ── Mobility subsection ── */}
          <WarmupSubsection
            label="Mobility" color={C.teal} icon="🔄"
            items={mobility.filter(i=>i.purpose!=="sport-specific")}
            onAdd={()=>addItem("mobility")}
            onRemoveAll={(id,mode)=>{if(mode==="last")removeItem(id);else setWarmup(w=>w.filter(i=>!(i.category==="mobility"&&i.purpose!=="sport-specific")));}}
            renderItem={item=><WarmupItem key={item.id} item={item} onUpdate={p=>updateItem(item.id,p)} onRemove={()=>removeItem(item.id)} settings={settings} onRestStart={onRestStart}/>}
          />

          {/* ── Sport Specific subsection ── */}
          <WarmupSubsection
            label="Sport Specific" color={C.amber} icon="⚡"
            items={warmup.filter(i=>i.purpose==="sport-specific")}
            onAdd={()=>addItem("sport-specific")}
            onRemoveAll={(id,mode)=>{if(mode==="last")removeItem(id);else setWarmup(w=>w.filter(i=>i.purpose!=="sport-specific"));}}
            renderItem={item=><WarmupItem key={item.id} item={item} onUpdate={p=>updateItem(item.id,p)} onRemove={()=>removeItem(item.id)} settings={settings} onRestStart={onRestStart}/>}
          />

          {warmup.length===0&&<div style={{textAlign:"center",padding:"20px 0",color:C.muted,fontSize:13}}>Tap a section below to add exercises.</div>}

          {/* ── Bottom add bar ── */}
          <div style={{display:"flex",gap:8,marginTop:16,paddingTop:14,borderTop:`1px solid ${C.border}`,flexWrap:"wrap"}}>
            <Btn variant="ghost" color={C.purple} style={{padding:"6px 12px",fontSize:11}} onClick={()=>addItem("stretching")}>+ Stretch</Btn>
            <Btn variant="ghost" color={C.teal} style={{padding:"6px 12px",fontSize:11}} onClick={()=>addItem("mobility")}>+ Mobility</Btn>
            <Btn variant="ghost" color={C.amber} style={{padding:"6px 12px",fontSize:11}} onClick={()=>addItem("sport-specific")}>+ Sport Specific</Btn>
            <Btn variant="ghost" color={C.sub} style={{padding:"6px 12px",fontSize:11}} onClick={()=>setWarmup(DEFAULT_STRETCHES_FACTORY())}>Load defaults</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// WORKOUT TIMER
// ═══════════════════════════════════════════════════════════════════════════════
function WorkoutTimer({exercises,startTime}){
  const [elapsed,setElapsed]=useState(0);
  useEffect(()=>{const i=setInterval(()=>setElapsed(Math.floor((Date.now()-startTime)/1000)),1000);return()=>clearInterval(i);},[startTime]);
  const totalSets=exercises.reduce((a,e)=>a+(e.sets?.length||0),0);
  const totalRestSec=exercises.reduce((a,e)=>a+(e.sets?.length||0)*(Number(e.templateRest)||60),0);
  const estTotalSec=totalSets*30+totalRestSec;
  const doneSets=exercises.reduce((a,e)=>a+(e.sets?.filter(s=>s.done)?.length||0),0);
  const pct=totalSets>0?(doneSets/totalSets)*100:0;
  return(
    <div style={{background:C.s2,border:`1px solid ${C.border}`,borderRadius:12,padding:"14px 18px",display:"flex",alignItems:"center",gap:20}}>
      <div style={{textAlign:"center"}}>
        <div style={{color:C.muted,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:3}}>Elapsed</div>
        <div style={{color:C.green,fontWeight:900,fontSize:22,fontVariantNumeric:"tabular-nums"}}>{fmt(elapsed)}</div>
      </div>
      <div style={{width:1,height:36,background:C.border}}/>
      <div style={{flex:1}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{color:C.sub,fontSize:12}}>Sets completed</span><span style={{color:C.text,fontWeight:700,fontSize:12}}>{doneSets}/{totalSets}</span></div>
        <div style={{height:6,background:C.s3,borderRadius:3}}><div style={{height:"100%",width:`${pct}%`,background:C.green,borderRadius:3,transition:"width 0.3s"}}/></div>
      </div>
      <div style={{width:1,height:36,background:C.border}}/>
      <div style={{textAlign:"center"}}>
        <div style={{color:C.muted,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:3}}>Est. Total</div>
        <div style={{color:C.amber,fontWeight:900,fontSize:22,fontVariantNumeric:"tabular-nums"}}>{fmt(estTotalSec)}</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXERCISE CARD
// ═══════════════════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════════════
// SESSION LOGGER
// ═══════════════════════════════════════════════════════════════════════════════

// ── Inline exercise card for session logger ──────────────────────────────────
function SessionExCard({ex,updateEx,addSet,updateSet,removeSet,removeEx,startRest,settings,checkPR}){
  const [showCfg,setShowCfg]=useState(false);
  const m=RESISTANCE_MODES.find(r=>r.value===(ex.resistanceMode||"weighted"))||RESISTANCE_MODES[0];
  const hasLoad=m.unit!==null;
  return(
    <Card>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}>
            <span style={{color:C.text,fontWeight:700,fontSize:15}}>{ex.name}</span>
            <Pill color={m.color}>{m.label}</Pill>
            {ex.templateSets&&<span style={{color:C.muted,fontSize:11}}>Target: {ex.templateSets}×{ex.templateReps}</span>}
            {ex.templateRest&&<span style={{color:C.muted,fontSize:11}}>· Rest: {ex.templateRest}s</span>}
          </div>
          {ex.notes&&<div style={{color:C.sub,fontSize:11,fontStyle:"italic"}}>💡 {ex.notes}</div>}
        </div>
        <div style={{display:"flex",gap:6,marginLeft:10,flexShrink:0}}>
          <Btn variant="ghost" color={C.sub} style={{padding:"5px 8px",fontSize:11}} onClick={()=>setShowCfg(c=>!c)}>⚙</Btn>
          <Btn variant="ghost" color={C.green} style={{padding:"5px 10px",fontSize:11}} onClick={()=>addSet(ex.id)}>+ Set</Btn>
          <Btn variant="danger" style={{padding:"5px 10px",fontSize:11}} onClick={()=>removeEx(ex.id)}>✕</Btn>
        </div>
      </div>
      {showCfg&&(
        <div style={{background:C.s2,borderRadius:10,padding:"12px 14px",marginBottom:12,border:`1px solid ${C.border}`,display:"flex",flexDirection:"column",gap:10}}>
          <div>
            <div style={{color:C.muted,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6}}>Resistance mode</div>
            <ResistanceToggle value={ex.resistanceMode||"weighted"} onChange={v=>updateEx(ex.id,{resistanceMode:v})}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
            {[{l:"Target sets",f:"templateSets",t:"number"},{l:"Target reps",f:"templateReps",t:"text"},{l:"Rest (sec)",f:"templateRest",t:"number"}].map(fi=>(
              <div key={fi.f}>
                <div style={{color:C.muted,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4}}>{fi.l}</div>
                <input type={fi.t} value={ex[fi.f]||""} onChange={e=>updateEx(ex.id,{[fi.f]:e.target.value})} placeholder="—"
                  style={{width:"100%",background:C.s3,border:`1px solid ${C.border}`,borderRadius:6,padding:"5px 8px",color:C.text,fontSize:12,outline:"none",fontFamily:"inherit"}}/>
              </div>
            ))}
          </div>
          <div>
            <div style={{color:C.muted,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4}}>Notes / cues</div>
            <input value={ex.notes||""} onChange={e=>updateEx(ex.id,{notes:e.target.value})} placeholder="Form tips…"
              style={{width:"100%",background:C.s3,border:`1px solid ${C.border}`,borderRadius:6,padding:"5px 8px",color:C.text,fontSize:12,outline:"none",fontFamily:"inherit"}}/>
          </div>
        </div>
      )}
      {ex.sets.length===0?(
        <div style={{color:C.muted,fontSize:12,textAlign:"center",padding:"10px 0"}}>No sets — <span onClick={()=>addSet(ex.id)} style={{color:C.green,cursor:"pointer"}}>add first set</span></div>
      ):(
        <>
          <div style={{display:"grid",gridTemplateColumns:hasLoad?`28px 1fr 1fr 1fr 36px 24px`:`28px 1fr 1fr 36px 24px`,gap:6,padding:"0 0 6px",borderBottom:`1px solid ${C.border}`}}>
            <div style={{color:C.muted,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em"}}>#</div>
            {hasLoad&&<div style={{color:m.color,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em"}}>{m.label} ({settings.weightUnit})</div>}
            <div style={{color:C.muted,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em"}}>Reps</div>
            <div style={{color:C.muted,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em"}}>Notes</div>
            <div style={{color:C.muted,fontSize:10,fontWeight:700}}>✓</div>
            <div/>
          </div>
          {ex.sets.map((s,si)=>(
            <div key={s.id} style={{display:"grid",gridTemplateColumns:hasLoad?`28px 1fr 1fr 1fr 36px 24px`:`28px 1fr 1fr 36px 24px`,gap:6,padding:"7px 0",borderBottom:`1px solid ${C.border}`,alignItems:"center",background:s.pr&&s.done?C.amber+"08":"transparent"}}>
              <span style={{color:C.muted,fontSize:13,fontWeight:700}}>{si+1}</span>
              {hasLoad&&<input type="number" value={s.load||""} placeholder="0" onChange={e=>{updateSet(ex.id,s.id,"load",e.target.value);if(s.done)checkPR(ex.id,s.id,e.target.value,s.reps);}}
                style={{background:C.s2,border:`1px solid ${m.color}44`,borderRadius:7,padding:"6px 8px",color:m.color,fontSize:13,outline:"none",fontFamily:"inherit",width:"100%",fontWeight:700}}/>}
              <input value={s.reps||""} placeholder="0" onChange={e=>{updateSet(ex.id,s.id,"reps",e.target.value);if(s.done)checkPR(ex.id,s.id,s.load,e.target.value);}}
                style={{background:C.s2,border:`1px solid ${C.border2}`,borderRadius:7,padding:"6px 8px",color:C.text,fontSize:13,outline:"none",fontFamily:"inherit",width:"100%"}}/>
              <input value={s.setNotes||""} placeholder="—" onChange={e=>updateSet(ex.id,s.id,"setNotes",e.target.value)}
                style={{background:C.s2,border:`1px solid ${C.border2}`,borderRadius:7,padding:"6px 8px",color:C.sub,fontSize:12,outline:"none",fontFamily:"inherit",width:"100%"}}/>
              <div onClick={()=>{
                const done=!s.done;
                updateSet(ex.id,s.id,"done",done);
                if(done){checkPR(ex.id,s.id,s.load,s.reps);startRest(Number(ex.templateRest)||settings.defaultRestSec);}
              }} style={{width:32,height:32,borderRadius:7,border:`2px solid ${s.done?C.green:C.border}`,background:s.done?C.green:"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:s.done?"#000":C.muted,fontSize:14,fontWeight:800}}>{s.done?"✓":""}</div>
              <div onClick={()=>removeSet(ex.id,s.id)} style={{color:C.muted,cursor:"pointer",fontSize:16,textAlign:"center"}}>×</div>
              {s.pr&&s.done&&<div style={{gridColumn:"1/-1"}}><Pill color={C.amber}>🏆 New PR!</Pill></div>}
            </div>
          ))}
        </>
      )}
    </Card>
  );
}

function SessionLogger({clients,sessions,onSave,activeClient,programs}){
  const [settings,setSettings]=useState(DEFAULT_SETTINGS);
  const [showSettings,setShowSettings]=useState(false);
  const [clientId,setClientId]=useState(activeClient?.id||"");
  const [name,setName]=useState("");
  const [notes,setNotes]=useState("");
  const [warmup,setWarmup]=useState([]);
  const [exercises,setExercises]=useState([]);
  const [showPicker,setShowPicker]=useState(false);
  const [saved,setSaved]=useState(false);
  const [saving,setSaving]=useState(false);
  const [programDay,setProgramDay]=useState("");
  const [loadModal,setLoadModal]=useState(false);
  const [startTime]=useState(Date.now());
  const [elapsed,setElapsed]=useState(0);

  // Simple rest timer — no complex hooks
  const [restSec,setRestSec]=useState(0);
  const [restFor,setRestFor]=useState(0);
  const [restRunning,setRestRunning]=useState(false);
  const [restExpanded,setRestExpanded]=useState(false);
  const restRef=useRef(null);

  const startRest=useCallback((sec)=>{
    if(!sec||sec<=0)return;
    setRestFor(sec);setRestSec(sec);setRestRunning(true);setRestExpanded(false);
  },[]);

  const pauseRest=useCallback(()=>setRestRunning(r=>!r),[]);

  const skipRest=useCallback(()=>{
    if(restRef.current)clearInterval(restRef.current);
    setRestRunning(false);setRestSec(0);setRestFor(0);setRestExpanded(false);
  },[]);

  useEffect(()=>{
    if(!restRunning){if(restRef.current)clearInterval(restRef.current);return;}
    restRef.current=setInterval(()=>{
      setRestSec(s=>{
        if(s<=1){clearInterval(restRef.current);setRestRunning(false);setRestFor(0);return 0;}
        return s-1;
      });
    },1000);
    return()=>{if(restRef.current)clearInterval(restRef.current);};
  },[restRunning]);

  // Elapsed timer
  useEffect(()=>{
    const i=setInterval(()=>setElapsed(Math.floor((Date.now()-startTime)/1000)),1000);
    return()=>clearInterval(i);
  },[startTime]);

  const client=clients.find(c=>c.id===clientId);
  const prog=programs.find(p=>p.id===client?.programId);

  const loadFromDay=day=>{
    setName(day.label+(day.focus?` — ${day.focus}`:""));
    setProgramDay(day.label);
    setExercises((day.exercises||[]).map(e=>({id:uid(),name:e.name,resistanceMode:"weighted",sets:[],templateSets:e.sets,templateReps:e.reps,templateRest:e.rest||settings.defaultRestSec,notes:e.notes||""})));
    setLoadModal(false);
  };

  const addSet=exId=>setExercises(p=>p.map(e=>e.id===exId?{...e,sets:[...e.sets,{id:uid(),load:"",reps:"",setNotes:"",done:false,pr:false}]}:e));
  const updateSet=(exId,sid,field,val)=>setExercises(p=>p.map(e=>e.id!==exId?e:{...e,sets:e.sets.map(s=>s.id!==sid?s:{...s,[field]:val})}));
  const removeSet=(exId,sid)=>setExercises(p=>p.map(e=>e.id!==exId?e:{...e,sets:e.sets.filter(s=>s.id!==sid)}));
  const removeEx=exId=>setExercises(p=>p.filter(e=>e.id!==exId));
  const updateEx=(exId,patch)=>setExercises(p=>p.map(e=>e.id===exId?{...e,...patch}:e));
  const addEx=n=>setExercises(p=>[...p,{id:uid(),name:n,resistanceMode:"weighted",sets:[],templateRest:settings.defaultRestSec,notes:""}]);

  const checkPR=(exId,sid,load,reps)=>{
    try{
      if(!clientId||!load||!reps)return;
      const exName=exercises.find(e=>e.id===exId)?.name;
      if(!exName)return;
      const prev=(sessions||[]).filter(s=>s.clientId===clientId).flatMap(s=>s.exercises||[]).filter(e=>e.name===exName).flatMap(e=>e.sets||[]).filter(s=>s.done&&Number(s.reps)===Number(reps)).map(s=>Number(s.load||s.weight||0));
      updateSet(exId,sid,"pr",prev.length===0||Number(load)>Math.max(...prev));
    }catch(e){console.warn("PR check failed",e);}
  };

  const save=async()=>{
    if(!clientId)return;
    setSaving(true);
    try{
      await onSave({id:uid(),clientId,name:name||`Session ${fmtDate(now())}`,notes,exercises,warmup,programDay,startedAt:now()});
      setSaved(true);
    }catch(e){console.error("Save failed",e);}finally{setSaving(false);}
  };

  const totalSets=exercises.reduce((a,e)=>a+(e.sets?.length||0),0);
  const doneSets=exercises.reduce((a,e)=>a+(e.sets?.filter(s=>s.done)?.length||0),0);
  const hasPR=exercises.some(e=>e.sets?.some(s=>s.pr&&s.done));
  const pct=totalSets>0?doneSets/totalSets*100:0;
  const totalRestSec=exercises.reduce((a,e)=>a+(e.sets?.length||0)*(Number(e.templateRest)||settings.defaultRestSec),0);
  const estTotal=totalSets*30+totalRestSec;
  const restPct=restFor>0?restSec/restFor*100:0;
  const isBottom=settings.restTimerPosition==="bottom";

  if(saved){
    return(
      <Card style={{textAlign:"center",padding:48}}>
        <div style={{fontSize:40,marginBottom:12}}>💪</div>
        <div style={{color:C.green,fontWeight:800,fontSize:22,marginBottom:8}}>Session Saved!</div>
        {hasPR&&<div style={{color:C.amber,fontWeight:700,marginBottom:16}}>🏆 New PR detected!</div>}
        <div style={{color:C.sub,marginBottom:24}}>{totalSets} sets saved for {client?.name}</div>
        <Btn variant="ghost" onClick={()=>{setSaved(false);setExercises([]);setWarmup([]);setName("");setNotes("");setProgramDay("");}}>Log Another</Btn>
      </Card>
    );
  }

  return(
    <div style={{display:"flex",flexDirection:"column",gap:16,position:"relative"}}>

      {/* ── Rest timer bar ── */}
      {restFor>0&&!restExpanded&&(
        <div onClick={()=>setRestExpanded(true)} style={{position:"fixed",left:0,right:0,[isBottom?"bottom":"top"]:0,background:C.s2,borderTop:isBottom?`1px solid ${C.border}`:"none",borderBottom:!isBottom?`1px solid ${C.border}`:"none",zIndex:400,cursor:"pointer",boxShadow:isBottom?"0 -4px 20px rgba(0,0,0,0.4)":"0 4px 20px rgba(0,0,0,0.4)"}}>
          {!isBottom&&<div style={{height:3,background:C.s3}}><div style={{height:"100%",width:`${restPct}%`,background:C.green,transition:"width 1s linear"}}/></div>}
          <div style={{display:"flex",alignItems:"center",gap:14,padding:"10px 20px"}}>
            <span style={{color:C.muted,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em"}}>Rest</span>
            <span style={{color:C.green,fontWeight:900,fontSize:20,fontVariantNumeric:"tabular-nums"}}>{fmt(restSec)}</span>
            <div style={{flex:1,height:6,background:C.s3,borderRadius:3}}><div style={{height:"100%",width:`${restPct}%`,background:C.green,borderRadius:3,transition:"width 1s linear"}}/></div>
            <div style={{display:"flex",gap:8}} onClick={e=>e.stopPropagation()}>
              <button onClick={pauseRest} style={{background:C.s3,border:`1px solid ${C.border}`,borderRadius:6,padding:"5px 10px",color:C.sub,fontSize:11,cursor:"pointer",fontWeight:600}}>{restRunning?"⏸":"▶"}</button>
              <button onClick={skipRest} style={{background:C.green+"18",border:`1px solid ${C.green}33`,borderRadius:6,padding:"5px 10px",color:C.green,fontSize:11,cursor:"pointer",fontWeight:700}}>Skip →</button>
            </div>
            <span style={{color:C.muted,fontSize:11}}>⤢</span>
          </div>
          {isBottom&&<div style={{height:3,background:C.s3}}><div style={{height:"100%",width:`${restPct}%`,background:C.green,transition:"width 1s linear"}}/></div>}
        </div>
      )}

      {/* ── Rest fullscreen ── */}
      {restFor>0&&restExpanded&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:500,backdropFilter:"blur(10px)"}} onClick={()=>setRestExpanded(false)}>
          <div style={{textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",gap:22}} onClick={e=>e.stopPropagation()}>
            <div style={{color:C.sub,fontSize:13,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase"}}>Rest Time</div>
            <div style={{position:"relative",width:140,height:140}}>
              <svg width="140" height="140" style={{transform:"rotate(-90deg)"}}>
                <circle cx="70" cy="70" r="54" fill="none" stroke={C.s3} strokeWidth="8"/>
                <circle cx="70" cy="70" r="54" fill="none" stroke={C.green} strokeWidth="8" strokeDasharray={2*Math.PI*54} strokeDashoffset={2*Math.PI*54*(1-restPct/100)} strokeLinecap="round" style={{transition:"stroke-dashoffset 1s linear"}}/>
              </svg>
              <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <span style={{color:C.text,fontWeight:900,fontSize:34,fontVariantNumeric:"tabular-nums"}}>{fmt(restSec)}</span>
              </div>
            </div>
            <div style={{color:C.muted,fontSize:13}}>Tap outside to collapse</div>
            <div style={{display:"flex",gap:12}}>
              <Btn variant="ghost" color={C.sub} onClick={pauseRest} style={{padding:"10px 20px"}}>{restRunning?"⏸ Pause":"▶ Resume"}</Btn>
              <Btn variant="ghost" color={C.green} onClick={skipRest} style={{padding:"10px 20px"}}>Skip Rest →</Btn>
            </div>
          </div>
        </div>
      )}

      {/* ── Settings panel ── */}
      {showSettings&&<SettingsPanel settings={settings} onChange={setSettings} onClose={()=>setShowSettings(false)}/>}

      {/* ── Session header ── */}
      <Card>
        <SL>Session Details</SL>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
          <Select label="Client" value={clientId} onChange={v=>{setClientId(v);setExercises([]);setProgramDay("");}} required options={[{value:"",label:"— Select client —"},...(clients||[]).map(c=>({value:c.id,label:c.name}))]}/>
          <div style={{display:"flex",gap:8,alignItems:"flex-end"}}>
            <div style={{flex:1}}><Input label="Session name" value={name} onChange={setName} placeholder="e.g. Lower Body Power"/></div>
            <button onClick={()=>setShowSettings(true)} style={{width:38,height:38,borderRadius:8,background:C.s2,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:16,color:C.sub,flexShrink:0}}>⚙</button>
          </div>
        </div>
        <div style={{display:"flex",gap:10,alignItems:"flex-end"}}>
          <div style={{flex:1}}><Input label="Notes" value={notes} onChange={setNotes} placeholder="Coach notes…"/></div>
          {prog&&<Btn variant="ghost" color={C.purple} style={{padding:"9px 14px"}} onClick={()=>setLoadModal(true)}>📋 Load from Program</Btn>}
        </div>
        {programDay&&<div style={{marginTop:10}}><Pill color={C.purple}>📋 {programDay}</Pill></div>}
      </Card>

      {/* ── Workout timer ── */}
      <div style={{background:C.s2,border:`1px solid ${C.border}`,borderRadius:12,padding:"14px 18px",display:"flex",alignItems:"center",gap:20}}>
        <div style={{textAlign:"center"}}>
          <div style={{color:C.muted,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:3}}>Elapsed</div>
          <div style={{color:C.green,fontWeight:900,fontSize:22,fontVariantNumeric:"tabular-nums"}}>{fmt(elapsed)}</div>
        </div>
        <div style={{width:1,height:36,background:C.border}}/>
        <div style={{flex:1}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{color:C.sub,fontSize:12}}>Sets completed</span><span style={{color:C.text,fontWeight:700,fontSize:12}}>{doneSets}/{totalSets}</span></div>
          <div style={{height:6,background:C.s3,borderRadius:3}}><div style={{height:"100%",width:`${pct}%`,background:C.green,borderRadius:3,transition:"width 0.3s"}}/></div>
        </div>
        <div style={{width:1,height:36,background:C.border}}/>
        <div style={{textAlign:"center"}}>
          <div style={{color:C.muted,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:3}}>Est. Total</div>
          <div style={{color:C.amber,fontWeight:900,fontSize:22,fontVariantNumeric:"tabular-nums"}}>{fmt(estTotal)}</div>
        </div>
      </div>

      {/* ── Warmup ── */}
      <WarmupSection warmup={warmup} setWarmup={setWarmup} settings={settings} onRestStart={startRest}/>

      {/* ── Exercises ── */}
      {exercises.map(ex=>(
        <SessionExCard key={ex.id} ex={ex} settings={settings}
          updateEx={updateEx} addSet={addSet} updateSet={updateSet}
          removeSet={removeSet} removeEx={removeEx}
          startRest={startRest} checkPR={checkPR}/>
      ))}

      {/* ── Add exercise ── */}
      <div style={{position:"relative"}}>
        <Btn variant="ghost" color={C.green} onClick={()=>setShowPicker(p=>!p)}>+ Add Exercise</Btn>
        {showPicker&&(
          <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:14,position:"absolute",top:"calc(100% + 8px)",left:0,zIndex:200,width:290,boxShadow:"0 8px 32px rgba(0,0,0,0.5)"}}>
            <ExPicker onPick={n=>{addEx(n);setShowPicker(false);}} onClose={()=>setShowPicker(false)}/>
          </div>
        )}
      </div>

      {/* ── Save bar ── */}
      <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"14px 18px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",gap:12,alignItems:"center"}}>
          <span style={{color:C.sub,fontSize:13}}>{doneSets}/{totalSets} sets done</span>
          {hasPR&&<Pill color={C.amber}>🏆 New PR!</Pill>}
        </div>
        <Btn disabled={!clientId||exercises.length===0||saving} onClick={save} style={{padding:"10px 24px"}}>{saving?"Saving…":"Save Session"}</Btn>
      </div>

      {/* ── Load from program modal ── */}
      {loadModal&&prog&&(
        <Modal title={`Load from: ${prog.name}`} onClose={()=>setLoadModal(false)} wide>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {(prog.days||[]).map(d=>(
              <div key={d.id} style={{background:C.s2,borderRadius:10,padding:"14px 16px",border:`1px solid ${C.border}`,cursor:"pointer"}} onClick={()=>loadFromDay(d)} onMouseEnter={e=>e.currentTarget.style.borderColor=C.purple} onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div><div style={{color:C.text,fontWeight:700,fontSize:14}}>{d.label}</div>{d.focus&&<Pill color={C.purple}>{d.focus}</Pill>}</div>
                  <div style={{color:C.muted,fontSize:12}}>{(d.exercises||[]).length} exercises</div>
                </div>
                {(d.exercises||[]).length>0&&<div style={{marginTop:8,display:"flex",gap:6,flexWrap:"wrap"}}>{d.exercises.map(e=><span key={e.id} style={{fontSize:11,color:C.sub,background:C.s3,padding:"2px 7px",borderRadius:5}}>{e.name} {e.sets}×{e.reps}</span>)}</div>}
              </div>
            ))}
            {!(prog.days||[]).length&&<div style={{color:C.muted,textAlign:"center",padding:24}}>No days built yet.</div>}
          </div>
        </Modal>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// GROUP CLASSES
// ═══════════════════════════════════════════════════════════════════════════════
