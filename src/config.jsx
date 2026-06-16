// FitOS — Config, Supabase, Design Tokens & Shared UI
import React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';

import React, { useState, useCallback, useEffect, useRef } from "react";

// ─── Supabase Config ──────────────────────────────────────────────────────────
const SUPABASE_URL = "https://mxbzpunefucxknodoqrc.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14YnpwdW5lZnVjeGtub2RvcXJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0NDY1MjgsImV4cCI6MjA5NzAyMjUyOH0.JuaXxAaAAxfDBQom0DDJdlBNJlsRlkdgsKw87pcch7I";

// Auth token stored in memory — refreshed on login
let _authToken = SUPABASE_KEY; // falls back to anon key until logged in
let _userId = null;

const getHeaders = () => ({
  "Content-Type": "application/json",
  "apikey": SUPABASE_KEY,
  "Authorization": `Bearer ${_authToken}`,
  "Prefer": "return=representation",
});

// ─── Supabase Auth helpers ────────────────────────────────────────────────────
const auth = {
  async signUp(email, password, name) {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: "POST",
      headers: {"Content-Type":"application/json","apikey":SUPABASE_KEY},
      body: JSON.stringify({email, password, data:{full_name:name}}),
    });
    const d = await r.json();
    if (d.error) throw new Error(d.error.message||d.error);
    if (d.access_token) { _authToken=d.access_token; _userId=d.user?.id; }
    return d;
  },
  async signIn(email, password) {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {"Content-Type":"application/json","apikey":SUPABASE_KEY},
      body: JSON.stringify({email, password}),
    });
    const d = await r.json();
    if (d.error) throw new Error(d.error.message||d.error_description||d.error);
    _authToken=d.access_token; _userId=d.user?.id;
    // Persist token
    try{localStorage.setItem("fitos_token",d.access_token);localStorage.setItem("fitos_uid",d.user?.id);}catch{}
    return d;
  },
  async signOut() {
    try{await fetch(`${SUPABASE_URL}/auth/v1/logout`,{method:"POST",headers:getHeaders()});}catch{}
    _authToken=SUPABASE_KEY; _userId=null;
    try{localStorage.removeItem("fitos_token");localStorage.removeItem("fitos_uid");}catch{}
  },
  async getUser() {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/user`,{headers:getHeaders()});
    if (!r.ok) return null;
    return r.json();
  },
  restoreSession() {
    try{
      const t=localStorage.getItem("fitos_token");
      const u=localStorage.getItem("fitos_uid");
      if(t&&u){_authToken=t;_userId=u;return{token:t,userId:u};}
    }catch{}
    return null;
  }
};

// ─── Supabase REST helpers ────────────────────────────────────────────────────
const SHARED_TABLES=["fitos_catalog"]; // no trainer_id filter
const db = {
  async select(table) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*&order=created_at.desc`, { headers:getHeaders() });
    if (!r.ok) throw new Error(`select ${table}: ${await r.text()}`);
    return r.json();
  },
  async insert(table, row) {
    // Auto-stamp trainer_id on private tables
    const rowWithId = SHARED_TABLES.includes(table)||!_userId ? row : {...row, trainer_id:_userId};
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: "POST", headers:getHeaders(), body: JSON.stringify(rowWithId),
    });
    if (!r.ok) throw new Error(`insert ${table}: ${await r.text()}`);
    const data = await r.json();
    return Array.isArray(data) ? data[0] : data;
  },
  async update(table, id, patch) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: "PATCH", headers:getHeaders(), body: JSON.stringify(patch),
    });
    if (!r.ok) throw new Error(`update ${table}: ${await r.text()}`);
    const data = await r.json();
    return Array.isArray(data) ? data[0] : data;
  },
  async delete(table, id) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: "DELETE", headers:getHeaders(),
    });
    if (!r.ok) throw new Error(`delete ${table}: ${await r.text()}`);
  },
};

