import React, { useMemo, useState } from "react";
import { C } from "./config.js";
import { Card, Pill } from "./ui.jsx";
import { buildStatistics, formatDay } from "./dashboard-statistics-data.mjs";
import "./dashboard-statistics.css";

function Trend({ buckets, metric, color, label, total }) {
  const max = Math.max(1, ...buckets.map(b => b[metric]));
  const width = 480, height = 122, step = width / buckets.length;
  return <section className="stats-panel" aria-label={label} style={{"--stats-accent":color}}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
      <h3 style={{ margin: 0, color: C.sub, fontSize: 12, fontWeight: 600 }}>{label}</h3>
      <strong className="stats-value" style={{ fontSize: 26, color }}>{total}</strong>
    </div>
    <svg role="img" aria-label={`${label}: ${total} in selected period. Dated bucket values available below.`} viewBox={`0 0 ${width} ${height + 26}`} style={{ width: "100%", display: "block", marginTop: 8 }}>
      <line x1="0" x2={width} y1={height} y2={height} stroke={C.border} />
      {buckets.map((bucket, index) => {
        const value = bucket[metric], h = value / max * (height - 22);
        return <g key={bucket.start}>
          <title>{formatDay(bucket.start)} – {formatDay(bucket.end)}: {value} {label.toLowerCase()}</title>
          <rect x={index * step + step * .18} y={height - h} width={step * .64} height={h} rx="3" fill={color} />
          <text x={(index + .5) * step} y={height - h - 7} textAnchor="middle" fontSize="12" fill={C.sub}>{value}</text>
        </g>;
      })}
      <text x="0" y={height + 21} fontSize="11" fill={C.sub}>{formatDay(buckets[0].start)}</text>
      <text x={width} y={height + 21} textAnchor="end" fontSize="11" fill={C.sub}>{formatDay(buckets[buckets.length - 1].end)}</text>
    </svg>
    <details style={{ marginTop: 8, color: C.sub, fontSize: 11 }}>
      <summary style={{ cursor: "pointer" }}>Exact dates &amp; values</summary>
      <ul style={{ paddingLeft: 16, lineHeight: 1.8 }}>{buckets.map(b => <li key={b.start}>{formatDay(b.start)} – {formatDay(b.end)}: <b>{b[metric]}</b></li>)}</ul>
    </details>
    {!total && <p className="stats-note">No {label.toLowerCase()} recorded in this period. Try a wider range.</p>}
  </section>;
}

