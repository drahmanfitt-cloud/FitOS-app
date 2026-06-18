// FitOS — Supabase config, design tokens, helpers
// ─────────────────────────────────────────────────────────────────────────────
import { createClient } from "@supabase/supabase-js";

export const SUPABASE_URL = "https://mxbzpunefucxknodoqrc.supabase.co";
export const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14YnpwdW5lZnVjeGtub2RvcXJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0NDY1MjgsImV4cCI6MjA5NzAyMjUyOH0.JuaXxAaAAxfDBQom0DDJdlBNJlsRlkdgsKw87pcch7I";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const C = {
  bg:"#0B0D11", surface:"#13161D", s2:"#1A1E28", s3:"#222738",
  border:"#2A2F42", border2:"#353B52",
  green:"#22D98A", blue:"#4B8EF8", purple:"#9B72F5",
  amber:"#F5A524", red:"#F5445A", teal:"#22C4D9",
  text:"#EDF0FA", sub:"#8A92B2", muted:"#4E566E",
};

export const TAG_COLORS = {Active:C.green,Inactive:"#F5445A",Lead:"#4B8EF8",VIP:"#9B72F5"};

export const uid = () => Math.random().toString(36).slice(2,10);
export const now = () => new Date().toISOString();
export const fmtDate = d => d ? new Date(d).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) : "—";
export const fmtTime = d => d ? new Date(d).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"}) : "—";
export const fmt = s => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
export const clamp = (v,mn,mx) => Math.min(mx,Math.max(mn,v));

// Tables that are shared across all trainers (no trainer_id filter)
const SHARED_TABLES = ["fitos_catalog"];

// Get the current session's access token (falls back to anon key if not logged in)
async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token || SUPABASE_KEY;
  return {
    "Content-Type": "application/json",
    "apikey": SUPABASE_KEY,
    "Authorization": `Bearer ${token}`,
    "Prefer": "return=representation",
  };
}

async function getTrainerId() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id || null;
}

export const db = {
  async select(table) {
    const headers = await getAuthHeaders();
    const trainerId = await getTrainerId();
    const filter = (!SHARED_TABLES.includes(table) && trainerId)
      ? `&trainer_id=eq.${trainerId}` : "";
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*&order=created_at.desc${filter}`, { headers });
    if (!r.ok) throw new Error(`select ${table}: ${await r.text()}`);
    return r.json();
  },
  async insert(table, row) {
    const headers = await getAuthHeaders();
    const trainerId = await getTrainerId();
    const fullRow = (!SHARED_TABLES.includes(table) && trainerId)
      ? { ...row, trainer_id: trainerId } : row;
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, { method:"POST", headers, body:JSON.stringify(fullRow) });
    if (!r.ok) throw new Error(`insert ${table}: ${await r.text()}`);
    const data = await r.json();
    return Array.isArray(data) ? data[0] : data;
  },
  async insertMany(table, rows) {
    if (!rows.length) return [];
    const headers = await getAuthHeaders();
    const trainerId = await getTrainerId();
    const fullRows = (!SHARED_TABLES.includes(table) && trainerId)
      ? rows.map(r => ({ ...r, trainer_id: trainerId })) : rows;
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, { method:"POST", headers, body:JSON.stringify(fullRows) });
    if (!r.ok) throw new Error(`insertMany ${table}: ${await r.text()}`);
    return r.json();
  },
  async update(table, id, patch) {
    const headers = await getAuthHeaders();
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, { method:"PATCH", headers, body:JSON.stringify(patch) });
    if (!r.ok) throw new Error(`update ${table}: ${await r.text()}`);
    const data = await r.json();
    return Array.isArray(data) ? data[0] : data;
  },
  async delete(table, id) {
    const headers = await getAuthHeaders();
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, { method:"DELETE", headers });
    if (!r.ok) throw new Error(`delete ${table}: ${await r.text()}`);
  },
};

export const mapClient  = r => r ? ({id:r.id,name:r.name,email:r.email||"",phone:r.phone||"",dob:r.dob||"",tag:r.tag||"Active",status:r.status||"active",notes:r.notes||"",sessionCount:r.session_count||0,programId:r.program_id||null,goals:r.goals||[],bodyweightLog:r.bodyweight_log||[],createdAt:r.created_at}) : null;
export const mapSession = r => r ? ({id:r.id,clientId:r.client_id,name:r.name||"",notes:r.notes||"",exercises:r.exercises||[],warmup:r.warmup||[],programDay:r.program_day||"",startedAt:r.started_at,createdAt:r.created_at}) : null;
export const mapClass   = r => r ? ({id:r.id,name:r.name,date:r.date||"",time:r.time||"",duration:r.duration||60,capacity:r.capacity||10,location:r.location||"",notes:r.notes||"",focus:r.focus||"",seriesId:r.series_id||null,status:r.status||"scheduled",bookings:r.bookings||[],formatId:r.format_id||null,formatName:r.format_name||"",createdAt:r.created_at}) : null;
export const mapProgram = r => r ? ({id:r.id,name:r.name,description:r.description||"",weeks:r.weeks||4,daysPerWeek:r.days_per_week||3,days:r.days||[],warmup:r.warmup||[],assignedClients:r.assigned_clients||[],createdAt:r.created_at}) : null;
export const mapFormat  = r => r ? ({id:r.id,name:r.name,type:r.type||"circuit",description:r.description||"",totalDuration:r.total_duration||45,workSec:r.work_sec||40,restSec:r.rest_sec||20,rounds:r.rounds||3,stations:r.stations||[],createdAt:r.created_at}) : null;
export const mapCatalog = r => r ? ({id:r.id,name:r.name,category:r.category||"Strength",muscles:r.muscles||[],equipment:r.equipment||"Barbell",difficulty:r.difficulty||"Intermediate",purpose:r.purpose||"",instructions:r.instructions||"",videoUrl:r.video_url||"",trainerNotes:r.trainer_notes||"",tags:r.tags||[],photoBase64:r.photo_base64||"",createdAt:r.created_at}) : null;