// ─── Auto-create tables via SQL ───────────────────────────────────────────────
const SETUP_SQL = `
create table if not exists fitos_clients (
  id text primary key,
  name text not null,
  email text,
  phone text,
  dob text,
  tag text default 'General',
  status text default 'active',
  notes text,
  session_count integer default 0,
  program_id text,
  created_at timestamptz default now()
);
create table if not exists fitos_sessions (
  id text primary key,
  client_id text,
  name text,
  notes text,
  exercises jsonb default '[]',
  program_day text,
  started_at timestamptz default now(),
  created_at timestamptz default now()
);
create table if not exists fitos_classes (
  id text primary key,
  name text not null,
  date text,
  time text,
  duration integer default 45,
  capacity integer default 12,
  location text,
  notes text,
  status text default 'scheduled',
  bookings jsonb default '[]',
  format_id text,
  format_name text,
  created_at timestamptz default now()
);
create table if not exists fitos_programs (
  id text primary key,
  name text not null,
  description text,
  weeks integer default 4,
  days_per_week integer default 3,
  days jsonb default '[]',
  assigned_clients jsonb default '[]',
  created_at timestamptz default now()
);
create table if not exists fitos_formats (
  id text primary key,
  name text not null,
  type text default 'circuit',
  description text,
  total_duration integer default 45,
  work_sec integer default 40,
  rest_sec integer default 20,
  rounds integer default 3,
  stations jsonb default '[]',
  created_at timestamptz default now()
);
`;

async function setupTables() {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: "POST", headers, body: JSON.stringify({ sql: SETUP_SQL }),
    });
  } catch (_) {}
  // Fallback: try selecting each table; if it errors the table doesn't exist yet
  // Tables are created via Supabase dashboard SQL editor as a one-time step
}

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
  bg:"#0B0D11", surface:"#13161D", s2:"#1A1E28", s3:"#222738",
  border:"#2A2F42", border2:"#353B52",
  green:"#22D98A", blue:"#4B8EF8", purple:"#9B72F5",
  amber:"#F5A524", red:"#F5445A", teal:"#22C4D9",
  text:"#EDF0FA", sub:"#8A92B2", muted:"#4E566E",
};
const TAG_COLORS = {
  Strength:C.blue,"Fat Loss":C.green,Mobility:C.purple,
  Endurance:C.amber,Rehab:C.red,Hypertrophy:C.blue,General:C.sub,
};
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

// ─── Utils ────────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2,10);
const now = () => new Date().toISOString();
const fmtDate = d => d ? new Date(d).toLocaleDateString("en-US",{month:"short",day:"numeric"}) : "—";
const fmtTime = d => d ? new Date(d).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"}) : "—";
const fmt = s => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
const clamp = (v,lo,hi) => Math.min(hi,Math.max(lo,v));

// Map DB row (snake_case) → app object (camelCase)
const mapClient = r => r ? ({
  id:r.id, name:r.name, email:r.email||"", phone:r.phone||"", dob:r.dob||"",
  tag:r.tag||"General", status:r.status||"active", notes:r.notes||"",
  sessionCount:r.session_count||0, programId:r.program_id||null, createdAt:r.created_at,
}) : null;
const mapSession = r => r ? ({
  id:r.id, clientId:r.client_id, name:r.name||"", notes:r.notes||"",
  exercises:r.exercises||[], programDay:r.program_day||"", startedAt:r.started_at||r.created_at,
}) : null;
const mapClass = r => r ? ({
  id:r.id, name:r.name, date:r.date||"", time:r.time||"", duration:r.duration||45,
  capacity:r.capacity||12, location:r.location||"", notes:r.notes||"",
  status:r.status||"scheduled", bookings:r.bookings||[],
  formatId:r.format_id||null, formatName:r.format_name||null, createdAt:r.created_at,
}) : null;
const mapProgram = r => r ? ({
  id:r.id, name:r.name, description:r.description||"", weeks:r.weeks||4,
  daysPerWeek:r.days_per_week||3, days:r.days||[], assignedClients:r.assigned_clients||[],
  createdAt:r.created_at,
}) : null;
const mapCatalog = r => r ? ({
  id:r.id, name:r.name, category:r.category||"Strength",
  muscles:r.muscles||[], equipment:r.equipment||"Barbell",
  difficulty:r.difficulty||"Intermediate", purpose:r.purpose||"",
  instructions:r.instructions||"",
  videoUrl:r.video_url||"", trainerNotes:r.trainer_notes||"",
  tags:r.tags||[], photoBase64:r.photo_base64||"", createdAt:r.created_at,
}) : null;

