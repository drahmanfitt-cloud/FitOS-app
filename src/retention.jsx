// FitOS — Client Retention analytics (graphs + at-risk list)
import React, { useMemo } from "react";
import { C, uid, TAG_COLORS } from "./config.js";
import { Avatar, Pill, Btn, Card, SL } from "./ui.jsx";

const DAY = 86400000;
const AT_RISK_DAYS = 14;   // no session in 14+ days → at risk
const LAPSED_DAYS  = 45;   // no session in 45+ days → lapsed

const daysAgo = ts => Math.floor((Date.now() - ts) / DAY);

// Last-session timestamp per client
function lastSessionMap(sessions) {
  const m = {};
  sessions.forEach(s => {
    if (!s.clientId) return;
    const t = new Date(s.startedAt || s.createdAt).getTime();
    if (!m[s.clientId] || t > m[s.clientId]) m[s.clientId] = t;
  });
  return m;
}

// Bucket each active client: engaged / atRisk / lapsed
export function retentionBuckets(clients, sessions) {
  const last = lastSessionMap(sessions);
  const engaged = [], atRisk = [], lapsed = [];
  clients.filter(c => c.status === "active").forEach(c => {
    const ls = last[c.id];
    const entry = { ...c, lastTs: ls || null, days: ls ? daysAgo(ls) : null, sinceDays: ls ? daysAgo(ls) : Infinity };
    if (ls) {
      const d = daysAgo(ls);
      if (d < AT_RISK_DAYS) engaged.push(entry);
      else if (d < LAPSED_DAYS) atRisk.push(entry);
      else lapsed.push(entry);
    } else {
      // Never trained: grace period for brand-new clients, otherwise lapsed.
      const age = c.createdAt ? daysAgo(new Date(c.createdAt).getTime()) : 0;
      if (age < AT_RISK_DAYS) engaged.push(entry);
      else lapsed.push(entry);
    }
  });
  return { engaged, atRisk, lapsed };
}

