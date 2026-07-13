// FitOS — Session Logger components
import React, { useState, useEffect, useRef, useCallback } from "react";
import { C, uid, now, fmtDate, fmt } from "./config.js";
import { Avatar, Pill, Btn, Card, SL, Input, Select, Modal, NumInput, Confirm } from "./ui.jsx";
import { DEFAULT_SETTINGS, ResistanceToggle, Toggle, modeFor } from "./clients.jsx";
import { ExPicker } from "./catalog.jsx";
import { WarmupPicker } from "./warmup.jsx";

// SETTINGS PANEL
// ═══════════════════════════════════════════════════════════════════════════════
function SettingsPanel({settings,onChange,onClose}){
  const set = (k,v) => onChange({...settings,[k]:v});
  const scrollRef=useRef(null);
  useEffect(()=>{
    const el=scrollRef.current; if(!el) return;
    const handler=e=>{
      e.stopPropagation();
      const m=e.deltaMode===1?16:e.deltaMode===2?el.clientHeight:1;
      el.scrollTop+=e.deltaY*m;
    };
    el.addEventListener("wheel",handler,{passive:false});
    return()=>el.removeEventListener("wheel",handler);
  },[]);
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:600,backdropFilter:"blur(6px)"}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div ref={scrollRef} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:"20px 20px 0 0",width:"100%",maxWidth:640,maxHeight:"85vh",overflowY:"auto",WebkitOverflowScrolling:"touch",overscrollBehavior:"contain",touchAction:"pan-y",padding:24}}>
        {/* Handle */}
        <div style={{width:40,height:4,borderRadius:2,background:C.border,margin:"0 auto 20px"}}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
          <span style={{color:C.text,fontWeight:800,fontSize:18}}>⚙ Session Settings</span>
          <button onClick={onClose} style={{background:"none",border:"none",color:C.muted,fontSize:22,cursor:"pointer",lineHeight:1}}>×</button>
        </div>

        {/* ── REST TIMER ─────────────────────────────────────────────── */}
        <div style={{background:C.s2,borderRadius:12,padding:16,marginBottom:14}}>
          <SL>Rest Timer</SL>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{color:C.text,fontSize:13,fontWeight:600}}>Default rest time</div>
                <div style={{color:C.muted,fontSize:11}}>Applied when no rest is set on an exercise</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <NumInput value={settings.defaultRestSec} onChange={v=>set("defaultRestSec",v)} min={5} max={600} width={64}/>
                <span style={{color:C.muted,fontSize:12}}>sec</span>
              </div>
            </div>
            <div style={{borderTop:`1px solid ${C.border}`,paddingTop:14}}>
              <div style={{color:C.text,fontSize:13,fontWeight:600,marginBottom:10}}>Timer bar position</div>
              <div style={{display:"flex",gap:8}}>
                {[["top","⬆ Top"],["bottom","⬇ Bottom"]].map(([v,label])=>(
                  <button key={v} onClick={()=>set("restTimerPosition",v)} style={{flex:1,padding:"10px",borderRadius:9,border:`1.5px solid ${settings.restTimerPosition===v?C.green:C.border}`,background:settings.restTimerPosition===v?C.green+"18":"transparent",color:settings.restTimerPosition===v?C.green:C.sub,fontWeight:700,fontSize:12,cursor:"pointer"}}>
                    {label}
                  </button>
                ))}
              </div>
              <div style={{color:C.muted,fontSize:11,marginTop:8}}>Tap the timer bar during a session to expand it fullscreen</div>
            </div>
          </div>
        </div>

        {/* ── SET TIMER ──────────────────────────────────────────────── */}
        <div style={{background:C.s2,borderRadius:12,padding:16,marginBottom:14}}>
          <SL>Set Timer</SL>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div>
              <div style={{color:C.text,fontSize:13,fontWeight:600}}>Countdown timer per set</div>
              <div style={{color:C.muted,fontSize:11}}>Counts down from this value when a set starts. Set to 0 to disable.</div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <NumInput value={settings.setTimerSec} onChange={v=>set("setTimerSec",v)} min={0} max={300} width={64}/>
              <span style={{color:C.muted,fontSize:12}}>sec</span>
            </div>
          </div>
        </div>

        {/* ── GENERAL ────────────────────────────────────────────────── */}
        <div style={{background:C.s2,borderRadius:12,padding:16,marginBottom:14}}>
          <SL>General</SL>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{color:C.text,fontSize:13,fontWeight:600}}>Weight unit</div>
                <div style={{color:C.muted,fontSize:11}}>Applied to all weighted/resisted/assisted inputs</div>
              </div>
              <div style={{display:"flex",gap:6}}>
                {["kg","lbs"].map(u=>(
                  <button key={u} onClick={()=>set("weightUnit",u)} style={{padding:"6px 16px",borderRadius:7,border:`1.5px solid ${settings.weightUnit===u?C.blue:C.border}`,background:settings.weightUnit===u?C.blue+"18":"transparent",color:settings.weightUnit===u?C.blue:C.sub,fontWeight:700,fontSize:13,cursor:"pointer"}}>{u}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── WARMUP DEFAULTS ─────────────────────────────────────────── */}
        <div style={{background:C.s2,borderRadius:12,padding:16,marginBottom:14}}>
          <SL>Warmup Defaults</SL>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{color:C.text,fontSize:13,fontWeight:600}}>Default hold time</div>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <NumInput value={settings.defaultWarmupHoldSec} onChange={v=>set("defaultWarmupHoldSec",v)} width={64}/>
                <span style={{color:C.muted,fontSize:12}}>sec</span>
              </div>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{color:C.text,fontSize:13,fontWeight:600}}>Default reps</div>
              <input value={settings.defaultWarmupReps} onChange={e=>set("defaultWarmupReps",e.target.value)}
                style={{width:64,background:C.s3,border:`1px solid ${C.border}`,borderRadius:7,padding:"6px 8px",color:C.text,fontSize:13,outline:"none",fontFamily:"inherit",textAlign:"center"}}/>
            </div>
            <div>
              <div style={{color:C.text,fontSize:13,fontWeight:600,marginBottom:8}}>Default resistance</div>
              <ResistanceToggle value={settings.defaultWarmupResistance} onChange={v=>set("defaultWarmupResistance",v)}/>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{color:C.text,fontSize:13,fontWeight:600}}>Rest between warmup items</div>
                <div style={{color:C.muted,fontSize:11}}>Fires the rest timer bar when you mark a warmup item done. Set to 0 to disable.</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <NumInput value={settings.warmupRestSec} onChange={v=>set("warmupRestSec",v)} min={0} max={300} width={64}/>
                <span style={{color:C.muted,fontSize:12}}>sec</span>
              </div>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{color:C.text,fontSize:13,fontWeight:600}}>Auto-start timer on warmup items</div>
                <div style={{color:C.muted,fontSize:11}}>Starts the hold timer as soon as you open warmup</div>
              </div>
              <Toggle value={settings.warmupAutoTimer} onChange={v=>set("warmupAutoTimer",v)} color={C.purple}/>
            </div>
          </div>
        </div>

        <Btn onClick={onClose} style={{width:"100%",justifyContent:"center",padding:"13px"}}>Done</Btn>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COUNTDOWN TIMER HOOK
// ═══════════════════════════════════════════════════════════════════════════════
function useCountdown(onDone){
  const [seconds,setSeconds]=useState(0);
  const [running,setRunning]=useState(false);
  const ref=useRef(null);
  const cb=useRef(onDone);
  useEffect(()=>{cb.current=onDone;},[onDone]);
  const start=useCallback(s=>{setSeconds(s);setRunning(true);},[]);
  const pause=useCallback(()=>setRunning(r=>!r),[]);
  const skip=useCallback(()=>{setRunning(false);setSeconds(0);cb.current?.();},[]);
  const reset=useCallback(()=>{setRunning(false);setSeconds(0);},[]);
  useEffect(()=>{
    if(!running)return;
    ref.current=setInterval(()=>{
      setSeconds(s=>{if(s<=1){clearInterval(ref.current);setRunning(false);cb.current?.();return 0;}return s-1;});
    },1000);
    return()=>clearInterval(ref.current);
  },[running]);
  return{seconds,running,start,pause,skip,reset};
}

