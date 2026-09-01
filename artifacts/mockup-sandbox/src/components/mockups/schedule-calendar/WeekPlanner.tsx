import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Copy,
  Dumbbell,
  MapPin,
  MoreHorizontal,
  Play,
  Plus,
  Radio,
  Repeat2,
  Settings2,
  TimerReset,
  Users,
  X,
} from "lucide-react";
import "./_group.css";

type ClassItem = {
  id: string; name: string; day: number; time: string; duration: number; capacity: number;
  booked: number; location: string; focus: string; format?: string; recurring?: boolean; tone: "green" | "blue" | "purple" | "amber";
};

const tones = {
  green: { line: "#22d98a", fill: "#122d27", ink: "#a9f5d3" },
  blue: { line: "#4b8ef8", fill: "#172946", ink: "#aac9ff" },
  purple: { line: "#9b72f5", fill: "#2a203f", ink: "#d5c4ff" },
  amber: { line: "#f5a524", fill: "#392b15", ink: "#ffdaa1" },
};

const seed: ClassItem[] = [
  { id: "conditioning", name: "Morning Conditioning", day: 0, time: "07:00", duration: 45, capacity: 12, booked: 11, location: "Main Studio", focus: "Conditioning", format: "Engine Builder", recurring: true, tone: "green" },
  { id: "strength", name: "Strength Circuit", day: 2, time: "06:30", duration: 45, capacity: 12, booked: 5, location: "Main Studio", focus: "Full Body", format: "Total Body Circuit", recurring: true, tone: "green" },
  { id: "hiit", name: "Express HIIT", day: 2, time: "12:15", duration: 30, capacity: 10, booked: 2, location: "Studio B", focus: "HIIT", format: "30-Minute Burner", tone: "blue" },
  { id: "lower", name: "Lower Body Lab", day: 3, time: "17:30", duration: 50, capacity: 10, booked: 3, location: "Main Studio", focus: "Lower Body", recurring: true, tone: "purple" },
  { id: "athletic", name: "Athletic Foundations", day: 4, time: "08:15", duration: 60, capacity: 8, booked: 7, location: "Studio B", focus: "Strength", format: "Progressive Strength", tone: "amber" },
  { id: "mobility", name: "Saturday Mobility", day: 5, time: "09:00", duration: 45, capacity: 14, booked: 4, location: "Movement Room", focus: "Mobility", format: "Mobility Reset", tone: "blue" },
  { id: "recovery", name: "Recovery Flow", day: 6, time: "10:30", duration: 45, capacity: 12, booked: 8, location: "Movement Room", focus: "Recovery", tone: "purple" },
];

