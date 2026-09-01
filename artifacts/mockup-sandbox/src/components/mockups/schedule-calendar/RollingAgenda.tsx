import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  Dumbbell,
  MapPin,
  Play,
  Plus,
  Repeat2,
  TimerReset,
  Users,
  X,
} from "lucide-react";
import "./_group.css";

type Booking = { name: string; initials: string; tone: string; attendance?: "here" | "late" | "away" };
type Session = {
  id: string; day: number; name: string; time: string; duration: number; location: string;
  focus: string; format?: string; capacity: number; bookings: Booking[]; recurring?: boolean;
};

const DAYS = [
  { short: "MON", date: "01", label: "Sep 1" }, { short: "TUE", date: "02", label: "Sep 2" },
  { short: "WED", date: "03", label: "Sep 3" }, { short: "THU", date: "04", label: "Sep 4" },
  { short: "FRI", date: "05", label: "Sep 5" }, { short: "SAT", date: "06", label: "Sep 6" },
  { short: "SUN", date: "07", label: "Sep 7" },
];

const sessions: Session[] = [
  { id: "conditioning", day: 0, name: "Morning Conditioning", time: "07:00", duration: 45, location: "Main Studio", focus: "Conditioning", capacity: 12, bookings: [{ name: "Mia Thompson", initials: "MT", tone: "#9B72F5", attendance: "here" }, { name: "Jordan Lee", initials: "JL", tone: "#22D98A", attendance: "away" }], recurring: true },
  { id: "strength", day: 2, name: "Strength Circuit", time: "06:30", duration: 45, location: "Main Studio", focus: "Full body", format: "Total Body Circuit", capacity: 12, bookings: [{ name: "Mia Thompson", initials: "MT", tone: "#9B72F5" }, { name: "Jordan Lee", initials: "JL", tone: "#22D98A" }, { name: "Olivia Bennett", initials: "OB", tone: "#4B8EF8" }, { name: "Marcus Reed", initials: "MR", tone: "#F5A524" }, { name: "Sophia Patel", initials: "SP", tone: "#9B72F5" }], recurring: true },
  { id: "hiit", day: 2, name: "Express HIIT", time: "12:15", duration: 30, location: "Studio B", focus: "HIIT", format: "30-Minute Burner", capacity: 10, bookings: [{ name: "Noah Williams", initials: "NW", tone: "#4B8EF8" }, { name: "Ava Martinez", initials: "AM", tone: "#22C4D9" }] },
  { id: "lower", day: 3, name: "Lower Body Lab", time: "17:30", duration: 50, location: "Main Studio", focus: "Lower body", capacity: 10, bookings: [{ name: "Mia Thompson", initials: "MT", tone: "#9B72F5" }, { name: "Sophia Patel", initials: "SP", tone: "#9B72F5" }, { name: "Ava Martinez", initials: "AM", tone: "#22C4D9" }], recurring: true },
  { id: "mobility", day: 4, name: "Saturday Mobility", time: "09:00", duration: 45, location: "Movement Room", focus: "Mobility", format: "Mobility Reset", capacity: 14, bookings: [{ name: "Jordan Lee", initials: "JL", tone: "#22D98A" }, { name: "Olivia Bennett", initials: "OB", tone: "#4B8EF8" }, { name: "Marcus Reed", initials: "MR", tone: "#F5A524" }, { name: "Noah Williams", initials: "NW", tone: "#4B8EF8" }] },
];

const hours = ["06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18"];

function Avatar({ booking, small = false }: { booking: Booking; small?: boolean }) {
  return <span title={booking.name} style={{ width: small ? 24 : 30, height: small ? 24 : 30, background: `${booking.tone}25`, border: `1px solid ${booking.tone}75`, color: booking.tone, borderRadius: "50%", display: "inline-flex", justifyContent: "center", alignItems: "center", fontWeight: 800, fontSize: small ? 8 : 9, flexShrink: 0 }}>{booking.initials}</span>;
}