// ═══════════════════════════════════════════════════════════════════════════════
// REST TIMER BAR  (compact strip, tap to go fullscreen)
// ═══════════════════════════════════════════════════════════════════════════════
function RestTimerBar({seconds,running,onPause,onSkip,restFor,position,onExpand}){
  if(!restFor)return null;
  const pct=restFor>0?(seconds/restFor)*100:0;
  const isTop=position==="top";
  return(
    <div onClick={onExpand} style={{
      position:"fixed", left:0, right:0, [isTop?"top":"bottom"]:0,
      background:C.s2, borderTop:isTop?"none":`1px solid ${C.border}`,
      borderBottom:isTop?`1px solid ${C.border}`:"none",
      zIndex:400, cursor:"pointer",
      boxShadow:isTop?"0 4px 20px rgba(0,0,0,0.4)":"0 -4px 20px rgba(0,0,0,0.4)",
    }}>
      {/* Progress bar — top of bar if position=bottom, bottom of bar if position=top */}
      {!isTop&&<div style={{height:3,background:C.s3}}><div style={{height:"100%",width:`${pct}%`,background:C.green,transition:"width 1s linear"}}/></div>}
      <div style={{display:"flex",alignItems:"center",gap:14,padding:"10px 20px"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{color:C.muted,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em"}}>Rest</span>
          <span style={{color:C.green,fontWeight:900,fontSize:20,fontVariantNumeric:"tabular-nums"}}>{fmt(seconds)}</span>
        </div>
        <div style={{flex:1,height:6,background:C.s3,borderRadius:3}}>
          <div style={{height:"100%",width:`${pct}%`,background:C.green,borderRadius:3,transition:"width 1s linear"}}/>
        </div>
        <div style={{display:"flex",gap:8}} onClick={e=>e.stopPropagation()}>
          <button onClick={onPause} style={{background:C.s3,border:`1px solid ${C.border}`,borderRadius:6,padding:"5px 10px",color:C.sub,fontSize:11,cursor:"pointer",fontWeight:600}}>{running?"⏸":"▶"}</button>
          <button onClick={onSkip} style={{background:C.green+"18",border:`1px solid ${C.green}33`,borderRadius:6,padding:"5px 10px",color:C.green,fontSize:11,cursor:"pointer",fontWeight:700}}>Skip →</button>
        </div>
        <span style={{color:C.muted,fontSize:11}}>⤢</span>
      </div>
      {isTop&&<div style={{height:3,background:C.s3}}><div style={{height:"100%",width:`${pct}%`,background:C.green,transition:"width 1s linear"}}/></div>}
    </div>
  );
}

// Fullscreen rest timer overlay
function RestTimerFull({seconds,running,onPause,onSkip,onCollapse,restFor}){
  if(!restFor)return null;
  const pct=restFor>0?(seconds/restFor)*100:0;
  const circ=2*Math.PI*54;
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:500,backdropFilter:"blur(10px)"}} onClick={onCollapse}>
      <div style={{textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",gap:22}} onClick={e=>e.stopPropagation()}>
        <div style={{color:C.sub,fontSize:13,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase"}}>Rest Time</div>
        <div style={{position:"relative",width:140,height:140}}>
          <svg width="140" height="140" style={{transform:"rotate(-90deg)"}}>
            <circle cx="70" cy="70" r="54" fill="none" stroke={C.s3} strokeWidth="8"/>
            <circle cx="70" cy="70" r="54" fill="none" stroke={C.green} strokeWidth="8"
              strokeDasharray={circ} strokeDashoffset={circ*(1-pct/100)}
              strokeLinecap="round" style={{transition:"stroke-dashoffset 1s linear"}}/>
          </svg>
          <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{color:C.text,fontWeight:900,fontSize:34,fontVariantNumeric:"tabular-nums"}}>{fmt(seconds)}</span>
          </div>
        </div>
        <div style={{color:C.muted,fontSize:13}}>Next set coming up… <span style={{color:C.muted,fontSize:11}}>(tap outside to collapse)</span></div>
        <div style={{display:"flex",gap:12}}>
          <Btn variant="ghost" color={C.sub} onClick={onPause} style={{padding:"10px 20px"}}>{running?"⏸ Pause":"▶ Resume"}</Btn>
          <Btn variant="ghost" color={C.green} onClick={onSkip} style={{padding:"10px 20px"}}>Skip Rest →</Btn>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SET TIMER  (counts down per set, shown inside exercise card)
// ═══════════════════════════════════════════════════════════════════════════════
function SetTimerPill({setTimerSec,onDone}){
  const {seconds,running,start,pause,skip}=useCountdown(onDone);
  const [started,setStarted]=useState(false);
  const pct=setTimerSec>0?seconds/setTimerSec*100:0;
  if(!setTimerSec)return null;
  if(!started)return(
    <button onClick={()=>{setStarted(true);start(setTimerSec);}} style={{background:C.blue+"18",border:`1px solid ${C.blue}33`,borderRadius:6,padding:"3px 10px",color:C.blue,fontSize:11,fontWeight:700,cursor:"pointer"}}>▶ Set Timer</button>
  );
  return(
    <div style={{display:"flex",alignItems:"center",gap:8,background:C.blue+"0E",border:`1px solid ${C.blue}33`,borderRadius:8,padding:"5px 10px"}}>
      <span style={{color:C.blue,fontWeight:800,fontSize:13,fontVariantNumeric:"tabular-nums"}}>{fmt(seconds)}</span>
      <div style={{width:60,height:4,background:C.s3,borderRadius:2}}><div style={{height:"100%",width:`${pct}%`,background:C.blue,borderRadius:2,transition:"width 1s linear"}}/></div>
      <button onClick={pause} style={{background:"none",border:"none",color:C.blue,fontSize:12,cursor:"pointer",fontWeight:700}}>{running?"⏸":"▶"}</button>
      <button onClick={()=>{skip();setStarted(false);}} style={{background:"none",border:"none",color:C.muted,fontSize:11,cursor:"pointer"}}>✕</button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// WARMUP SECTION
// ═══════════════════════════════════════════════════════════════════════════════
const DEFAULT_STRETCHES_FACTORY=()=>[
  {id:uid(),name:"Hip Flexor Stretch",category:"stretching",holdSec:30,reps:"",resistanceMode:"bodyweight",resistanceVal:"",sides:true,description:"Kneel on one knee, push hips forward. Keep torso upright and core braced.",expanded:false},
  {id:uid(),name:"World's Greatest Stretch",category:"stretching",holdSec:45,reps:"",resistanceMode:"bodyweight",resistanceVal:"",sides:true,description:"Step into lunge, rotate thoracic spine, reach arm to sky.",expanded:false},
  {id:uid(),name:"Cat-Cow",category:"mobility",holdSec:20,reps:"10",resistanceMode:"bodyweight",resistanceVal:"",sides:false,description:"On hands and knees. Inhale arch (cow), exhale round (cat).",expanded:false},
  {id:uid(),name:"90/90 Hip Rotation",category:"mobility",holdSec:40,reps:"",resistanceMode:"resisted",resistanceVal:"",sides:true,description:"Sit with both knees at 90°. Rotate hips into IR and ER each side.",expanded:false},
  {id:uid(),name:"Band Pull-Apart",category:"mobility",holdSec:0,reps:"15",resistanceMode:"resisted",resistanceVal:"Light",sides:false,description:"Hold band at shoulder width, pull apart to full extension.",expanded:false},
];

function WarmupTimerRing({item,onDone,autoStart,onRestStart,warmupRestSec}){
  const [phase,setPhase]=useState(item.sides?"left":"single");
  const {seconds,running,start,pause,skip}=useCountdown(()=>{
    if(phase==="left"){setPhase("right");start(item.holdSec);}
    else{setPhase("done");onDone?.();if(warmupRestSec)onRestStart?.(warmupRestSec);}
  });
  useEffect(()=>{if(item.holdSec>0&&autoStart)start(item.holdSec);},[]);
  const pct=item.holdSec>0?seconds/item.holdSec*100:0;
  const color=item.category==="stretching"?C.purple:item.category==="foam-rolling"?C.blue:C.teal;
  if(phase==="done")return(<div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",background:C.green+"18",borderRadius:8,border:`1px solid ${C.green}33`}}><span style={{color:C.green,fontSize:16}}>✓</span><span style={{color:C.green,fontWeight:700,fontSize:13}}>Complete!{warmupRestSec?" Rest starting…":""}</span></div>);
  return(
    <div style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",background:color+"0E",borderRadius:10,border:`1px solid ${color}33`}}>
      <div style={{position:"relative",width:44,height:44,flexShrink:0}}>
        <svg width="44" height="44" style={{transform:"rotate(-90deg)"}}>
          <circle cx="22" cy="22" r="18" fill="none" stroke={C.s3} strokeWidth="4"/>
          <circle cx="22" cy="22" r="18" fill="none" stroke={color} strokeWidth="4"
            strokeDasharray={2*Math.PI*18} strokeDashoffset={2*Math.PI*18*(1-pct/100)}
            strokeLinecap="round" style={{transition:"stroke-dashoffset 1s linear"}}/>
        </svg>
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <span style={{color,fontWeight:800,fontSize:11}}>{fmt(seconds)}</span>
        </div>
      </div>
      <div style={{flex:1}}>
        <div style={{color:C.text,fontWeight:600,fontSize:13}}>{item.name}</div>
        {item.sides&&<div style={{color,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",marginTop:2}}>{phase==="left"?"Left":"Right"} side</div>}
      </div>
      <div style={{display:"flex",gap:6}}>
        {!running&&seconds===0?<button onClick={()=>start(item.holdSec)} style={{background:color+"18",border:`1px solid ${color}44`,borderRadius:6,padding:"5px 10px",color,fontSize:11,cursor:"pointer",fontWeight:700}}>▶ Start</button>:
        <><button onClick={pause} style={{background:C.s3,border:`1px solid ${C.border}`,borderRadius:6,padding:"5px 10px",color:C.sub,fontSize:11,cursor:"pointer",fontWeight:600}}>{running?"Pause":"Resume"}</button>
        <button onClick={skip} style={{background:color+"18",border:`1px solid ${color}44`,borderRadius:6,padding:"5px 10px",color,fontSize:11,cursor:"pointer",fontWeight:600}}>Skip</button></>}
      </div>
    </div>
  );
}

function WarmupItem({item,onUpdate,onRemove,settings,onRestStart}){
  const [timerActive,setTimerActive]=useState(false);
  const [done,setDone]=useState(false);
  const color=item.category==="stretching"?C.purple:item.category==="foam-rolling"?C.blue:C.teal;
  const mode=modeFor(item.resistanceMode);
  const unit=settings.weightUnit;
  return(
    <div style={{background:C.s2,borderRadius:10,border:`1px solid ${done?C.green+"44":C.border}`,overflow:"hidden",marginBottom:8}}>
      <div style={{padding:"10px 14px",display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:8,height:8,borderRadius:"50%",background:color,flexShrink:0}}/>
        <input value={item.name} onChange={e=>onUpdate({name:e.target.value})}
          style={{flex:1,background:"none",border:"none",color:C.text,fontWeight:600,fontSize:13,outline:"none",fontFamily:"inherit"}}/>
        <div style={{display:"flex",alignItems:"center",gap:5}}>
          <Pill color={color}>{item.category}</Pill>
          {item.sides&&<Pill color={C.amber}>Both sides</Pill>}
          {item.resistanceMode!=="bodyweight"&&<Pill color={mode.color}>{mode.label}</Pill>}
        </div>
        <button onClick={()=>onUpdate({expanded:!item.expanded})} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:13}}>{item.expanded?"▲":"▼"}</button>
        <button onClick={onRemove} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:16,lineHeight:1}}>×</button>
      </div>

      {timerActive&&!done?(
        <div style={{padding:"0 14px 12px"}}>
          <WarmupTimerRing item={item} onDone={()=>{setTimerActive(false);setDone(true);}} autoStart={settings.warmupAutoTimer} onRestStart={onRestStart} warmupRestSec={settings.warmupRestSec}/>
        </div>
      ):(
        <div style={{padding:"0 14px 12px",display:"flex",flexDirection:"column",gap:8}}>
          <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
            <div style={{display:"flex",alignItems:"center",gap:5}}>
              <span style={{color:C.muted,fontSize:11}}>Hold</span>
              <input type="number" value={item.holdSec} onChange={e=>{const v=e.target.value;onUpdate({holdSec:v===""?"":Number(v)});}}
                style={{width:44,background:C.s3,border:`1px solid ${C.border}`,borderRadius:6,padding:"4px 7px",color:C.text,fontSize:12,outline:"none",fontFamily:"inherit",textAlign:"center"}}/>
              <span style={{color:C.muted,fontSize:11}}>sec</span>
            </div>
            <div style={{width:1,height:14,background:C.border}}/>
            <div style={{display:"flex",alignItems:"center",gap:5}}>
              <span style={{color:C.muted,fontSize:11}}>Reps</span>
              <input value={item.reps} onChange={e=>onUpdate({reps:e.target.value})} placeholder="—"
                style={{width:44,background:C.s3,border:`1px solid ${C.border}`,borderRadius:6,padding:"4px 7px",color:C.text,fontSize:12,outline:"none",fontFamily:"inherit",textAlign:"center"}}/>
            </div>
            {mode.unit&&(
              <>
                <div style={{width:1,height:14,background:C.border}}/>
                <div style={{display:"flex",alignItems:"center",gap:5}}>
                  <span style={{color:mode.color,fontSize:11,fontWeight:700}}>{mode.label}</span>
                  <input value={item.resistanceVal} onChange={e=>onUpdate({resistanceVal:e.target.value})} placeholder="—"
                    style={{width:52,background:C.s3,border:`1px solid ${mode.color}44`,borderRadius:6,padding:"4px 7px",color:mode.color,fontSize:12,outline:"none",fontFamily:"inherit",textAlign:"center",fontWeight:700}}/>
                  <span style={{color:C.muted,fontSize:11}}>{unit}</span>
                </div>
              </>
            )}
            <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8}}>
              {!done&&item.holdSec>0&&<button onClick={()=>setTimerActive(true)} style={{background:color+"18",border:`1px solid ${color}44`,borderRadius:6,padding:"4px 10px",color,fontSize:11,cursor:"pointer",fontWeight:700}}>▶ Timer</button>}
              <button onClick={()=>{const nd=!done;setDone(nd);if(nd&&settings.warmupRestSec)onRestStart?.(settings.warmupRestSec);}} style={{background:"none",border:"none",color:C.muted,fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
                <div style={{width:15,height:15,borderRadius:3,border:`2px solid ${done?C.green:C.border}`,background:done?C.green:"transparent",display:"flex",alignItems:"center",justifyContent:"center",color:"#000",fontSize:9,fontWeight:800}}>{done?"✓":""}</div>
                {item.sides?"Both sides":"Done"}
              </button>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{color:C.muted,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",flexShrink:0}}>Mode:</span>
            <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
              {RESISTANCE_MODES.map(m=>(
                <button key={m.value} onClick={()=>onUpdate({resistanceMode:m.value,resistanceVal:""})} style={{padding:"2px 8px",borderRadius:5,fontSize:10,fontWeight:700,cursor:"pointer",border:`1px solid ${item.resistanceMode===m.value?m.color:C.border}`,background:item.resistanceMode===m.value?m.color+"18":"transparent",color:item.resistanceMode===m.value?m.color:C.muted,transition:"all 0.12s"}}>{m.label}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {item.expanded&&(
        <div style={{padding:"12px 14px 14px",borderTop:`1px solid ${C.border}`,display:"flex",flexDirection:"column",gap:12}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div>
              <div style={{color:C.muted,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6}}>Category</div>
              <div style={{display:"flex",gap:6}}>
                {[["stretching","Stretch",C.purple],["mobility","Mobility",C.teal],["foam-rolling","Foam Roll",C.blue]].map(([cat,lbl,col])=>(
                  <button key={cat} onClick={()=>onUpdate({category:cat,purpose:""})} style={{padding:"4px 10px",borderRadius:6,border:`1px solid ${item.category===cat?col:C.border}`,background:item.category===cat?col+"18":"transparent",color:item.category===cat?col:C.muted,fontSize:11,fontWeight:600,cursor:"pointer"}}>{lbl}</button>
                ))}
              </div>
            </div>
            <div>
              <div style={{color:C.muted,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6}}>Both sides</div>
              <Toggle value={item.sides} onChange={v=>onUpdate({sides:v})} color={C.amber}/>
            </div>
          </div>
          <div>
            <div style={{color:C.muted,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6}}>Description / cues</div>
            <textarea value={item.description} onChange={e=>onUpdate({description:e.target.value})} placeholder="Form cues, progressions…"
              style={{width:"100%",background:C.s3,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 12px",color:C.text,fontSize:12,outline:"none",fontFamily:"inherit",resize:"vertical",minHeight:60,lineHeight:1.6}}/>
          </div>
        </div>
      )}
    </div>
  );
}


// ── Warmup purpose filter ─────────────────────────────────────────────────────
const WARMUP_PURPOSES=[
  {value:"all",       label:"All",           color:C.sub},
  {value:"stretching",label:"Stretch",       color:C.purple},
  {value:"mobility",  label:"Mobility",      color:C.teal},
  {value:"foam-rolling",label:"Foam Roll",   color:C.blue},
  {value:"sport-specific",label:"Sport Specific",color:C.amber},
];
function WarmupPurposeFilter({warmup,updateItem}){
  const [active,setActive]=useState("all");
  const counts={};
  WARMUP_PURPOSES.forEach(p=>{counts[p.value]=(p.value==="all"?warmup.length:warmup.filter(i=>i.category===p.value||i.purpose===p.value).length);});
  return(
    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14,paddingBottom:12,borderBottom:`1px solid ${C.border}`}}>
      <span style={{color:C.muted,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",alignSelf:"center",marginRight:4}}>Filter:</span>
      {WARMUP_PURPOSES.map(p=>(
        <button key={p.value} onClick={()=>setActive(p.value)} style={{padding:"4px 12px",borderRadius:20,fontSize:11,fontWeight:700,cursor:"pointer",border:`1px solid ${active===p.value?p.color:C.border}`,background:active===p.value?p.color+"18":"transparent",color:active===p.value?p.color:C.muted,display:"flex",alignItems:"center",gap:5}}>
          {p.label}
          {counts[p.value]>0&&<span style={{background:active===p.value?p.color+"30":C.s3,borderRadius:10,padding:"0 5px",fontSize:10}}>{counts[p.value]}</span>}
        </button>
      ))}
    </div>
  );
}


// ── Reusable warmup subsection with inline +/− controls ──────────────────────
function WarmupSubsection({label,color,icon,items,onAdd,onRemoveAll,renderItem}){
  const [collapsed,setCollapsed]=useState(false);
  const [confirmClear,setConfirmClear]=useState(false);
  const totalSec=items.reduce((a,i)=>a+(i.sides?(i.holdSec||0)*2:(i.holdSec||0)),0);

  return(
    <div style={{marginBottom:14,background:C.s2,borderRadius:10,border:`1px solid ${color}33`,overflow:"hidden"}}>
      {/* Subsection header */}
      <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 12px",background:color+"0A"}}>
        <div style={{width:3,height:18,borderRadius:2,background:color,flexShrink:0}}/>
        <span style={{fontSize:14}}>{icon}</span>
        <span style={{color,fontWeight:700,fontSize:12,textTransform:"uppercase",letterSpacing:"0.08em",flex:1}}>{label}</span>
        {items.length>0&&<span style={{color:C.muted,fontSize:11}}>{items.length} item{items.length!==1?"s":""}{totalSec>0?` · ${totalSec}s`:""}</span>}

        {/* Controls */}
        <div style={{display:"flex",gap:4,alignItems:"center"}}>
          {/* Add button */}
          <button onClick={onAdd} title={`Add ${label} exercise`}
            style={{width:26,height:26,borderRadius:6,background:color+"20",border:`1px solid ${color}44`,color,fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,lineHeight:1}}>
            +
          </button>
          {/* Remove last item */}
          {items.length>0&&(
            <button onClick={()=>{
              // Remove just the last item in this section
              const lastId=items[items.length-1]?.id;
              if(lastId)onRemoveAll(lastId,"last");
            }} title="Remove last item"
              style={{width:26,height:26,borderRadius:6,background:C.red+"15",border:`1px solid ${C.red}33`,color:C.red,fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,lineHeight:1}}>
              −
            </button>
          )}
          {/* Clear all */}
          {items.length>0&&(
            confirmClear?(
              <div style={{display:"flex",gap:4,alignItems:"center"}}>
                <span style={{color:C.red,fontSize:11,fontWeight:700}}>Clear all?</span>
                <button onClick={()=>{onRemoveAll(null,"all");setConfirmClear(false);}} style={{background:C.red,border:"none",borderRadius:5,padding:"3px 8px",color:"#000",fontSize:11,fontWeight:700,cursor:"pointer"}}>Yes</button>
                <button onClick={()=>setConfirmClear(false)} style={{background:C.s3,border:`1px solid ${C.border}`,borderRadius:5,padding:"3px 8px",color:C.sub,fontSize:11,cursor:"pointer"}}>No</button>
              </div>
            ):(
              <button onClick={()=>setConfirmClear(true)} title="Clear all items in this section"
                style={{width:26,height:26,borderRadius:6,background:"transparent",border:`1px solid ${C.border}`,color:C.muted,fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                ✕
              </button>
            )
          )}
          {/* Collapse toggle */}
          {items.length>0&&(
            <button onClick={()=>setCollapsed(c=>!c)}
              style={{width:26,height:26,borderRadius:6,background:"transparent",border:`1px solid ${C.border}`,color:C.muted,fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
              {collapsed?"▼":"▲"}
            </button>
          )}
        </div>
      </div>

      {/* Items */}
      {!collapsed&&(
        <div style={{padding:items.length>0?"8px 10px 4px":0}}>
          {items.length===0?(
            <div style={{textAlign:"center",padding:"14px 0",color:C.muted,fontSize:12}}>
              No {label.toLowerCase()} exercises — <span onClick={onAdd} style={{color,cursor:"pointer",fontWeight:600}}>add one</span>
            </div>
          ):(
            items.map(item=>renderItem(item))
          )}
        </div>
      )}
    </div>
  );
}

function WarmupSection({warmup,setWarmup,settings,onRestStart,catalog=[],onAddToCatalog}){
  const [open,setOpen]=useState(false);
  const [pickCat,setPickCat]=useState(null);
  const NEW_NAMES={stretching:"Stretch",mobility:"Mobility","foam-rolling":"Foam Rolling","sport-specific":"Sport Specific"};
  const CAT_COLORS={stretching:C.purple,mobility:C.teal,"foam-rolling":C.blue,"sport-specific":C.amber};
  const addItem=(cat,name)=>setWarmup(w=>[...w,{id:uid(),name:name||`New ${NEW_NAMES[cat]||cat}`,category:cat==='sport-specific'?'mobility':cat,purpose:cat==='sport-specific'?'sport-specific':'',holdSec:settings.defaultWarmupHoldSec,reps:settings.defaultWarmupReps,resistanceMode:settings.defaultWarmupResistance,resistanceVal:"",sides:false,description:"",expanded:true}]);
  const updateItem=(id,patch)=>setWarmup(w=>w.map(i=>i.id===id?{...i,...patch}:i));
  const removeItem=id=>setWarmup(w=>w.filter(i=>i.id!==id));
  const stretches=warmup.filter(i=>i.category==="stretching");
  const mobility=warmup.filter(i=>i.category==="mobility");
  const totalSec=warmup.reduce((a,i)=>a+(i.sides?(i.holdSec||0)*2:(i.holdSec||0)),0);
  return(
    <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,overflow:"hidden",flexShrink:0}}>
      <button onClick={()=>setOpen(o=>!o)} style={{width:"100%",padding:"14px 18px",background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:12,textAlign:"left"}}>
        <div style={{width:32,height:32,borderRadius:8,background:C.purple+"18",border:`1px solid ${C.purple}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>🧘</div>
        <div style={{flex:1}}>
          <div style={{color:C.text,fontWeight:700,fontSize:14}}>Warmup</div>
          <div style={{color:C.muted,fontSize:11,marginTop:1}}>{warmup.length===0?"No exercises added yet":`${stretches.length} stretch · ${mobility.filter(i=>i.purpose!=="sport-specific").length} mobility · ${warmup.filter(i=>i.category==="foam-rolling").length} foam · ${warmup.filter(i=>i.purpose==="sport-specific").length} sport · ~${Math.round(totalSec/60)} min`}</div>
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
          {stretches.length>0&&(
          <WarmupSubsection
            label="Stretching" color={C.purple} icon="🧘"
            items={stretches}
            onAdd={()=>setPickCat("stretching")}
            onRemoveAll={(id,mode)=>{if(mode==="last")removeItem(id);else setWarmup(w=>w.filter(i=>i.category!=="stretching"));}}
            renderItem={item=><WarmupItem key={item.id} item={item} onUpdate={p=>updateItem(item.id,p)} onRemove={()=>removeItem(item.id)} settings={settings} onRestStart={onRestStart}/>}
          />
          )}

          {/* ── Mobility subsection ── */}
          {mobility.filter(i=>i.purpose!=="sport-specific").length>0&&(
          <WarmupSubsection
            label="Mobility" color={C.teal} icon="🔄"
            items={mobility.filter(i=>i.purpose!=="sport-specific")}
            onAdd={()=>setPickCat("mobility")}
            onRemoveAll={(id,mode)=>{if(mode==="last")removeItem(id);else setWarmup(w=>w.filter(i=>!(i.category==="mobility"&&i.purpose!=="sport-specific")));}}
            renderItem={item=><WarmupItem key={item.id} item={item} onUpdate={p=>updateItem(item.id,p)} onRemove={()=>removeItem(item.id)} settings={settings} onRestStart={onRestStart}/>}
          />
          )}

          {/* ── Foam Rolling subsection ── */}
          {warmup.filter(i=>i.category==="foam-rolling").length>0&&(
          <WarmupSubsection
            label="Foam Rolling" color={C.blue} icon="🌀"
            items={warmup.filter(i=>i.category==="foam-rolling")}
            onAdd={()=>setPickCat("foam-rolling")}
            onRemoveAll={(id,mode)=>{if(mode==="last")removeItem(id);else setWarmup(w=>w.filter(i=>i.category!=="foam-rolling"));}}
            renderItem={item=><WarmupItem key={item.id} item={item} onUpdate={p=>updateItem(item.id,p)} onRemove={()=>removeItem(item.id)} settings={settings} onRestStart={onRestStart}/>}
          />
          )}

          {/* ── Sport Specific subsection ── */}
          {warmup.filter(i=>i.purpose==="sport-specific").length>0&&(
          <WarmupSubsection
            label="Sport Specific" color={C.amber} icon="⚡"
            items={warmup.filter(i=>i.purpose==="sport-specific")}
            onAdd={()=>setPickCat("sport-specific")}
            onRemoveAll={(id,mode)=>{if(mode==="last")removeItem(id);else setWarmup(w=>w.filter(i=>i.purpose!=="sport-specific"));}}
            renderItem={item=><WarmupItem key={item.id} item={item} onUpdate={p=>updateItem(item.id,p)} onRemove={()=>removeItem(item.id)} settings={settings} onRestStart={onRestStart}/>}
          />
          )}

          {warmup.length===0&&<div style={{textAlign:"center",padding:"20px 0",color:C.muted,fontSize:13}}>Tap a section below to add exercises.</div>}

          {/* ── Bottom add bar ── */}
          <div style={{display:"flex",gap:8,marginTop:16,paddingTop:14,borderTop:`1px solid ${C.border}`,flexWrap:"wrap"}}>
            <Btn variant="ghost" color={C.purple} style={{padding:"6px 12px",fontSize:11}} onClick={()=>setPickCat("stretching")}>+ Stretch</Btn>
            <Btn variant="ghost" color={C.teal} style={{padding:"6px 12px",fontSize:11}} onClick={()=>setPickCat("mobility")}>+ Mobility</Btn>
            <Btn variant="ghost" color={C.blue} style={{padding:"6px 12px",fontSize:11}} onClick={()=>setPickCat("foam-rolling")}>+ Foam Roll</Btn>
            <Btn variant="ghost" color={C.amber} style={{padding:"6px 12px",fontSize:11}} onClick={()=>setPickCat("sport-specific")}>+ Sport Specific</Btn>
            <Btn variant="ghost" color={C.sub} style={{padding:"6px 12px",fontSize:11}} onClick={()=>setWarmup(DEFAULT_STRETCHES_FACTORY())}>Load defaults</Btn>
          </div>
        </div>
      )}
      {pickCat&&<Modal title={`Add ${NEW_NAMES[pickCat]||pickCat}`} onClose={()=>setPickCat(null)}><WarmupPicker catId={pickCat} color={CAT_COLORS[pickCat]} catalog={catalog} onAddToCatalog={onAddToCatalog} onPick={name=>{addItem(pickCat,name);setPickCat(null);}} onClose={()=>setPickCat(null)}/></Modal>}
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

const RESISTANCE_MODES=[
  {value:"weighted",label:"Weighted",unit:"kg",color:C.blue},
  {value:"resisted",label:"Resisted",unit:"kg",color:C.amber},
  {value:"assisted",label:"Assisted",unit:"kg",color:C.purple},
  {value:"bodyweight",label:"Bodyweight",unit:null,color:C.green},
];

function SessionExCard({ex,updateEx,addSet,updateSet,removeSet,removeEx,startRest,settings,checkPR,prevSets}){
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
          <button onClick={()=>updateEx(ex.id,{sides:!ex.sides})}
            style={{alignSelf:"flex-start",display:"flex",alignItems:"center",gap:7,padding:"6px 12px",borderRadius:999,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:700,background:ex.sides?C.amber+"1E":C.s3,border:`1px solid ${ex.sides?C.amber:C.border}`,color:ex.sides?C.amber:C.sub}}>
            <span style={{width:14,height:14,borderRadius:4,flexShrink:0,border:`2px solid ${ex.sides?C.amber:C.muted}`,background:ex.sides?C.amber:"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"#000",lineHeight:1}}>{ex.sides?"✓":""}</span>
            Unilateral (per side)
          </button>
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
          <div style={{display:"grid",gridTemplateColumns:hasLoad?`24px 1fr 60px 54px 96px 34px 22px`:`24px 1fr 60px 96px 34px 22px`,gap:6,padding:"0 0 6px",borderBottom:`1px solid ${C.border}`}}>
            <div style={{color:C.muted,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",textAlign:"center"}}>#</div>
            <div style={{color:C.muted,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",textAlign:"center"}}>Prev</div>
            {hasLoad&&<div style={{color:m.color,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",textAlign:"center"}}>{settings.weightUnit}</div>}
            <div style={{color:C.muted,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",textAlign:"center"}}>Reps</div>
            <div style={{color:C.muted,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",textAlign:"center"}}>Notes</div>
            <div style={{color:C.muted,fontSize:10,fontWeight:700,textAlign:"center"}}>✓</div>
            <div/>
          </div>
          {ex.sets.map((s,si)=>{
            const prevSet=prevSets&&prevSets[si]?prevSets[si]:null;
            const prevText=prevSet?(hasLoad?`${prevSet.load||prevSet.weight||"–"}×${prevSet.reps||"–"}`:`${prevSet.reps||"–"}`):"—";
            return(
            <div key={s.id} style={{display:"grid",gridTemplateColumns:hasLoad?`24px 1fr 60px 54px 96px 34px 22px`:`24px 1fr 60px 96px 34px 22px`,gap:6,padding:"7px 0",borderBottom:`1px solid ${C.border}`,alignItems:"center",background:s.pr&&s.done?C.amber+"08":"transparent"}}>
              <span style={{color:C.muted,fontSize:13,fontWeight:700,textAlign:"center"}}>{si+1}</span>
              <span title={prevText} style={{color:C.muted,fontSize:11,opacity:0.65,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",textAlign:"center"}}>{prevText}</span>
              {hasLoad&&<input type="number" value={s.load||""} placeholder="0" onChange={e=>{updateSet(ex.id,s.id,"load",e.target.value);if(s.done)checkPR(ex.id,s.id,e.target.value,s.reps);}}
                style={{background:C.s2,border:`1px solid ${m.color}44`,borderRadius:7,padding:"6px 5px",color:m.color,fontSize:13,outline:"none",fontFamily:"inherit",width:"100%",fontWeight:700,textAlign:"center"}}/>}
              <input value={s.reps||""} placeholder="0" onChange={e=>{updateSet(ex.id,s.id,"reps",e.target.value);if(s.done)checkPR(ex.id,s.id,s.load,e.target.value);}}
                style={{background:C.s2,border:`1px solid ${C.border}`,borderRadius:7,padding:"6px 5px",color:C.text,fontSize:13,outline:"none",fontFamily:"inherit",width:"100%",textAlign:"center"}}/>
              <input value={s.setNotes||""} placeholder="—" onChange={e=>updateSet(ex.id,s.id,"setNotes",e.target.value)}
                style={{background:C.s2,border:`1px solid ${C.border}`,borderRadius:7,padding:"6px 8px",color:C.sub,fontSize:12,outline:"none",fontFamily:"inherit",width:"100%"}}/>
              <div onClick={()=>{
                const done=!s.done;
                updateSet(ex.id,s.id,"done",done);
                if(done){checkPR(ex.id,s.id,s.load,s.reps);startRest(Number(ex.templateRest)||settings.defaultRestSec);}
              }} style={{width:32,height:32,borderRadius:7,border:`2px solid ${s.done?C.green:C.border}`,background:s.done?C.green:"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:s.done?"#000":C.muted,fontSize:14,fontWeight:800}}>{s.done?"✓":""}</div>
              <div onClick={()=>removeSet(ex.id,s.id)} style={{color:C.muted,cursor:"pointer",fontSize:16,textAlign:"center"}}>×</div>
              {s.pr&&s.done&&<div style={{gridColumn:"1/-1"}}><Pill color={C.amber}>🏆 New PR!</Pill></div>}
            </div>
            );
          })}
        </>
      )}
    </Card>
  );
}

function SessionLogger({clients,sessions,onSave,onUpdate,onDone,editSession,activeClient,programs,initialDay,catalog,onAddToCatalog,workouts=[],onStatus,onSessionsView=true,onDiscard}){
  const isEdit=!!editSession;
  const [settings,setSettings]=useState(DEFAULT_SETTINGS);
  const [showSettings,setShowSettings]=useState(false);
  const [confirmCancel,setConfirmCancel]=useState(false);
  const [clientId,setClientId]=useState(editSession?.clientId||activeClient?.id||"");
  const [name,setName]=useState(editSession?.name||"");
  const [notes,setNotes]=useState(editSession?.notes||"");
  const [warmup,setWarmup]=useState(editSession?.warmup||[]);
  const [exercises,setExercises]=useState(editSession?.exercises||[]);
  const [showPicker,setShowPicker]=useState(false);
  const [saved,setSaved]=useState(false);
  const [saving,setSaving]=useState(false);
  const [programDay,setProgramDay]=useState(editSession?.programDay||"");
  const [loadModal,setLoadModal]=useState(false);
  const [wkModal,setWkModal]=useState(false);
  const [startTime]=useState(Date.now());
  const [elapsed,setElapsed]=useState(0);

  const [restSec,setRestSec]=useState(0);
  const [restFor,setRestFor]=useState(0);
  const [restRunning,setRestRunning]=useState(false);
  const [restExpanded,setRestExpanded]=useState(false);
  const [restEndsAt,setRestEndsAt]=useState(0);
  const restRef=useRef(null);

  const startRest=useCallback((sec)=>{
    if(!sec||sec<=0)return;
    setRestFor(sec);setRestSec(sec);setRestRunning(true);setRestExpanded(false);setRestEndsAt(Date.now()+sec*1000);
  },[]);
  const pauseRest=useCallback(()=>setRestRunning(r=>{if(!r)setRestEndsAt(Date.now()+restSec*1000);return !r;}),[restSec]);
  const skipRest=useCallback(()=>{
    if(restRef.current)clearInterval(restRef.current);
    setRestRunning(false);setRestSec(0);setRestFor(0);setRestExpanded(false);setRestEndsAt(0);
  },[]);

  useEffect(()=>{
    if(!restRunning){if(restRef.current)clearInterval(restRef.current);return;}
    restRef.current=setInterval(()=>{
      setRestSec(s=>{
        if(s<=1){clearInterval(restRef.current);setRestRunning(false);setRestFor(0);setRestEndsAt(0);return 0;}
        return s-1;
      });
    },1000);
    return()=>{if(restRef.current)clearInterval(restRef.current);};
  },[restRunning]);

  useEffect(()=>{
    const i=setInterval(()=>setElapsed(Math.floor((Date.now()-startTime)/1000)),1000);
    return()=>clearInterval(i);
  },[startTime]);

  const client=clients.find(c=>c.id===clientId);
  const prog=programs.find(p=>p.id===client?.programId);

  // Warmup items built in the Workout/Program planner use a slightly different shape
  // (category "sport", sidesMode, notes) than the session logger (purpose "sport-specific",
  // sides boolean, description). Normalise so every section — incl. Sport Specific — survives.
  const adoptWarmup=list=>(list||[]).map(w=>{
    const isSport=w.purpose==="sport-specific"||w.category==="sport"||w.category==="sport-specific";
    return {
      id:uid(),
      name:w.name||"",
      category:isSport?"mobility":(w.category||"mobility"),
      purpose:isSport?"sport-specific":(w.purpose||""),
      holdSec:w.holdSec??settings.defaultWarmupHoldSec,
      reps:w.reps??"",
      resistanceMode:w.resistanceMode||"bodyweight",
      resistanceVal:w.resistanceVal??"",
      sides:w.sides!==undefined?w.sides:(w.sidesMode==="both"),
      description:w.description||w.notes||"",
      expanded:false,
    };
  });

  const loadFromDay=day=>{
    setName(day.label+(day.focus?` — ${day.focus}`:""));
    setProgramDay(day.label);
    setWarmup(adoptWarmup(day.warmup));
    setExercises((day.exercises||[]).map(e=>({id:uid(),name:e.name,resistanceMode:"weighted",sets:[],templateSets:e.sets,templateReps:e.reps,templateRest:e.rest||settings.defaultRestSec,notes:e.notes||""})));
    setLoadModal(false);
  };

  const loadFromWorkout=wk=>{
    setName(wk.name+(wk.focus?` — ${wk.focus}`:""));
    setProgramDay("");
    setWarmup(adoptWarmup(wk.warmup));
    setExercises((wk.exercises||[]).map(e=>({id:uid(),name:e.name,resistanceMode:"weighted",sets:[],templateSets:e.sets,templateReps:e.reps,templateRest:e.rest||settings.defaultRestSec,notes:e.notes||""})));
    setWkModal(false);
  };

  // Pre-load a program day when navigated from client profile
  useEffect(()=>{if(initialDay&&!isEdit)loadFromDay(initialDay);},[]);

  // Previous session's sets for an exercise (same client, excluding the session being edited)
  const prevSetsFor=exName=>{
    if(!clientId||!exName)return null;
    const cutoff=isEdit?new Date(editSession.startedAt||editSession.createdAt||0).getTime():Infinity;
    const prior=(sessions||[])
      .filter(s=>s.clientId===clientId&&s.id!==editSession?.id)
      .filter(s=>!isEdit||new Date(s.startedAt||s.createdAt||0).getTime()<cutoff)
      .filter(s=>(s.exercises||[]).some(e=>e.name===exName))
      .sort((a,b)=>new Date(b.startedAt||b.createdAt||0)-new Date(a.startedAt||a.createdAt||0));
    if(!prior.length)return null;
    return (prior[0].exercises||[]).find(e=>e.name===exName)?.sets||null;
  };

  const addSet=exId=>setExercises(p=>p.map(e=>{
    if(e.id!==exId)return e;
    const last=e.sets[e.sets.length-1];
    return {...e,sets:[...e.sets,{id:uid(),load:last?last.load:"",reps:last?last.reps:"",setNotes:"",done:false,pr:false}]};
  }));
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
      if(isEdit){
        await onUpdate(editSession.id,{clientId,name:name||`Session ${fmtDate(now())}`,notes,exercises,warmup,programDay,startedAt:editSession.startedAt||now()});
      }else{
        await onSave({id:uid(),clientId,name:name||`Session ${fmtDate(now())}`,notes,exercises,warmup,programDay,startedAt:now()});
      }
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

  useEffect(()=>{
    if(!onStatus)return;
    const active=!!clientId&&exercises.length>0&&!saved;
    onStatus(active?{name:name||"Session",clientName:client?.name||"",startTime,doneSets,totalSets,restRunning,restEndsAt}:null);
  },[onStatus,clientId,exercises.length,saved,name,client?.name,startTime,doneSets,totalSets,restRunning,restEndsAt]);

  if(saved){
    return(
      <Card style={{textAlign:"center",padding:48}}>
        <div style={{fontSize:40,marginBottom:12}}>💪</div>
        <div style={{color:C.green,fontWeight:800,fontSize:22,marginBottom:8}}>{isEdit?"Session Updated!":"Session Saved!"}</div>
        {hasPR&&<div style={{color:C.amber,fontWeight:700,marginBottom:16}}>🏆 New PR detected!</div>}
        <div style={{color:C.sub,marginBottom:24}}>{totalSets} sets saved for {client?.name}</div>
        {isEdit
          ?<Btn variant="ghost" onClick={()=>onDone&&onDone()}>← Back to Sessions</Btn>
          :<Btn variant="ghost" onClick={()=>{setSaved(false);setExercises([]);setWarmup([]);setName("");setNotes("");setProgramDay("");}}>Log Another</Btn>}
      </Card>
    );
  }

  return(
    <div style={{display:"flex",flexDirection:"column",gap:16,position:"relative"}}>
      {onSessionsView&&restFor>0&&!restExpanded&&(
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
      {onSessionsView&&restFor>0&&restExpanded&&(
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
      {showSettings&&<SettingsPanel settings={settings} onChange={setSettings} onClose={()=>setShowSettings(false)}/>}
      <Card>
        <SL>Session Details</SL>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
          <Select label="Client" value={clientId} onChange={v=>{setClientId(v);setExercises([]);setProgramDay("");}} required options={[{value:"",label:"— Select client —"},...(clients||[]).map(c=>({value:c.id,label:c.name}))]}/>
          <div style={{display:"flex",gap:8,alignItems:"flex-end"}}>
            <div style={{flex:1}}><Input label="Session name" value={name} onChange={setName} placeholder="e.g. Lower Body Power"/></div>
            <button onClick={()=>setShowSettings(true)} className="fitos-btn" style={{"--btn-col":C.sub,width:38,height:38,borderRadius:8,background:C.s2,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:16,color:C.sub,flexShrink:0,transition:"border-color 0.15s"}}>⚙</button>
          </div>
        </div>
        <div style={{display:"flex",gap:10,alignItems:"flex-end"}}>
          <div style={{flex:1}}><Input label="Notes" value={notes} onChange={setNotes} placeholder="Coach notes…"/></div>
          {prog&&<Btn variant="ghost" color={C.purple} style={{padding:"9px 14px"}} onClick={()=>setLoadModal(true)}>📋 Load from Program</Btn>}
          {workouts.length>0&&<Btn variant="ghost" color={C.blue} style={{padding:"9px 14px"}} onClick={()=>setWkModal(true)}>💪 Load Workout</Btn>}
        </div>
        {programDay&&<div style={{marginTop:10}}><Pill color={C.purple}>📋 {programDay}</Pill></div>}
      </Card>
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
      <WarmupSection warmup={warmup} setWarmup={setWarmup} settings={settings} onRestStart={startRest} catalog={catalog} onAddToCatalog={onAddToCatalog}/>
      {exercises.map(ex=>(
        <SessionExCard key={ex.id} ex={ex} settings={settings}
          updateEx={updateEx} addSet={addSet} updateSet={updateSet}
          removeSet={removeSet} removeEx={removeEx}
          startRest={startRest} checkPR={checkPR} prevSets={prevSetsFor(ex.name)}/>
      ))}
      <div style={{position:"relative"}}>
        <Btn variant="ghost" color={C.green} onClick={()=>setShowPicker(p=>!p)}>+ Add Exercise</Btn>
        {showPicker&&(
          <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:14,position:"absolute",top:"calc(100% + 8px)",left:0,zIndex:200,width:290,boxShadow:"0 8px 32px rgba(0,0,0,0.5)"}}>
            <ExPicker onPick={n=>{addEx(n);setShowPicker(false);}} onClose={()=>setShowPicker(false)} catalog={catalog} onAddToCatalog={onAddToCatalog}/>
          </div>
        )}
      </div>
      <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"14px 18px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",gap:12,alignItems:"center"}}>
          <span style={{color:C.sub,fontSize:13}}>{doneSets}/{totalSets} sets done</span>
          {hasPR&&<Pill color={C.amber}>🏆 New PR!</Pill>}
        </div>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          {onDiscard&&<Btn variant="ghost" color={C.red} disabled={saving} onClick={()=>setConfirmCancel(true)} style={{padding:"10px 18px"}}>{isEdit?"Cancel":"Discard"}</Btn>}
          <Btn disabled={!clientId||exercises.length===0||saving} onClick={save} style={{padding:"10px 24px"}}>{saving?"Saving…":"Save Session"}</Btn>
        </div>
      </div>
      {confirmCancel&&<Confirm msg={isEdit?"Discard your changes to this session?":"Discard this session? Anything you've logged will be lost."} confirmText="Discard" cancelText="Keep editing" onConfirm={()=>{setConfirmCancel(false);onStatus&&onStatus(null);onDiscard&&onDiscard();}} onCancel={()=>setConfirmCancel(false)}/>}
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
      {wkModal&&(
        <Modal title="Load a Workout" onClose={()=>setWkModal(false)} wide>
          <p style={{color:C.sub,fontSize:13,marginBottom:14}}>Loads the workout's warmup and exercises into this session to perform.</p>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {workouts.map(wk=>(
              <div key={wk.id} style={{background:C.s2,borderRadius:10,padding:"14px 16px",border:`1px solid ${C.border}`,cursor:"pointer"}} onClick={()=>loadFromWorkout(wk)} onMouseEnter={e=>e.currentTarget.style.borderColor=C.blue} onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div><div style={{color:C.text,fontWeight:700,fontSize:14}}>{wk.name}</div>{wk.focus&&<Pill color={C.blue}>{wk.focus}</Pill>}</div>
                  <div style={{color:C.muted,fontSize:12}}>{(wk.exercises||[]).length} exercises{(wk.warmup||[]).length?` · ${wk.warmup.length} warmup`:""}</div>
                </div>
                {(wk.exercises||[]).length>0&&<div style={{marginTop:8,display:"flex",gap:6,flexWrap:"wrap"}}>{wk.exercises.map(e=><span key={e.id} style={{fontSize:11,color:C.sub,background:C.s3,padding:"2px 7px",borderRadius:5}}>{e.name} {e.sets}×{e.reps}</span>)}</div>}
              </div>
            ))}
            {!workouts.length&&<div style={{color:C.muted,textAlign:"center",padding:24}}>No workouts yet.</div>}
          </div>
        </Modal>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SESSION HISTORY
// ═══════════════════════════════════════════════════════════════════════════════

function SessionHistory({sessions,clients,onEdit,onDelete,onNew,mobile}){
  const [selected,setSelected]=useState(null);
  const [confirm,setConfirm]=useState(null);
  const sorted=[...(sessions||[])].sort((a,b)=>new Date(b.startedAt||b.createdAt||0)-new Date(a.startedAt||a.createdAt||0));
  const sel=sorted.find(s=>s.id===selected);
  const clientName=id=>clients.find(c=>c.id===id)?.name||"Unknown client";
  const statOf=s=>{
    const exs=s.exercises||[];
    const sets=exs.reduce((a,e)=>a+(e.sets?.length||0),0);
    const done=exs.reduce((a,e)=>a+(e.sets?.filter(x=>x.done)?.length||0),0);
    const prs=exs.reduce((a,e)=>a+(e.sets?.filter(x=>x.pr&&x.done)?.length||0),0);
    return {exCount:exs.length,sets,done,prs};
  };

  return(
    <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"300px 1fr",gap:16,minHeight:mobile?0:500}}>
      <div style={{display:"flex",flexDirection:"column",gap:10,order:mobile&&sel?2:0}}>
        <Btn style={{justifyContent:"center"}} onClick={()=>onNew&&onNew()}>+ Log Session</Btn>
        {sorted.length===0&&<Card style={{textAlign:"center",padding:32}}><div style={{fontSize:28,marginBottom:8}}>🕘</div><div style={{color:C.muted,fontSize:13}}>No sessions logged yet.</div></Card>}
        {sorted.map(s=>{
          const st=statOf(s);
          return(
            <div key={s.id} onClick={()=>setSelected(s.id)} style={{background:C.surface,border:`1px solid ${selected===s.id?C.green:C.border}`,borderRadius:12,padding:14,cursor:"pointer",borderLeft:`3px solid ${st.prs>0?C.amber:C.green}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
                <div style={{color:C.text,fontWeight:700,fontSize:14,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.name||"Session"}</div>
                {st.prs>0&&<Pill color={C.amber}>🏆 {st.prs}</Pill>}
              </div>
              <div style={{color:C.sub,fontSize:12,marginTop:4}}>{clientName(s.clientId)}</div>
              <div style={{color:C.muted,fontSize:11,marginTop:2}}>{fmtDate(s.startedAt||s.createdAt)} · {st.exCount} exercises · {st.done}/{st.sets} sets</div>
              {s.programDay&&<div style={{marginTop:5}}><Pill color={C.purple}>📋 {s.programDay}</Pill></div>}
            </div>
          );
        })}
      </div>

      {!sel?<Card style={{display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{textAlign:"center",color:C.muted}}><div style={{fontSize:32,marginBottom:10}}>⚡</div>Select a session</div></Card>:(
        <div style={{display:"flex",flexDirection:"column",gap:14,order:mobile?1:0}}>
          <Card>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12,gap:10,flexWrap:"wrap"}}>
              <div style={{minWidth:0}}>
                <div style={{color:C.text,fontWeight:800,fontSize:18}}>{sel.name||"Session"}</div>
                <div style={{color:C.sub,fontSize:13,marginTop:2}}>{clientName(sel.clientId)} · {fmtDate(sel.startedAt||sel.createdAt)}</div>
                {sel.programDay&&<div style={{marginTop:6}}><Pill color={C.purple}>📋 {sel.programDay}</Pill></div>}
              </div>
              <div style={{display:"flex",gap:8,flexShrink:0}}>
                <Btn variant="ghost" color={C.blue} style={{padding:"6px 12px",fontSize:11}} onClick={()=>onEdit(sel)}>Edit</Btn>
                <Btn variant="danger" style={{padding:"6px 12px",fontSize:11}} onClick={()=>setConfirm(sel.id)}>Delete</Btn>
              </div>
            </div>
            {sel.notes&&<div style={{background:C.s2,borderRadius:10,padding:"10px 14px",border:`1px solid ${C.border}`,color:C.sub,fontSize:13}}>💬 {sel.notes}</div>}
            {(()=>{const st=statOf(sel);return(
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginTop:12}}>
                {[{label:"Exercises",val:st.exCount,color:C.text},{label:"Sets done",val:`${st.done}/${st.sets}`,color:C.green},{label:"PRs",val:st.prs,color:C.amber}].map(x=>(
                  <div key={x.label} style={{background:C.s2,border:`1px solid ${C.border}`,borderRadius:9,padding:12,textAlign:"center"}}><div style={{color:C.muted,fontSize:10,textTransform:"uppercase",letterSpacing:"0.06em"}}>{x.label}</div><div style={{color:x.color,fontWeight:800,fontSize:22}}>{x.val}</div></div>
                ))}
              </div>
            );})()}
          </Card>

          {(sel.warmup||[]).length>0&&(
            <Card>
              <SL>Warm-up</SL>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {sel.warmup.map((w,i)=><span key={w.id||i} style={{fontSize:12,color:C.sub,background:C.s2,padding:"5px 10px",borderRadius:7,border:`1px solid ${C.border}`}}>{w.name}{w.duration?` · ${w.duration}`:""}</span>)}
              </div>
            </Card>
          )}

          {(sel.exercises||[]).map((ex,ei)=>{
            const m=RESISTANCE_MODES.find(r=>r.value===(ex.resistanceMode||"weighted"))||RESISTANCE_MODES[0];
            const hasLoad=m.unit!==null;
            return(
              <Card key={ex.id||ei}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8,flexWrap:"wrap"}}>
                  <span style={{color:C.text,fontWeight:700,fontSize:15}}>{ex.name}</span>
                  <Pill color={m.color}>{m.label}</Pill>
                </div>
                {(ex.sets||[]).length===0?<div style={{color:C.muted,fontSize:12}}>No sets recorded.</div>:(
                  <div style={{display:"flex",flexDirection:"column",gap:5}}>
                    {ex.sets.map((s,si)=>(
                      <div key={s.id||si} style={{display:"flex",alignItems:"center",gap:10,background:s.pr&&s.done?C.amber+"10":C.s2,borderRadius:8,padding:"7px 12px",border:`1px solid ${C.border}`}}>
                        <span style={{color:C.muted,fontSize:12,fontWeight:700,width:18}}>{si+1}</span>
                        <span style={{color:C.text,fontSize:13,flex:1}}>{hasLoad?`${s.load||s.weight||"–"} × ${s.reps||"–"}`:`${s.reps||"–"} reps`}</span>
                        {s.setNotes&&<span style={{color:C.sub,fontSize:11,fontStyle:"italic"}}>{s.setNotes}</span>}
                        {s.pr&&s.done&&<Pill color={C.amber}>🏆 PR</Pill>}
                        <span style={{color:s.done?C.green:C.muted,fontSize:14}}>{s.done?"✓":"—"}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {confirm&&<Confirm msg="Delete this session? This cannot be undone." onConfirm={async()=>{await onDelete(confirm);if(selected===confirm)setSelected(null);setConfirm(null);}} onCancel={()=>setConfirm(null)}/>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════

export { SessionLogger, SessionExCard, SessionHistory };
