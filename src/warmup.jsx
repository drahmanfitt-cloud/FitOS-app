// FitOS — Warmup components
import React, { useState, useEffect, useRef, useCallback } from "react";
import { C, uid, fmt } from "./config.js";
import { Pill, Btn, Card, SL } from "./ui.jsx";

// WARMUP + FLOOR PLAN + CLASS DISPLAY MODES (from preview)
// ═══════════════════════════════════════════════════════════════════════════════

const WARMUP_CATS = [
  {id:"stretching", label:"Stretching", color:C.purple, icon:"🧘"},
  {id:"mobility",   label:"Mobility",   color:C.teal,   icon:"🔄"},
  {id:"sport",      label:"Sport Specific", color:C.amber, icon:"⚡"},
];

const RESISTANCE_MODES = [
  {value:"bodyweight",label:"Bodyweight",color:C.green},
  {value:"weighted",  label:"Weighted",  color:C.blue},
  {value:"resisted",  label:"Resisted",  color:C.amber},
  {value:"assisted",  label:"Assisted",  color:C.purple},
];

function WarmupItem({item,onUpdate,onRemove}){
  const [expanded,setExpanded]=useState(false);
  const cat=WARMUP_CATS.find(c=>c.id===item.category)||WARMUP_CATS[0];
  const mode=RESISTANCE_MODES.find(m=>m.value===item.resistanceMode)||RESISTANCE_MODES[0];
  return(
    <div style={{background:C.s2,borderRadius:10,border:`1px solid ${cat.color}33`,marginBottom:8,overflow:"hidden"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px"}}>
        <div style={{width:8,height:8,borderRadius:"50%",background:cat.color,flexShrink:0}}/>
        <input value={item.name} onChange={e=>onUpdate({name:e.target.value})}
          style={{flex:1,background:"none",border:"none",color:C.text,fontWeight:600,fontSize:13,outline:"none",fontFamily:"inherit"}}/>
        <Pill color={mode.color}>{mode.label}</Pill>
        {item.holdSec>0&&<span style={{color:C.muted,fontSize:11}}>{item.holdSec}s{(item.sidesMode==="both"||item.sidesMode==="single")?` × ${item.sidesMode==="both"?"2":"1"}`:""}</span>}
        {item.reps&&<span style={{color:C.muted,fontSize:11}}>{item.reps} reps</span>}
        {item.sidesMode==="both"&&<Pill color={C.amber}>Both sides</Pill>}
        {item.sidesMode==="single"&&<Pill color={C.blue}>Single side</Pill>}
        <button onClick={()=>setExpanded(e=>!e)} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:12}}>{expanded?"▲":"▼"}</button>
        <button onClick={onRemove} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:16,lineHeight:1}}>×</button>
      </div>
      {expanded&&(
        <div style={{padding:"0 12px 12px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,borderTop:`1px solid ${C.border}`}}>
          <div style={{paddingTop:10}}>
            <div style={{color:C.muted,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6}}>Hold (sec)</div>
            <input type="number" value={item.holdSec} onChange={e=>onUpdate({holdSec:Number(e.target.value)})}
              style={{width:"100%",background:C.s3,border:`1px solid ${C.border}`,borderRadius:6,padding:"6px 8px",color:C.text,fontSize:13,outline:"none",fontFamily:"inherit"}}/>
          </div>
          <div style={{paddingTop:10}}>
            <div style={{color:C.muted,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6}}>Reps</div>
            <input value={item.reps} onChange={e=>onUpdate({reps:e.target.value})} placeholder="—"
              style={{width:"100%",background:C.s3,border:`1px solid ${C.border}`,borderRadius:6,padding:"6px 8px",color:C.text,fontSize:13,outline:"none",fontFamily:"inherit"}}/>
          </div>
          <div style={{gridColumn:"1/-1"}}>
            <div style={{color:C.muted,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6}}>Resistance mode</div>
            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
              {RESISTANCE_MODES.map(m=>(
                <button key={m.value} onClick={()=>onUpdate({resistanceMode:m.value})}
                  style={{padding:"3px 9px",borderRadius:6,fontSize:11,fontWeight:700,cursor:"pointer",border:`1px solid ${item.resistanceMode===m.value?m.color:C.border}`,background:item.resistanceMode===m.value?m.color+"18":"transparent",color:item.resistanceMode===m.value?m.color:C.muted}}>
                  {m.label}
                </button>
              ))}
            </div>
          </div>
          <div style={{gridColumn:"1/-1"}}>
            <div style={{color:C.muted,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6}}>Notes / cues</div>
            <textarea value={item.notes} onChange={e=>onUpdate({notes:e.target.value})} placeholder="Form cues, progressions…" rows={2}
              style={{width:"100%",background:C.s3,border:`1px solid ${C.border}`,borderRadius:6,padding:"6px 8px",color:C.text,fontSize:12,outline:"none",fontFamily:"inherit",resize:"vertical",lineHeight:1.5}}/>
          </div>
          <div style={{gridColumn:"1/-1"}}>
            <div style={{color:C.muted,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6}}>Sides</div>
            <div style={{display:"flex",gap:5}}>
              {[["none","No sides",C.muted],["single","Single side",C.blue],["both","Both sides",C.amber]].map(([val,label,col])=>(
                <button key={val} onClick={()=>onUpdate({sidesMode:val})}
                  style={{padding:"4px 10px",borderRadius:6,fontSize:11,fontWeight:700,cursor:"pointer",border:`1px solid ${(item.sidesMode||"none")===val?col:C.border}`,background:(item.sidesMode||"none")===val?col+"18":"transparent",color:(item.sidesMode||"none")===val?col:C.muted}}>
                  {label}
                </button>
              ))}
            </div>
            {(item.sidesMode==="single"||item.sidesMode==="both")&&(
              <div style={{marginTop:8,display:"flex",alignItems:"center",gap:8}}>
                <span style={{color:C.muted,fontSize:11}}>Time per side:</span>
                <input type="number" value={item.holdSec} onChange={e=>onUpdate({holdSec:Number(e.target.value)})}
                  style={{width:52,background:C.s3,border:`1px solid ${C.border}`,borderRadius:6,padding:"4px 7px",color:C.text,fontSize:12,outline:"none",fontFamily:"inherit",textAlign:"center"}}/>
                <span style={{color:C.muted,fontSize:11}}>sec {item.sidesMode==="both"?"× 2 sides":""}</span>
                {item.sidesMode==="both"&&<span style={{color:C.amber,fontSize:11,fontWeight:600}}>= {(item.holdSec||0)*2}s total</span>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function WarmupSubsection({cat,items,onAdd,onUpdate,onRemove}){
  const [collapsed,setCollapsed]=useState(false);
  const totalSec=items.reduce((a,i)=>a+(i.sides?(i.holdSec||0)*2:(i.holdSec||0)),0);
  return(
    <div style={{marginBottom:12,borderRadius:10,border:`1px solid ${cat.color}33`,overflow:"hidden"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 12px",background:cat.color+"0A"}}>
        <span style={{fontSize:14}}>{cat.icon}</span>
        <span style={{color:cat.color,fontWeight:700,fontSize:12,textTransform:"uppercase",letterSpacing:"0.08em",flex:1}}>{cat.label}</span>
        {items.length>0&&<span style={{color:C.muted,fontSize:11}}>{items.length} · {totalSec}s</span>}
        <button onClick={onAdd} style={{width:26,height:26,borderRadius:6,background:cat.color+"20",border:`1px solid ${cat.color}44`,color:cat.color,fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900}}>+</button>
        {items.length>0&&<button onClick={()=>setCollapsed(c=>!c)} style={{width:26,height:26,borderRadius:6,background:"transparent",border:`1px solid ${C.border}`,color:C.muted,fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{collapsed?"▼":"▲"}</button>}
      </div>
      {!collapsed&&(
        <div style={{padding:items.length?"10px 10px 4px":0}}>
          {items.length===0?(
            <div style={{textAlign:"center",padding:"12px 0",color:C.muted,fontSize:12}}>
              No {cat.label.toLowerCase()} added — <span onClick={onAdd} style={{color:cat.color,cursor:"pointer",fontWeight:600}}>add one</span>
            </div>
          ):items.map(item=>(
            <WarmupItem key={item.id} item={item} onUpdate={p=>onUpdate(item.id,p)} onRemove={()=>onRemove(item.id)}/>
          ))}
        </div>
      )}
    </div>
  );
}

function ProgramWarmupTab(){
  const [items,setItems]=useState([
    {id:uid(),name:"Hip Flexor Stretch",category:"stretching",holdSec:30,reps:"",resistanceMode:"bodyweight",sides:true,notes:""},
    {id:uid(),name:"Cat-Cow",category:"mobility",holdSec:20,reps:"10",resistanceMode:"bodyweight",sides:false,notes:"Inhale arch, exhale round"},
    {id:uid(),name:"Band Pull-Apart",category:"sport",holdSec:0,reps:"15",resistanceMode:"resisted",sides:false,notes:""},
  ]);

  const addItem=cat=>setItems(p=>[...p,{id:uid(),name:`New ${cat.label}`,category:cat.id,holdSec:30,reps:"",resistanceMode:"bodyweight",sides:false,notes:""}]);
  const updateItem=(id,patch)=>setItems(p=>p.map(i=>i.id===id?{...i,...patch}:i));
  const removeItem=id=>setItems(p=>p.filter(i=>i.id!==id));

  const totalMin=Math.round(items.reduce((a,i)=>a+(i.sides?(i.holdSec||0)*2:(i.holdSec||0)),0)/60);

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div>
          <div style={{color:C.text,fontWeight:700,fontSize:15}}>Warmup Protocol</div>
          <div style={{color:C.muted,fontSize:12,marginTop:2}}>{items.length} exercises · ~{totalMin} min</div>
        </div>
        <div style={{display:"flex",gap:6}}>
          {WARMUP_CATS.map(cat=>(
            <button key={cat.id} onClick={()=>addItem(cat)} style={{padding:"5px 10px",borderRadius:7,fontSize:11,fontWeight:700,cursor:"pointer",border:`1px solid ${cat.color}44`,background:cat.color+"18",color:cat.color}}>
              + {cat.label.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>
      {WARMUP_CATS.map(cat=>(
        <WarmupSubsection key={cat.id} cat={cat}
          items={items.filter(i=>i.category===cat.id)}
          onAdd={()=>addItem(cat)}
          onUpdate={updateItem}
          onRemove={removeItem}/>
      ))}
    </div>
  );
}

function ProgramBuilderPreview(){
  const [tab,setTab]=useState("warmup");
  const TABS=[
    {id:"warmup",label:"🧘 Warmup",color:C.purple},
    {id:"day1",label:"Day 1 — Push",color:C.blue},
    {id:"day2",label:"Day 2 — Pull",color:C.green},
    {id:"day3",label:"Day 3 — Legs",color:C.amber},
  ];
  return(
    <Card>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div>
          <div style={{color:C.text,fontWeight:800,fontSize:16}}>Strength Block A</div>
          <div style={{color:C.muted,fontSize:12}}>4 weeks · 3 days/week</div>
        </div>
        <Pill color={C.green}>2 clients assigned</Pill>
      </div>
      {/* Tab bar */}
      <div style={{display:"flex",gap:2,marginBottom:20,borderBottom:`1px solid ${C.border}`,overflowX:"auto"}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"8px 14px",border:"none",background:"none",cursor:"pointer",color:tab===t.id?t.color:C.sub,fontWeight:tab===t.id?700:500,fontSize:13,borderBottom:`2px solid ${tab===t.id?t.color:"transparent"}`,whiteSpace:"nowrap"}}>
            {t.label}
          </button>
        ))}
      </div>
      {tab==="warmup"&&<ProgramWarmupTab/>}
      {tab!=="warmup"&&(
        <div style={{textAlign:"center",padding:"32px 0",color:C.muted}}>
          <div style={{fontSize:28,marginBottom:10}}>🏋️</div>
          <div style={{fontSize:13}}>Training day exercises — same as existing program builder</div>
        </div>
      )}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════

export { WARMUP_CATS, RESISTANCE_MODES, WarmupItem, WarmupSubsection };
