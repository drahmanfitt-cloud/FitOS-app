// FitOS — Floor Plan, Display Modes & Swipe
import React, { useState, useEffect, useRef, useCallback } from "react";
import { C, uid, fmt } from "./config.js";
import { Pill, Btn } from "./ui.jsx";

// TAB 2: CLASS FORMAT — FLOOR PLAN + DISPLAY MODES
// ═══════════════════════════════════════════════════════════════════════════════

const ROOM_SHAPES = [
  {id:"rectangle", label:"Rectangle", icon:"⬛"},
  {id:"lshape",    label:"L-Shape",   icon:"🟦"},
  {id:"studio",    label:"Studio",    icon:"🔲"},
  {id:"open",      label:"Open Gym",  icon:"⬜"},
];

const STATION_COLORS = [C.green,C.blue,C.purple,C.amber,C.red,C.teal,"#F548E4","#48F5A0"];

function FloorPlanEditor({stations,onUpdateStation}){
  const [roomShape,setRoomShape]=useState("rectangle");
  const [dragging,setDragging]=useState(null);
  const [dragOffset,setDragOffset]=useState({x:0,y:0});
  const planRef=useRef(null);
  const pointerInside=useRef(true);

  const getRoomPath=()=>{
    switch(roomShape){
      case "lshape": return "M 20,20 L 80,20 L 80,55 L 55,55 L 55,80 L 20,80 Z";
      case "studio": return "M 15,25 L 85,25 L 85,75 L 15,75 Z";
      case "open": return "M 10,10 L 90,10 L 90,90 L 10,90 Z";
      default: return "M 15,15 L 85,15 L 85,85 L 15,85 Z";
    }
  };

  const handleMouseDown=(e,id)=>{
    const rect=planRef.current.getBoundingClientRect();
    const st=stations.find(s=>s.id===id);
    setDragging(id);
    pointerInside.current=!(st.x==null||st.y==null);
    if(st.x==null||st.y==null){
      // from the tray — only placed once dragged onto the room
      setDragOffset({x:0,y:0});
    }else{
      setDragOffset({
        x:e.clientX-rect.left-st.x*(rect.width/100),
        y:e.clientY-rect.top-st.y*(rect.height/100),
      });
    }
    e.preventDefault();
  };

  const handleMouseMove=useCallback((e)=>{
    if(!dragging||!planRef.current)return;
    const rect=planRef.current.getBoundingClientRect();
    const inside=e.clientX>=rect.left&&e.clientX<=rect.right&&e.clientY>=rect.top&&e.clientY<=rect.bottom;
    pointerInside.current=inside;
    if(!inside)return; // outside the room — releasing here returns it to the tray
    const x=Math.min(90,Math.max(5,((e.clientX-rect.left-dragOffset.x)/rect.width)*100));
    const y=Math.min(90,Math.max(5,((e.clientY-rect.top-dragOffset.y)/rect.height)*100));
    onUpdateStation(dragging,{x,y});
  },[dragging,dragOffset,onUpdateStation]);

  const handleMouseUp=useCallback(()=>{
    if(dragging&&!pointerInside.current) onUpdateStation(dragging,{x:null,y:null});
    pointerInside.current=true;
    setDragging(null);
  },[dragging,onUpdateStation]);

  // Touch support
  const handleTouchStart=(e,id)=>{
    const touch=e.touches[0];
    const rect=planRef.current.getBoundingClientRect();
    const st=stations.find(s=>s.id===id);
    setDragging(id);
    pointerInside.current=!(st.x==null||st.y==null);
    if(st.x==null||st.y==null){
      setDragOffset({x:0,y:0});
    }else{
      setDragOffset({x:touch.clientX-rect.left-st.x*(rect.width/100),y:touch.clientY-rect.top-st.y*(rect.height/100)});
    }
    e.preventDefault();
  };
  const handleTouchMove=useCallback((e)=>{
    if(!dragging||!planRef.current)return;
    const touch=e.touches[0];
    const rect=planRef.current.getBoundingClientRect();
    const inside=touch.clientX>=rect.left&&touch.clientX<=rect.right&&touch.clientY>=rect.top&&touch.clientY<=rect.bottom;
    pointerInside.current=inside;
    if(!inside){e.preventDefault();return;} // outside the room — release returns it to the tray
    const x=Math.min(90,Math.max(5,((touch.clientX-rect.left-dragOffset.x)/rect.width)*100));
    const y=Math.min(90,Math.max(5,((touch.clientY-rect.top-dragOffset.y)/rect.height)*100));
    onUpdateStation(dragging,{x,y});
    e.preventDefault();
  },[dragging,dragOffset,onUpdateStation]);

  useEffect(()=>{
    window.addEventListener("mousemove",handleMouseMove);
    window.addEventListener("mouseup",handleMouseUp);
    window.addEventListener("touchmove",handleTouchMove,{passive:false});
    window.addEventListener("touchend",handleMouseUp);
    return()=>{
      window.removeEventListener("mousemove",handleMouseMove);
      window.removeEventListener("mouseup",handleMouseUp);
      window.removeEventListener("touchmove",handleTouchMove);
      window.removeEventListener("touchend",handleMouseUp);
    };
  },[handleMouseMove,handleMouseUp,handleTouchMove]);

  return(
    <div style={{userSelect:"none",WebkitUserSelect:"none",WebkitTouchCallout:"none"}}>
      {/* Room shape selector */}
      <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
        <span style={{color:C.muted,fontSize:12,alignSelf:"center",fontWeight:600}}>Room:</span>
        {ROOM_SHAPES.map(r=>(
          <button key={r.id} onClick={()=>setRoomShape(r.id)}
            style={{padding:"5px 12px",borderRadius:7,fontSize:12,fontWeight:700,cursor:"pointer",border:`1px solid ${roomShape===r.id?C.green:C.border}`,background:roomShape===r.id?C.green+"18":"transparent",color:roomShape===r.id?C.green:C.muted,display:"flex",alignItems:"center",gap:5}}>
            {r.icon} {r.label}
          </button>
        ))}
      </div>

      {/* Floor plan */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
        <span style={{color:C.muted,fontSize:11}}>Drag stations from the tray onto the room — reposition any time</span>
        <span style={{color:C.muted,fontSize:11,fontWeight:600}}>{stations.filter(s=>s.x!=null&&s.y!=null).length}/{stations.length} placed</span>
      </div>

      {/* Tray of unplaced stations */}
      {stations.some(s=>s.x==null||s.y==null)&&(
        <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",background:C.s2,border:`1px dashed ${C.border2}`,borderRadius:10,padding:"10px 12px",marginBottom:10}}>
          <span style={{color:C.muted,fontSize:11,fontWeight:600,marginRight:2}}>Tray →</span>
          {stations.map((st,i)=>(st.x==null||st.y==null)&&(
            <div key={st.id}
              onMouseDown={e=>handleMouseDown(e,st.id)}
              onTouchStart={e=>handleTouchStart(e,st.id)}
              title={st.name}
              style={{display:"flex",alignItems:"center",gap:6,background:C.s3,borderRadius:8,padding:"5px 9px 5px 6px",border:`1px solid ${STATION_COLORS[i%8]}55`,cursor:"grab",touchAction:"none"}}>
              <div style={{width:24,height:24,borderRadius:7,background:STATION_COLORS[i%8],display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:11,color:"#000",flexShrink:0}}>{i+1}</div>
              <span style={{color:C.text,fontSize:12,fontWeight:600,maxWidth:90,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{st.name}</span>
            </div>
          ))}
        </div>
      )}

      <div ref={planRef} style={{position:"relative",width:"100%",paddingBottom:"56%",background:C.s2,borderRadius:12,border:`1px solid ${C.border}`,overflow:"hidden",userSelect:"none",touchAction:"pan-y"}}>
        {/* Room outline */}
        <svg style={{position:"absolute",inset:0,width:"100%",height:"100%"}} viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d={getRoomPath()} fill={C.s3} stroke={C.border2} strokeWidth="0.6"/>
        </svg>
        {/* Grid overlay (HTML so dots stay round) */}
        <div style={{position:"absolute",inset:0,backgroundImage:`radial-gradient(${C.border2} 1px, transparent 1px)`,backgroundSize:"32px 32px",opacity:0.35,pointerEvents:"none"}}/>
        {/* Entrance marker */}
        <div style={{position:"absolute",bottom:6,left:"50%",transform:"translateX(-50%)",display:"flex",flexDirection:"column",alignItems:"center",gap:2,pointerEvents:"none"}}>
          <div style={{width:44,height:3,borderRadius:2,background:C.muted,opacity:0.5}}/>
          <span style={{color:C.muted,fontSize:9,fontWeight:700,letterSpacing:"0.08em"}}>ENTRANCE</span>
        </div>

        {/* Empty / hint states */}
        {stations.length===0&&(
          <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6,pointerEvents:"none",padding:16,textAlign:"center"}}>
            <div style={{fontSize:30,opacity:0.5}}>🗺</div>
            <div style={{color:C.sub,fontSize:13,fontWeight:600}}>No stations to place yet</div>
            <div style={{color:C.muted,fontSize:11,maxWidth:240}}>Add stations in the “Stations” tab, then drag them onto the room.</div>
          </div>
        )}
        {stations.length>0&&stations.every(s=>s.x==null||s.y==null)&&(
          <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6,pointerEvents:"none",padding:16,textAlign:"center"}}>
            <div style={{fontSize:26,opacity:0.5}}>👆</div>
            <div style={{color:C.muted,fontSize:12,maxWidth:240}}>Drag a station from the tray above onto the room.</div>
          </div>
        )}

        {/* Placed station markers */}
        {stations.map((st,i)=>(st.x!=null&&st.y!=null)&&(
          <div key={st.id}
            onMouseDown={e=>handleMouseDown(e,st.id)}
            onTouchStart={e=>handleTouchStart(e,st.id)}
            style={{position:"absolute",left:`${st.x}%`,top:`${st.y}%`,transform:"translate(-50%,-50%)",cursor:"grab",touchAction:"none",zIndex:dragging===st.id?10:1,display:"flex",flexDirection:"column",alignItems:"center"}}>
            <div style={{position:"relative",width:28,height:28,borderRadius:8,background:STATION_COLORS[i%8],display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:12,color:"#000",boxShadow:dragging===st.id?"0 4px 16px rgba(0,0,0,0.5)":"0 2px 8px rgba(0,0,0,0.3)",border:"2px solid rgba(255,255,255,0.3)",transition:dragging===st.id?"none":"box-shadow 0.15s"}}>
              {i+1}
              <button
                onMouseDown={e=>e.stopPropagation()}
                onTouchStart={e=>{e.stopPropagation();onUpdateStation(st.id,{x:null,y:null});}}
                onClick={e=>{e.stopPropagation();onUpdateStation(st.id,{x:null,y:null});}}
                title="Return to tray"
                style={{position:"absolute",top:-7,right:-7,width:16,height:16,borderRadius:"50%",background:C.bg,color:C.text,border:`1px solid ${C.border2}`,fontSize:11,lineHeight:1,fontWeight:900,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",padding:0,touchAction:"none"}}>×</button>
            </div>
            <div style={{textAlign:"center",marginTop:2,fontSize:8,fontWeight:700,color:C.text,whiteSpace:"nowrap",textShadow:"0 1px 3px rgba(0,0,0,0.8)",maxWidth:52,overflow:"hidden",textOverflow:"ellipsis"}}>
              {st.name.split(" ").slice(0,2).join(" ")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Breath cue hook ───────────────────────────────────────────────────────────
function useBreathCue(holdSec, running) {
  const [breathPhase, setBreathPhase] = useState("inhale"); // inhale | hold | exhale
  const [breathSec, setBreathSec] = useState(4);
  const PHASES = [{label:"Inhale",sec:4},{label:"Hold",sec:4},{label:"Exhale",sec:6}];
  const phaseIdx = useRef(0);

  useEffect(()=>{
    if(!running){setBreathPhase("inhale");setBreathSec(4);phaseIdx.current=0;return;}
    const tick=setInterval(()=>{
      setBreathSec(s=>{
        if(s<=1){
          phaseIdx.current=(phaseIdx.current+1)%PHASES.length;
          const next=PHASES[phaseIdx.current];
          setBreathPhase(next.label.toLowerCase());
          return next.sec;
        }
        return s-1;
      });
    },1000);
    return()=>clearInterval(tick);
  },[running]);

  return {breathPhase, breathSec};
}

// ── Yoga/Stretch pose timer ───────────────────────────────────────────────────
function PoseTimer({pose, onDone, accent=C.purple}){
  // sidesMode: "none" | "single" | "both"
  // For "single": left side only, then done
  // For "both": left side, auto-switch to right, then done
  // For "none": just counts down, done
  const sidesMode = pose.sidesMode || (pose.sides ? "both" : "none");
  const initSide = sidesMode==="none" ? "single" : "left";
  const [side, setSide] = useState(initSide);
  const [seconds, setSeconds] = useState(pose.holdSec||30);
  const [running, setRunning] = useState(true);
  const [switching, setSwitching] = useState(false); // brief pause between sides
  const {breathPhase, breathSec} = useBreathCue(pose.holdSec, running);
  const pct = (seconds/(pose.holdSec||30))*100;
  const circ = 2*Math.PI*54;

  const BREATH_COLORS = {inhale:C.blue, hold:C.purple, exhale:C.teal};
  const breathColor = BREATH_COLORS[breathPhase]||C.blue;

  useEffect(()=>{
    if(!running||switching)return;
    const t=setInterval(()=>{
      setSeconds(s=>{
        if(s<=1){
          clearInterval(t);
          setRunning(false);
          if(sidesMode==="both"&&side==="left"){
            // Auto-switch to right side with a 1.5s pause
            setSwitching(true);
            setTimeout(()=>{
              setSide("right");
              setSeconds(pose.holdSec||30);
              setSwitching(false);
              setRunning(true);
            },1500);
          } else {
            setTimeout(()=>onDone?.(),600);
          }
          return 0;
        }
        return s-1;
      });
    },1000);
    return()=>clearInterval(t);
  },[running, side, switching, sidesMode]);

  const done = !running && !switching && seconds===0 && (sidesMode!=="both"||side==="right");

  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:20}}>
      {/* Side indicator */}
      {sidesMode!=="none"&&(
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <div style={{padding:"4px 16px",borderRadius:20,fontSize:13,fontWeight:700,background:C.amber+"22",color:C.amber,border:`1px solid ${C.amber}55`,textTransform:"capitalize",display:"flex",alignItems:"center",gap:6}}>
            {switching?(
              <span style={{color:C.green}}>↔ Switch sides…</span>
            ):(
              <>
                {side==="left"?"Left":"Right"} side
                {sidesMode==="both"&&<span style={{color:C.muted,fontSize:11,fontWeight:500}}> ({side==="left"?"1":"2"}/2)</span>}
              </>
            )}
          </div>
          {sidesMode==="both"&&!switching&&!done&&(
            <div style={{display:"flex",gap:4}}>
              {["left","right"].map(s=>(
                <div key={s} style={{width:8,height:8,borderRadius:"50%",background:s===side?C.amber:(side==="right"&&s==="left")?C.green+"88":C.muted}}/>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Countdown ring */}
      <div style={{position:"relative",width:140,height:140}}>
        <svg width="140" height="140" style={{transform:"rotate(-90deg)"}}>
          <circle cx="70" cy="70" r="54" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8"/>
          <circle cx="70" cy="70" r="54" fill="none" stroke={done?C.green:accent} strokeWidth="8"
            strokeDasharray={circ} strokeDashoffset={circ*(1-pct/100)}
            strokeLinecap="round" style={{transition:"stroke-dashoffset 1s linear, stroke 0.3s"}}/>
        </svg>
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2}}>
          {done?(
            <span style={{color:C.green,fontSize:32}}>✓</span>
          ):(
            <>
              <span style={{color:"#fff",fontWeight:900,fontSize:32,fontVariantNumeric:"tabular-nums"}}>{fmt(seconds)}</span>
              <span style={{color:C.muted,fontSize:10}}>remaining</span>
            </>
          )}
        </div>
      </div>

      {/* Breath cue */}
      {!done&&(
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
          <div style={{color:breathColor,fontWeight:800,fontSize:20,textTransform:"uppercase",letterSpacing:"0.1em",transition:"color 0.5s"}}>
            {breathPhase.charAt(0).toUpperCase()+breathPhase.slice(1)}
          </div>
          {/* Breath ring animation */}
          <div style={{width:60,height:60,borderRadius:"50%",border:`3px solid ${breathColor}`,display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.5s",transform:breathPhase==="inhale"?"scale(1.15)":breathPhase==="exhale"?"scale(0.85)":"scale(1.0)",background:breathColor+"11"}}>
            <span style={{fontSize:20}}>{breathPhase==="inhale"?"☁️":breathPhase==="hold"?"⭕":"💨"}</span>
          </div>
          <div style={{color:C.muted,fontSize:12}}>{breathSec}s</div>
        </div>
      )}

      {/* Pause/resume */}
      {!done&&(
        <button onClick={()=>setRunning(r=>!r)} style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:8,padding:"8px 20px",color:"#fff",fontSize:13,cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>
          {running?"⏸ Pause":"▶ Resume"}
        </button>
      )}
    </div>
  );
}

// ── Swipe gesture hook ───────────────────────────────────────────────────────
function useSwipe(onSwipeLeft, onSwipeRight, threshold=60){
  const touchStart=useRef(null);
  const touchEnd=useRef(null);
  const [swipeHint,setSwipeHint]=useState(null);

  const onTouchStart=useCallback(e=>{
    touchStart.current={x:e.touches[0].clientX, y:e.touches[0].clientY};
    touchEnd.current=null;
  },[]);

  const onTouchMove=useCallback(e=>{
    if(!touchStart.current)return;
    const dx=e.touches[0].clientX-touchStart.current.x;
    const dy=e.touches[0].clientY-touchStart.current.y;
    // Only show hint if horizontal movement dominates vertical
    if(Math.abs(dx)>Math.abs(dy)&&Math.abs(dx)>20){
      setSwipeHint(dx<0?"left":"right");
    } else {
      setSwipeHint(null);
    }
    touchEnd.current={x:e.touches[0].clientX, y:e.touches[0].clientY};
  },[]);

  const onTouchEnd=useCallback(()=>{
    setSwipeHint(null);
    if(!touchStart.current||!touchEnd.current)return;
    const dx=touchEnd.current.x-touchStart.current.x;
    const dy=touchEnd.current.y-touchStart.current.y;
    // Only trigger if horizontal movement is greater than vertical (not a scroll)
    if(Math.abs(dx)>Math.abs(dy)&&Math.abs(dx)>threshold){
      if(dx<0) onSwipeLeft?.();
      else onSwipeRight?.();
    }
    touchStart.current=null;
    touchEnd.current=null;
  },[onSwipeLeft,onSwipeRight,threshold]);

  return{onTouchStart,onTouchMove,onTouchEnd,swipeHint};
}

// ── Follow-Along Display Mode (Standard + Yoga/Stretch) ───────────────────────
function FollowAlongDisplay({stations,classType,mobile,onClose}){
  const isFlow=classType==="yoga"||classType==="mobility"; // hold-based, guided flow layout
  const isYoga=classType==="yoga";
  const accent=classType==="mobility"?C.teal:isYoga?C.purple:C.green;
  const [idx,setIdx]=useState(0);
  const [poseTimerActive,setPoseTimerActive]=useState(false);
  const [poseDone,setPoseDone]=useState({});
  const [started,setStarted]=useState(!isFlow); // flow classes open on an agenda screen
  const current=stations[idx];
  const next=stations[idx+1];
  const total=stations.length;
  const progress=total?(idx/total)*100:0;

  const goNext=useCallback(()=>{
    if(idx<total-1){setIdx(i=>i+1);setPoseTimerActive(false);}
    else onClose();
  },[idx,total,onClose]);

  const goPrev=useCallback(()=>{
    setIdx(i=>Math.max(0,i-1));setPoseTimerActive(false);
  },[]);

  const {onTouchStart,onTouchMove,onTouchEnd,swipeHint}=useSwipe(goNext,goPrev);

  // Category colours for warmup / flow sections
  const CAT_COLORS={stretching:C.purple,mobility:C.teal,foam:C.amber,sport:C.blue};
  const catColor=CAT_COLORS[current?.category]||accent;
  const catLabel=(it)=>{
    if(it?.category) return it.category==="foam"?"Foam Rolling":it.category;
    return classType==="mobility"?"Movement":"Pose";
  };

  // ── Agenda / overview screen (flow classes only) ──
  if(isFlow&&!started){
    const totalSec=stations.reduce((a,s)=>a+((Number(s.holdSec)||0)*((s.sidesMode==="both"||s.sides)?2:1)),0);
    return(
      <div style={{position:"fixed",inset:0,background:classType==="mobility"?"#06100e":"#060810",display:"flex",flexDirection:"column",zIndex:1000}}>
        <div style={{padding:mobile?"20px 18px 14px":"28px 40px 18px",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
          <div style={{color:accent,fontSize:12,fontWeight:800,letterSpacing:"0.12em",textTransform:"uppercase"}}>{classType==="mobility"?"Mobility Flow":"Yoga Flow"}</div>
          <div style={{color:"#fff",fontWeight:900,fontSize:mobile?26:34,marginTop:6}}>Class Agenda</div>
          <div style={{color:"rgba(255,255,255,0.45)",fontSize:14,marginTop:4}}>{total} item{total!==1?"s":""}{totalSec?` · ~${Math.max(1,Math.round(totalSec/60))} min of holds`:""}</div>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:mobile?"14px 14px 24px":"18px 40px 28px"}}>
          {total===0&&<div style={{color:"rgba(255,255,255,0.4)",textAlign:"center",padding:40}}>Nothing in this class yet. Add poses or warm-up items in the builder.</div>}
          {stations.map((s,i)=>{
            const col=CAT_COLORS[s.category]||accent;
            return(
              <div key={s.id||i} onClick={()=>{setIdx(i);setPoseTimerActive(false);setStarted(true);}}
                style={{display:"flex",alignItems:"center",gap:14,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:mobile?"11px 13px":"13px 16px",marginBottom:8,cursor:"pointer"}}>
                <div style={{width:30,height:30,borderRadius:8,background:col+"22",border:`1px solid ${col}55`,display:"flex",alignItems:"center",justifyContent:"center",color:col,fontWeight:800,fontSize:13,flexShrink:0}}>{i+1}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{color:"#fff",fontWeight:700,fontSize:15}}>{s.name}</div>
                  <div style={{display:"flex",gap:8,alignItems:"center",marginTop:3,flexWrap:"wrap"}}>
                    <span style={{color:col,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em"}}>{catLabel(s)}</span>
                    {Number(s.holdSec)>0&&<span style={{color:"rgba(255,255,255,0.45)",fontSize:12}}>{s.holdSec}s{(s.sidesMode==="both"||s.sides)?" × 2 sides":s.sidesMode==="single"?" · 1 side":""}</span>}
                    {s.reps&&<span style={{color:"rgba(255,255,255,0.45)",fontSize:12}}>{s.reps} reps</span>}
                  </div>
                </div>
                <span style={{color:"rgba(255,255,255,0.25)",fontSize:18}}>▸</span>
              </div>
            );
          })}
        </div>
        <div style={{padding:mobile?"14px 16px calc(env(safe-area-inset-bottom) + 86px)":"18px 40px",borderTop:"1px solid rgba(255,255,255,0.06)",display:"flex",gap:12}}>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.08)",border:"none",borderRadius:10,padding:"13px 22px",color:"#fff",fontSize:15,cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>Exit</button>
          <button onClick={()=>{setIdx(0);setPoseTimerActive(false);setStarted(true);}} disabled={total===0}
            style={{flex:1,background:accent,border:"none",borderRadius:10,padding:"13px 22px",color:"#000",fontSize:16,cursor:total===0?"default":"pointer",opacity:total===0?0.4:1,fontFamily:"inherit",fontWeight:800}}>▶ Start Class</button>
        </div>
      </div>
    );
  }

  return(
    <div onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
      style={{position:"fixed",inset:0,background:isFlow?(classType==="mobility"?"#06100e":"#060810"):"#000",display:"flex",flexDirection:"column",zIndex:1000,userSelect:"none"}}>
      {/* Swipe hint overlay */}
      {swipeHint&&(
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:swipeHint==="left"?"flex-end":"flex-start",pointerEvents:"none",zIndex:10,padding:"0 24px"}}>
          <div style={{background:"rgba(255,255,255,0.12)",borderRadius:12,padding:"12px 20px",display:"flex",alignItems:"center",gap:8}}>
            <span style={{color:"#fff",fontSize:20}}>{swipeHint==="left"?"→":"←"}</span>
            <span style={{color:"rgba(255,255,255,0.7)",fontSize:13,fontWeight:600}}>{swipeHint==="left"?"Next":"Back"}</span>
          </div>
        </div>
      )}
      {/* Progress bar */}
      <div style={{height:4,background:"rgba(255,255,255,0.06)"}}>
        <div style={{height:"100%",width:`${progress}%`,background:accent,transition:"width 0.3s"}}/>
      </div>

      {/* Section category badge for flow classes */}
      {isFlow&&(
        <div style={{padding:"10px 24px",display:"flex",alignItems:"center",gap:10,borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
          <div style={{width:8,height:8,borderRadius:"50%",background:catColor}}/>
          <span style={{color:catColor,fontSize:12,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em"}}>{catLabel(current)}</span>
          <span style={{color:"rgba(255,255,255,0.2)",fontSize:12,marginLeft:"auto"}}>{idx+1} / {total}</span>
        </div>
      )}

      {/* Main content */}
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:isFlow?"24px 40px":"40px",textAlign:"center",gap:isFlow?16:20}}>
        {!isFlow&&<div style={{color:C.muted,fontSize:13,fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase"}}>Exercise {idx+1} of {total}</div>}

        {current?.icon?(
          <div style={{fontSize:isFlow?64:80}}>{current.icon}</div>
        ):isFlow?(
          <div style={{fontSize:64}}>{classType==="mobility"?"🤸":"🧘"}</div>
        ):null}

        <div style={{color:"#fff",fontWeight:900,fontSize:isFlow?40:48,lineHeight:1.1,maxWidth:600}}>
          {current?.name}
        </div>

        {/* Flow mode: description + hold/breath timer */}
        {isFlow?(
          <>
            {current?.description&&(
              <div style={{color:"rgba(255,255,255,0.6)",fontSize:16,maxWidth:500,lineHeight:1.8,textAlign:"center"}}>
                {current.description}
              </div>
            )}
            {current?.reps&&<div style={{color:accent,fontWeight:800,fontSize:24}}>{current.reps} reps{(current.sidesMode==="both"||current.sides)?" per side":""}</div>}
            {current?.holdSec>0&&(
              poseTimerActive?(
                <PoseTimer pose={current} accent={accent} onDone={()=>{setPoseDone(p=>({...p,[idx]:true}));setPoseTimerActive(false);}}/>
              ):(
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
                  {poseDone[idx]?(
                    <div style={{color:C.green,fontWeight:700,fontSize:16}}>✓ Complete</div>
                  ):(
                    <div style={{textAlign:"center"}}>
                      <div style={{color:accent,fontWeight:700,fontSize:18}}>
                        Hold {current.holdSec}s
                        {(current.sidesMode==="both"||current.sides)&&" each side"}
                        {current.sidesMode==="single"&&" (one side)"}
                      </div>
                      {(current.sidesMode==="both"||current.sides)&&(
                        <div style={{color:C.amber,fontSize:13,marginTop:4,fontWeight:600}}>
                          ⏱ Auto-switches sides after {current.holdSec}s
                        </div>
                      )}
                      {current.sidesMode==="single"&&(
                        <div style={{color:C.blue,fontSize:13,marginTop:4,fontWeight:600}}>
                          ⏱ Left side only · {current.holdSec}s
                        </div>
                      )}
                    </div>
                  )}
                  <button onClick={()=>setPoseTimerActive(true)}
                    style={{background:poseDone[idx]?C.green+"22":accent+"22",border:`1px solid ${poseDone[idx]?C.green:accent}55`,borderRadius:10,padding:"10px 24px",color:poseDone[idx]?C.green:accent,fontSize:14,cursor:"pointer",fontFamily:"inherit",fontWeight:700}}>
                    {poseDone[idx]?"▶ Repeat Timer":"▶ Start Timer"}
                  </button>
                </div>
              )
            )}
            {current?.breathNote&&(
              <div style={{color:"rgba(255,255,255,0.35)",fontSize:13,fontStyle:"italic",maxWidth:400}}>
                🌬 {current.breathNote}
              </div>
            )}
          </>
        ):(
          <>
            {/* Side indicator for HIIT exercises */}
            {current?.sidesMode&&current.sidesMode!=="none"&&(
              <div style={{padding:"4px 18px",borderRadius:20,fontSize:14,fontWeight:700,background:C.amber+"22",color:C.amber,border:`1px solid ${C.amber}44`}}>
                {current.sidesMode==="both"?"Both sides — auto-switches":"Single side (left)"}
              </div>
            )}
            {current?.reps&&<div style={{color:C.green,fontWeight:800,fontSize:28}}>{current.reps} reps{current.sidesMode&&current.sidesMode!=="none"?" per side":""}</div>}
            {current?.workSec>0&&(
              <div style={{textAlign:"center"}}>
                <div style={{color:C.amber,fontWeight:800,fontSize:24}}>{current.workSec} seconds{current.sidesMode==="both"?" × 2 sides":""}</div>
                {current.sidesMode==="both"&&<div style={{color:C.muted,fontSize:13,marginTop:4}}>Timer auto-switches sides halfway</div>}
              </div>
            )}
            {current?.notes&&(
              <div style={{color:C.sub,fontSize:17,maxWidth:500,lineHeight:1.6,padding:"14px 22px",background:"rgba(255,255,255,0.05)",borderRadius:12,border:"1px solid rgba(255,255,255,0.08)"}}>
                💡 {current.notes}
              </div>
            )}
          </>
        )}

        {next&&!poseTimerActive&&(
          <div style={{color:"rgba(255,255,255,0.25)",fontSize:13,marginTop:8}}>
            Next: <span style={{color:"rgba(255,255,255,0.45)",fontWeight:600}}>{next.name}</span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={{padding:"16px 24px",paddingBottom:mobile?"calc(env(safe-area-inset-bottom) + 86px)":"16px",display:"flex",justifyContent:"space-between",alignItems:"center",background:"rgba(255,255,255,0.02)",borderTop:"1px solid rgba(255,255,255,0.06)"}}>
        <button onClick={goPrev} disabled={idx===0}
          style={{background:"rgba(255,255,255,0.08)",border:"none",borderRadius:10,padding:"11px 22px",color:"#fff",fontSize:15,cursor:"pointer",opacity:idx===0?0.25:1,fontFamily:"inherit",fontWeight:600}}>
          ← Back
        </button>
        <div style={{display:"flex",gap:5}}>
          {stations.map((_,i)=>(
            <div key={i} onClick={()=>{setIdx(i);setPoseTimerActive(false);}}
              style={{width:i===idx?22:7,height:7,borderRadius:4,background:poseDone[i]?C.green:i===idx?accent:C.muted,cursor:"pointer",transition:"all 0.2s"}}/>
          ))}
        </div>
        {idx<total-1?(
          <button onClick={goNext}
            style={{background:accent,border:"none",borderRadius:10,padding:"11px 22px",color:"#000",fontSize:15,cursor:"pointer",fontFamily:"inherit",fontWeight:800}}>
            Next →
          </button>
        ):(
          <button onClick={onClose}
            style={{background:accent,border:"none",borderRadius:10,padding:"11px 22px",color:"#000",fontSize:15,cursor:"pointer",fontFamily:"inherit",fontWeight:800}}>
            Finish ✓
          </button>
        )}
      </div>
      <div style={{position:"absolute",top:isFlow?52:12,right:16,display:"flex",gap:8}}>
        {isFlow&&<button onClick={()=>setStarted(false)} style={{background:"rgba(255,255,255,0.08)",border:"none",borderRadius:7,padding:"7px 13px",color:"rgba(255,255,255,0.5)",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>≡ Agenda</button>}
        <button onClick={onClose} style={{background:"rgba(255,255,255,0.08)",border:"none",borderRadius:7,padding:"7px 13px",color:"rgba(255,255,255,0.5)",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>✕ Exit</button>
      </div>
    </div>
  );
}

// ── Station Rotation Display Mode ─────────────────────────────────────────────
function StationRotationDisplay({stations,workSec=40,restSec=20,mobile,onClose}){
  const [phase,setPhase]=useState("work");
  const [stationIdx,setStationIdx]=useState(0);
  const [side,setSide]=useState("left");
  const [seconds,setSeconds]=useState(workSec);
  const [running,setRunning]=useState(true);

  const current=stations[stationIdx];
  const next=stations[stationIdx+1];
  const sidesMode=current?.sidesMode||"none";
  const switchSec=Number(current?.switchSec)||5;
  const isRest=phase==="rest";
  const isSwitching=phase==="switching";
  const totalSec=isRest?restSec:isSwitching?switchSec:workSec;
  const pct=seconds/totalSec*100;
  const circ=2*Math.PI*70;
  const done=!running&&seconds===0&&!isSwitching;

  // Compute strip color without nested ternary
  const stripColor=(i)=>{
    if(i<stationIdx) return C.green;
    if(i===stationIdx){
      if(isSwitching) return C.purple;
      if(isRest) return C.amber;
      return C.blue;
    }
    return "rgba(255,255,255,0.1)";
  };

  // Compute bg without nested ternary
  let bgColor="#0A0D1A";
  if(isRest) bgColor="#0A1A0A";
  if(isSwitching) bgColor="#0A0A1A";

  // Ring color
  let ringColor=C.blue;
  if(isRest) ringColor=C.amber;
  if(isSwitching) ringColor=C.purple;

  useEffect(()=>{
    if(!running) return;
    const timer=setInterval(()=>{
      setSeconds(s=>{
        if(s<=1){
          clearInterval(timer);
          if(phase==="switching"){
            setSide("right");setPhase("work");setSeconds(workSec);setRunning(true);
          } else if(phase==="work"){
            const sm=stations[stationIdx]?.sidesMode||"none";
            const sw=Number(stations[stationIdx]?.switchSec)||5;
            if(sm==="both"&&side==="left"){
              setPhase("switching");setSeconds(sw);setRunning(true);
            } else {
              setPhase("rest");setSide("left");setSeconds(restSec);setRunning(true);
            }
          } else {
            const n=stationIdx+1;
            if(n>=stations.length){setRunning(false);}
            else{setStationIdx(n);setSide("left");setPhase("work");setSeconds(workSec);setRunning(true);}
          }
          return 0;
        }
        return s-1;
      });
    },1000);
    return()=>clearInterval(timer);
  },[running,phase,stationIdx,side]);

  const skip=useCallback(()=>{
    setRunning(false);
    if(phase==="switching"){
      setSide("right");setPhase("work");setSeconds(workSec);setRunning(true);
    } else if(phase==="work"){
      const sm=stations[stationIdx]?.sidesMode||"none";
      const sw=Number(stations[stationIdx]?.switchSec)||5;
      if(sm==="both"&&side==="left"){
        setPhase("switching");setSeconds(sw);setRunning(true);
      } else {
        setPhase("rest");setSide("left");setSeconds(restSec);setRunning(true);
      }
    } else {
      const n=stationIdx+1;
      if(n>=stations.length){setRunning(false);setSeconds(0);}
      else{setStationIdx(n);setSide("left");setPhase("work");setSeconds(workSec);setRunning(true);}
    }
  },[phase,stationIdx,side,stations,workSec,restSec]);

  // Swipe left = skip forward, swipe right = pause/resume
  const {onTouchStart:rTouchStart,onTouchMove:rTouchMove,onTouchEnd:rTouchEnd,swipeHint:rHint}=useSwipe(
    skip,
    ()=>setRunning(r=>!r)
  );

  return(
    <div onTouchStart={rTouchStart} onTouchMove={rTouchMove} onTouchEnd={rTouchEnd}
      style={{position:"fixed",inset:0,background:bgColor,display:"flex",flexDirection:"column",zIndex:1000,transition:"background 0.5s",userSelect:"none"}}>
      {/* Swipe hint */}
      {rHint&&(
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:rHint==="left"?"flex-end":"flex-start",pointerEvents:"none",zIndex:10,padding:"0 24px"}}>
          <div style={{background:"rgba(255,255,255,0.12)",borderRadius:12,padding:"12px 20px",display:"flex",alignItems:"center",gap:8}}>
            <span style={{color:"#fff",fontSize:20}}>{rHint==="left"?"⏭":"⏯"}</span>
            <span style={{color:"rgba(255,255,255,0.7)",fontSize:13,fontWeight:600}}>{rHint==="left"?"Skip":"Pause/Resume"}</span>
          </div>
        </div>
      )}
      <div style={{display:"flex",height:6}}>
        {stations.map((_,i)=>(
          <div key={i} style={{flex:1,background:stripColor(i),transition:"background 0.3s",margin:"0 1px"}}/>
        ))}
      </div>
      {done?(
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:20}}>
          <div style={{fontSize:60}}>🎉</div>
          <div style={{color:"#fff",fontWeight:900,fontSize:36}}>Circuit Complete!</div>
          <div style={{color:C.green,fontSize:18}}>{stations.length} stations finished</div>
          <button onClick={onClose} style={{background:C.green,border:"none",borderRadius:12,padding:"14px 32px",color:"#000",fontSize:18,fontWeight:800,cursor:"pointer",fontFamily:"inherit",marginTop:10}}>Done</button>
        </div>
      ):(
        <>
          <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:20,padding:24}}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
              <div style={{color:ringColor,fontSize:16,fontWeight:800,letterSpacing:"0.15em",textTransform:"uppercase"}}>
                {isSwitching?"↔ Switch Sides":isRest?"🛑 Rest":"⚡ Work"} — Station {stationIdx+1}/{stations.length}
              </div>
              {!isRest&&!isSwitching&&sidesMode!=="none"&&(
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <div style={{padding:"3px 14px",borderRadius:20,fontSize:13,fontWeight:700,background:C.amber+"22",color:C.amber,border:"1px solid "+C.amber+"44"}}>
                    {side==="left"?"Left":"Right"} side
                    {sidesMode==="both"&&<span style={{color:C.muted,fontSize:11,fontWeight:400,marginLeft:6}}>({side==="left"?"1":"2"}/2)</span>}
                  </div>
                  {sidesMode==="both"&&(
                    <div style={{display:"flex",gap:4}}>
                      <div style={{width:8,height:8,borderRadius:"50%",background:side==="left"?C.amber:C.green}}/>
                      <div style={{width:8,height:8,borderRadius:"50%",background:side==="right"?C.amber:C.muted}}/>
                    </div>
                  )}
                </div>
              )}
              {isSwitching&&<div style={{color:"rgba(255,255,255,0.5)",fontSize:14}}>Switching to right side…</div>}
            </div>
            <div style={{position:"relative",width:180,height:180}}>
              <svg width="180" height="180" style={{transform:"rotate(-90deg)"}}>
                <circle cx="90" cy="90" r="70" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10"/>
                <circle cx="90" cy="90" r="70" fill="none" stroke={ringColor} strokeWidth="10"
                  strokeDasharray={circ} strokeDashoffset={circ*(1-pct/100)}
                  strokeLinecap="round" style={{transition:"stroke-dashoffset 1s linear,stroke 0.5s"}}/>
              </svg>
              <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2}}>
                {isSwitching?(
                  <>
                    <span style={{color:C.purple,fontSize:28,lineHeight:1}}>↔</span>
                    <span style={{color:C.purple,fontWeight:900,fontSize:32,fontVariantNumeric:"tabular-nums"}}>{fmt(seconds)}</span>
                  </>
                ):(
                  <span style={{color:"#fff",fontWeight:900,fontSize:48,fontVariantNumeric:"tabular-nums"}}>{fmt(seconds)}</span>
                )}
              </div>
            </div>
            {!isRest&&!isSwitching&&(
              <>
                <div style={{color:"#fff",fontWeight:900,fontSize:32,textAlign:"center",lineHeight:1.1}}>{current?.name}</div>
                {current?.reps&&<div style={{color:C.green,fontWeight:700,fontSize:20}}>{current.reps} reps{sidesMode!=="none"?" per side":""}</div>}
                {current?.notes&&<div style={{color:C.sub,fontSize:15,textAlign:"center",maxWidth:400}}>{current.notes}</div>}
              </>
            )}
            {isRest&&next&&(
              <div style={{textAlign:"center"}}>
                <div style={{color:C.muted,fontSize:14,marginBottom:8}}>Get ready for</div>
                <div style={{color:"#fff",fontWeight:800,fontSize:28}}>{next.name}</div>
                {next.sidesMode==="both"&&<div style={{color:C.amber,fontSize:13,marginTop:4}}>Both sides · {next.workSec||workSec}s each</div>}
                {next.sidesMode==="single"&&<div style={{color:C.blue,fontSize:13,marginTop:4}}>Single side · {next.workSec||workSec}s</div>}
              </div>
            )}
          </div>
          <div style={{padding:24,paddingBottom:mobile?"calc(env(safe-area-inset-bottom) + 86px)":24,display:"flex",justifyContent:"center",gap:16,borderTop:"1px solid rgba(255,255,255,0.08)"}}>
            <button onClick={()=>setRunning(r=>!r)} disabled={isSwitching}
              style={{background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:10,padding:"12px 28px",color:"#fff",fontSize:16,cursor:"pointer",fontFamily:"inherit",fontWeight:600,opacity:isSwitching?0.4:1}}>
              {running&&!isSwitching?"⏸ Pause":"▶ Resume"}
            </button>
            <button onClick={skip}
              style={{background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:10,padding:"12px 28px",color:"#fff",fontSize:16,cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>
              Skip →
            </button>
            <button onClick={onClose}
              style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,padding:"12px 20px",color:C.muted,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>✕</button>
          </div>
        </>
      )}
    </div>
  );
}
// ── Class Format Builder ──────────────────────────────────────────────────────

const YOGA_SECTIONS = [
  {id:"foam",     label:"Foam Rolling",  color:"#F5A524", icon:"🟫"},
  {id:"mobility", label:"Mobility",      color:"#22C4D9", icon:"🔄"},
  {id:"stretching",label:"Stretching",   color:"#9B72F5", icon:"🧘"},
];

const DEMO_YOGA = [
  {id:uid(),name:"Thoracic Spine Roll",category:"foam",holdSec:40,sidesMode:"none",sides:false,description:"Place roller under mid-back. Support head, arms crossed. Slowly roll up and down, pausing on tight spots.",breathNote:"Breathe into the roller. Relax on each exhale.",icon:"🟫",x:30,y:30},
  {id:uid(),name:"IT Band Roll",category:"foam",holdSec:30,sidesMode:"both",sides:true,description:"Side lying, roller under outer thigh. Use arms for support. Roll from hip to just above the knee.",breathNote:"Stay relaxed. Breathe through any tension.",icon:"🟫",x:70,y:30},
  {id:uid(),name:"90/90 Hip Rotation",category:"mobility",holdSec:45,sidesMode:"both",sides:true,description:"Sit with both knees at 90°. Slowly rotate hips to internal then external rotation. Keep spine tall.",breathNote:"Inhale to prep, exhale as you rotate deeper.",icon:"🔄",x:30,y:60},
  {id:uid(),name:"Cat-Cow",category:"mobility",holdSec:0,sidesMode:"none",sides:false,description:"On hands and knees. Inhale — drop belly, lift head (cow). Exhale — round spine, tuck chin (cat). 10 slow reps.",breathNote:"Let the breath drive the movement.",icon:"🔄",x:70,y:60},
  {id:uid(),name:"Hip Flexor Stretch",category:"stretching",holdSec:40,sidesMode:"both",sides:true,description:"Kneel on one knee, step opposite foot forward. Drive hips forward gently. Keep torso upright, core braced.",breathNote:"Inhale to lengthen, exhale to soften into the stretch.",icon:"🧘",x:30,y:80},
  {id:uid(),name:"Supine Twist",category:"stretching",holdSec:40,sidesMode:"single",sides:true,description:"Lie on back, draw one knee to chest and guide across body. Both shoulders stay grounded. Arms out wide.",breathNote:"Every exhale, let gravity deepen the twist.",icon:"🧘",x:70,y:80},
];

function YogaSectionBlock({section,poses}){
  return poses.length===0?null:(
    <div style={{marginBottom:14}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
        <div style={{width:3,height:16,borderRadius:2,background:section.color}}/>
        <span style={{fontSize:13}}>{section.icon}</span>
        <span style={{color:section.color,fontWeight:700,fontSize:12,textTransform:"uppercase",letterSpacing:"0.08em"}}>{section.label}</span>
        <span style={{color:C.muted,fontSize:11,marginLeft:4}}>{poses.length} poses</span>
      </div>
      {poses.map((p,i)=>(
        <div key={p.id} style={{display:"flex",alignItems:"center",gap:12,background:C.s2,borderRadius:9,padding:"10px 14px",marginBottom:6,border:`1px solid ${section.color}22`}}>
          <span style={{fontSize:18}}>{p.icon}</span>
          <div style={{flex:1}}>
            <div style={{color:C.text,fontWeight:600,fontSize:13}}>{p.name}</div>
            <div style={{color:C.muted,fontSize:11,marginTop:2,lineHeight:1.5}}>{p.description?.slice(0,70)}…</div>
          </div>
          <div style={{textAlign:"right",flexShrink:0}}>
            {p.holdSec>0&&<div style={{color:section.color,fontWeight:700,fontSize:13}}>{p.holdSec}s{p.sidesMode==="both"?" × 2":p.sidesMode==="single"?" × 1":""}</div>}
            {p.sidesMode==="both"&&<div style={{color:C.amber,fontSize:10,fontWeight:600}}>Both sides</div>}
            {p.sidesMode==="single"&&<div style={{color:C.blue,fontSize:10,fontWeight:600}}>Single side</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

function ClassFormatPreview(){ return null; }

// ═══════════════════════════════════════════════════════════════════════════════

// ── Shared class-type config (used by the Format builder and the Schedule runner)
const CLASS_TYPES=[
  {id:"hiit",     toggle:"🏋️ HIIT",     color:C.green,  item:"Station",  items:"Stations / Exercises", empty:"No stations yet.",  lead:"Follow-Along",  timer:true},
  {id:"yoga",     toggle:"🧘 Yoga",     color:C.purple, item:"Pose",     items:"Poses",                empty:"No poses yet.",     lead:"Lead Class",    timer:false},
  {id:"mobility", toggle:"🤸 Mobility", color:C.teal,   item:"Movement", items:"Movements",            empty:"No movements yet.", lead:"Lead Movement", timer:false},
];

// Build the station lists a live display needs, from a saved format + class type.
// Mirrors the normalisation done in the Class Format builder.
function buildRunData(format,classType){
  const allStations=format?.stations||[];
  const typeStations=allStations.filter(s=>(s.classType||"hiit")===classType);
  const stationsWithPos=typeStations.map(st=>({...st,sidesMode:st.sidesMode||"none"}));
  const isFlowType=classType==="yoga"||classType==="mobility";
  const warmupItems=format?.warmup||[];
  const WARM_ICONS={"foam-rolling":"🌀",stretching:"🧘",mobility:"🔄",sport:"⚡"};
  const seqSource=isFlowType?[
    ...warmupItems.map(w=>({...w,kind:"warmup"})),
    ...typeStations.map(s=>({...s,kind:"pose"})),
  ]:[];
  const orderedSeq=seqSource.map((it,i)=>({it,i})).sort((a,b)=>{
    const sa=a.it.seq??(1e6+a.i), sb=b.it.seq??(1e6+b.i);
    return sa-sb;
  }).map(x=>x.it);
  const leadSequence=isFlowType?orderedSeq.map(it=>it.kind==="warmup"?{
    id:it.id,name:it.name,
    category:it.category==="foam-rolling"?"foam":it.category,
    icon:WARM_ICONS[it.category]||"🧘",
    description:it.notes||"",
    holdSec:Number(it.holdSec)||0,
    reps:it.reps||"",
    sidesMode:it.sidesMode||"none",
  }:{
    ...it,
    description:it.description||it.notes||"",
    holdSec:Number(it.holdSec)||Number(it.workSec)||0,
    sidesMode:it.sidesMode||"none",
  }):stationsWithPos;
  return {stationsWithPos,leadSequence};
}

// Compact "run this class" panel — lets a trainer launch the live display
// straight from a scheduled class (Schedule screen) without visiting Programs.
const typeMemKey=id=>"fitos_fmt_type_"+id;
const savedType=(id,list)=>{ try{const v=localStorage.getItem(typeMemKey(id)); if(v&&list.some(t=>t.id===v))return v;}catch{} return list[0].id; };

function ClassRunPanel({format,mobile}){
  const present=[...new Set((format?.stations||[]).map(s=>s.classType||"hiit"))];
  const types=CLASS_TYPES.filter(t=>present.includes(t.id));
  const list=types.length?types:[CLASS_TYPES[0]];
  const [classType,setClassTypeRaw]=useState(()=>savedType(format?.id,list));
  const [displayMode,setDisplayMode]=useState(null);
  const setClassType=t=>{ setClassTypeRaw(t); try{localStorage.setItem(typeMemKey(format?.id),t);}catch{} };
  // Reset when a different format is shown (restores that format's remembered type)
  useEffect(()=>{ setClassTypeRaw(savedType(format?.id,list)); setDisplayMode(null); },[format?.id]);
  const activeType=list.some(t=>t.id===classType)?classType:list[0].id;
  const typeCfg=CLASS_TYPES.find(t=>t.id===activeType)||CLASS_TYPES[0];
  const {stationsWithPos,leadSequence}=buildRunData(format,activeType);
  const empty=leadSequence.length===0&&stationsWithPos.length===0;

  if(displayMode==="followalong") return <FollowAlongDisplay stations={leadSequence} classType={activeType} mobile={mobile} onClose={()=>setDisplayMode(null)}/>;
  if(displayMode==="rotation")    return <StationRotationDisplay stations={stationsWithPos} workSec={Number(format?.workSec)||40} restSec={Number(format?.restSec)||20} mobile={mobile} onClose={()=>setDisplayMode(null)}/>;

  return(
    <div style={{borderTop:`1px solid ${C.border}`,marginTop:mobile?10:12,paddingTop:mobile?10:12,display:"flex",flexDirection:"column",gap:mobile?8:10}}>
      {empty?(
        <div style={{color:C.muted,fontSize:12}}>This format has no stations yet — add some in Programs → Class Formats.</div>
      ):(
        <>
          {list.length>1&&(
            <div style={{display:"flex",background:C.s3,borderRadius:8,padding:3}}>
              {list.map(t=>(
                <button key={t.id} onClick={()=>setClassType(t.id)}
                  style={{flex:1,padding:"6px",borderRadius:6,border:"none",cursor:"pointer",fontWeight:700,fontSize:mobile?11:12,background:activeType===t.id?t.color:"transparent",color:activeType===t.id?"#000":C.sub,transition:"all 0.15s"}}>
                  {t.toggle}
                </button>
              ))}
            </div>
          )}
          <div style={{display:"flex",gap:8}}>
            <Btn variant="ghost" color={typeCfg.color} style={{flex:1,justifyContent:"center",padding:"7px",fontSize:11}} onClick={()=>setDisplayMode("followalong")}>
              📖 {typeCfg.lead}
            </Btn>
            {typeCfg.timer&&<Btn variant="ghost" color={C.green} style={{flex:1,justifyContent:"center",padding:"7px",fontSize:11}} onClick={()=>setDisplayMode("rotation")}>
              ▶ Station Timer
            </Btn>}
          </div>
        </>
      )}
    </div>
  );
}

export { ROOM_SHAPES, STATION_COLORS, FloorPlanEditor, useBreathCue, PoseTimer, useSwipe, FollowAlongDisplay, StationRotationDisplay, YOGA_SECTIONS, YogaSectionBlock, CLASS_TYPES, ClassRunPanel, savedType, typeMemKey };
