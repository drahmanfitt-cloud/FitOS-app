import { useMemo, useState, type CSSProperties } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  Play,
  Plus,
  RotateCcw,
  Settings2,
  Users,
  X,
} from "lucide-react";
import "./_group.css";

type ClassItem = {
  id: string;
  name: string;
  date: string;
  time: string;
  duration: number;
  capacity: number;
  enrolled: number;
  location: string;
  focus: string;
  format?: string;
  recurring?: boolean;
  color: string;
};

const classes: ClassItem[] = [
  { id: "conditioning", name: "Morning Conditioning", date: "2026-09-01", time: "07:00", duration: 45, capacity: 12, enrolled: 9, location: "Main Studio", focus: "Conditioning", format: "Engine Builder", recurring: true, color: "#22D98A" },
  { id: "strength", name: "Strength Circuit", date: "2026-09-03", time: "06:30", duration: 45, capacity: 12, enrolled: 5, location: "Main Studio", focus: "Full Body", format: "Total Body Circuit", recurring: true, color: "#22D98A" },
  { id: "hiit", name: "Express HIIT", date: "2026-09-03", time: "12:15", duration: 30, capacity: 10, enrolled: 2, location: "Studio B", focus: "HIIT", format: "30-Minute Burner", color: "#F5A524" },
  { id: "lower", name: "Lower Body Lab", date: "2026-09-04", time: "17:30", duration: 50, capacity: 10, enrolled: 3, location: "Main Studio", focus: "Lower Body", recurring: true, color: "#9B72F5" },
  { id: "mobility", name: "Saturday Mobility", date: "2026-09-05", time: "09:00", duration: 45, capacity: 14, enrolled: 4, location: "Movement Room", focus: "Mobility", format: "Mobility Reset", color: "#22C4D9" },
  { id: "strength-2", name: "Strength Circuit", date: "2026-09-08", time: "06:30", duration: 45, capacity: 12, enrolled: 7, location: "Main Studio", focus: "Full Body", format: "Total Body Circuit", recurring: true, color: "#22D98A" },
  { id: "run", name: "Run Club Prep", date: "2026-09-10", time: "18:00", duration: 55, capacity: 16, enrolled: 11, location: "Outdoor Track", focus: "Endurance", color: "#4B8EF8" },
  { id: "hiit-2", name: "Express HIIT", date: "2026-09-15", time: "12:15", duration: 30, capacity: 10, enrolled: 8, location: "Studio B", focus: "HIIT", format: "30-Minute Burner", color: "#F5A524" },
  { id: "mobility-2", name: "Sunday Reset", date: "2026-09-20", time: "10:00", duration: 50, capacity: 12, enrolled: 6, location: "Movement Room", focus: "Mobility", color: "#22C4D9" },
  { id: "clinic", name: "Kettlebell Clinic", date: "2026-09-23", time: "17:45", duration: 60, capacity: 8, enrolled: 8, location: "Main Studio", focus: "Skill", color: "#F5445A" },
  { id: "strength-3", name: "Strength Circuit", date: "2026-09-29", time: "06:30", duration: 45, capacity: 12, enrolled: 9, location: "Main Studio", focus: "Full Body", format: "Total Body Circuit", recurring: true, color: "#22D98A" },
];

const names = ["Mia Thompson", "Jordan Lee", "Olivia Bennett", "Marcus Reed", "Sophia Patel", "Noah Williams", "Ava Martinez", "Theo Grant"];
const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const pad = (day: number) => `2026-09-${String(day).padStart(2, "0")}`;

