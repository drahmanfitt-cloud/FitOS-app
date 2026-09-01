import { useMemo, useState, type CSSProperties, type ReactNode } from "react";
import "./_group.css";

const C = {
  bg: "#0B0D11", surface: "#13161D", s2: "#1A1E28", s3: "#222738",
  border: "#2A2F42", border2: "#353B52", green: "#22D98A",
  blue: "#4B8EF8", purple: "#9B72F5", amber: "#F5A524",
  red: "#F5445A", teal: "#22C4D9", text: "#EDF0FA",
  sub: "#8A92B2", muted: "#4E566E",
};

type Attendance = "attended" | "late" | "no-show" | null;
type Booking = { clientId: string; attendance: Attendance };
type Client = { id: string; name: string; tag: "Active" | "VIP" | "Lead" };
type ClassItem = {
  id: string;
  name: string;
  date: string;
  time: string;
  duration: number;
  capacity: number;
  location: string;
  focus: string;
  seriesId?: string;
  status: "scheduled" | "completed";
  bookings: Booking[];
  formatId?: string;
  formatName?: string;
};

const TAG_COLORS = { Active: C.green, VIP: C.purple, Lead: C.blue };

const CLIENTS: Client[] = [
  { id: "mia", name: "Mia Thompson", tag: "VIP" },
  { id: "jordan", name: "Jordan Lee", tag: "Active" },
  { id: "olivia", name: "Olivia Bennett", tag: "Active" },
  { id: "marcus", name: "Marcus Reed", tag: "Active" },
  { id: "sophia", name: "Sophia Patel", tag: "VIP" },
  { id: "noah", name: "Noah Williams", tag: "Lead" },
  { id: "ava", name: "Ava Martinez", tag: "Active" },
];

const INITIAL_CLASSES: ClassItem[] = [
  {
    id: "strength", name: "Strength Circuit", date: "2026-09-03", time: "06:30",
    duration: 45, capacity: 12, location: "Main Studio", focus: "Full Body",
    seriesId: "series-strength", status: "scheduled", formatId: "fmt-circuit",
    formatName: "Total Body Circuit",
    bookings: [
      { clientId: "mia", attendance: "attended" },
      { clientId: "jordan", attendance: null },
      { clientId: "olivia", attendance: null },
      { clientId: "marcus", attendance: "late" },
      { clientId: "sophia", attendance: null },
    ],
  },
  {
    id: "hiit", name: "Express HIIT", date: "2026-09-03", time: "12:15",
    duration: 30, capacity: 10, location: "Studio B", focus: "HIIT",
    status: "scheduled", formatId: "fmt-hiit", formatName: "30-Minute Burner",
    bookings: [{ clientId: "noah", attendance: null }, { clientId: "ava", attendance: null }],
  },
  {
    id: "lower", name: "Lower Body Lab", date: "2026-09-04", time: "17:30",
    duration: 50, capacity: 10, location: "Main Studio", focus: "Lower Body",
    seriesId: "series-lower", status: "scheduled",
    bookings: [{ clientId: "mia", attendance: null }, { clientId: "sophia", attendance: null }, { clientId: "ava", attendance: null }],
  },
  {
    id: "mobility", name: "Saturday Mobility", date: "2026-09-05", time: "09:00",
    duration: 45, capacity: 14, location: "Movement Room", focus: "Mobility",
    status: "scheduled", formatId: "fmt-flow", formatName: "Mobility Reset",
    bookings: [{ clientId: "jordan", attendance: null }, { clientId: "olivia", attendance: null }, { clientId: "marcus", attendance: null }, { clientId: "noah", attendance: null }],
  },
  {
    id: "completed", name: "Morning Conditioning", date: "2026-09-01", time: "07:00",
    duration: 45, capacity: 12, location: "Main Studio", focus: "Conditioning",
    status: "completed",
    bookings: [{ clientId: "mia", attendance: "attended" }, { clientId: "jordan", attendance: "no-show" }],
  },
];

function Pill({ children, color = C.green }: { children: ReactNode; color?: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", fontSize: 10, fontWeight: 700, letterSpacing: "0.04em", padding: "3px 8px", borderRadius: 20, background: `${color}1A`, color, border: `1px solid ${color}30`, whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}

type ButtonVariant = "primary" | "ghost" | "outline" | "danger";
function Btn({ children, variant = "primary", color = C.green, style, onClick }: { children: ReactNode; variant?: ButtonVariant; color?: string; style?: CSSProperties; onClick?: () => void }) {
  const variants: Record<ButtonVariant, CSSProperties> = {
    primary: { background: color, color: "#000", border: "1px solid transparent" },
    ghost: { background: `${color}15`, color, border: `1px solid ${color}30` },
    outline: { background: "transparent", color: C.sub, border: `1px solid ${C.border}` },
    danger: { background: `${C.red}18`, color: C.red, border: `1px solid ${C.red}40` },
  };
  return <button onClick={onClick} style={{ ...variants[variant], borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 12, padding: "8px 14px", display: "inline-flex", alignItems: "center", gap: 5, ...style }}>{children}</button>;
}

function Card({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 18, ...style }}>{children}</div>;
}

function SL({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted, marginBottom: 8, ...style }}>{children}</div>;
}

