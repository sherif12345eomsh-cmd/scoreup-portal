import React, { useState, useEffect, useRef } from "react";
import { supabase, isConfigured } from "./supabase.js";

/* ============================================================
   ScoreUp Elite Academy — Homework Portal (live, shared data)
   Teacher assigns · students do & submit · all data in Supabase
   ============================================================ */

const C = {
  black: "#0A0A0A", coal: "#141414", panel: "#1A1A1A", raised: "#1E1E1E",
  gold: "#E6B43C", goldLt: "#F5D67A", goldDk: "#B8860B",
  cream: "#F5EFE0", ash: "#9A968C", line: "#2A2A2A",
  green: "#6FCF97", greenBg: "#14241A", amber: "#F2C94C", amberBg: "#2A2410",
  red: "#EB5757", redBg: "#2A1414",
};

const Logo = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" aria-label="ScoreUp">
    <defs>
      <linearGradient id="g" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0" stopColor={C.goldDk} /><stop offset=".5" stopColor={C.gold} /><stop offset="1" stopColor={C.goldLt} />
      </linearGradient>
    </defs>
    <rect x="15" y="15" width="70" height="70" rx="15" fill="#0A0A0A" stroke="url(#g)" strokeWidth="4.5" />
    <path d="M57 72 L67 72 L67 44 L62 38 L57 44 Z" fill="url(#g)" />
    <path d="M26 68 Q46 64 62 40" fill="none" stroke="url(#g)" strokeWidth="2" opacity=".45" strokeLinecap="round" />
    <path d="M27 71 Q48 67 64 43" fill="none" stroke="url(#g)" strokeWidth="3" opacity=".6" strokeLinecap="round" />
    <path d="M29 70 Q50 65 66 36" fill="none" stroke="url(#g)" strokeWidth="7.5" strokeLinecap="round" />
    <path d="M58 26 L76 30 L66 45 Z" fill="url(#g)" />
  </svg>
);