export function MonthAgenda() {
  const [selectedDate, setSelectedDate] = useState("2026-09-03");
  const [selectedId, setSelectedId] = useState("strength");
  const [monthOffset, setMonthOffset] = useState(0);
  const [showNew, setShowNew] = useState(false);
  const [launched, setLaunched] = useState(false);
  const selected = classes.find((item) => item.id === selectedId) ?? classes[1];
  const agenda = useMemo(() => classes.filter((item) => item.date === selectedDate), [selectedDate]);
  const title = monthOffset === 0 ? "September 2026" : monthOffset === -1 ? "August 2026" : "October 2026";
  const startBlank = monthOffset === 0 ? 1 : monthOffset === -1 ? 5 : 3;
  const days = monthOffset === 0 ? 30 : 31;

  const selectDay = (day: number) => {
    if (monthOffset !== 0) return;
    const date = pad(day);
    const first = classes.find((item) => item.date === date);
    setSelectedDate(date);
    if (first) setSelectedId(first.id);
  };

  return (
    <main className="fitos-schedule" style={{ padding: 0, minHeight: "100dvh", background: "#0B0D11" }}>
      <style>{`
        .ma-shell{max-width:1480px;margin:auto;padding:28px 30px 36px}.ma-grid{display:grid;grid-template-columns:minmax(620px,1.3fr) minmax(330px,.7fr);gap:18px;align-items:start}.ma-card{background:#13161D;border:1px solid #2A2F42;border-radius:16px}.ma-btn{border:1px solid #353B52;background:#1A1E28;color:#EDF0FA;border-radius:9px;height:36px;padding:0 12px;display:inline-flex;align-items:center;gap:7px;font-size:12px;font-weight:700;cursor:pointer}.ma-btn.primary{border-color:#22D98A;background:#22D98A;color:#0B0D11}.ma-btn.soft{border-color:#22D98A66;background:#22D98A14;color:#22D98A}.ma-day{min-height:103px;border-right:1px solid #2A2F42;border-bottom:1px solid #2A2F42;padding:8px;cursor:pointer;background:transparent;text-align:left;vertical-align:top}.ma-day:nth-child(7n){border-right:0}.ma-day:hover{background:#1A1E28}.ma-day.selected{background:#202936;box-shadow:inset 0 0 0 1px #22D98A}.ma-event{width:100%;border:0;border-left:3px solid var(--event);background:#1A1E28;border-radius:5px;padding:4px 5px;margin-top:4px;color:#EDF0FA;font-size:10px;line-height:1.25;text-align:left;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer}.ma-event:hover{background:#252b38}.ma-event-time{color:#8A92B2;font-weight:700;margin-right:3px}.ma-skeleton{height:14px;background:#222738;border-radius:4px}@media(max-width:850px){.ma-shell{padding:18px 14px}.ma-grid{grid-template-columns:1fr}.ma-day{min-height:84px;padding:5px}.ma-event{font-size:9px}.ma-header-copy{display:none}.ma-detail{position:static!important}}@media(max-width:520px){.ma-day{min-height:65px}.ma-event{padding:3px;border-left-width:2px}.ma-event-time{display:none}.ma-day-name{font-size:10px!important}.ma-top{align-items:flex-start!important;gap:12px!important}.ma-actions{flex-wrap:wrap;justify-content:flex-end}.ma-day-num{font-size:11px!important}}
      `}</style>
      <div className="ma-shell">
        <header className="ma-top" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
            <div style={{ width: 39, height: 39, display: "grid", placeItems: "center", borderRadius: 11, background: "#22D98A", color: "#0B0D11" }}><CalendarDays size={21} strokeWidth={2.6} /></div>
            <div><div style={{ fontSize: 20, lineHeight: 1, fontWeight: 850, letterSpacing: "-.04em" }}>Schedule</div><div className="ma-header-copy" style={{ color: "#8A92B2", fontSize: 12, marginTop: 6 }}>Plan the month. Run the room.</div></div>
          </div>
          <div className="ma-actions" style={{ display: "flex", gap: 8 }}>
            <button className="ma-btn" onClick={() => setSelectedDate("2026-09-01")}><RotateCcw size={14} />History</button>
            <button className="ma-btn primary" onClick={() => setShowNew(true)}><Plus size={15} />New class</button>
          </div>
        </header>

        <div className="ma-grid">
          <section className="ma-card" style={{ overflow: "hidden" }}>
            <div style={{ padding: "19px 20px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #2A2F42" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <button aria-label="Previous month" className="ma-btn" style={{ padding: "0 9px", height: 32 }} onClick={() => setMonthOffset((value) => Math.max(-1, value - 1))}><ChevronLeft size={17} /></button>
                <strong style={{ fontSize: 16, minWidth: 130, textAlign: "center" }}>{title}</strong>
                <button aria-label="Next month" className="ma-btn" style={{ padding: "0 9px", height: 32 }} onClick={() => setMonthOffset((value) => Math.min(1, value + 1))}><ChevronRight size={17} /></button>
              </div>
              <button className="ma-btn soft" style={{ height: 32 }} onClick={() => setMonthOffset(0)}>Today <span style={{ color: "#8A92B2" }}>03</span></button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: "1px solid #2A2F42", background: "#101319" }}>
              {weekdays.map((day) => <div className="ma-day-name" key={day} style={{ padding: "10px 8px", color: "#4E566E", fontWeight: 800, fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase" }}>{day}</div>)}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
              {Array.from({ length: startBlank }, (_, i) => <div key={`blank-${i}`} className="ma-day" style={{ cursor: "default", background: "#101319", opacity: .55 }} />)}
              {Array.from({ length: days }, (_, i) => {
                const day = i + 1; const date = monthOffset === 0 ? pad(day) : ""; const events = monthOffset === 0 ? classes.filter((item) => item.date === date) : [];
                return <div key={day} role="button" tabIndex={0} className={`ma-day ${selectedDate === date ? "selected" : ""}`} onClick={() => selectDay(day)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") selectDay(day); }}>
                  <span className="ma-day-num" style={{ display: "block", color: day === 3 && monthOffset === 0 ? "#22D98A" : "#8A92B2", fontWeight: 800, fontSize: 12 }}>{day}</span>
                  {events.slice(0, 2).map((item) => <button key={item.id} className="ma-event" style={{ "--event": item.color } as CSSProperties} onClick={(event) => { event.stopPropagation(); setSelectedDate(item.date); setSelectedId(item.id); }}><span className="ma-event-time">{item.time}</span>{item.name}</button>)}
                  {events.length > 2 && <span style={{ display: "block", color: "#8A92B2", fontSize: 10, marginTop: 5 }}>+{events.length - 2} more</span>}
                </div>;
              })}
            </div>
            <div style={{ padding: "13px 18px", display: "flex", gap: 16, color: "#8A92B2", fontSize: 11 }}>
              <span><i style={{ display: "inline-block", width: 7, height: 7, borderRadius: 10, background: "#22D98A", marginRight: 6 }} />Recurring program</span>
              <span>11 classes planned</span><span>72 booked this month</span>
            </div>
          </section>

          <aside className="ma-detail ma-card" style={{ position: "sticky", top: 16, overflow: "hidden" }}>
            <div style={{ padding: "18px 19px", borderBottom: "1px solid #2A2F42", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div><div style={{ color: "#8A92B2", textTransform: "uppercase", letterSpacing: ".1em", fontWeight: 800, fontSize: 10 }}>Day agenda</div><strong style={{ fontSize: 16, display: "block", marginTop: 5 }}>{selectedDate === "2026-09-03" ? "Thursday, Sep 3" : selectedDate ? new Date(`${selectedDate}T12:00:00`).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }) : "Pick a day"}</strong></div>
              <span style={{ color: "#22D98A", fontWeight: 800, fontSize: 12 }}>{agenda.length} sessions</span>
            </div>
            <div style={{ padding: 11 }}>
              {agenda.length ? agenda.map((item) => <button key={item.id} onClick={() => setSelectedId(item.id)} style={{ width: "100%", textAlign: "left", border: selectedId === item.id ? `1px solid ${item.color}` : "1px solid transparent", background: selectedId === item.id ? "#1A1E28" : "transparent", padding: "11px 10px", borderRadius: 10, cursor: "pointer", display: "flex", gap: 11 }}>
                <div style={{ color: item.color, fontSize: 11, fontWeight: 800, minWidth: 34, paddingTop: 2 }}>{item.time}</div><div><div style={{ color: "#EDF0FA", fontSize: 13, fontWeight: 750 }}>{item.name}</div><div style={{ color: "#8A92B2", fontSize: 11, marginTop: 4 }}>{item.duration} min <span style={{ color: "#4E566E" }}>·</span> {item.enrolled}/{item.capacity} booked</div></div>
              </button>) : <div style={{ padding: "32px 15px", textAlign: "center", color: "#4E566E", fontSize: 13 }}>No classes scheduled.<br /><button className="ma-btn soft" style={{ marginTop: 12 }} onClick={() => setShowNew(true)}><Plus size={14} />Add a class</button></div>}
            </div>
            <div style={{ borderTop: "1px solid #2A2F42", padding: 18, background: "#101319" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}><div><div style={{ color: selected.color, fontSize: 10, fontWeight: 850, letterSpacing: ".1em", textTransform: "uppercase" }}>{selected.focus}{selected.recurring ? " · Recurring" : ""}</div><h2 style={{ fontSize: 18, letterSpacing: "-.035em", margin: "5px 0 0" }}>{selected.name}</h2></div><button className="ma-btn" aria-label="Edit class" style={{ height: 30, padding: "0 8px" }} onClick={() => setShowNew(true)}><Settings2 size={15} /></button></div>
              <div style={{ display: "grid", gap: 8, marginTop: 16, fontSize: 12, color: "#8A92B2" }}><span style={{ display: "flex", alignItems: "center", gap: 8 }}><Clock3 size={14} />{selected.time} · {selected.duration} min</span><span style={{ display: "flex", alignItems: "center", gap: 8 }}><MapPin size={14} />{selected.location}</span><span style={{ display: "flex", alignItems: "center", gap: 8 }}><Users size={14} />{selected.enrolled} enrolled of {selected.capacity}</span></div>
              <div style={{ marginTop: 16, padding: 11, borderRadius: 9, background: "#1A1E28", border: "1px solid #2A2F42" }}><div style={{ color: "#4E566E", textTransform: "uppercase", letterSpacing: ".08em", fontWeight: 800, fontSize: 9 }}>Attached format</div><div style={{ fontWeight: 700, fontSize: 12, marginTop: 5 }}>{selected.format ?? "No format attached"}</div></div>
              <button className="ma-btn primary" style={{ marginTop: 14, width: "100%", justifyContent: "center", height: 42 }} onClick={() => setLaunched(true)}><Play size={15} fill="currentColor" />Lead class</button>
              <button className="ma-btn" style={{ marginTop: 8, width: "100%", justifyContent: "center" }} onClick={() => alert(`Opening attendance for ${selected.name}`)}>Manage roster & attendance</button>
              <div style={{ marginTop: 15, display: "flex", gap: -4 }}>{names.slice(0, selected.enrolled > 5 ? 5 : selected.enrolled).map((name, index) => <span key={name} title={name} style={{ width: 25, height: 25, marginLeft: index ? -5 : 0, borderRadius: 20, display: "grid", placeItems: "center", border: "2px solid #101319", background: ["#45356c", "#25586b", "#6e4139", "#465a32", "#65476b"][index], fontSize: 9, fontWeight: 800 }}>{name[0]}</span>)}<span style={{ color: "#8A92B2", fontSize: 11, alignSelf: "center", marginLeft: 8 }}>View roster</span></div>
            </div>
          </aside>
        </div>
      </div>
      {showNew && <div role="dialog" aria-modal="true" style={{ position: "fixed", inset: 0, background: "#0B0D11CC", display: "grid", placeItems: "center", padding: 18, zIndex: 5 }}><div className="ma-card" style={{ width: "min(430px,100%)", padding: 22 }}><div style={{ display: "flex", justifyContent: "space-between" }}><div><strong style={{ fontSize: 18 }}>{selectedId ? "Edit class" : "New class"}</strong><div style={{ color: "#8A92B2", fontSize: 12, marginTop: 4 }}>Build a session in your monthly plan.</div></div><button className="ma-btn" onClick={() => setShowNew(false)} style={{ height: 30, padding: "0 7px" }}><X size={16} /></button></div><div style={{ display: "grid", gap: 9, marginTop: 20 }}>{["Class name", "Date & time", "Location", "Attached format"].map((label, i) => <label key={label} style={{ color: "#8A92B2", fontSize: 11, fontWeight: 700 }}>{label}<div style={{ marginTop: 5, background: "#1A1E28", color: "#EDF0FA", padding: "10px 11px", borderRadius: 8, border: "1px solid #353B52" }}>{i === 0 ? selected.name : i === 1 ? "Sep 3 · 06:30 · 45 min" : i === 2 ? selected.location : selected.format ?? "Choose a format"}</div></label>)}</div><button className="ma-btn primary" onClick={() => setShowNew(false)} style={{ marginTop: 18, width: "100%", justifyContent: "center" }}>Save class</button></div></div>}
      {launched && <div style={{ position: "fixed", bottom: 22, right: 22, background: "#22D98A", color: "#0B0D11", borderRadius: 12, padding: "13px 17px", fontSize: 13, fontWeight: 850, boxShadow: "0 12px 35px #0008", zIndex: 7 }}>Live class ready · {selected.name}</div>}
    </main>
  );
}