export function RollingAgenda() {
  const [day, setDay] = useState(2);
  const [selectedId, setSelectedId] = useState("strength");
  const [, setWeek] = useState(0);
  const [activeRun, setActiveRun] = useState<string | null>(null);
  const [history, setHistory] = useState(false);
  const selected = sessions.find((s) => s.id === selectedId) ?? sessions[1];
  const agenda = useMemo(() => sessions.filter((s) => s.day === day), [day]);
  const dayDate = DAYS[day];
  const status = selected.id === "strength" ? "Starts in 18 min" : selected.day < 2 ? "Completed" : "Upcoming";

  const changeDay = (delta: number) => {
    setDay((current) => (current + delta + 7) % 7);
    const target = (day + delta + 7) % 7;
    const first = sessions.find((s) => s.day === target);
    if (first) setSelectedId(first.id);
  };

  return (
    <main className="fitos-schedule rolling-agenda">
      <style>{`
        .rolling-agenda { padding: 0; min-height: 100vh; background: #0b0d11; }
        .ra-shell { max-width: 1440px; margin: 0 auto; padding: 26px 30px 34px; }
        .ra-top { display:flex; justify-content:space-between; align-items:center; margin-bottom:25px; gap:18px; }
        .ra-brand { display:flex; align-items:baseline; gap:12px; } .ra-eyebrow { color:#22d98a; font-size:10px; letter-spacing:.18em; font-weight:800; }
        .ra-title { margin:0; font-size:27px; line-height:1; letter-spacing:-.045em; } .ra-date { color:#8a92b2; font-size:12px; }
        .ra-button { border:1px solid #2a2f42; background:#1a1e28; color:#edf0fa; min-height:36px; padding:0 12px; border-radius:9px; display:inline-flex; align-items:center; gap:7px; font-weight:750; cursor:pointer; font-size:12px; }
        .ra-button.primary { background:#22d98a; border-color:#22d98a; color:#07130e; } .ra-button.subtle { color:#8a92b2; }
        .ra-actions { display:flex; gap:8px; }
        .ra-days { display:grid; grid-template-columns:42px repeat(7, minmax(90px,1fr)) 42px; align-items:stretch; border:1px solid #2a2f42; border-radius:15px; padding:7px; background:#13161d; margin-bottom:20px; }
        .ra-day { border:0; cursor:pointer; background:transparent; border-radius:10px; padding:10px 7px; min-width:0; color:#8a92b2; text-align:left; position:relative; } .ra-day.active { background:#222738; color:#edf0fa; }
        .ra-day small { display:block; font-size:9px; letter-spacing:.11em; font-weight:800; } .ra-day strong { display:block; font-size:21px; letter-spacing:-.04em; margin:2px 0; }
        .ra-day em { display:block; min-height:10px; color:#4e566e; font-size:10px; font-style:normal; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; } .ra-day.active em { color:#22d98a; }
        .ra-nav { display:grid; place-items:center; border:0; background:transparent; color:#8a92b2; cursor:pointer; }
        .ra-layout { display:grid; grid-template-columns:minmax(0,1fr) 350px; gap:20px; align-items:start; }
        .ra-agenda { border-radius:16px; overflow:hidden; border:1px solid #2a2f42; background:#13161d; }
        .ra-agenda-header { padding:15px 18px; border-bottom:1px solid #2a2f42; display:flex; align-items:center; justify-content:space-between; }
        .ra-agenda-header h2 { font-size:14px; margin:0; letter-spacing:-.01em; } .ra-agenda-header span { color:#8a92b2; font-size:11px; }
        .ra-grid { position:relative; display:grid; grid-template-columns:62px 1fr; min-height:632px; }
        .ra-times { padding-top:1px; } .ra-time { height:48px; color:#4e566e; font-size:10px; text-align:right; padding:0 13px 0 0; transform:translateY(-6px); }
        .ra-lines { border-left:1px solid #2a2f42; position:relative; background:repeating-linear-gradient(to bottom, transparent 0, transparent 47px, #2a2f42 48px); }
        .ra-now { position:absolute; left:0; right:0; top:99px; height:1px; background:#f5a524; z-index:3; } .ra-now:before { content:"NOW"; position:absolute; left:-1px; top:-15px; padding:2px 5px; border-radius:3px; background:#f5a524; color:#171008; font-size:8px; letter-spacing:.07em; font-weight:900; }
        .ra-session { position:absolute; left:14px; right:16px; border:1px solid; border-radius:10px; padding:10px 12px; text-align:left; cursor:pointer; overflow:hidden; transition:transform .18s ease, filter .18s ease; }
        .ra-session:hover { transform:translateX(3px); filter:brightness(1.12); } .ra-session.selected { outline:2px solid #edf0fa; outline-offset:1px; }
        .ra-session-name { display:flex; align-items:center; justify-content:space-between; gap:8px; color:#edf0fa; font-weight:800; font-size:13px; } .ra-session-meta { color:#8a92b2; margin-top:3px; font-size:10px; display:flex; gap:7px; align-items:center; }
        .ra-session .ra-mini { font-size:9px; font-weight:800; color:#22d98a; letter-spacing:.05em; } .ra-quiet { padding:16px; color:#4e566e; font-size:12px; }
        .ra-inspector { position:sticky; top:15px; background:#13161d; border:1px solid #2a2f42; border-radius:16px; overflow:hidden; }
        .ra-inspector-top { padding:18px; background:linear-gradient(135deg, #1c2d29, #13161d 68%); border-bottom:1px solid #2a2f42; }
        .ra-status { color:#22d98a; font-size:10px; text-transform:uppercase; font-weight:900; letter-spacing:.11em; display:flex; gap:6px; align-items:center; } .ra-dot { width:6px; height:6px; border-radius:50%; background:#22d98a; }
        .ra-inspector h2 { margin:9px 0 5px; font-size:22px; letter-spacing:-.045em; } .ra-detail { color:#8a92b2; font-size:11px; line-height:1.6; display:flex; flex-wrap:wrap; gap:0 6px; }
        .ra-chip { border:1px solid #2a2f42; color:#8a92b2; border-radius:99px; font-size:10px; padding:4px 7px; display:inline-flex; align-items:center; gap:4px; margin-top:11px; } .ra-chip.green { border-color:#22d98a55; background:#22d98a12; color:#22d98a; }
        .ra-lead { margin-top:16px; width:100%; border:0; border-radius:10px; height:45px; color:#07130e; background:#22d98a; display:flex; justify-content:center; align-items:center; gap:8px; font-weight:900; cursor:pointer; font-size:13px; } .ra-lead.running { background:#f5a524; color:#201805; }
        .ra-section { padding:15px 18px; border-bottom:1px solid #2a2f42; } .ra-section:last-child { border:0; }
        .ra-label { color:#4e566e; font-size:9px; font-weight:900; letter-spacing:.13em; margin-bottom:10px; } .ra-format { display:flex; align-items:center; gap:10px; } .ra-format-icon { width:32px; height:32px; border-radius:8px; color:#22c4d9; background:#22c4d918; display:grid; place-items:center; } .ra-format strong { display:block; font-size:12px; } .ra-format span { font-size:10px; color:#8a92b2; }
        .ra-capacity { display:flex; justify-content:space-between; align-items:center; color:#8a92b2; font-size:11px; margin-bottom:8px; } .ra-capacity strong { color:#edf0fa; font-size:12px; } .ra-bar { height:5px; border-radius:9px; overflow:hidden; background:#222738; } .ra-bar > i { display:block; height:100%; border-radius:inherit; background:#22d98a; }
        .ra-roster { display:flex; align-items:center; } .ra-roster > span { margin-left:-6px; } .ra-roster > span:first-child { margin-left:0; } .ra-roster small { color:#8a92b2; font-size:10px; margin-left:9px; }
        .ra-empty { height:100%; display:flex; align-items:center; justify-content:center; color:#4e566e; font-size:12px; }
        @media(max-width:850px) { .ra-shell{padding:20px 16px}.ra-layout{grid-template-columns:1fr}.ra-inspector{position:static}.ra-days{grid-template-columns:32px repeat(7,minmax(52px,1fr)) 32px}.ra-day{padding:8px 4px}.ra-day em{display:none}.ra-day strong{font-size:17px}.ra-grid{min-height:510px}.ra-agenda{order:1}.ra-inspector{order:0}.ra-session{left:9px;right:9px} }
        @media(max-width:560px) { .ra-top{align-items:flex-start}.ra-brand{display:block}.ra-date{display:block;margin-top:7px}.ra-actions .subtle{display:none}.ra-days{margin-left:-9px;margin-right:-9px;border-radius:11px}.ra-day:nth-of-type(2),.ra-day:nth-of-type(3),.ra-day:nth-of-type(8){display:none}.ra-days{grid-template-columns:32px repeat(4,1fr) 32px}.ra-layout{gap:14px}.ra-inspector-top{padding:15px}.ra-section{padding:13px 15px}.ra-grid{min-height:500px}.ra-session-meta{font-size:9px} }
      `}</style>
      <div className="ra-shell">
        <header className="ra-top">
          <div className="ra-brand"><div><div className="ra-eyebrow">FITOS / COACH CONSOLE</div><h1 className="ra-title">Today&apos;s run of show</h1></div><span className="ra-date">Wednesday, September 3</span></div>
          <div className="ra-actions"><button className="ra-button subtle" onClick={() => setHistory((value) => !value)}><CalendarDays size={14} />{history ? "Today" : "History"}</button><button className="ra-button primary" onClick={() => { setDay(2); setSelectedId("strength"); }}><Plus size={15} />New class</button></div>
        </header>
        <nav className="ra-days" aria-label="Schedule dates">
          <button className="ra-nav" onClick={() => setWeek((value) => value - 1)} aria-label="Previous week"><ChevronLeft size={18} /></button>
          {DAYS.map((entry, index) => { const count = sessions.filter((s) => s.day === index).length; return <button key={entry.short} onClick={() => { setDay(index); const first = sessions.find((s) => s.day === index); if (first) setSelectedId(first.id); }} className={`ra-day ${day === index ? "active" : ""}`}><small>{entry.short}</small><strong>{entry.date}</strong><em>{count ? `${count} class${count > 1 ? "es" : ""}` : "Open"}</em></button>; })}
          <button className="ra-nav" onClick={() => setWeek((value) => value + 1)} aria-label="Next week"><ChevronRight size={18} /></button>
        </nav>
        <div className="ra-layout">
          <section className="ra-agenda">
            <div className="ra-agenda-header"><div><h2>{history ? "Completed classes" : `${dayDate.short} · ${dayDate.label}`}</h2><span>{agenda.length ? `${agenda.length} class${agenda.length > 1 ? "es" : ""} scheduled` : "No sessions on this day"}</span></div><button className="ra-button subtle" onClick={() => changeDay(1)}>Jump next <ChevronRight size={14} /></button></div>
            <div className="ra-grid">
              <div className="ra-times">{hours.map((hour) => <div className="ra-time" key={hour}>{hour}:00</div>)}</div>
              <div className="ra-lines">
                {day === 2 && <div className="ra-now" />}
                {agenda.map((session) => { const [h, m] = session.time.split(":").map(Number); const top = ((h - 6) * 48) + (m / 60 * 48); const accent = session.id === "strength" ? "#22D98A" : session.id === "hiit" ? "#F5A524" : session.id === "mobility" ? "#22C4D9" : "#9B72F5"; return <button key={session.id} onClick={() => setSelectedId(session.id)} className={`ra-session ${selectedId === session.id ? "selected" : ""}`} style={{ top, height: Math.max(48, session.duration / 60 * 48), background: `${accent}13`, borderColor: `${accent}80` }}><div className="ra-session-name"><span>{session.name}</span>{session.recurring && <Repeat2 size={12} color={accent} />}</div><div className="ra-session-meta"><span>{session.time} · {session.duration} min</span><span>{session.bookings.length}/{session.capacity} enrolled</span>{session.id === "strength" && <b className="ra-mini">NEXT UP</b>}</div></button>; })}
                {!agenda.length && <div className="ra-empty">A clear lane. Use it for programming, recovery, or a new class.</div>}
              </div>
            </div>
          </section>
          <aside className="ra-inspector" aria-label="Class details">
            <div className="ra-inspector-top">
              <div className="ra-status"><span className="ra-dot" />{status}</div>
              <h2>{selected.name}</h2>
              <div className="ra-detail"><span><Clock3 size={11} /> {dayDate.label} · {selected.time} · {selected.duration} min</span><span>·</span><span><MapPin size={11} /> {selected.location}</span></div>
              <span className="ra-chip green">{selected.focus}</span>{selected.recurring && <span className="ra-chip"><Repeat2 size={11} />Recurring</span>}
              <button className={`ra-lead ${activeRun === selected.id ? "running" : ""}`} onClick={() => setActiveRun(activeRun === selected.id ? null : selected.id)}>{activeRun === selected.id ? <><X size={17} />End live class</> : <><Play size={17} fill="currentColor" />Lead Class</>}</button>
            </div>
            <div className="ra-section">
              <div className="ra-label">CLASS FORMAT</div>
              {selected.format ? <div className="ra-format"><div className="ra-format-icon"><Dumbbell size={16} /></div><div><strong>{selected.format}</strong><span>6 stations · 3 rounds</span></div><button className="ra-button subtle" style={{ marginLeft: "auto", padding: "0 8px", minHeight: 30 }} onClick={() => setActiveRun(`timer-${selected.id}`)}><TimerReset size={14} /></button></div> : <button className="ra-button subtle" onClick={() => setSelectedId("strength")}><Plus size={14} />Attach format</button>}
            </div>
            <div className="ra-section">
              <div className="ra-label">ENROLLMENT</div>
              <div className="ra-capacity"><span><Users size={12} /> Roster</span><strong>{selected.bookings.length} / {selected.capacity}</strong></div>
              <div className="ra-bar"><i style={{ width: `${selected.bookings.length / selected.capacity * 100}%` }} /></div>
            </div>
            <div className="ra-section">
              <div className="ra-label">ON THE FLOOR</div>
              <div className="ra-roster">{selected.bookings.slice(0, 5).map((booking) => <Avatar booking={booking} small key={booking.name} />)}<small>{selected.bookings.length ? `${selected.bookings.length} athletes checked in` : "No roster yet"}</small></div>
              <button className="ra-button" style={{ marginTop: 13, width: "100%", justifyContent: "center" }} onClick={() => setActiveRun(`attendance-${selected.id}`)}><ClipboardCheck size={14} />Manage attendance</button>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}