function Avatar({ name, size, color }: { name: string; size: number; color: string }) {
  return <div style={{ width: size, height: size, borderRadius: "50%", background: `${color}33`, border: `2px solid ${color}55`, display: "flex", alignItems: "center", justifyContent: "center", color, fontWeight: 800, fontSize: size * 0.38, flexShrink: 0 }}>{name[0]}</div>;
}

function ClassRunPanel() {
  const [classType, setClassType] = useState<"hiit" | "mobility">("hiit");
  return (
    <div style={{ borderTop: `1px solid ${C.border}`, marginTop: 12, paddingTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", background: C.s3, borderRadius: 8, padding: 3 }}>
        <button onClick={() => setClassType("hiit")} style={{ flex: 1, padding: 6, borderRadius: 6, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 12, background: classType === "hiit" ? C.green : "transparent", color: classType === "hiit" ? "#000" : C.sub }}>🏋️ HIIT</button>
        <button onClick={() => setClassType("mobility")} style={{ flex: 1, padding: 6, borderRadius: 6, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 12, background: classType === "mobility" ? C.teal : "transparent", color: classType === "mobility" ? "#000" : C.sub }}>🤸 Mobility</button>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <Btn color={classType === "hiit" ? C.green : C.teal} style={{ flex: 1, justifyContent: "center", padding: 10, fontSize: 13 }}>📖 {classType === "hiit" ? "Follow-Along" : "Lead Movement"}</Btn>
        {classType === "hiit" && <Btn variant="ghost" color={C.green} style={{ flex: 1, justifyContent: "center", padding: 10, fontSize: 13 }}>▶ Station Timer</Btn>}
      </div>
    </div>
  );
}

export function Current() {
  const [classes, setClasses] = useState(INITIAL_CLASSES);
  const [selected, setSelected] = useState("strength");
  const [showHistory, setShowHistory] = useState(false);
  const visible = useMemo(() => classes.filter(c => showHistory ? c.status === "completed" : c.status !== "completed"), [classes, showHistory]);
  const sel = classes.find(c => c.id === selected);
  const seriesCount = sel?.seriesId ? classes.filter(c => c.seriesId === sel.seriesId).length : 0;
  const attendanceColors = { attended: C.green, "no-show": C.red, late: C.amber };

  const patchSelected = (patch: Partial<ClassItem>) => {
    if (!sel) return;
    setClasses(items => items.map(item => item.id === sel.id ? { ...item, ...patch } : item));
  };
  const toggleBooking = (clientId: string) => {
    if (!sel) return;
    const exists = sel.bookings.some(b => b.clientId === clientId);
    patchSelected({ bookings: exists ? sel.bookings.filter(b => b.clientId !== clientId) : [...sel.bookings, { clientId, attendance: null }] });
  };
  const markAttendance = (clientId: string, attendance: Exclude<Attendance, null>) => {
    if (!sel) return;
    patchSelected({ bookings: sel.bookings.map(b => b.clientId === clientId ? { ...b, attendance: b.attendance === attendance ? null : attendance } : b) });
  };

  return (
    <main className="fitos-schedule">
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16, minHeight: 500 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn style={{ flex: 1, justifyContent: "center" }}>+ New Class</Btn>
            <Btn variant={showHistory ? "ghost" : "outline"} color={C.amber} onClick={() => { setShowHistory(v => !v); setSelected(""); }}>🕘 History</Btn>
          </div>
          {visible.map(item => (
            <div key={item.id} onClick={() => setSelected(item.id)} style={{ background: C.surface, borderTop: `1px solid ${selected === item.id ? C.green : C.border}`, borderRight: `1px solid ${selected === item.id ? C.green : C.border}`, borderBottom: `1px solid ${selected === item.id ? C.green : C.border}`, borderRadius: 12, padding: 14, cursor: "pointer", borderLeft: `3px solid ${item.status === "completed" ? C.muted : C.green}` }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ color: C.text, fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 5 }}>{item.seriesId && <span style={{ color: C.amber }}>↻</span>}{item.name}</div>
                <Pill color={item.status === "completed" ? C.muted : C.green}>{item.status}</Pill>
              </div>
              <div style={{ color: C.sub, fontSize: 12, marginTop: 4 }}>{item.date} · {item.time} · {item.duration}min</div>
              <div style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>{item.bookings.length}/{item.capacity} enrolled</div>
              <div style={{ marginTop: 5, display: "flex", gap: 5, flexWrap: "wrap" }}>
                <Pill color={C.purple}>{item.focus}</Pill>
                {item.formatId && <Pill color={C.teal}>{item.formatName}</Pill>}
              </div>
            </div>
          ))}
        </div>

        {!sel ? (
          <Card style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ textAlign: "center", color: C.muted }}><div style={{ fontSize: 32, marginBottom: 10 }}>📅</div>Select a class</div>
          </Card>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <div style={{ color: C.text, fontWeight: 800, fontSize: 18 }}>{sel.name}</div>
                  <div style={{ color: C.sub, fontSize: 13, marginTop: 2 }}>{sel.date} · {sel.time} · {sel.duration}min · {sel.location}</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
                    <Pill color={C.purple}>🎯 {sel.focus}</Pill>
                    {sel.seriesId && <Pill color={C.amber}>↻ Recurring{seriesCount > 1 ? ` · ${seriesCount}` : ""}</Pill>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                  <Btn variant="ghost" color={C.blue} style={{ padding: "6px 12px", fontSize: 11 }}>Edit</Btn>
                  {sel.status === "scheduled" && <Btn variant="ghost" color={C.green} style={{ padding: "6px 12px", fontSize: 11 }} onClick={() => patchSelected({ status: "completed" })}>✓ Complete</Btn>}
                  <Btn variant="danger" style={{ padding: "6px 12px", fontSize: 11 }}>Delete</Btn>
                  {seriesCount > 1 && <Btn variant="ghost" color={C.red} style={{ padding: "6px 12px", fontSize: 11 }}>Delete series</Btn>}
                </div>
              </div>
              <div style={{ background: C.s2, borderRadius: 10, padding: "12px 14px", border: `1px solid ${sel.formatId ? `${C.teal}44` : C.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <SL style={{ marginBottom: 4 }}>Class Format</SL>
                    {sel.formatId ? <div><div style={{ color: C.text, fontWeight: 700, fontSize: 14 }}>{sel.formatName}</div><div style={{ color: C.muted, fontSize: 11 }}>6 stations</div></div> : <div style={{ color: C.muted, fontSize: 13 }}>No format attached.</div>}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {sel.formatId && <Btn variant="danger" style={{ padding: "5px 10px", fontSize: 11 }} onClick={() => patchSelected({ formatId: undefined, formatName: undefined })}>Detach</Btn>}
                    <Btn variant="ghost" color={C.teal} style={{ padding: "5px 10px", fontSize: 11 }}>📋 Attach Format</Btn>
                  </div>
                </div>
                {sel.formatId && sel.status === "scheduled" && <ClassRunPanel />}
              </div>
            </Card>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
              {[
                { label: "Enrolled", value: `${sel.bookings.length}/${sel.capacity}`, color: C.text },
                { label: "Attended", value: sel.bookings.filter(b => b.attendance === "attended").length, color: C.green },
                { label: "No-shows", value: sel.bookings.filter(b => b.attendance === "no-show").length, color: C.red },
              ].map(stat => <div key={stat.label} style={{ background: C.s2, border: `1px solid ${C.border}`, borderRadius: 9, padding: 12, textAlign: "center" }}><div style={{ color: C.muted, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>{stat.label}</div><div style={{ color: stat.color, fontWeight: 800, fontSize: 22 }}>{stat.value}</div></div>)}
            </div>

            <Card>
              <SL>Roster</SL>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
                {sel.bookings.map(booking => {
                  const client = CLIENTS.find(c => c.id === booking.clientId);
                  if (!client) return null;
                  return (
                    <div key={booking.clientId} style={{ display: "flex", alignItems: "center", gap: 10, background: C.s2, borderRadius: 9, padding: "10px 12px", border: `1px solid ${C.border}` }}>
                      <Avatar name={client.name} size={28} color={TAG_COLORS[client.tag]} />
                      <span style={{ color: C.text, fontWeight: 600, fontSize: 13, flex: 1 }}>{client.name}</span>
                      {sel.status === "scheduled" && <div style={{ display: "flex", gap: 5 }}>
                        {(["attended", "late", "no-show"] as const).map(status => <button key={status} onClick={() => markAttendance(booking.clientId, status)} style={{ padding: "3px 9px", borderRadius: 6, border: `1px solid ${booking.attendance === status ? attendanceColors[status] : C.border}`, background: booking.attendance === status ? `${attendanceColors[status]}20` : "transparent", color: booking.attendance === status ? attendanceColors[status] : C.muted, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>{status}</button>)}
                      </div>}
                      <button aria-label={`Remove ${client.name}`} onClick={() => toggleBooking(booking.clientId)} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 16 }}>×</button>
                    </div>
                  );
                })}
              </div>
              {sel.status === "scheduled" && <>
                <SL>Add Client</SL>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {CLIENTS.filter(client => !sel.bookings.some(b => b.clientId === client.id)).map(client => <button key={client.id} onClick={() => toggleBooking(client.id)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 12px", background: C.s2, border: `1px solid ${C.border}`, borderRadius: 8, color: C.sub, fontSize: 12, cursor: "pointer" }}><Avatar name={client.name} size={20} color={TAG_COLORS[client.tag]} />{client.name}</button>)}
                </div>
              </>}
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}