const mapFormat = r => r ? ({
  id:r.id, name:r.name, type:r.type||"circuit", description:r.description||"",
  totalDuration:r.total_duration||45, workSec:r.work_sec||40, restSec:r.rest_sec||20,
  rounds:r.rounds||3, stations:r.stations||[], createdAt:r.created_at,
}) : null;

function useToast(){
  const [ts,setTs]=useState([]);
  const toast=(msg,type="success")=>{ const id=uid(); setTs(p=>[...p,{id,msg,type}]); setTimeout(()=>setTs(p=>p.filter(t=>t.id!==id)),2800); };
  return [ts,toast];
}

// ─── Micro UI ─────────────────────────────────────────────────────────────────
const Avatar=({name="?",size=34,color=C.green})=>(
  <div style={{width:size,height:size,borderRadius:"50%",background:color+"22",border:`1.5px solid ${color}44`,display:"flex",alignItems:"center",justifyContent:"center",color,fontWeight:800,fontSize:size*0.38,flexShrink:0}}>{(name||"?").charAt(0).toUpperCase()}</div>
);
const Pill=({children,color=C.green})=>(
  <span style={{display:"inline-flex",alignItems:"center",fontSize:10,fontWeight:700,letterSpacing:"0.04em",padding:"2px 7px",borderRadius:20,background:color+"1A",color,border:`1px solid ${color}30`}}>{children}</span>
);
const Btn=({children,onClick,variant="primary",color=C.green,disabled,style:sx={}})=>{
  const s={primary:{background:disabled?C.muted:color,color:"#000",border:"none"},ghost:{background:color+"15",color,border:`1px solid ${color}30`},outline:{background:"transparent",color:C.sub,border:`1px solid ${C.border}`},danger:{background:C.red+"18",color:C.red,border:`1px solid ${C.red}40`}};
  return <button disabled={disabled} onClick={onClick} style={{...s[variant],borderRadius:8,cursor:disabled?"not-allowed":"pointer",fontWeight:700,fontSize:12,padding:"8px 14px",whiteSpace:"nowrap",display:"inline-flex",alignItems:"center",gap:5,opacity:disabled?0.5:1,...sx}}>{children}</button>;
};
const Input=({label,value,onChange,placeholder,type="text",required,min,max})=>(
  <div style={{display:"flex",flexDirection:"column",gap:5}}>
    {label&&<label style={{color:C.sub,fontSize:12,fontWeight:600}}>{label}{required&&<span style={{color:C.red}}> *</span>}</label>}
    <input type={type} value={value||""} min={min} max={max} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      style={{background:C.s2,border:`1px solid ${C.border2}`,borderRadius:8,padding:"9px 12px",color:C.text,fontSize:13,outline:"none",fontFamily:"inherit",width:"100%"}}/>
  </div>
);
const Select=({label,value,onChange,options,required})=>(
  <div style={{display:"flex",flexDirection:"column",gap:5}}>
    {label&&<label style={{color:C.sub,fontSize:12,fontWeight:600}}>{label}{required&&<span style={{color:C.red}}> *</span>}</label>}
    <select value={value||""} onChange={e=>onChange(e.target.value)} style={{background:C.s2,border:`1px solid ${C.border2}`,borderRadius:8,padding:"9px 12px",color:C.text,fontSize:13,outline:"none",fontFamily:"inherit",cursor:"pointer"}}>
      {options.map(o=><option key={o.value??o} value={o.value??o}>{o.label??o}</option>)}
    </select>
  </div>
);
const Card=({children,style:sx={}})=><div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:18,...sx}}>{children}</div>;
const SL=({children,style:sx={}})=><div style={{fontSize:11,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:C.muted,marginBottom:10,...sx}}>{children}</div>;

