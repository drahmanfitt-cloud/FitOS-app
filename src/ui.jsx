// FitOS — Shared UI components
import React, { useState, useCallback, useEffect, useRef } from "react";
import { C, uid } from "./config.js";

export const Avatar = ({name,size=36,color=C.purple}) => (
  <div style={{width:size,height:size,borderRadius:"50%",background:color+"33",border:`2px solid ${color}55`,display:"flex",alignItems:"center",justifyContent:"center",color,fontWeight:800,fontSize:size*0.38,flexShrink:0}}>
    {name?.[0]?.toUpperCase()||"?"}
  </div>
);

export const Pill = ({children,color=C.green,style:sx={}}) => (
  <span className="fitos-pill" style={{"--pill-col":color,display:"inline-flex",alignItems:"center",fontSize:10,fontWeight:700,letterSpacing:"0.04em",padding:"3px 8px",borderRadius:20,background:color+"1A",color,border:`1px solid ${color}30`,whiteSpace:"nowrap",transition:"border-color 0.15s",...sx}}>{children}</span>
);

export const Btn = ({children,onClick,variant="primary",color=C.green,disabled,style:sx={}}) => {
  const s={primary:{background:disabled?C.muted:color,color:"#000",border:"1px solid transparent"},ghost:{background:color+"15",color,border:`1px solid ${color}30`},outline:{background:"transparent",color:C.sub,border:`1px solid ${C.border}`},danger:{background:C.red+"18",color:C.red,border:`1px solid ${C.red}40`}};
  const hoverCol={primary:color,ghost:color,outline:C.sub,danger:C.red}[variant];
  return <button disabled={disabled} onClick={onClick} className="fitos-btn" style={{"--btn-col":hoverCol,...s[variant],borderRadius:8,cursor:disabled?"not-allowed":"pointer",fontWeight:700,fontSize:12,padding:"8px 14px",display:"inline-flex",alignItems:"center",gap:5,opacity:disabled?0.5:1,transition:"background 0.15s,color 0.15s,border-color 0.15s",...sx}}>{children}</button>;
};

export const NumInput = ({value,onChange,min,max,width=56}) => (
  <input type="number" value={value??""} min={min} max={max}
    onChange={e=>{const v=Number(e.target.value);onChange(max!==undefined?Math.min(max,Math.max(min??0,v)):v);}}
    style={{width,background:C.s2,border:`1px solid ${C.border2}`,borderRadius:8,padding:"7px 8px",color:C.text,fontSize:13,outline:"none",fontFamily:"inherit",textAlign:"center"}}/>
);

export const Card = ({children,style:sx={},...rest}) => (
  <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:18,...sx}} {...rest}>{children}</div>
);

export const SL = ({children,style:sx={}}) => (
  <div style={{fontSize:11,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:C.muted,marginBottom:8,...sx}}>{children}</div>
);

export const Input = ({label,value,onChange,placeholder,type="text",required}) => (
  <div style={{display:"flex",flexDirection:"column",gap:5}}>
    {label&&<label style={{color:C.sub,fontSize:12,fontWeight:600}}>{label}{required&&<span style={{color:C.red}}> *</span>}</label>}
    <input type={type} value={value||""} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      style={{background:C.s2,border:`1px solid ${C.border2}`,borderRadius:8,padding:"9px 12px",color:C.text,fontSize:13,outline:"none",fontFamily:"inherit",width:"100%"}}/>
  </div>
);

export const Select = ({label,value,onChange,options=[],required}) => (
  <div style={{display:"flex",flexDirection:"column",gap:5}}>
    {label&&<label style={{color:C.sub,fontSize:12,fontWeight:600}}>{label}{required&&<span style={{color:C.red}}> *</span>}</label>}
    <select value={value||""} onChange={e=>onChange(e.target.value)}
      style={{background:C.s2,border:`1px solid ${C.border2}`,borderRadius:8,padding:"9px 12px",color:C.text,fontSize:13,outline:"none",fontFamily:"inherit",width:"100%"}}>
      {options.map(o=>typeof o==="string"?<option key={o}>{o}</option>:<option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

export function Modal({title,children,onClose,wide}){
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
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:500,padding:16}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div ref={scrollRef} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:24,width:"100%",maxWidth:wide?720:480,maxHeight:"90vh",overflowY:"auto",WebkitOverflowScrolling:"touch",overscrollBehavior:"contain",touchAction:"pan-y"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <span style={{color:C.text,fontWeight:800,fontSize:16}}>{title}</span>
          <button onClick={onClose} style={{background:"none",border:"none",color:C.muted,fontSize:22,cursor:"pointer",lineHeight:1}}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export const Confirm = ({msg,onConfirm,onCancel}) => (
  <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:600,padding:16}}>
    <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:28,maxWidth:380,width:"100%",textAlign:"center"}}>
      <div style={{color:C.text,fontSize:15,marginBottom:20,lineHeight:1.6}}>{msg}</div>
      <div style={{display:"flex",gap:12,justifyContent:"center"}}>
        <Btn variant="outline" onClick={onCancel}>Cancel</Btn>
        <Btn variant="danger" onClick={onConfirm}>Delete</Btn>
      </div>
    </div>
  </div>
);

export function useToast(){
  const [toasts,setToasts]=useState([]);
  const toast=useCallback((msg,type="success")=>{
    const id=uid();
    setToasts(t=>[...t,{id,msg,type}]);
    setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),3000);
  },[]);
  return[toasts,toast];
}

export const Toast = ({toasts}) => (
  <div style={{position:"fixed",bottom:24,right:24,display:"flex",flexDirection:"column",gap:8,zIndex:999}}>
    {toasts.map(t=>(
      <div key={t.id} style={{background:t.type==="error"?C.red:C.green,color:"#000",borderRadius:10,padding:"10px 18px",fontWeight:700,fontSize:13,boxShadow:"0 4px 20px rgba(0,0,0,0.4)",animation:"slideIn 0.2s ease"}}>
        {t.msg}
      </div>
    ))}
  </div>
);

export class ErrorBoundary extends React.Component {
  constructor(props){super(props);this.state={error:null};}
  static getDerivedStateFromError(e){return{error:e};}
  componentDidCatch(e,info){console.error("FitOS Error:",e,info);}
  render(){
    if(this.state.error){
      return(
        <div style={{background:"#1A0A0A",border:"1px solid #F5445A44",borderRadius:14,padding:32,textAlign:"center",margin:20}}>
          <div style={{fontSize:28,marginBottom:12}}>⚠️</div>
          <div style={{color:"#F5445A",fontWeight:800,fontSize:18,marginBottom:8}}>Something went wrong</div>
          <div style={{color:"#8A92B2",fontSize:12,marginBottom:16,fontFamily:"monospace",background:"#0B0D11",padding:12,borderRadius:8,textAlign:"left",wordBreak:"break-all"}}>{this.state.error?.message||"Unknown error"}</div>
          <button onClick={()=>this.setState({error:null})} style={{background:"#22D98A",border:"none",borderRadius:8,padding:"10px 24px",color:"#000",fontWeight:700,fontSize:13,cursor:"pointer"}}>Try again</button>
        </div>
      );
    }
    return this.props.children;
  }
}
