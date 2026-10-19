import React, { useMemo, useState } from "react";
import { C } from "./config.js";
import { Avatar, Pill } from "./ui.jsx";
import { dayNumber, formatDay } from "./dashboard-statistics-data.mjs";
import { buildMetricDetails } from "./metric-details-data.mjs";
import "./metric-details.css";

const META = {
  clients: { title: "Active clients", subtitle: "The people behind the numbers.", color: C.green, management: "clients", action: "Manage clients" },
  sessions: { title: "Sessions logged", subtitle: "Understand the rhythm of your coaching.", color: C.blue, management: "session-history", action: "Open session history" },
  programs: { title: "Programs built", subtitle: "From your library to their training.", color: C.purple, management: "programs", action: "Manage programs" },
  prs: { title: "Personal records", subtitle: "Every breakthrough, traced back to a client.", color: C.amber, management: "session-history", action: "Review session history" },
};
const date = value => { const day = dayNumber(value); return day === null ? "Unknown date" : formatDay(day); };
const pct = (n,total) => total ? `${Math.round(n / total * 100)}%` : "—";

function Panel({ title, note, children, action }) {
  return <section className="md-panel"><div className="md-heading"><h2>{title}</h2>{action}</div>{note && <p>{note}</p>}{children}</section>;
}
function Empty({ title, children, onReset }) {
  return <div className="md-empty"><h3>{title}</h3><p>{children}</p>{onReset && <button className="md-action" onClick={onReset}>Reset filters</button>}</div>;
}
function Trend({ stats, field, title, total }) {
  const buckets = stats.buckets, max = Math.max(1,...buckets.map(b => b[field]));
  const points = buckets.map((b,i) => [buckets.length === 1 ? 280 : 12 + i / (buckets.length - 1) * 536, 126 - b[field] / max * 102]);
  const path = points.map(([x,y],i) => `${i ? "L" : "M"}${x},${y}`).join(" ");
  const datedTotal = buckets.reduce((sum,b) => sum + b[field],0);
  return <Panel title={title} note="Dated activity grouped into calendar-day intervals.">
    <svg viewBox="0 0 560 158" role="img" aria-label={`${title}: ${datedTotal} dated records. Exact interval counts below.`} style={{width:"100%",display:"block",marginTop:18}}>
      {[0,.5,1].map(v => <g key={v}><line x1="12" x2="548" y1={126-v*102} y2={126-v*102} stroke={C.border}/><text x="548" y={121-v*102} textAnchor="end" fontSize="10" fill={C.sub}>{Math.round(max*v)}</text></g>)}
      <path d={`${path} L${points[points.length-1][0]},126 L${points[0][0]},126 Z`} fill="var(--metric-accent)" opacity=".12"/>
      <path d={path} fill="none" stroke="var(--metric-accent)" strokeWidth="2.5" strokeLinejoin="round"/>
      {points.map(([x,y],i) => <circle key={i} cx={x} cy={y} r="3" fill="var(--metric-accent)"><title>{formatDay(buckets[i].start)} – {formatDay(buckets[i].end)}: {buckets[i][field]}</title></circle>)}
      <text x="12" y="152" fill={C.sub} fontSize="10">{formatDay(stats.start)}</text>
      <text x="548" y="152" textAnchor="end" fill={C.sub} fontSize="10">{formatDay(stats.today)}</text>
    </svg>
    <p><strong className="md-count">{datedTotal}</strong> plotted · <strong>{total}</strong> total in scope. Unknown and future dates do not appear in the trend.</p>
    <details><summary>Exact interval counts</summary><ul>{buckets.map(b => <li key={b.start}>{formatDay(b.start)} – {formatDay(b.end)}: {b[field]}</li>)}</ul></details>
    {!total && <p>No activity in this range. Widen the period or choose another client.</p>}
  </Panel>;
}
function ClientName({ client, onClient, fallback = "Unknown / deleted client" }) {
  return client ? <button className="md-link" onClick={() => onClient(client)}>{client.name || "Unnamed client"} <span aria-hidden="true" style={{color:"var(--metric-accent)"}}>↗</span></button> : <span style={{color:C.sub}}>{fallback}</span>;
}
function Ranking({ rows, field, onClient }) {
  const sorted = [...rows].sort((a,b) => b[field]-a[field] || (a.client.name || "").localeCompare(b.client.name || ""));
  const max = Math.max(1,...sorted.map(r => r[field]));
  return sorted.length ? <div>{sorted.map((r,i) => <div className="md-rank" key={r.client.id}>
    <span style={{fontSize:11,color:C.sub}}>{String(i+1).padStart(2,"0")}</span>
    <div><ClientName client={r.client} onClient={onClient}/><div className="md-track" aria-hidden="true"><span style={{width:`${r[field]/max*100}%`}}/></div></div><strong className="md-count">{r[field]}</strong>
  </div>)}</div> : <Empty title="No clients in this scope">Add a client or clear the client filter to build a comparison.</Empty>;
}

