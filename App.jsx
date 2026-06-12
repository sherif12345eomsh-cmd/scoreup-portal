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

const LOGO_SRC = "data:image/jpeg;base64,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";
const Logo = ({ size = 40 }) => (
  <img src={LOGO_SRC} width={size} height={size} alt="ScoreUp"
    style={{ borderRadius: size * 0.18, display: "block" }} />
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