const Pill = ({ children, tone = "gold" }) => {
  const map = { gold: [C.gold, "rgba(230,180,60,.12)"], green: [C.green, C.greenBg], amber: [C.amber, C.amberBg], red: [C.red, C.redBg], ash: [C.ash, "rgba(154,150,140,.12)"] };
  const [fg, bg] = map[tone] || map.gold;
  return <span style={{ color: fg, background: bg, border: `1px solid ${fg}33`, padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>{children}</span>;
};

const Btn = ({ children, onClick, kind = "gold", disabled, full, small }) => {
  const base = { cursor: disabled ? "not-allowed" : "pointer", border: "none", borderRadius: 12, fontWeight: 800, padding: small ? "8px 14px" : "13px 20px", fontSize: small ? 13 : 15, width: full ? "100%" : "auto", opacity: disabled ? .5 : 1, transition: "transform .08s" };
  const kinds = { gold: { background: `linear-gradient(135deg, ${C.goldLt}, ${C.gold} 55%, ${C.goldDk})`, color: "#1a1300" }, ghost: { background: "transparent", color: C.cream, border: `1px solid ${C.line}` } };
  return <button onClick={disabled ? undefined : onClick}
    onMouseDown={e => !disabled && (e.currentTarget.style.transform = "scale(.97)")}
    onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
    onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
    style={{ ...base, ...kinds[kind] }}>{children}</button>;
};

const Card = ({ children, style, onClick, hover }) => (
  <div onClick={onClick} style={{ background: C.raised, border: `1px solid ${C.line}`, borderRadius: 16, padding: 18, ...(style || {}) }}
    onMouseEnter={hover ? e => (e.currentTarget.style.borderColor = C.gold + "66") : undefined}
    onMouseLeave={hover ? e => (e.currentTarget.style.borderColor = C.line) : undefined}>{children}</div>
);

const Field = ({ label, children }) => (
  <label style={{ display: "block", marginBottom: 14 }}>
    <div style={{ color: C.ash, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: .6, marginBottom: 6 }}>{label}</div>
    {children}
  </label>
);
const inputStyle = { width: "100%", background: C.coal, border: `1px solid ${C.line}`, borderRadius: 10, color: C.cream, padding: "12px 14px", fontSize: 15, outline: "none", fontFamily: "inherit" };

const fmtDate = d => new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" });
const daysLeft = d => Math.ceil((new Date(d + "T00:00:00") - new Date()) / 86400000);
const dueTone = d => { const n = daysLeft(d); return n < 0 ? "red" : n <= 1 ? "amber" : "green"; };
const dueLabel = d => { const n = daysLeft(d); return n < 0 ? `${-n}d overdue` : n === 0 ? "Due today" : n === 1 ? "Due tomorrow" : `${n} days left`; };

// ============================================================
export default function App() {
  const [session, setSession] = useState(null);
  const [students, setStudents] = useState([]);
  const [homework, setHomework] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const refresh = async () => {
    const [s, h, sub] = await Promise.all([
      supabase.from("students").select("*").order("name"),
      supabase.from("homework").select("*").order("due"),
      supabase.from("submissions").select("*").order("submitted_at", { ascending: false }),
    ]);
    if (s.error || h.error || sub.error) setErr((s.error || h.error || sub.error).message);
    setStudents(s.data || []); setHomework(h.data || []); setSubmissions(sub.data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (!isConfigured) { setLoading(false); return; }
    refresh();
    // live updates: when anyone submits, everyone refreshes
    const ch = supabase.channel("rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "submissions" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "homework" }, refresh)
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, []);

  if (!isConfigured) return <NotConfigured />;
  if (loading) return <Splash />;

  return (
    <div style={{ minHeight: "100vh", background: `radial-gradient(1200px 600px at 50% -10%, #1a1408 0%, ${C.black} 55%)`, color: C.cream, fontFamily: "'Inter','Helvetica Neue',Arial,sans-serif" }}>
      {err && <div style={{ background: C.redBg, color: C.red, padding: "8px 16px", fontSize: 13, textAlign: "center" }}>{err}</div>}
      {!session && <Login students={students} onLogin={setSession} />}
      {session?.role === "student" && <Student me={students.find(x => x.id === session.studentId)} homework={homework} submissions={submissions} onExit={() => setSession(null)} refresh={refresh} />}
      {session?.role === "teacher" && <Teacher students={students} homework={homework} submissions={submissions} onExit={() => setSession(null)} refresh={refresh} />}
    </div>
  );
}

function Splash() {
  return <div style={{ minHeight: "100vh", background: C.black, display: "grid", placeItems: "center" }}>
    <div style={{ textAlign: "center" }}><Logo size={64} /><div style={{ color: C.gold, marginTop: 14, letterSpacing: 3, fontWeight: 800 }}>SCOREUP</div></div>
  </div>;
}

function NotConfigured() {
  return <div style={{ minHeight: "100vh", background: C.black, color: C.cream, display: "grid", placeItems: "center", fontFamily: "Arial", padding: 24 }}>
    <div style={{ maxWidth: 460, textAlign: "center" }}>
      <Logo size={56} />
      <h2 style={{ color: C.gold, marginTop: 16 }}>Almost there</h2>
      <p style={{ color: C.ash, lineHeight: 1.6 }}>The app isn't connected to your database yet. Open <b style={{ color: C.cream }}>src/supabase.js</b> and paste your two Supabase keys, following the setup guide. Then refresh.</p>
    </div>
  </div>;
}

function TopBar({ subtitle, right, onExit }) {
  return <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", borderBottom: `1px solid ${C.line}`, background: "rgba(10,10,10,.6)", backdropFilter: "blur(8px)", position: "sticky", top: 0, zIndex: 10 }}>
    <Logo size={38} />
    <div style={{ lineHeight: 1.1 }}>
      <div style={{ fontWeight: 800, letterSpacing: 1 }}><span style={{ color: C.cream }}>SCORE</span><span style={{ color: C.gold }}>UP</span> <span style={{ color: C.ash, fontSize: 11 }}>ELITE ACADEMY</span></div>
      <div style={{ color: C.ash, fontSize: 12 }}>{subtitle}</div>
    </div>
    <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>{right}<Btn kind="ghost" small onClick={onExit}>Log out</Btn></div>
  </div>;
}

// ---------------- LOGIN ----------------
function Login({ students, onLogin }) {
  const [tab, setTab] = useState("student");
  const [studentId, setStudentId] = useState(students[0]?.id || "");
  const [pin, setPin] = useState("");
  const [tpw, setTpw] = useState("");
  const [err, setErr] = useState("");

  const studentLogin = () => {
    const s = students.find(x => x.id === studentId);
    if (s && pin === s.pin) onLogin({ role: "student", studentId });
    else setErr("Wrong PIN.");
  };
  const teacherLogin = async () => {
    const { data } = await supabase.from("staff").select("password").limit(1).single();
    if (data && tpw === data.password) onLogin({ role: "teacher" });
    else setErr("Wrong password.");
  };

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 26 }}>
          <Logo size={58} />
          <h1 style={{ fontFamily: "Georgia,serif", fontSize: 30, margin: "16px 0 4px" }}>Turn Potential Into <span style={{ color: C.gold, fontStyle: "italic" }}>Results.</span></h1>
          <div style={{ color: C.ash, fontSize: 14 }}>Homework Portal · log in to continue</div>
        </div>
        <Card style={{ padding: 22 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 18, background: C.coal, padding: 5, borderRadius: 12 }}>
            {["student", "teacher"].map(t => (
              <button key={t} onClick={() => { setTab(t); setErr(""); }}
                style={{ flex: 1, padding: 10, borderRadius: 9, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 14, textTransform: "capitalize",
                  background: tab === t ? `linear-gradient(135deg, ${C.goldLt}, ${C.gold})` : "transparent", color: tab === t ? "#1a1300" : C.ash }}>{t}</button>
            ))}
          </div>
          {tab === "student" ? (
            <>
              <Field label="Who are you?">
                <select style={inputStyle} value={studentId} onChange={e => { setStudentId(e.target.value); setErr(""); }}>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name} — {s.group}</option>)}
                </select>
              </Field>
              <Field label="Your PIN">
                <input style={inputStyle} value={pin} type="password" inputMode="numeric" placeholder="4-digit PIN"
                  onChange={e => { setPin(e.target.value); setErr(""); }} onKeyDown={e => e.key === "Enter" && studentLogin()} />
              </Field>
              <Btn full onClick={studentLogin}>Enter my homework →</Btn>
            </>
          ) : (
            <>
              <Field label="Teacher password">
                <input style={inputStyle} value={tpw} type="password" placeholder="password"
                  onChange={e => { setTpw(e.target.value); setErr(""); }} onKeyDown={e => e.key === "Enter" && teacherLogin()} />
              </Field>
              <Btn full onClick={teacherLogin}>Open teacher dashboard →</Btn>
            </>
          )}
          {err && <div style={{ color: C.red, fontSize: 13, marginTop: 12, textAlign: "center" }}>{err}</div>}
        </Card>
      </div>
    </div>
  );
}

