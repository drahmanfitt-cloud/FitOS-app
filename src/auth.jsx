// FitOS — Auth Screen (login / signup)
import React, { useState } from "react";
import { C, supabase } from "./config.js";

export function AuthScreen() {
  const [tab, setTab] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      if (tab === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccess("Account created! Check your email to confirm, then sign in.");
        setTab("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      const notEnabled = /provider is not enabled|unsupported provider/i.test(error.message || "");
      setError(notEnabled
        ? "Google sign-in isn't set up yet. Please use email & password for now."
        : error.message);
      setGoogleLoading(false);
    }
  };

  return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Inter',system-ui,sans-serif",padding:16}}>
      <div style={{width:"100%",maxWidth:400}}>

        {/* Logo */}
        <div style={{textAlign:"center",marginBottom:36}}>
          <div style={{width:52,height:52,borderRadius:14,background:C.green,display:"inline-flex",alignItems:"center",justifyContent:"center",marginBottom:14}}>
            <span style={{fontSize:26,fontWeight:900,color:"#000"}}>F</span>
          </div>
          <div style={{color:C.text,fontWeight:900,fontSize:26,letterSpacing:"-0.02em"}}>FitOS</div>
          <div style={{color:C.muted,fontSize:13,marginTop:4}}>Personal Training Management</div>
        </div>

        {/* Card */}
        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:18,padding:28}}>

          {/* Tabs */}
          <div style={{display:"flex",gap:4,background:C.s2,borderRadius:10,padding:4,marginBottom:24}}>
            {["signin","signup"].map(t => (
              <button key={t} onClick={() => { setTab(t); setError(""); setSuccess(""); }}
                style={{flex:1,padding:"8px 0",borderRadius:7,border:"none",cursor:"pointer",fontWeight:700,fontSize:13,fontFamily:"inherit",
                  background: tab === t ? C.surface : "transparent",
                  color: tab === t ? C.text : C.muted,
                  boxShadow: tab === t ? "0 1px 4px rgba(0,0,0,0.3)" : "none",
                  transition:"all 0.15s"}}>
                {t === "signin" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          {/* Google */}
          <button onClick={handleGoogle} disabled={googleLoading}
            style={{width:"100%",padding:"11px 16px",borderRadius:10,border:`1px solid ${C.border2}`,background:C.s2,color:C.text,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginBottom:18,opacity:googleLoading?0.6:1}}>
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.616z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"/>
              <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"/>
            </svg>
            {googleLoading ? "Redirecting…" : "Continue with Google"}
          </button>

          {/* Divider */}
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18}}>
            <div style={{flex:1,height:1,background:C.border}}/>
            <span style={{color:C.muted,fontSize:12}}>or</span>
            <div style={{flex:1,height:1,background:C.border}}/>
          </div>

          {/* Email form */}
          <form onSubmit={handleSubmit} style={{display:"flex",flexDirection:"column",gap:14}}>
            <div>
              <label style={{display:"block",color:C.sub,fontSize:12,fontWeight:600,marginBottom:5}}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="you@example.com"
                style={{width:"100%",background:C.s2,border:`1px solid ${C.border2}`,borderRadius:9,padding:"10px 13px",color:C.text,fontSize:14,outline:"none",fontFamily:"inherit"}}/>
            </div>
            <div>
              <label style={{display:"block",color:C.sub,fontSize:12,fontWeight:600,marginBottom:5}}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                placeholder={tab === "signup" ? "Min. 6 characters" : "Your password"}
                minLength={tab === "signup" ? 6 : undefined}
                style={{width:"100%",background:C.s2,border:`1px solid ${C.border2}`,borderRadius:9,padding:"10px 13px",color:C.text,fontSize:14,outline:"none",fontFamily:"inherit"}}/>
            </div>

            {error && (
              <div style={{background:C.red+"18",border:`1px solid ${C.red}40`,borderRadius:8,padding:"10px 13px",color:C.red,fontSize:13}}>
                {error}
              </div>
            )}
            {success && (
              <div style={{background:C.green+"18",border:`1px solid ${C.green}40`,borderRadius:8,padding:"10px 13px",color:C.green,fontSize:13}}>
                {success}
              </div>
            )}

            <button type="submit" disabled={loading}
              style={{width:"100%",padding:"11px 16px",borderRadius:10,border:"none",background:loading?C.muted:C.green,color:"#000",fontSize:14,fontWeight:800,cursor:loading?"not-allowed":"pointer",fontFamily:"inherit",marginTop:2,opacity:loading?0.7:1}}>
              {loading ? "Please wait…" : tab === "signin" ? "Sign In" : "Create Account"}
            </button>
          </form>
        </div>

        <div style={{textAlign:"center",marginTop:20,color:C.muted,fontSize:12}}>
          Your data is stored securely in your own Supabase project.
        </div>
      </div>
    </div>
  );
}
