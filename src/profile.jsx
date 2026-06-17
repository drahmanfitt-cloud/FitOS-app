// FitOS — Trainer Profile Setup + Profile Editor
import React, { useState } from "react";
import { C, supabase } from "./config.js";

const SPECIALTIES = [
  "Strength","Hypertrophy","HIIT","CrossFit","Yoga","Pilates",
  "Mobility","Sports Performance","Weight Loss","Rehabilitation",
  "Nutrition","Running","Cycling","Boxing","Functional Fitness",
];

export function ProfileSetup({ user, onComplete }) {
  const [name, setName] = useState(user?.user_metadata?.full_name || "");
  const [gym, setGym] = useState("");
  const [role, setRole] = useState("Head Coach");
  const [selected, setSelected] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const toggleSpec = s => setSelected(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);

  const save = async () => {
    if (!name.trim()) { setError("Please enter your name."); return; }
    setSaving(true);
    setError("");
    try {
      const { error } = await supabase
        .from("fitos_trainer_profiles")
        .upsert({ id: user.id, name: name.trim(), gym: gym.trim(), role: role.trim(), specialties: selected });
      if (error) throw error;
      onComplete({ id: user.id, name: name.trim(), gym: gym.trim(), role: role.trim(), specialties: selected });
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Inter',system-ui,sans-serif",padding:16}}>
      <div style={{width:"100%",maxWidth:480}}>

        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{width:52,height:52,borderRadius:14,background:C.green,display:"inline-flex",alignItems:"center",justifyContent:"center",marginBottom:14}}>
            <span style={{fontSize:26,fontWeight:900,color:"#000"}}>F</span>
          </div>
          <div style={{color:C.text,fontWeight:900,fontSize:22}}>Set up your trainer profile</div>
          <div style={{color:C.muted,fontSize:13,marginTop:6}}>This takes 30 seconds. You can update it anytime.</div>
        </div>

        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:18,padding:28,display:"flex",flexDirection:"column",gap:20}}>

          <div>
            <label style={{display:"block",color:C.sub,fontSize:12,fontWeight:600,marginBottom:6}}>Full name <span style={{color:C.red}}>*</span></label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Jordan Reeves"
              style={{width:"100%",background:C.s2,border:`1px solid ${C.border2}`,borderRadius:9,padding:"10px 13px",color:C.text,fontSize:14,outline:"none",fontFamily:"inherit"}}/>
          </div>

          <div>
            <label style={{display:"block",color:C.sub,fontSize:12,fontWeight:600,marginBottom:6}}>Gym / Studio name</label>
            <input value={gym} onChange={e => setGym(e.target.value)} placeholder="e.g. Peak Performance Gym"
              style={{width:"100%",background:C.s2,border:`1px solid ${C.border2}`,borderRadius:9,padding:"10px 13px",color:C.text,fontSize:14,outline:"none",fontFamily:"inherit"}}/>
          </div>

          <div>
            <label style={{display:"block",color:C.sub,fontSize:12,fontWeight:600,marginBottom:6}}>Your role / title</label>
            <input value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Head Coach, Personal Trainer"
              style={{width:"100%",background:C.s2,border:`1px solid ${C.border2}`,borderRadius:9,padding:"10px 13px",color:C.text,fontSize:14,outline:"none",fontFamily:"inherit"}}/>
          </div>

          <div>
            <label style={{display:"block",color:C.sub,fontSize:12,fontWeight:600,marginBottom:10}}>Specialties <span style={{color:C.muted,fontWeight:400}}>(pick any that apply)</span></label>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {SPECIALTIES.map(s => {
                const on = selected.includes(s);
                return (
                  <button key={s} onClick={() => toggleSpec(s)}
                    style={{padding:"6px 13px",borderRadius:20,border:`1px solid ${on ? C.green : C.border2}`,background:on ? C.green+"18" : "transparent",color:on ? C.green : C.sub,fontSize:12,fontWeight:on ? 700 : 500,cursor:"pointer",fontFamily:"inherit",transition:"all 0.15s"}}>
                    {on ? "✓ " : ""}{s}
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div style={{background:C.red+"18",border:`1px solid ${C.red}40`,borderRadius:8,padding:"10px 13px",color:C.red,fontSize:13}}>
              {error}
            </div>
          )}

          <button onClick={save} disabled={saving}
            style={{width:"100%",padding:"12px 16px",borderRadius:10,border:"none",background:saving?C.muted:C.green,color:"#000",fontSize:14,fontWeight:800,cursor:saving?"not-allowed":"pointer",fontFamily:"inherit",opacity:saving?0.7:1}}>
            {saving ? "Saving…" : "Enter FitOS →"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProfileEditor({ profile, onSave, onClose, onSignOut }) {
  const [name, setName] = useState(profile.name || "");
  const [gym, setGym] = useState(profile.gym || "");
  const [role, setRole] = useState(profile.role || "");
  const [selected, setSelected] = useState(profile.specialties || []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const toggleSpec = s => setSelected(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);

  const save = async () => {
    if (!name.trim()) { setError("Name is required."); return; }
    setSaving(true);
    setError("");
    try {
      const { error } = await supabase
        .from("fitos_trainer_profiles")
        .upsert({ id: profile.id, name: name.trim(), gym: gym.trim(), role: role.trim(), specialties: selected });
      if (error) throw error;
      onSave({ ...profile, name: name.trim(), gym: gym.trim(), role: role.trim(), specialties: selected });
      onClose();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:600,padding:16,fontFamily:"'Inter',system-ui,sans-serif"}}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:18,padding:28,width:"100%",maxWidth:460,maxHeight:"90vh",overflowY:"auto"}}>

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
          <span style={{color:C.text,fontWeight:800,fontSize:17}}>My Profile</span>
          <button onClick={onClose} style={{background:"none",border:"none",color:C.muted,fontSize:22,cursor:"pointer",lineHeight:1}}>×</button>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div>
            <label style={{display:"block",color:C.sub,fontSize:12,fontWeight:600,marginBottom:6}}>Full name <span style={{color:C.red}}>*</span></label>
            <input value={name} onChange={e => setName(e.target.value)}
              style={{width:"100%",background:C.s2,border:`1px solid ${C.border2}`,borderRadius:9,padding:"10px 13px",color:C.text,fontSize:14,outline:"none",fontFamily:"inherit"}}/>
          </div>
          <div>
            <label style={{display:"block",color:C.sub,fontSize:12,fontWeight:600,marginBottom:6}}>Gym / Studio</label>
            <input value={gym} onChange={e => setGym(e.target.value)}
              style={{width:"100%",background:C.s2,border:`1px solid ${C.border2}`,borderRadius:9,padding:"10px 13px",color:C.text,fontSize:14,outline:"none",fontFamily:"inherit"}}/>
          </div>
          <div>
            <label style={{display:"block",color:C.sub,fontSize:12,fontWeight:600,marginBottom:6}}>Role / Title</label>
            <input value={role} onChange={e => setRole(e.target.value)}
              style={{width:"100%",background:C.s2,border:`1px solid ${C.border2}`,borderRadius:9,padding:"10px 13px",color:C.text,fontSize:14,outline:"none",fontFamily:"inherit"}}/>
          </div>
          <div>
            <label style={{display:"block",color:C.sub,fontSize:12,fontWeight:600,marginBottom:10}}>Specialties</label>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {SPECIALTIES.map(s => {
                const on = selected.includes(s);
                return (
                  <button key={s} onClick={() => toggleSpec(s)}
                    style={{padding:"6px 13px",borderRadius:20,border:`1px solid ${on ? C.green : C.border2}`,background:on ? C.green+"18" : "transparent",color:on ? C.green : C.sub,fontSize:12,fontWeight:on ? 700 : 500,cursor:"pointer",fontFamily:"inherit"}}>
                    {on ? "✓ " : ""}{s}
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div style={{background:C.red+"18",border:`1px solid ${C.red}40`,borderRadius:8,padding:"10px 13px",color:C.red,fontSize:13}}>
              {error}
            </div>
          )}

          <div style={{display:"flex",gap:10,marginTop:4}}>
            <button onClick={save} disabled={saving}
              style={{flex:1,padding:"11px 16px",borderRadius:10,border:"none",background:saving?C.muted:C.green,color:"#000",fontSize:14,fontWeight:800,cursor:saving?"not-allowed":"pointer",fontFamily:"inherit"}}>
              {saving ? "Saving…" : "Save Changes"}
            </button>
            <button onClick={onClose}
              style={{padding:"11px 16px",borderRadius:10,border:`1px solid ${C.border}`,background:"transparent",color:C.sub,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
              Cancel
            </button>
          </div>

          <div style={{borderTop:`1px solid ${C.border}`,paddingTop:16,marginTop:4}}>
            <button onClick={onSignOut}
              style={{width:"100%",padding:"10px 16px",borderRadius:10,border:`1px solid ${C.red}40`,background:C.red+"10",color:C.red,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