// ---------------- STUDENT ----------------
function Student({ me, homework, submissions, onExit, refresh }) {
  const [openId, setOpenId] = useState(null);
  const myHw = homework.filter(h => h.group === me.group);
  const subFor = id => submissions.find(s => s.student_id === me.id && s.hw_id === id);
  const done = myHw.filter(h => subFor(h.id)).length;

  if (openId) {
    const hw = homework.find(h => h.id === openId);
    return <DoHomework hw={hw} me={me} existing={subFor(openId)} onBack={() => setOpenId(null)}
      onDone={() => { setOpenId(null); refresh(); }} />;
  }

  return (
    <>
      <TopBar subtitle={`${me.name} · ${me.group}`} onExit={onExit} right={<Pill>{done}/{myHw.length} done</Pill>} />
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px 60px" }}>
        <h2 style={{ fontFamily: "Georgia,serif", fontSize: 24, marginBottom: 4 }}>Your homework</h2>
        <p style={{ color: C.ash, marginBottom: 20, fontSize: 14 }}>Tap any assignment to open and submit it.</p>
        {myHw.length === 0 && <Card><div style={{ color: C.ash, textAlign: "center", padding: 20 }}>Nothing assigned yet.</div></Card>}
        <div style={{ display: "grid", gap: 14 }}>
          {myHw.map(h => {
            const sub = subFor(h.id);
            return (
              <Card key={h.id} hover onClick={() => setOpenId(h.id)} style={{ cursor: "pointer" }}>
                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                      <Pill tone="ash">{h.id}</Pill><Pill>{h.subject}</Pill>
                      <Pill tone={h.difficulty === "Hard" ? "red" : h.difficulty === "Medium" ? "amber" : "green"}>{h.difficulty}</Pill>
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>{h.title}</div>
                    <div style={{ color: C.ash, fontSize: 13, marginTop: 4 }}>{h.mode === "quiz" ? `${(h.questions || []).length} questions · type answers` : "Upload a photo of your work"}</div>
                  </div>
                  <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                    {sub ? <Pill tone="green">✓ Submitted</Pill> : <Pill tone={dueTone(h.due)}>{dueLabel(h.due)}</Pill>}
                    <div style={{ color: C.ash, fontSize: 12 }}>Due {fmtDate(h.due)}</div>
                  </div>
                </div>
                {sub && sub.score != null && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.line}`, display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: C.ash, fontSize: 13 }}>Graded</span>
                    <Pill tone={sub.score >= 0.7 ? "green" : "amber"}>{Math.round(sub.score * 100)}%</Pill>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
}

function DoHomework({ hw, me, existing, onBack, onDone }) {
  const qs = hw.questions || [];
  const [answers, setAnswers] = useState(existing?.answers || qs.map(() => ""));
  const [photo, setPhoto] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(existing?.photo_url || null);
  const [note, setNote] = useState(existing?.note || "");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const fileRef = useRef();

  const canSubmit = hw.mode === "quiz" ? answers.every(a => (a || "").trim() !== "") : (!!photo || !!photoUrl);

  const onFile = e => {
    const file = e.target.files[0]; if (!file) return;
    setPhoto(file);
    const r = new FileReader(); r.onload = () => setPhotoUrl(r.result); r.readAsDataURL(file);
  };

  const submit = async () => {
    setSaving(true); setErr("");
    let finalPhotoUrl = existing?.photo_url || null;
    try {
      if (photo) {
        const path = `${me.id}/${hw.id}_${Date.now()}_${photo.name}`;
        const up = await supabase.storage.from("submissions").upload(path, photo, { upsert: true });
        if (up.error) throw up.error;
        finalPhotoUrl = supabase.storage.from("submissions").getPublicUrl(path).data.publicUrl;
      }
      let score = null;
      if (hw.mode === "quiz" && qs.length) {
        let c = 0; qs.forEach((q, i) => { if ((answers[i] || "").trim().toLowerCase() === String(q.a).trim().toLowerCase()) c++; });
        score = c / qs.length;
      }
      const row = { student_id: me.id, hw_id: hw.id, group: me.group, answers: hw.mode === "quiz" ? answers : null, photo_url: finalPhotoUrl, note, score, submitted_at: new Date().toISOString() };
      const { error } = await supabase.from("submissions").upsert(row, { onConflict: "student_id,hw_id" });
      if (error) throw error;
      onDone();
    } catch (e) { setErr(e.message || "Could not submit. Try again."); setSaving(false); }
  };

  return (
    <>
      <TopBar subtitle={`${hw.id} · ${hw.title}`} onExit={onBack} right={<Btn kind="ghost" small onClick={onBack}>← Back</Btn>} />
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px 60px" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
          <Pill>{hw.subject}</Pill><Pill tone="ash">{hw.skill}</Pill><Pill tone={dueTone(hw.due)}>{dueLabel(hw.due)}</Pill>
        </div>
        <h2 style={{ fontFamily: "Georgia,serif", fontSize: 26, marginBottom: 10 }}>{hw.title}</h2>
        <Card style={{ background: C.coal, marginBottom: 20 }}>
          <div style={{ color: C.goldLt, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: .6, marginBottom: 6 }}>Instructions</div>
          <div style={{ lineHeight: 1.55 }}>{hw.instructions}</div>
        </Card>
        {existing && <div style={{ marginBottom: 18 }}><Pill tone="green">Already submitted — you can resubmit to update</Pill></div>}

        {hw.mode === "quiz" ? (
          <div style={{ display: "grid", gap: 14 }}>
            {qs.map((q, i) => (
              <Card key={i}>
                <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 8, background: `linear-gradient(135deg,${C.goldLt},${C.gold})`, color: "#1a1300", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 13, flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ fontSize: 16, fontWeight: 600, paddingTop: 2 }}>{q.q}</div>
                </div>
                <input style={inputStyle} value={answers[i]} placeholder="Your answer"
                  onChange={e => { const n = [...answers]; n[i] = e.target.value; setAnswers(n); }} />
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <div style={{ color: C.goldLt, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: .6, marginBottom: 10 }}>Upload your work</div>
            <input ref={fileRef} type="file" accept="image/*" onChange={onFile} style={{ display: "none" }} />
            {!photoUrl ? (
              <button onClick={() => fileRef.current.click()} style={{ width: "100%", padding: "40px 20px", border: `2px dashed ${C.line}`, borderRadius: 14, background: C.coal, color: C.ash, cursor: "pointer", fontSize: 15 }}>
                <div style={{ fontSize: 34, marginBottom: 8 }}>📸</div>Tap to take or choose a photo
              </button>
            ) : (
              <div>
                <img src={photoUrl} alt="work" style={{ width: "100%", borderRadius: 12, border: `1px solid ${C.line}`, maxHeight: 360, objectFit: "contain", background: C.black }} />
                <div style={{ marginTop: 10 }}><Btn kind="ghost" small onClick={() => fileRef.current.click()}>Change photo</Btn></div>
              </div>
            )}
          </Card>
        )}

        <div style={{ marginTop: 16 }}>
          <Field label="Note for your teacher (optional)">
            <input style={inputStyle} value={note} onChange={e => setNote(e.target.value)} placeholder="Anything to flag?" />
          </Field>
        </div>
        {err && <div style={{ color: C.red, fontSize: 13, marginBottom: 12 }}>{err}</div>}
        <Btn full disabled={!canSubmit || saving} onClick={submit}>{saving ? "Submitting…" : existing ? "Update my submission" : "Submit homework"}</Btn>
        {!canSubmit && <div style={{ color: C.ash, fontSize: 12, textAlign: "center", marginTop: 10 }}>{hw.mode === "quiz" ? "Answer every question to submit." : "Add a photo to submit."}</div>}
      </div>
    </>
  );
}

// ---------------- TEACHER ----------------
function Teacher({ students, homework, submissions, onExit, refresh }) {
  const [view, setView] = useState("home");
  return (
    <>
      <TopBar subtitle="Teacher dashboard" onExit={onExit} right={<Pill>{homework.length} assignments</Pill>} />
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "24px 16px 60px" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 22, flexWrap: "wrap" }}>
          {[["home", "Overview"], ["create", "+ Assign homework"], ["subs", `Submissions (${submissions.length})`]].map(([k, l]) => (
            <button key={k} onClick={() => setView(k)} style={{ padding: "10px 16px", borderRadius: 10, border: `1px solid ${view === k ? C.gold : C.line}`, cursor: "pointer", fontWeight: 700, fontSize: 14, background: view === k ? "rgba(230,180,60,.12)" : "transparent", color: view === k ? C.gold : C.ash }}>{l}</button>
          ))}
        </div>
        {view === "home" && <TeacherHome students={students} homework={homework} submissions={submissions} go={setView} />}
        {view === "create" && <CreateHomework homework={homework} onCreated={() => { setView("home"); refresh(); }} />}
        {view === "subs" && <SubmissionsReview students={students} homework={homework} submissions={submissions} refresh={refresh} />}
      </div>
    </>
  );
}

function Stat({ label, value, tone = "gold" }) {
  const col = { gold: C.gold, green: C.green, cream: C.cream }[tone];
  return <Card style={{ textAlign: "center", padding: "18px 12px" }}>
    <div style={{ fontFamily: "Georgia,serif", fontSize: 30, fontWeight: 700, color: col }}>{value}</div>
    <div style={{ color: C.ash, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: .6, marginTop: 4 }}>{label}</div>
  </Card>;
}

function TeacherHome({ students, homework, submissions, go }) {
  const expected = homework.reduce((n, h) => n + students.filter(s => s.group === h.group).length, 0);
  const rate = expected ? Math.round((submissions.length / expected) * 100) : 0;
  const graded = submissions.filter(s => s.score != null);
  const avg = graded.length ? Math.round(graded.reduce((n, s) => n + s.score, 0) / graded.length * 100) : "—";
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 12, marginBottom: 24 }}>
        <Stat label="Assignments" value={homework.length} />
        <Stat label="Submissions" value={submissions.length} tone="green" />
        <Stat label="Submission rate" value={rate + "%"} />
        <Stat label="Avg score" value={avg === "—" ? "—" : avg + "%"} tone="cream" />
      </div>
      <h3 style={{ fontFamily: "Georgia,serif", fontSize: 19, marginBottom: 12 }}>Assignments & who's missing</h3>
      <div style={{ display: "grid", gap: 12 }}>
        {homework.map(h => {
          const gs = students.filter(s => s.group === h.group);
          const subbed = submissions.filter(s => s.hw_id === h.id);
          const missing = gs.filter(s => !subbed.find(x => x.student_id === s.id));
          return (
            <Card key={h.id}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 8 }}>
                <Pill tone="ash">{h.id}</Pill><Pill>{h.group}</Pill>
                <span style={{ fontWeight: 700, fontSize: 16 }}>{h.title}</span>
                <span style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                  <Pill tone="green">{subbed.length} in</Pill>
                  {missing.length ? <Pill tone="red">{missing.length} missing</Pill> : <Pill tone="green">All in ✓</Pill>}
                </span>
              </div>
              {missing.length > 0 && <div style={{ color: C.ash, fontSize: 13, paddingTop: 8, borderTop: `1px solid ${C.line}` }}>Waiting on: {missing.map(m => m.name).join(", ")}</div>}
            </Card>
          );
        })}
      </div>
      <div style={{ marginTop: 22, textAlign: "center" }}><Btn onClick={() => go("create")}>+ Assign new homework</Btn></div>
    </>
  );
}

function CreateHomework({ homework, onCreated }) {
  const [f, setF] = useState({
    id: "HW-" + String(homework.length + 1).padStart(3, "0"), title: "", group: "SAT-A",
    subject: "Math", skill: "Algebra", difficulty: "Medium",
    due: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10), mode: "quiz", instructions: "",
  });
  const [qs, setQs] = useState([{ q: "", a: "" }]);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  const valid = f.title.trim() && f.instructions.trim() && (f.mode === "upload" || qs.every(q => q.q.trim()));

  const save = async () => {
    setSaving(true); setErr("");
    const row = { ...f, questions: f.mode === "quiz" ? qs.filter(q => q.q.trim()) : [] };
    const { error } = await supabase.from("homework").insert(row);
    if (error) { setErr(error.message); setSaving(false); } else onCreated();
  };

  return (
    <Card style={{ padding: 22 }}>
      <h3 style={{ fontFamily: "Georgia,serif", fontSize: 20, marginBottom: 18 }}>Assign homework</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Field label="Homework ID"><input style={inputStyle} value={f.id} onChange={e => set("id", e.target.value)} /></Field>
        <Field label="Group"><select style={inputStyle} value={f.group} onChange={e => set("group", e.target.value)}><option>SAT-A</option><option>SAT-B</option></select></Field>
      </div>
      <Field label="Title"><input style={inputStyle} value={f.title} placeholder="e.g. Quadratic Equations" onChange={e => set("title", e.target.value)} /></Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
        <Field label="Subject"><select style={inputStyle} value={f.subject} onChange={e => set("subject", e.target.value)}><option>Math</option><option>English</option></select></Field>
        <Field label="Skill"><select style={inputStyle} value={f.skill} onChange={e => set("skill", e.target.value)}>{["Algebra", "Geometry", "Data", "Reading-Detail", "Reading-Inference", "Grammar", "Vocab-in-Context", "Critical-Thinking"].map(s => <option key={s}>{s}</option>)}</select></Field>
        <Field label="Difficulty"><select style={inputStyle} value={f.difficulty} onChange={e => set("difficulty", e.target.value)}><option>Easy</option><option>Medium</option><option>Hard</option></select></Field>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Field label="Due date"><input style={inputStyle} type="date" value={f.due} onChange={e => set("due", e.target.value)} /></Field>
        <Field label="Submission type"><select style={inputStyle} value={f.mode} onChange={e => set("mode", e.target.value)}><option value="quiz">Typed answers (quiz)</option><option value="upload">Photo upload</option></select></Field>
      </div>
      <Field label="Instructions"><textarea style={{ ...inputStyle, minHeight: 70, resize: "vertical" }} value={f.instructions} placeholder="What should students do?" onChange={e => set("instructions", e.target.value)} /></Field>
      {f.mode === "quiz" && (
        <div style={{ marginTop: 6 }}>
          <div style={{ color: C.ash, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: .6, marginBottom: 10 }}>Questions <span style={{ color: C.goldDk }}>(answer key auto-grades)</span></div>
          <div style={{ display: "grid", gap: 10 }}>
            {qs.map((q, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ color: C.gold, fontWeight: 800, width: 18 }}>{i + 1}</span>
                <input style={{ ...inputStyle, flex: 2 }} placeholder="Question" value={q.q} onChange={e => { const n = [...qs]; n[i].q = e.target.value; setQs(n); }} />
                <input style={{ ...inputStyle, flex: 1 }} placeholder="Answer" value={q.a} onChange={e => { const n = [...qs]; n[i].a = e.target.value; setQs(n); }} />
                {qs.length > 1 && <button onClick={() => setQs(qs.filter((_, j) => j !== i))} style={{ background: "none", border: "none", color: C.red, cursor: "pointer", fontSize: 20 }}>×</button>}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 10 }}><Btn kind="ghost" small onClick={() => setQs([...qs, { q: "", a: "" }])}>+ Add question</Btn></div>
        </div>
      )}
      {err && <div style={{ color: C.red, fontSize: 13, marginTop: 12 }}>{err}</div>}
      <div style={{ marginTop: 20 }}><Btn full disabled={!valid || saving} onClick={save}>{saving ? "Assigning…" : `Assign to ${f.group}`}</Btn></div>
    </Card>
  );
}

function SubmissionsReview({ students, homework, submissions, refresh }) {
  const [filter, setFilter] = useState("all");
  const nameOf = id => students.find(s => s.id === id)?.name || id;
  const hwOf = id => homework.find(h => h.id === id);
  const list = submissions.filter(s => filter === "all" || s.hw_id === filter);

  const setScore = async (sub, score) => { await supabase.from("submissions").update({ score }).eq("id", sub.id); refresh(); };

  if (!submissions.length) return <Card><div style={{ textAlign: "center", color: C.ash, padding: 30 }}>No submissions yet. They appear here live the moment a student submits.</div></Card>;

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <select style={{ ...inputStyle, maxWidth: 260 }} value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All assignments</option>
          {homework.map(h => <option key={h.id} value={h.id}>{h.id} — {h.title}</option>)}
        </select>
      </div>
      <div style={{ display: "grid", gap: 12 }}>
        {list.map(s => {
          const hw = hwOf(s.hw_id);
          return (
            <Card key={s.id}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 10 }}>
                <span style={{ fontWeight: 700, fontSize: 16 }}>{nameOf(s.student_id)}</span>
                <Pill tone="ash">{s.hw_id}</Pill><Pill>{hw?.title}</Pill>
                <span style={{ marginLeft: "auto", color: C.ash, fontSize: 12 }}>{new Date(s.submitted_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
              </div>
              {s.answers && hw?.questions && (
                <div style={{ display: "grid", gap: 6, marginBottom: 10 }}>
                  {hw.questions.map((q, i) => {
                    const right = String(q.a).trim().toLowerCase() === String((s.answers[i] || "")).trim().toLowerCase();
                    return <div key={i} style={{ display: "flex", gap: 8, fontSize: 14, padding: "6px 10px", background: C.coal, borderRadius: 8 }}>
                      <span style={{ color: C.ash }}>{i + 1}.</span><span style={{ flex: 1 }}>{q.q}</span>
                      <span style={{ color: right ? C.green : C.red, fontWeight: 700 }}>{s.answers[i] || "—"} {right ? "✓" : "✗"}</span>
                    </div>;
                  })}
                </div>
              )}
              {s.photo_url && <img src={s.photo_url} alt="work" style={{ width: "100%", maxHeight: 320, objectFit: "contain", borderRadius: 10, border: `1px solid ${C.line}`, background: C.black, marginBottom: 10 }} />}
              {s.note && <div style={{ color: C.ash, fontSize: 13, fontStyle: "italic", marginBottom: 10 }}>Note: "{s.note}"</div>}
              <div style={{ display: "flex", gap: 8, alignItems: "center", paddingTop: 10, borderTop: `1px solid ${C.line}`, flexWrap: "wrap" }}>
                <span style={{ color: C.ash, fontSize: 13, fontWeight: 700 }}>Score:</span>
                {[0, 0.25, 0.5, 0.7, 0.85, 1].map(v => (
                  <button key={v} onClick={() => setScore(s, v)} style={{ padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 13, border: `1px solid ${s.score === v ? C.gold : C.line}`, background: s.score === v ? "rgba(230,180,60,.15)" : "transparent", color: s.score === v ? C.gold : C.ash }}>{Math.round(v * 100)}%</button>
                ))}
                {s.score != null && <span style={{ marginLeft: "auto" }}><Pill tone={s.score >= 0.7 ? "green" : "amber"}>Graded {Math.round(s.score * 100)}%</Pill></span>}
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}
