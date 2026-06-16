// FitOS — Warmup Components & Settings
import React, { useState, useEffect, useRef, useCallback } from 'react';


const RESISTANCE_MODES = [
  { value:"weighted",  label:"Weighted",  unit:"kg",  color:C.blue   },
  { value:"resisted",  label:"Resisted",  unit:"kg",  color:C.amber  },
  { value:"assisted",  label:"Assisted",  unit:"kg",  color:C.purple },
  { value:"bodyweight",label:"Bodyweight",unit:null,  color:C.green  },
];
const modeFor = v => RESISTANCE_MODES.find(m=>m.value===v)||RESISTANCE_MODES[0];

// Default settings
const DEFAULT_SETTINGS = {
  restTimerPosition: "bottom",   // "top" | "bottom"
  weightUnit: "kg",              // "kg" | "lbs"
  defaultRestSec: 90,
  setTimerSec: 0,                // 0 = off
  defaultWarmupHoldSec: 30,
  defaultWarmupReps: "10",
  defaultWarmupResistance: "bodyweight",
  warmupAutoTimer: false,
  warmupRestSec: 30,
};

function Toggle({value,onChange,color=C.green}){
  return(
    <div onClick={()=>onChange(!value)} style={{width:40,height:22,borderRadius:11,background:value?color:C.s3,border:`1px solid ${value?color:C.border}`,cursor:"pointer",position:"relative",transition:"all 0.2s",flexShrink:0}}>
      <div style={{position:"absolute",top:3,left:value?20:3,width:16,height:16,borderRadius:"50%",background:"#fff",transition:"left 0.2s"}}/>
    </div>
  );
}

function NumInput({value,onChange,min=0,max=9999,width=60}){
  return(
    <input type="number" value={value} min={min} max={max} onChange={e=>onChange(Number(e.target.value))}
      style={{width,background:C.s3,border:`1px solid ${C.border}`,borderRadius:7,padding:"6px 8px",color:C.text,fontSize:13,outline:"none",fontFamily:"inherit",textAlign:"center"}}/>
  );
}

function ResistanceToggle({value,onChange}){
  return(
    <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
      {RESISTANCE_MODES.map(m=>(
        <button key={m.value} onClick={()=>onChange(m.value)} style={{padding:"3px 9px",borderRadius:6,fontSize:11,fontWeight:700,cursor:"pointer",border:`1px solid ${value===m.value?m.color:C.border}`,background:value===m.value?m.color+"18":"transparent",color:value===m.value?m.color:C.muted,transition:"all 0.12s"}}>{m.label}</button>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SETTINGS PANEL
// ═══════════════════════════════════════════════════════════════════════════════
function SettingsPanel({settings,onChange,onClose}){
  const set = (k,v) => onChange({...settings,[k]:v});
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:600,backdropFilter:"blur(6px)"}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:"20px 20px 0 0",width:"100%",maxWidth:640,maxHeight:"85vh",overflowY:"auto",padding:24}}>
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
  const color=item.category==="stretching"?C.purple:C.teal;
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
  const color=item.category==="stretching"?C.purple:C.teal;
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
              <input type="number" value={item.holdSec} onChange={e=>onUpdate({holdSec:Number(e.target.value)})}
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
                {["stretching","mobility"].map(cat=>(
                  <button key={cat} onClick={()=>onUpdate({category:cat})} style={{padding:"4px 10px",borderRadius:6,border:`1px solid ${item.category===cat?(cat==="stretching"?C.purple:C.teal):C.border}`,background:item.category===cat?(cat==="stretching"?C.purple+"18":C.teal+"18"):"transparent",color:item.category===cat?(cat==="stretching"?C.purple:C.teal):C.muted,fontSize:11,fontWeight:600,cursor:"pointer",textTransform:"capitalize"}}>{cat}</button>
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