const people = ["Mia Thompson", "Jordan Lee", "Olivia Bennett", "Marcus Reed", "Sophia Patel", "Noah Williams", "Ava Martinez"];
const days = [
  { dow: "MON", date: "01" }, { dow: "TUE", date: "02" }, { dow: "WED", date: "03" },
  { dow: "THU", date: "04" }, { dow: "FRI", date: "05" }, { dow: "SAT", date: "06" }, { dow: "SUN", date: "07" },
];
const times = ["06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

function initials(name: string) {
  return name.split(" ").map((part) => part[0]).join("");
}
function mins(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  return (hour - 6) * 60 + minute;
}

export function WeekPlanner() {
  const [week, setWeek] = useState(0);
  const [items, setItems] = useState(seed);
  const [selected, setSelected] = useState("strength");
  const [newClass, setNewClass] = useState(false);
  const [live, setLive] = useState(false);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const selectedClass = items.find((item) => item.id === selected) ?? items[0];
  const selTone = tones[selectedClass.tone];
  const bookedPeople = people.slice(0, selectedClass.booked);
  const weeklyBooked = useMemo(() => items.reduce((sum, item) => sum + item.booked, 0), [items]);

  function addClass() {
    const id = `new-${Date.now()}`;
    setItems((current) => [...current, { id, name: "Coach's Choice", day: 1, time: "16:00", duration: 45, capacity: 10, booked: 0, location: "Studio B", focus: "Performance", tone: "amber" }]);
    setSelected(id);
    setNewClass(false);
  }

  return (
    <main className="fitos-schedule" style={{ padding: 0, minHeight: "100dvh", background: "#0b0d11" }}>
      <section style={{ maxWidth: 1540, margin: "0 auto", padding: "24px clamp(16px, 3vw, 40px) 34px" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 9, color: "#22d98a", fontSize: 11, fontWeight: 800, letterSpacing: ".15em" }}><span style={{ width: 8, height: 8, borderRadius: 99, background: "#22d98a" }} />SCHEDULE / WEEK VIEW</div>
            <h1 style={{ fontSize: "clamp(25px,3vw,36px)", letterSpacing: "-.055em", lineHeight: 1, margin: "8px 0 0", fontWeight: 900 }}>Run the week, not the spreadsheet.</h1>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <button onClick={() => setWeek((v) => v - 1)} aria-label="Previous week" style={iconButton}><ChevronLeft size={18} /></button>
            <button onClick={() => setWeek(0)} style={{ ...softButton, color: week === 0 ? "#22d98a" : "#8a92b2" }}>This week</button>
            <button onClick={() => setWeek((v) => v + 1)} aria-label="Next week" style={iconButton}><ChevronRight size={18} /></button>
            <button onClick={() => setNewClass(true)} style={primaryButton}><Plus size={16} /> New class</button>
            <button style={softButton}><Clock3 size={15} /> History</button>
          </div>
        </header>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(620px, 1.65fr) minmax(310px, .7fr)", gap: 16, alignItems: "start" }} className="week-layout">
          <section style={{ background: "#13161d", border: "1px solid #2a2f42", borderRadius: 16, overflow: "hidden", minWidth: 0 }}>
            <div style={{ display: "flex", padding: "14px 16px", borderBottom: "1px solid #2a2f42", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
              <div style={{ fontSize: 14, fontWeight: 800 }}>01–07 September <span style={{ color: "#4e566e", fontWeight: 600 }}>2026</span></div>
              <div style={{ display: "flex", gap: 14, color: "#8a92b2", fontSize: 11, fontWeight: 700 }}>
                <span><b style={{ color: "#22d98a" }}>{items.length}</b> sessions</span><span><b style={{ color: "#edf0fa" }}>{weeklyBooked}</b> booked</span>
              </div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <div style={{ minWidth: 690 }}>
                <div style={{ display: "grid", gridTemplateColumns: "54px repeat(7, 1fr)", borderBottom: "1px solid #2a2f42", background: "#101319" }}>
                  <div />
                  {days.map((day, index) => <button key={day.dow} onClick={() => { const first = items.find((item) => item.day === index); if (first) setSelected(first.id); }} style={{ color: "#8a92b2", background: index === 2 ? "#1a2830" : "transparent", border: "none", borderLeft: "1px solid #222738", padding: "10px 4px", cursor: "pointer", fontSize: 10, fontWeight: 800, letterSpacing: ".08em" }}><span style={{ display: "block" }}>{day.dow}</span><span style={{ color: index === 2 ? "#22d98a" : "#edf0fa", fontSize: 16, letterSpacing: 0 }}>{day.date}</span></button>)}
                </div>
                <div style={{ position: "relative", display: "grid", gridTemplateColumns: "54px repeat(7, 1fr)", height: 654, background: "#13161d" }}>
                  <div style={{ gridColumn: 1, gridRow: 1, zIndex: 1, background: "#13161d" }}>{times.map((time) => <div key={time} style={{ height: 50, padding: "7px 9px", color: "#4e566e", fontSize: 10, fontWeight: 700, textAlign: "right", borderBottom: "1px solid #1c202a" }}>{time}</div>)}</div>
                  {days.map((_, day) => <div key={day} style={{ gridColumn: day + 2, gridRow: 1, position: "relative", borderLeft: "1px solid #222738", background: day === 2 ? "rgba(34,217,138,.025)" : "transparent" }}>{times.map((time) => <div key={time} style={{ height: 50, borderBottom: "1px solid #1c202a" }} />)}
                    {items.filter((item) => item.day === day).map((item) => {
                      const tone = tones[item.tone]; const active = item.id === selected;
                      return <button key={item.id} onClick={() => setSelected(item.id)} style={{ position: "absolute", left: 5, right: 5, top: mins(item.time) / 60 * 50 + 2, height: Math.max(item.duration / 60 * 50 - 3, 30), background: active ? tone.fill : "#1a1e28", border: `1px solid ${active ? tone.line : "#2a2f42"}`, borderLeft: `3px solid ${tone.line}`, borderRadius: 7, padding: "5px 6px", overflow: "hidden", textAlign: "left", color: "#edf0fa", cursor: "pointer", boxShadow: active ? `0 0 0 1px ${tone.line}44` : "none" }}>
                        <span style={{ display: "block", fontSize: 10, lineHeight: 1.15, fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</span>
                        <span style={{ color: active ? tone.ink : "#8a92b2", display: "block", marginTop: 3, fontSize: 9, fontWeight: 700 }}>{item.time} · {item.booked}/{item.capacity}</span>
                      </button>;
                    })}
                  </div>)}
                  <div style={{ position: "absolute", left: 54, right: 0, top: 321, borderTop: "1px dashed #22d98a88", pointerEvents: "none" }}><span style={{ position: "absolute", right: 4, top: -16, color: "#22d98a", fontSize: 9, fontWeight: 800, background: "#13161d", padding: "1px 3px" }}>12:25</span></div>
                </div>
              </div>
            </div>
          </section>

          <aside style={{ background: "#13161d", border: `1px solid ${selTone.line}55`, borderRadius: 16, overflow: "hidden", minWidth: 0 }}>
            <div style={{ padding: "17px 18px 15px", borderBottom: "1px solid #2a2f42" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <div style={{ color: selTone.ink, fontSize: 10, letterSpacing: ".12em", fontWeight: 900, textTransform: "uppercase" }}>{selectedClass.focus} class</div>
                <button aria-label="More class options" style={{ ...iconButton, width: 28, height: 28 }}><MoreHorizontal size={17} /></button>
              </div>
              <h2 style={{ fontSize: 23, letterSpacing: "-.045em", margin: "6px 0 8px", lineHeight: 1.04 }}>{selectedClass.name}</h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, color: "#8a92b2", fontSize: 12, fontWeight: 600 }}>
                <span style={meta}><CalendarDays size={13} /> {days[selectedClass.day].dow} 0{days[selectedClass.day].date} SEP</span>
                <span style={meta}><Clock3 size={13} /> {selectedClass.time} · {selectedClass.duration} min</span>
                <span style={meta}><MapPin size={13} /> {selectedClass.location}</span>
              </div>
              <div style={{ display: "flex", gap: 7, marginTop: 14, flexWrap: "wrap" }}>
                {selectedClass.recurring && <span style={{ ...badge, color: "#f5a524", borderColor: "#f5a52455" }}><Repeat2 size={12} /> Weekly series</span>}
                {selectedClass.format ? <span style={{ ...badge, color: "#22c4d9", borderColor: "#22c4d955" }}><Settings2 size={12} /> {selectedClass.format}</span> : <button style={{ ...badge, color: "#22c4d9", borderColor: "#22c4d955", background: "transparent", cursor: "pointer" }}><Plus size={12} /> Attach format</button>}
              </div>
            </div>
            <div style={{ padding: 16 }}>
              <button onClick={() => setLive((v) => !v)} style={{ ...primaryButton, width: "100%", justifyContent: "center", padding: "12px 14px", background: live ? "#f5a524" : "#22d98a" }}>{live ? <TimerReset size={17} /> : <Play size={17} fill="currentColor" />}{live ? "Class is live · 43:18" : "Lead class"}</button>
              <button onClick={() => setLive(true)} style={{ ...softButton, width: "100%", justifyContent: "center", marginTop: 8, color: "#22c4d9" }}><Radio size={15} /> Launch station timer</button>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", marginTop: 20, marginBottom: 8 }}>
                <div><div style={sectionLabel}>Enrollment</div><div style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-.05em" }}>{selectedClass.booked}<span style={{ color: "#4e566e", fontSize: 14 }}> / {selectedClass.capacity}</span></div></div>
                <span style={{ color: selectedClass.booked >= selectedClass.capacity ? "#f5445a" : "#22d98a", fontSize: 11, fontWeight: 800 }}>{selectedClass.capacity - selectedClass.booked} places open</span>
              </div>
              <div style={{ height: 6, background: "#222738", borderRadius: 99, overflow: "hidden", marginBottom: 18 }}><div style={{ height: "100%", width: `${selectedClass.booked / selectedClass.capacity * 100}%`, borderRadius: 99, background: selTone.line }} /></div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 9 }}><div style={sectionLabel}>Roster <span style={{ color: "#4e566e" }}>/{selectedClass.booked}</span></div><button style={{ background: "transparent", border: 0, color: "#4b8ef8", fontSize: 11, fontWeight: 800, cursor: "pointer" }}>Manage</button></div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {bookedPeople.length === 0 && <div style={{ padding: 13, color: "#4e566e", fontSize: 12, textAlign: "center", background: "#1a1e28", borderRadius: 8 }}>No one booked yet.</div>}
                {bookedPeople.map((person, index) => <div key={person} style={{ display: "flex", alignItems: "center", padding: "7px 8px", borderRadius: 8, background: "#1a1e28", gap: 8 }}>
                  <span style={{ width: 24, height: 24, borderRadius: 99, display: "grid", placeItems: "center", background: index % 2 ? "#213c37" : "#2b2540", color: index % 2 ? "#7ee7b7" : "#c7b1ff", fontSize: 9, fontWeight: 900 }}>{initials(person)}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, flex: 1 }}>{person}</span>
                  <button onClick={() => setAttendance((value) => ({ ...value, [person]: value[person] === "Present" ? "" : "Present" }))} style={{ border: `1px solid ${attendance[person] ? "#22d98a" : "#353b52"}`, borderRadius: 5, background: attendance[person] ? "#163a2d" : "transparent", color: attendance[person] ? "#22d98a" : "#8a92b2", fontSize: 9, fontWeight: 800, padding: "4px 6px", cursor: "pointer" }}>{attendance[person] || "Mark"}</button>
                </div>)}
              </div>
              <button style={{ ...softButton, width: "100%", justifyContent: "center", marginTop: 12 }}><Users size={15} /> Add client</button>
            </div>
          </aside>
        </div>
      </section>
      {newClass && <div style={{ position: "fixed", inset: 0, display: "grid", placeItems: "center", background: "#06070ab8", zIndex: 10, padding: 16 }}>
        <div style={{ width: "min(420px,100%)", background: "#13161d", border: "1px solid #353b52", borderRadius: 16, padding: 22, boxShadow: "0 22px 70px #0008" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}><div><div style={{ color: "#22d98a", fontSize: 10, fontWeight: 900, letterSpacing: ".13em" }}>SCHEDULE</div><h2 style={{ margin: "5px 0 0", fontSize: 22 }}>New class</h2></div><button onClick={() => setNewClass(false)} style={iconButton}><X size={17} /></button></div>
          <div style={{ marginTop: 18, padding: 14, borderRadius: 10, background: "#1a1e28", color: "#8a92b2", fontSize: 13, lineHeight: 1.5 }}>Coach's Choice<br /><b style={{ color: "#edf0fa" }}>Tue 02 Sep · 16:00 · Studio B</b><br />45 minutes · 10 places</div>
          <div style={{ display: "flex", gap: 8, marginTop: 18 }}><button onClick={() => setNewClass(false)} style={{ ...softButton, flex: 1, justifyContent: "center" }}>Cancel</button><button onClick={addClass} style={{ ...primaryButton, flex: 1, justifyContent: "center" }}><Copy size={15} /> Create class</button></div>
        </div>
      </div>}
    </main>
  );
}

const iconButton = { width: 34, height: 34, display: "inline-grid", placeItems: "center", background: "#1a1e28", color: "#8a92b2", border: "1px solid #2a2f42", borderRadius: 8, cursor: "pointer" };
const softButton = { display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 10px", background: "#1a1e28", color: "#8a92b2", border: "1px solid #2a2f42", borderRadius: 8, cursor: "pointer", fontSize: 11, fontWeight: 800 };
const primaryButton = { display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 12px", background: "#22d98a", color: "#08130e", border: "1px solid transparent", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 900 };
const meta = { display: "inline-flex", alignItems: "center", gap: 4 };
const badge = { display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 7px", border: "1px solid", borderRadius: 5, background: "#1a1e28", fontSize: 10, fontWeight: 800 };
const sectionLabel = { fontSize: 10, color: "#8a92b2", fontWeight: 900, letterSpacing: ".11em", textTransform: "uppercase" };