const Toast=({toasts})=>(
  <div style={{position:"fixed",bottom:24,right:24,display:"flex",flexDirection:"column",gap:8,zIndex:9999}}>
    {toasts.map(t=><div key={t.id} style={{background:t.type==="success"?C.green:t.type==="error"?C.red:C.blue,color:"#000",padding:"10px 16px",borderRadius:10,fontWeight:700,fontSize:13,boxShadow:"0 4px 20px rgba(0,0,0,0.5)"}}>{t.msg}</div>)}
  </div>
);
function Modal({title,onClose,children,wide}){
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:500,padding:16}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:24,width:wide?660:440,maxWidth:"98vw",maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <span style={{color:C.text,fontWeight:800,fontSize:17}}>{title}</span>
          <button onClick={onClose} style={{background:"none",border:"none",color:C.muted,fontSize:22,cursor:"pointer",lineHeight:1}}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
function Confirm({msg,onConfirm,onCancel}){
  return <Modal title="Confirm" onClose={onCancel}><p style={{color:C.sub,marginBottom:20}}>{msg}</p><div style={{display:"flex",gap:10,justifyContent:"flex-end"}}><Btn variant="outline" onClick={onCancel}>Cancel</Btn><Btn variant="danger" onClick={onConfirm}>Delete</Btn></div></Modal>;
}
function ExPicker({onPick,onClose}){
  const [q,setQ]=useState("");
  const hits=EXERCISES.filter(e=>e.toLowerCase().includes(q.toLowerCase()));
  return(
    <div>
      <input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder="Search or type custom name…"
        style={{width:"100%",background:C.s2,border:`1px solid ${C.border2}`,borderRadius:8,padding:"9px 12px",color:C.text,fontSize:13,outline:"none",fontFamily:"inherit",marginBottom:10}}/>
      <div style={{maxHeight:240,overflowY:"auto",display:"flex",flexDirection:"column",gap:2}}>
        {q&&!EXERCISES.includes(q)&&<div onClick={()=>{onPick(q);onClose();}} style={{padding:"8px 10px",borderRadius:7,cursor:"pointer",color:C.green,fontSize:13,display:"flex",gap:8,alignItems:"center"}}><Pill color={C.purple}>custom</Pill>{q}</div>}
        {hits.map(e=><div key={e} onClick={()=>{onPick(e);onClose();}} style={{padding:"8px 10px",borderRadius:7,cursor:"pointer",color:C.text,fontSize:13}} onMouseEnter={el=>el.currentTarget.style.background=C.s2} onMouseLeave={el=>el.currentTarget.style.background="transparent"}>{e}</div>)}
      </div>
    </div>
  );
}