// ── Tiny SVG chart primitives ────────────────────────────────────────────────
function BarChart({ data, color, mobile }) {
  // data: [{label, value}]
  const W = 100, H = 44, pad = 1.5;
  const max = Math.max(1, ...data.map(d => d.value));
  const bw = W / data.length;
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H + 8}`} style={{ width: "100%", display: "block" }}>
        {data.map((d, i) => {
          const h = (d.value / max) * H;
          return (
            <g key={i}>
              <rect x={i * bw + pad} y={H - h} width={bw - pad * 2} height={Math.max(h, 0.5)}
                rx={1.2} fill={d.value === 0 ? C.border : color} opacity={d.value === 0 ? 0.6 : 0.9} />
              {d.value > 0 && <text x={i * bw + bw / 2} y={H - h - 1.5} textAnchor="middle" fontSize="3.2" fill={C.sub}>{d.value}</text>}
              <text x={i * bw + bw / 2} y={H + 5.5} textAnchor="middle" fontSize="2.8" fill={C.muted}>{d.label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function LineChart({ data, color }) {
  // data: [{label, value}] where value is 0-100 (%)
  const W = 100, H = 40;
  const max = 100;
  const step = data.length > 1 ? W / (data.length - 1) : W;
  const pts = data.map((d, i) => [i * step, H - (d.value / max) * (H - 6) - 3]);
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `${path} L${W},${H} L0,${H} Z`;
  return (
    <svg viewBox={`-4 0 ${W + 8} ${H + 9}`} style={{ width: "100%", display: "block" }}>
      {[25, 50, 75].map(g => {
        const y = H - (g / max) * (H - 6) - 3;
        return <line key={g} x1="0" y1={y} x2={W} y2={y} stroke={C.border} strokeWidth="0.3" />;
      })}
      <path d={area} fill={color} opacity="0.12" />
      <path d={path} fill="none" stroke={color} strokeWidth="1.1" strokeLinejoin="round" strokeLinecap="round" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p[0]} cy={p[1]} r="1.5" fill={color} />
          <text x={p[0]} y={p[1] - 3} textAnchor="middle" fontSize="3.2" fill={C.sub}>{data[i].value}%</text>
          <text x={p[0]} y={H + 7} textAnchor="middle" fontSize="2.8" fill={C.muted}>{data[i].label}</text>
        </g>
      ))}
    </svg>
  );
}

function BreakdownBar({ engaged, atRisk, lapsed }) {
  const total = engaged + atRisk + lapsed;
  if (!total) return null;
  const seg = (n, col, label) => n > 0 && (
    <div style={{ flex: n, background: col, minWidth: 4, display: "flex", alignItems: "center", justifyContent: "center", color: "#000", fontSize: 11, fontWeight: 800 }}>{n}</div>
  );
  return (
    <div>
      <div style={{ display: "flex", height: 26, borderRadius: 8, overflow: "hidden", border: `1px solid ${C.border}` }}>
        {seg(engaged, C.green)}
        {seg(atRisk, C.amber)}
        {seg(lapsed, C.red)}
      </div>
      <div style={{ display: "flex", gap: 14, marginTop: 8, flexWrap: "wrap" }}>
        {[["Engaged (trained <14d)", C.green, engaged], ["At risk (14–45d)", C.amber, atRisk], ["Lapsed (45d+)", C.red, lapsed]].map(([l, col, n]) => (
          <span key={l} style={{ display: "flex", alignItems: "center", gap: 5, color: C.sub, fontSize: 11 }}>
            <span style={{ width: 9, height: 9, borderRadius: 3, background: col, display: "inline-block" }} />{l} · <b style={{ color: C.text }}>{n}</b>
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Main screen ──────────────────────────────────────────────────────────────
function RetentionScreen({ clients, sessions, tasks, onAddTask, setView, setActiveClient, mobile }) {
  const { engaged, atRisk, lapsed } = useMemo(() => retentionBuckets(clients, sessions), [clients, sessions]);
  const activeClients = clients.filter(c => c.status === "active");

  // Weekly sessions — last 12 weeks (8 on mobile)
  const weeks = mobile ? 8 : 12;
  const weekly = useMemo(() => {
    const nowT = Date.now();
    const out = [];
    for (let i = weeks - 1; i >= 0; i--) {
      const end = nowT - i * 7 * DAY;
      const start = end - 7 * DAY;
      const n = sessions.filter(s => { const t = new Date(s.startedAt || s.createdAt).getTime(); return t > start && t <= end; }).length;
      const d = new Date(end);
      out.push({ label: `${d.getMonth() + 1}/${d.getDate()}`, value: n });
    }
    return out;
  }, [sessions, weeks]);

  // Monthly retention % — last 6 months: share of active clients with ≥1 session that month
  const monthly = useMemo(() => {
    const out = [];
    const nowD = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(nowD.getFullYear(), nowD.getMonth() - i, 1);
      const next = new Date(nowD.getFullYear(), nowD.getMonth() - i + 1, 1);
      const trained = new Set(
        sessions.filter(s => { const t = new Date(s.startedAt || s.createdAt).getTime(); return t >= d.getTime() && t < next.getTime(); }).map(s => s.clientId)
      );
      const denom = activeClients.length || 1;
      const n = activeClients.filter(c => trained.has(c.id)).length;
      out.push({ label: d.toLocaleDateString("en-US", { month: "short" }), value: Math.round((n / denom) * 100) });
    }
    return out;
  }, [sessions, clients]);

  const needsAttention = [...atRisk, ...lapsed].sort((a, b) => (b.sinceDays === Infinity ? 1e9 : b.sinceDays) - (a.sinceDays === Infinity ? 1e9 : a.sinceDays));
  const hasOpenCheckin = c => tasks.some(t => !t.done && t.clientId === c.id && /^check in/i.test(t.title || ""));
  const retentionNow = activeClients.length ? Math.round((engaged.length / activeClients.length) * 100) : 0;

  const stat = (label, value, col) => (
    <Card style={{ textAlign: "center", padding: mobile ? "12px 8px" : 16 }}>
      <div style={{ color: col, fontSize: mobile ? 22 : 26, fontWeight: 800 }}>{value}</div>
      <div style={{ color: C.muted, fontSize: 11, marginTop: 3 }}>{label}</div>
    </Card>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: mobile ? 12 : 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: mobile ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: mobile ? 8 : 12 }}>
        {stat("Retention rate", `${retentionNow}%`, retentionNow >= 70 ? C.green : retentionNow >= 40 ? C.amber : C.red)}
        {stat("Engaged clients", engaged.length, C.green)}
        {stat("At risk", atRisk.length, C.amber)}
        {stat("Lapsed", lapsed.length, C.red)}
      </div>

      <Card>
        <SL>Client Engagement Breakdown</SL>
        <div style={{ marginTop: 10 }}>
          {activeClients.length === 0
            ? <div style={{ color: C.muted, fontSize: 13, textAlign: "center", padding: "12px 0" }}>Add clients to see retention stats.</div>
            : <BreakdownBar engaged={engaged.length} atRisk={atRisk.length} lapsed={lapsed.length} />}
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: mobile ? 12 : 16 }}>
        <Card>
          <SL>Sessions per Week</SL>
          <div style={{ color: C.muted, fontSize: 11, marginTop: 2, marginBottom: 8 }}>Training volume · last {weeks} weeks</div>
          <BarChart data={weekly} color={C.blue} mobile={mobile} />
        </Card>
        <Card>
          <SL>Monthly Retention Rate</SL>
          <div style={{ color: C.muted, fontSize: 11, marginTop: 2, marginBottom: 8 }}>% of active clients who trained each month</div>
          <LineChart data={monthly} color={C.green} />
        </Card>
      </div>

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: needsAttention.length ? 12 : 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <SL>Needs Attention</SL>
            {needsAttention.length > 0 && <span style={{ background: C.amber + "22", color: C.amber, fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 10 }}>{needsAttention.length}</span>}
          </div>
        </div>
        {needsAttention.length === 0
          ? <div style={{ color: C.muted, fontSize: 13, textAlign: "center", padding: "14px 0" }}>🎉 All active clients trained in the last {AT_RISK_DAYS} days.</div>
          : needsAttention.map((c, i) => {
            const isLapsed = c.sinceDays >= LAPSED_DAYS || c.sinceDays === Infinity;
            const openTask = hasOpenCheckin(c);
            return (
              <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: i < needsAttention.length - 1 ? `1px solid ${C.border}` : "none" }}>
                <Avatar name={c.name} size={32} color={TAG_COLORS[c.tag] || C.sub} />
                <div style={{ flex: 1, minWidth: 0, cursor: "pointer" }} onClick={() => { setActiveClient(c); setView("client"); }}>
                  <div style={{ color: C.text, fontWeight: 600, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</div>
                  <div style={{ color: C.muted, fontSize: 11 }}>{c.days == null ? "No sessions logged yet" : `Last session ${c.days} day${c.days === 1 ? "" : "s"} ago`}</div>
                </div>
                <Pill color={isLapsed ? C.red : C.amber}>{isLapsed ? "Lapsed" : "At risk"}</Pill>
                {openTask
                  ? <Pill color={C.green}>✓ Check-in planned</Pill>
                  : <Btn variant="ghost" color={C.green} style={{ padding: "5px 10px", fontSize: 11, flexShrink: 0 }}
                      onClick={() => onAddTask({ id: uid(), title: `Check in with ${c.name}`, notes: c.days == null ? "No sessions logged yet." : `No session in ${c.days} days.`, dueDate: new Date().toISOString().slice(0, 10), clientId: c.id })}>
                      + Check-in task
                    </Btn>}
              </div>
            );
          })}
      </Card>
    </div>
  );
}

export { RetentionScreen };