export function DashboardStatistics({ clients, sessions, programs, setActiveClient, setView }) {
  const [range, setRange] = useState("28");
  const [selectedClient, setSelectedClient] = useState("");
  const [sort, setSort] = useState("sessions");
  const [search, setSearch] = useState("");
  const clientId = clients.some(c => String(c.id) === selectedClient) ? selectedClient : "";
  const stats = useMemo(() => buildStatistics({ clients, sessions, programs, range, clientId }), [clients, sessions, programs, range, clientId]);
  const rows = stats.rows.filter(row => (row.client.name || "").toLowerCase().includes(search.toLowerCase())).sort((a, b) =>
    sort === "name" ? (a.client.name || "").localeCompare(b.client.name || "") : b[sort] - a[sort] || (a.client.name || "").localeCompare(b.client.name || ""));
  const maxClientSessions = Math.max(1, ...stats.rows.map(row => row.sessions));
  const scope = clientId ? clients.find(c => String(c.id) === clientId)?.name : "All clients";
  return <Card className="fitos-stats" style={{ padding: 20 }}>
    <div className="stats-header">
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".12em", color: C.green, textTransform: "uppercase", marginBottom: 6 }}>Training intelligence</div>
        <h2 style={{ color: C.text, fontSize: 20, margin: 0, letterSpacing: "-.03em" }}>Client statistics</h2>
        <p className="stats-note">See who is showing up, setting records, and following a program.</p>
      </div>
      <div className="stats-range" role="group" aria-label="Statistics time range">
        {[["28", "28 days"], ["90", "90 days"], ["365", "1 year"], ["all", "All time"]].map(([value, label]) =>
          <button key={value} type="button" aria-pressed={range === value} onClick={() => setRange(value)}>{label}</button>)}
      </div>
    </div>
    <div className="stats-controls" style={{ marginTop: 18, justifyContent: "space-between" }}>
      <label style={{ color: C.sub, fontSize: 12 }}>Trend scope{" "}
        <select className="stats-field" value={clientId} onChange={e => setSelectedClient(e.target.value)}>
          <option value="">All clients</option>
          {clients.map(client => <option key={client.id} value={client.id}>{client.name}</option>)}
        </select>
      </label>
      <span className="stats-note" aria-live="polite">{formatDay(stats.start)} – {formatDay(stats.today)}</span>
    </div>
    <div className="stats-trends">
      <Trend buckets={stats.buckets} metric="sessions" color={C.blue} label="Sessions logged" total={stats.sessions} />
      <Trend buckets={stats.buckets} metric="prs" color={C.amber} label="PRs logged" total={stats.prs} />
    </div>
    <p className="stats-note">{scope} · PRs count completed sets marked as a PR, not unique exercises. Bars group dated workout starts into calendar-day intervals.
      {stats.undated > 0 && ` ${stats.undated} session(s) have no valid workout date; ${range === "all" ? "included in totals, not bars" : "excluded from this date range"}.`}
      {stats.future > 0 && ` ${stats.future} future-dated session(s) excluded.`}
    </p>
    <div className="stats-context">
      <section className="stats-panel" aria-label="Current client status snapshot">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
          <h3 style={{ color: C.text, margin: 0, fontSize: 13 }}>Active clients</h3>
          <Pill color={C.green}>Current snapshot</Pill>
        </div>
        <div style={{ margin: "12px 0", color: C.text }}><strong style={{ fontSize: 28 }}>{clients.filter(c => c.status === "active").length}</strong><span style={{ color: C.sub, fontSize: 12 }}> / {clients.length} clients</span></div>
        {stats.status.map(status => <div key={status.label} style={{ display: "grid", gridTemplateColumns: "minmax(65px,auto) 1fr 24px", gap: 10, alignItems: "center", margin: "10px 0", fontSize: 12, color: C.sub }}>
          <span style={{ textTransform: "capitalize" }}>{status.label}</span>
          <div style={{ background: C.s3, height: 7, borderRadius: 4 }}><div style={{ width: `${status.value / clients.length * 100}%`, background: status.label === "active" ? C.green : C.sub, height: 7, borderRadius: 4 }} /></div>
          <b className="stats-value">{status.value}</b>
        </div>)}
        <p className="stats-note">All clients, today. Status history is not stored, so no historical active-client trend is inferred.</p>
        <div style={{ borderTop: `1px solid ${C.border}`, marginTop: 16, paddingTop: 12, fontSize: 12, color: C.sub }}>
          <strong style={{ color: C.purple }}>{stats.assignedClients}</strong> of {clients.length} clients have a current program assignment.
          <p className="stats-note">Assignments use the client’s current program, not historical program participation.</p>
        </div>
      </section>
      <Trend buckets={stats.buckets} metric="programs" color={C.purple} label="Programs built" total={stats.programsBuilt} />
    </div>
    <p className="stats-note">Programs built: global library, independent of client scope. {programs.length} programs currently in the library; chart uses recorded creation dates.
      {stats.undatedPrograms > 0 && ` ${stats.undatedPrograms} program(s) have no valid creation date; ${range === "all" ? "included in total, not bars" : "excluded from this range"}.`}
    </p>
    <div style={{ borderTop: `1px solid ${C.border}`, marginTop: 20, paddingTop: 18 }}>
      <div className="stats-header">
        <div><h3 style={{ color: C.text, fontSize: 14, margin: 0 }}>Every client, side by side</h3>
          <p className="stats-note">Sessions &amp; PRs use the selected period. Status, assignment and last dated session are current / all-time context.</p>
        </div>
        <div className="stats-controls">
          <input className="stats-field" aria-label="Find a client in comparison" placeholder="Find a client" value={search} onChange={e => setSearch(e.target.value)} />
          <select className="stats-field" aria-label="Sort client comparison" value={sort} onChange={e => setSort(e.target.value)}>
            <option value="sessions">Most sessions</option><option value="prs">Most PRs</option><option value="name">Name A–Z</option>
          </select>
        </div>
      </div>
      {rows.length ? <table className="stats-table">
        <caption className="stats-sr">All-client comparison for {formatDay(stats.start)} through {formatDay(stats.today)}. Select a client name to open their profile.</caption>
        <thead><tr>{["Client / current status", "Sessions", "PRs", "Last dated session", "Current assignment"].map(label => <th scope="col" key={label}>{label}</th>)}</tr></thead>
        <tbody>{rows.map(row => <tr key={row.client.id}>
          <td><button className="stats-link" onClick={() => { setActiveClient(row.client); setView("client"); }} aria-label={`Open ${row.client.name}'s profile`}>{row.client.name} <span style={{ color: C.green }}>→</span></button><div className="stats-note" style={{ textTransform: "capitalize", marginTop: 4 }}>{row.client.status || "Unknown status"}</div></td>
          <td data-label="Sessions"><div style={{ display: "flex", alignItems: "center", gap: 8 }}><strong className="stats-value" style={{ color: C.blue }}>{row.sessions}</strong><span aria-hidden="true" style={{ display: "inline-block", width: row.sessions / maxClientSessions * 60, height: 5, background: C.blue, borderRadius: 3 }} /></div></td>
          <td data-label="PRs"><strong className="stats-value" style={{ color: C.amber }}>{row.prs}</strong></td>
          <td data-label="Last dated session" style={{ color: C.sub }}>{row.lastDay === null ? "None recorded" : formatDay(row.lastDay)}{row.undated > 0 && <div className="stats-note">{row.undated} undated session(s)</div>}</td>
          <td data-label="Current assignment" style={{ color: C.sub }}>{row.assignment}</td>
        </tr>)}</tbody>
      </table> : <div style={{ textAlign: "center", padding: "28px 12px", color: C.sub, fontSize: 13 }}>
        <strong style={{ color: C.text, display: "block", marginBottom: 8 }}>{clients.length ? "No matching clients" : "Your client picture starts here"}</strong>
        {clients.length ? "Try another name. No clients are hidden by training activity or status." : "Add clients to compare training activity. Zero-session clients will appear here too."}
        {!clients.length && <div style={{ marginTop: 12 }}><button className="stats-link" onClick={() => setView("clients")}>Go to clients →</button></div>}
      </div>}
      <p className="stats-note">Showing {rows.length} of {clients.length} clients, including those with zero sessions. Comparison always includes all clients regardless of trend scope.
        {stats.unmatched > 0 && ` ${stats.unmatched} session(s) in this period have no matching current client; included in all-client trends only.`}
      </p>
    </div>
  </Card>;
}