export function MetricDetails({ metric = "clients", clients = [], sessions = [], programs = [], formats = [], setView, setActiveClient, mobile }) {
  const key = META[metric] ? metric : "clients", meta = META[key];
  const [range,setRange] = useState("all");
  const [selectedClient,setSelectedClient] = useState("");
  const [search,setSearch] = useState("");
  const [exercise,setExercise] = useState("");
  const [page,setPage] = useState(1);
  const clientId = clients.some(c => String(c.id) === selectedClient) ? selectedClient : "";
  // Program creation is a global library measure and never takes a client filter.
  const stats = useMemo(() => buildMetricDetails({clients,sessions,programs,range,clientId:key === "programs" ? "" : clientId}),[clients,sessions,programs,range,clientId,key]);
  const onClient = client => { setActiveClient(client); setView("client"); };
  const reset = () => {setRange("all");setSelectedClient("");setSearch("");setExercise("");setPage(1);};
  const rows = stats.rows.filter(r => (r.client.name || "").toLowerCase().includes(search.toLowerCase()));
  const exerciseNames = [...new Set(stats.records.map(r => r.exercise))].sort();
  const activeExercise = exerciseNames.includes(exercise) ? exercise : "";
  const records = stats.records.filter(r => !activeExercise || r.exercise === activeExercise);
  const displayedRecords = records.slice(0,page*30);
  const values = {clients:stats.active,sessions:stats.sessions,programs:stats.programsBuilt,prs:stats.prs};
  const scope = key === "programs" ? "Global library" : clientId ? clients.find(c => String(c.id) === clientId)?.name : "All clients, including unmatched records";
  const facts = key === "clients" ? [
    ["Current client roster",clients.length],["Clients trained in scope",stats.trained],["Current assignment coverage",pct(stats.assigned,clients.length)],
  ] : key === "sessions" ? [
    ["Clients with activity",stats.trained],["Sessions without a current client",stats.unknownSessions],["Sessions with unknown dates",stats.undated],
  ] : key === "programs" ? [
    ["Programs in library now",programs.length],["Clients currently assigned",`${stats.assigned} / ${clients.length}`],["Class formats (separate library)",formats.length],
  ] : [
    ["Clients with a completed PR",stats.rows.filter(r=>r.prs>0).length],["Exercises with records",exerciseNames.length],["PR sets without a current client",stats.unknownPRs],
  ];
  return <div className="metric-details" style={{"--metric-accent":meta.color}} data-mobile={mobile || undefined}>
    <div className="md-top"><button className="md-link" onClick={() => setView("dashboard")}>← Back to dashboard</button><button className="md-action" onClick={() => setView(meta.management)}>{meta.action} →</button></div>
    <nav className="md-nav" aria-label="Expanded analytics">{Object.entries(META).map(([id,item]) => <button key={id} aria-current={id===key?"page":undefined} onClick={() => {setPage(1);setSearch("");setExercise("");setView(`analytics-${id}`);}}>{item.title}</button>)}</nav>
    <header className="md-panel md-hero">
      <div><div className="md-eyebrow">Training intelligence / {String(Object.keys(META).indexOf(key)+1).padStart(2,"0")}</div><h1>{meta.title}</h1><p>{meta.subtitle}</p>
        <div className="md-number" aria-live="polite">{values[key]}</div>
        <p>{key==="clients" ? "Active right now · all clients, independent of filters" : key==="prs" ? "Completed sets marked as a PR · selected scope" : key==="programs" ? "Programs created · selected period" : "Saved training sessions · selected scope"}</p>
      </div><div className="md-facts">{facts.map(([label,value]) => <div className="md-fact" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
    </header>
    <div className="md-panel">
      <div className="md-tools"><div className="md-range" role="group" aria-label="Activity period">{[["28","28 days"],["90","90 days"],["365","1 year"],["all","All time"]].map(([value,label]) => <button key={value} aria-pressed={range===value} onClick={() => {setRange(value);setPage(1);}}>{label}</button>)}</div>
        {key!=="programs" && <label className="md-label">Client<select className="md-field" value={clientId} onChange={e=>{setSelectedClient(e.target.value);setPage(1);}}><option value="">All clients</option>{clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>}
      </div>
      <p aria-live="polite">{scope} · {range==="all" ? "All saved records, including unknown and future dates." : `${formatDay(stats.start)} – ${formatDay(stats.today)}. Unknown and future dates excluded.`}{key==="clients" && " Period and client filters apply to activity only; status and assignments are current snapshots."}</p>
      {key!=="programs" && <p>{stats.undated} session(s) have an unknown workout date; {stats.future} have future dates. {key==="prs" && `${stats.undatedPRs} unknown-date PR sets and ${stats.futurePRs} future-date PR sets included in this total.`} Workout dates use startedAt only, never record creation time.</p>}
      {key==="programs" && <p>{stats.undatedPrograms} program(s) have unknown creation dates; {stats.futurePrograms} have future creation dates. The library is independent of client scope.</p>}
    </div>

    {key==="clients" && <>
      <div className="md-grid">
        <Panel title="Current client status" note="Today’s roster, not a historical active-client trend. Status history is not stored.">
          {stats.status.length ? stats.status.map(s=><div className="md-list-item md-heading" key={s.label}><Pill color={s.label==="active"?C.green:C.sub}>{s.label}</Pill><strong className="md-count">{s.value} <span style={{color:C.sub,fontSize:11}}>/ {clients.length}</span></strong></div>) : <Empty title="Your roster starts here">Add clients to see their current status and training activity.</Empty>}
        </Panel>
        <Panel title="Engagement, not assumptions" note="Recency uses each client’s latest valid, non-future workout date across all time. It is not a status label.">
          {["Trained within 14 days","14–44 days since training","45+ days since training","Only undated activity","No dated activity"].map(label=><div key={label} className="md-list-item md-heading"><span style={{fontSize:12,color:C.sub}}>{label}</span><strong>{stats.rows.filter(r=>r.engagement===label).length}</strong></div>)}
        </Panel>
      </div>
      <Panel title="Every client’s activity & assignment" note="Zero-session clients stay visible. Last training and assignments show current / all-time context." action={<label className="md-label"><input className="md-field" aria-label="Search clients" placeholder="Find a client" value={search} onChange={e=>setSearch(e.target.value)}/></label>}>
        {rows.length ? <div className="md-table-wrap"><table><thead><tr>{["Client / current status","Activity in period","Last dated training","Current program"].map(t=><th key={t} scope="col">{t}</th>)}</tr></thead><tbody>{rows.map(r=><tr key={r.client.id}>
          <td><div style={{display:"flex",gap:9,alignItems:"center"}}><Avatar name={r.client.name} size={28} color={C.green}/><div><ClientName client={r.client} onClient={onClient}/><small>{r.client.status || "Unknown status"}</small></div></div></td>
          <td><strong className="md-count">{r.sessions}</strong> sessions<small>{r.prs} completed PR sets</small></td>
          <td>{r.lastDay===null?"None recorded":formatDay(r.lastDay)}<small>{r.engagement}{r.undated>0 && ` · ${r.undated} undated session(s)`}</small></td><td>{r.assignment}</td>
        </tr>)}</tbody></table></div> : <Empty title="No clients to show" onReset={reset}>Try another name or open client management to add your first client.</Empty>}
        <p>{stats.unknownSessions} session(s) in this activity scope have no matching current client and cannot appear as a client row.</p>
      </Panel>
    </>}

    {key==="sessions" && <>
      <div className="md-grid"><Trend stats={stats} field="sessions" title="Training over time" total={stats.sessions}/>
        <Panel title="Sessions by client" note="Saved session counts, including clients with zero sessions."><Ranking rows={stats.rows} field="sessions" onClient={onClient}/><p>{stats.unknownSessions} additional session(s) belong to unknown / deleted clients.</p></Panel></div>
      <Panel title="Session ledger" note="Newest dated sessions first; unknown dates appear last. Expand a session for recorded exercise details.">
        {stats.recent.length ? stats.recent.slice(0,page*30).map((s,i) => {
          const client=clients.find(c=>String(c.id)===String(s.clientId));
          return <div className="md-list-item" key={s.id || i}><div className="md-heading"><div><h3>{s.name || "Untitled session"}</h3><ClientName client={client} onClient={onClient}/></div><span style={{fontSize:12,color:C.sub}}>{date(s.startedAt)}</span></div>
            <p>{(s.exercises||[]).length} exercises · {(s.exercises||[]).reduce((n,e)=>n+(e.sets||[]).filter(t=>t.done).length,0)} completed sets{s.programDay && ` · ${s.programDay}`}</p>
            <details><summary>Exercise & session details</summary>{s.notes && <p>{s.notes}</p>}{(s.exercises||[]).length ? <ul>{s.exercises.map((e,j)=><li key={e.id||j}>{e.name || "Unnamed exercise"} · {(e.sets||[]).filter(t=>t.done).length} completed / {(e.sets||[]).length} sets</li>)}</ul> : <p>No exercise details recorded.</p>}</details>
          </div>;
        }) : <Empty title="No sessions in this scope" onReset={reset}>Choose a wider period or review your saved sessions in session history.</Empty>}
        {stats.recent.length>page*30 && <button className="md-action" style={{marginTop:18}} onClick={()=>setPage(p=>p+1)}>Show 30 more sessions</button>}
      </Panel>
    </>}

    {key==="programs" && <>
      <div className="md-grid"><Trend stats={stats} field="programs" title="Library creation over time" total={stats.programsBuilt}/>
        <Panel title="Current assignment coverage" note="All clients and programs, today. Historical assignments are not stored.">
          <div className="md-number" style={{fontSize:44}}>{pct(stats.assigned,clients.length)}</div><p>{stats.assigned} of {clients.length} clients have a current program ID. {clients.length-stats.assigned} have no assignment.</p>
          <div className="md-list-item"><h3>{stats.unavailableAssignments} unavailable program references</h3><p>These clients reference a program no longer in the current library. They are included in assigned coverage, not treated as unassigned.</p></div>
          <div className="md-list-item"><h3>{formats.length} class formats</h3><p>Formats are a separate library and do not count as programs built.</p></div>
        </Panel></div>
      <Panel title="Programs & their current clients" note="Creation dates follow the selected period; assignments always show today’s state. Client programId is the current-assignment source; saved program rosters are shown separately when they disagree.">
        {stats.programRows.length ? stats.programRows.map(({program:p,assigned,rosterOnly,missingFromRoster})=><article className="md-list-item" key={p.id}>
          <div className="md-heading"><h3>{p.name || "Untitled program"}</h3><Pill color={C.purple}>{assigned.length} current client{assigned.length===1?"":"s"}</Pill></div>
          <p>{p.weeks} weeks · {p.daysPerWeek} days / week · {(p.days||[]).length} configured days · Created {date(p.createdAt)}</p>{p.description && <p>{p.description}</p>}
          {assigned.length ? <div className="md-chips">{assigned.map(c=><button key={c.id} onClick={()=>onClient(c)}>{c.name} ↗</button>)}</div> : <p>No clients currently reference this program.</p>}
          {(rosterOnly.length>0 || missingFromRoster>0) && <details><summary>Assignment source differences ({rosterOnly.length+missingFromRoster})</summary><p>{missingFromRoster} current client assignment(s) are absent from the saved program roster.</p>{rosterOnly.length>0 && <ul>{rosterOnly.map(id=><li key={id}><ClientName client={clients.find(c=>String(c.id)===id)} onClient={onClient}/> · saved roster only, not a current assignment</li>)}</ul>}</details>}
        </article>) : <Empty title="No programs created in this period" onReset={reset}>Widen the period or open program management to build your library.</Empty>}
      </Panel>
    </>}

    {key==="prs" && <>
      <div className="md-grid"><Trend stats={stats} field="prs" title="Completed PR sets over time" total={stats.prs}/>
        <Panel title="Client PR leaderboard" note="One PR = one completed set marked as a PR (set.pr && set.done). Not unique exercises, estimated strength or verified lifetime bests.">
          <Ranking rows={stats.rows} field="prs" onClient={onClient}/><p>{stats.unknownPRs} PR set(s) without a current client are included in totals, not attributed to a leaderboard client.</p>
        </Panel></div>
      <Panel title="Record book" note="Trace every record to its exercise, client and session. Recorded load unit unspecified: sessions do not persist units, so loads are not converted or compared." action={<label className="md-label">Exercise<select className="md-field" value={exerciseNames.includes(exercise)?exercise:""} onChange={e=>{setExercise(e.target.value);setPage(1);}}><option value="">All exercises</option>{exerciseNames.map(name=><option key={name}>{name}</option>)}</select></label>}>
        {records.length ? <div className="md-table-wrap"><table><thead><tr>{["Client","Exercise / set","Recorded performance","Session","Workout date"].map(t=><th key={t} scope="col">{t}</th>)}</tr></thead><tbody>{displayedRecords.map(r=><tr key={r.key}>
          <td><ClientName client={r.client} onClient={onClient}/></td><td><strong>{r.exercise}</strong><small>Set {r.setNumber} · completed PR</small></td>
          <td>{r.set.reps!=="" && r.set.reps!=null ? `${r.set.reps} reps` : "Reps not recorded"}<small>{(r.set.load ?? r.set.weight)!=="" && (r.set.load ?? r.set.weight)!=null ? `Recorded load: ${r.set.load ?? r.set.weight} · unit unspecified` : "Load not recorded"}</small></td>
          <td>{r.session.name || "Untitled session"}{r.session.programDay && <small>{r.session.programDay}</small>}</td><td>{r.day===null?"Unknown date":formatDay(r.day)}</td>
        </tr>)}</tbody></table></div> : <Empty title="No completed PR sets in this scope" onReset={reset}>A record appears only when a set is both completed and marked as a PR. Try all time or another client.</Empty>}
        <p>{records.length} record(s){activeExercise ? ` for ${activeExercise}` : ""}. Exercise filtering affects this record book only; the headline and leaderboard retain the period and client scope.</p>
        {records.length>displayedRecords.length && <button className="md-action" style={{marginTop:15}} onClick={()=>setPage(p=>p+1)}>Show 30 more records</button>}
      </Panel>
    </>}
  </div>;
}