// ─── Loading spinner ──────────────────────────────────────────────────────────
function Spinner({msg="Loading…"}){
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:60,gap:16}}>
      <div style={{width:36,height:36,border:`3px solid ${C.border}`,borderTop:`3px solid ${C.green}`,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
      <div style={{color:C.sub,fontSize:13}}>{msg}</div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ─── Setup screen shown when tables don't exist yet ───────────────────────────
function SetupScreen({onSetupDone}){
  const [step,setStep]=useState("idle"); // idle | running | done | error
  const [err,setErr]=useState("");

  const SQL = `
-- Run this in Supabase → SQL Editor → New query

create table if not exists fitos_clients (
  id text primary key, name text not null, email text, phone text, dob text,
  tag text default 'General', status text default 'active', notes text,
  session_count integer default 0, program_id text,
  created_at timestamptz default now()
);
create table if not exists fitos_sessions (
  id text primary key, client_id text, name text, notes text,
  exercises jsonb default '[]', program_day text,
  started_at timestamptz default now(), created_at timestamptz default now()
);
create table if not exists fitos_classes (
  id text primary key, name text not null, date text, time text,
  duration integer default 45, capacity integer default 12,
  location text, notes text, status text default 'scheduled',
  bookings jsonb default '[]', format_id text, format_name text,
  created_at timestamptz default now()
);
create table if not exists fitos_programs (
  id text primary key, name text not null, description text,
  weeks integer default 4, days_per_week integer default 3,
  days jsonb default '[]', assigned_clients jsonb default '[]',
  created_at timestamptz default now()
);
create table if not exists fitos_formats (
  id text primary key, name text not null, type text default 'circuit',
  description text, total_duration integer default 45,
  work_sec integer default 40, rest_sec integer default 20,
  rounds integer default 3, stations jsonb default '[]',
  created_at timestamptz default now()
);

-- Allow public access (since we use the anon key)
alter table fitos_clients enable row level security;
alter table fitos_sessions enable row level security;
alter table fitos_classes enable row level security;
alter table fitos_programs enable row level security;
alter table fitos_formats enable row level security;

create policy if not exists "public_all" on fitos_clients for all using (true) with check (true);
create policy if not exists "public_all" on fitos_sessions for all using (true) with check (true);
create policy if not exists "public_all" on fitos_classes for all using (true) with check (true);
create policy if not exists "public_all" on fitos_programs for all using (true) with check (true);
create policy if not exists "public_all" on fitos_formats for all using (true) with check (true);
  `.trim();

  const verify = async () => {
    setStep("running");
    try {
      // Use a HEAD request — just checks the table exists, doesn't need RLS read permission
      const r = await fetch(`${SUPABASE_URL}/rest/v1/fitos_clients?limit=0`, {
        method: "GET",
        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${SUPABASE_KEY}`,
        },
      });
      if (r.ok || r.status === 200 || r.status === 406) {
        // 406 = table exists but no rows match — still means table is there
        setStep("done");
        setTimeout(onSetupDone, 1200);
      } else {
        throw new Error(`status ${r.status}`);
      }
    } catch(e) {
      setStep("error");
      setErr(`Could not reach tables (${e.message}). Double-check you ran all the SQL in Supabase and that your anon key is correct.`);
    }
  };

  return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Inter',system-ui,sans-serif",padding:24}}>
      <div style={{maxWidth:680,width:"100%"}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{width:48,height:48,borderRadius:12,background:C.green,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}><span style={{fontSize:24,fontWeight:900,color:"#000"}}>F</span></div>
          <div style={{color:C.text,fontWeight:800,fontSize:24,marginBottom:8}}>One-time database setup</div>
          <div style={{color:C.sub,fontSize:14}}>You only need to do this once. It takes about 2 minutes.</div>
        </div>

        {/* Steps */}
        <div style={{display:"flex",flexDirection:"column",gap:16,marginBottom:24}}>
          {[
            {n:"1", title:"Open Supabase SQL Editor", desc:'Go to your Supabase dashboard → click "SQL Editor" in the left sidebar → click "New query"'},
            {n:"2", title:"Copy and paste this SQL", desc:"Select all the SQL below, copy it, and paste it into the SQL editor"},
            {n:"3", title:"Click Run", desc:'Press the green "Run" button (or Ctrl+Enter). You should see "Success. No rows returned."'},
            {n:"4", title:"Come back here and click Verify", desc:"Once the SQL has run, click the button below to confirm everything is set up"},
          ].map(s=>(
            <div key={s.n} style={{display:"flex",gap:14,background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:16}}>
              <div style={{width:28,height:28,borderRadius:"50%",background:C.green+"20",border:`2px solid ${C.green}`,display:"flex",alignItems:"center",justifyContent:"center",color:C.green,fontWeight:900,fontSize:13,flexShrink:0}}>{s.n}</div>
              <div><div style={{color:C.text,fontWeight:700,fontSize:14,marginBottom:3}}>{s.title}</div><div style={{color:C.sub,fontSize:13}}>{s.desc}</div></div>
            </div>
          ))}
        </div>

        {/* SQL box */}
        <div style={{background:C.s2,border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden",marginBottom:20}}>
          <div style={{background:C.s3,padding:"10px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:`1px solid ${C.border}`}}>
            <span style={{color:C.sub,fontSize:12,fontWeight:700}}>SQL to run in Supabase</span>
            <button onClick={()=>{navigator.clipboard.writeText(SQL);}} style={{background:C.green+"18",border:`1px solid ${C.green}33`,borderRadius:6,padding:"4px 12px",color:C.green,fontSize:11,fontWeight:700,cursor:"pointer"}}>Copy SQL</button>
          </div>
          <pre style={{padding:16,margin:0,color:C.sub,fontSize:11,lineHeight:1.7,overflowX:"auto",fontFamily:"monospace",maxHeight:240,overflowY:"auto"}}>{SQL}</pre>
        </div>

        {step==="error"&&<div style={{background:C.red+"18",border:`1px solid ${C.red}44`,borderRadius:10,padding:"10px 16px",color:C.red,fontSize:13,marginBottom:16}}>{err}</div>}
        {step==="done"&&<div style={{background:C.green+"18",border:`1px solid ${C.green}44`,borderRadius:10,padding:"10px 16px",color:C.green,fontSize:13,fontWeight:700,marginBottom:16}}>✓ Tables found! Loading FitOS…</div>}

        <Btn disabled={step==="running"||step==="done"} onClick={verify} style={{width:"100%",justifyContent:"center",padding:"13px"}}>
          {step==="running"?"Checking…":step==="done"?"✓ Done!":"✓ I ran the SQL — verify setup"}
        </Btn>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLIENTS
// ═══════════════════════════════════════════════════════════════════════════════

function ClientForm({initial,onSave,onClose}){
  const EMPTY={name:"",email:"",phone:"",dob:"",tag:"General",status:"active",notes:""};
  const [f,setF]=useState(initial||EMPTY);
  const set=k=>v=>setF(p=>({...p,[k]:v}));
  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Input label="Full name" value={f.name} onChange={set("name")} required/>
        <Input label="Email" value={f.email} onChange={set("email")} type="email"/>
        <Input label="Phone" value={f.phone} onChange={set("phone")}/>
        <Input label="Date of birth" value={f.dob} onChange={set("dob")} type="date"/>
        <Select label="Focus" value={f.tag} onChange={set("tag")} options={["General","Strength","Fat Loss","Hypertrophy","Endurance","Mobility","Rehab"]}/>
        <Select label="Status" value={f.status} onChange={set("status")} options={["active","inactive","prospect"]}/>
      </div>
      <Input label="Notes" value={f.notes} onChange={set("notes")} placeholder="Injuries, goals…"/>
      <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}><Btn variant="outline" onClick={onClose}>Cancel</Btn><Btn disabled={!f.name.trim()} onClick={()=>onSave(f)}>Save Client</Btn></div>
    </div>
  );
}

function ClientsScreen({clients,onAdd,onEdit,onDelete,programs,setView,setActiveClient}){
  const [search,setSearch]=useState("");
  const [modal,setModal]=useState(null);
  const [confirm,setConfirm]=useState(null);
  const [saving,setSaving]=useState(false);
  const SC={active:C.green,inactive:C.red,prospect:C.amber};
  const filtered=clients.filter(c=>(c.name||"").toLowerCase().includes(search.toLowerCase())||(c.email||"").toLowerCase().includes(search.toLowerCase()));

  const save=async(f)=>{ setSaving(true); if(modal==="add") await onAdd(f); else await onEdit(modal.client.id,f); setSaving(false); setModal(null); };

  return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{display:"flex",gap:10}}>
        <div style={{flex:1,background:C.surface,border:`1px solid ${C.border}`,borderRadius:9,padding:"10px 14px",display:"flex",alignItems:"center",gap:8}}>
          <span style={{color:C.muted}}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search clients…" style={{background:"none",border:"none",color:C.text,fontSize:14,flex:1,outline:"none",fontFamily:"inherit"}}/>
        </div>
        <Btn onClick={()=>setModal("add")}>+ New Client</Btn>
      </div>
      {filtered.length===0?(
        <Card style={{textAlign:"center",padding:48}}>
          <div style={{fontSize:32,marginBottom:10}}>👥</div>
          <div style={{color:C.sub,marginBottom:16}}>{search?"No matches.":"Add your first client."}</div>
          {!search&&<Btn onClick={()=>setModal("add")}>+ Add Client</Btn>}
        </Card>
      ):(
        <Card style={{padding:0,overflow:"hidden"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead style={{background:C.s2}}>
              <tr>{["Client","Focus","Status","Program","Sessions","Added",""].map(h=><th key={h} style={{textAlign:"left",color:C.muted,fontSize:11,fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",padding:"12px 16px",borderBottom:`1px solid ${C.border}`}}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.map(c=>{
                const prog=programs.find(p=>p.id===c.programId);
                return(
                  <tr key={c.id} style={{borderBottom:`1px solid ${C.border}`,cursor:"pointer"}}
                    onMouseEnter={e=>e.currentTarget.style.background=C.s2} onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                    onClick={()=>{setActiveClient(c);setView("client");}}>
                    <td style={{padding:"12px 16px"}}><div style={{display:"flex",alignItems:"center",gap:10}}><Avatar name={c.name} size={30} color={TAG_COLORS[c.tag]||C.sub}/><div><div style={{color:C.text,fontWeight:600,fontSize:14}}>{c.name}</div><div style={{color:C.muted,fontSize:11}}>{c.email||"—"}</div></div></div></td>
                    <td style={{padding:"12px 16px"}}><Pill color={TAG_COLORS[c.tag]||C.sub}>{c.tag}</Pill></td>
                    <td style={{padding:"12px 16px"}}><Pill color={SC[c.status]||C.sub}>{c.status}</Pill></td>
                    <td style={{padding:"12px 16px"}}>{prog?<Pill color={C.purple}>{prog.name}</Pill>:<span style={{color:C.muted,fontSize:12}}>—</span>}</td>
                    <td style={{padding:"12px 16px",color:C.sub,fontSize:14}}>{c.sessionCount||0}</td>
                    <td style={{padding:"12px 16px",color:C.muted,fontSize:13}}>{fmtDate(c.createdAt)}</td>
                    <td style={{padding:"12px 16px"}}><div style={{display:"flex",gap:6}} onClick={e=>e.stopPropagation()}>
                      <Btn variant="ghost" color={C.blue} style={{padding:"5px 10px",fontSize:11}} onClick={()=>setModal({client:c})}>Edit</Btn>
                      <Btn variant="danger" style={{padding:"5px 10px",fontSize:11}} onClick={()=>setConfirm(c.id)}>Delete</Btn>
                    </div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
      {(modal==="add"||modal?.client)&&<Modal title={modal==="add"?"New Client":"Edit Client"} onClose={()=>setModal(null)} wide><ClientForm initial={modal?.client} onSave={save} onClose={()=>setModal(null)}/></Modal>}
      {confirm&&<Confirm msg="Delete this client?" onConfirm={async()=>{await onDelete(confirm);setConfirm(null);}} onCancel={()=>setConfirm(null)}/>}
    </div>
  );
}

function ClientProfile({client,sessions,programs,onEdit,setView,setActiveClient}){
  const [modal,setModal]=useState(null);
  const prog=programs.find(p=>p.id===client.programId);
  const clientSessions=sessions.filter(s=>s.clientId===client.id).sort((a,b)=>new Date(b.startedAt)-new Date(a.startedAt));
  return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <Card style={{display:"flex",alignItems:"flex-start",gap:16}}>
        <Avatar name={client.name} size={56} color={TAG_COLORS[client.tag]||C.sub}/>
        <div style={{flex:1}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4,flexWrap:"wrap"}}>
            <span style={{color:C.text,fontWeight:800,fontSize:20}}>{client.name}</span>
            <Pill color={client.status==="active"?C.green:client.status==="inactive"?C.red:C.amber}>{client.status}</Pill>
            <Pill color={TAG_COLORS[client.tag]||C.sub}>{client.tag}</Pill>
            {prog&&<Pill color={C.purple}>📋 {prog.name}</Pill>}
          </div>
          <div style={{color:C.sub,fontSize:13}}>{client.email||"No email"} {client.phone&&`· ${client.phone}`}</div>
          {client.notes&&<div style={{color:C.muted,fontSize:12,marginTop:6,fontStyle:"italic"}}>"{client.notes}"</div>}
        </div>
        <div style={{display:"flex",gap:8}}>
          <Btn variant="ghost" color={C.blue} onClick={()=>setModal("edit")}>Edit</Btn>
          <Btn onClick={()=>setView("sessions")}>+ Log Session</Btn>
        </div>
      </Card>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
        {[{label:"Sessions",val:clientSessions.length,color:C.green},{label:"Last Session",val:clientSessions[0]?fmtDate(clientSessions[0].startedAt):"Never",color:C.blue},{label:"Client Since",val:fmtDate(client.createdAt),color:C.sub}].map(s=>(
          <Card key={s.label} style={{textAlign:"center",padding:16}}><div style={{color:C.muted,fontSize:11,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4}}>{s.label}</div><div style={{color:s.color,fontWeight:800,fontSize:22}}>{s.val}</div></Card>
        ))}
      </div>
      {prog&&(
        <Card style={{borderColor:C.purple+"44"}}>
          <SL>Assigned Program — {prog.name}</SL>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:8}}>
            {prog.days?.map(d=>(
              <div key={d.id} style={{background:C.s2,borderRadius:9,padding:"10px 12px",border:`1px solid ${C.border}`}}>
                <div style={{color:C.text,fontWeight:700,fontSize:13,marginBottom:2}}>{d.label}</div>
                {d.focus&&<div style={{marginBottom:6}}><Pill color={C.purple}>{d.focus}</Pill></div>}
                {d.exercises?.slice(0,3).map(e=><div key={e.id} style={{color:C.sub,fontSize:11,marginTop:2}}>· {e.name} {e.sets}×{e.reps}</div>)}
                {d.exercises?.length>3&&<div style={{color:C.muted,fontSize:10,marginTop:2}}>+{d.exercises.length-3} more</div>}
              </div>
            ))}
          </div>
        </Card>
      )}
      <Card>
        <SL>Session History</SL>
        {clientSessions.length===0?<div style={{textAlign:"center",padding:"24px 0",color:C.muted}}>No sessions yet. <span onClick={()=>setView("sessions")} style={{color:C.green,cursor:"pointer"}}>Log the first one →</span></div>:(
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {clientSessions.map(s=>(
              <div key={s.id} style={{background:C.s2,borderRadius:10,padding:"12px 14px",border:`1px solid ${C.border}`}}>
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <div><div style={{color:C.text,fontWeight:700,fontSize:14}}>{s.name||"Untitled"}</div><div style={{color:C.muted,fontSize:12,marginTop:2}}>{fmtDate(s.startedAt)} · {s.exercises?.length||0} exercises · {s.exercises?.reduce((a,e)=>a+(e.sets?.length||0),0)||0} sets{s.programDay?` · ${s.programDay}`:""}</div></div>
                  <span style={{color:C.muted,fontSize:11}}>{fmtTime(s.startedAt)}</span>
                </div>
                {s.notes&&<div style={{color:C.sub,fontSize:12,marginTop:6,fontStyle:"italic"}}>{s.notes}</div>}
                {s.exercises?.some(e=>e.sets?.some(st=>st.pr))&&(
                  <div style={{marginTop:8,display:"flex",gap:6,flexWrap:"wrap"}}>
                    {s.exercises.flatMap(e=>e.sets?.filter(st=>st.pr).map(st=><Pill key={st.id} color={C.amber}>🏆 {e.name}: {st.weight}kg×{st.reps}</Pill>))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
      {modal==="edit"&&<Modal title="Edit Client" onClose={()=>setModal(null)} wide><ClientForm initial={client} onSave={async f=>{await onEdit(client.id,f);setActiveClient(p=>({...p,...f}));setModal(null);}} onClose={()=>setModal(null)}/></Modal>}
    </div>
  );
}

