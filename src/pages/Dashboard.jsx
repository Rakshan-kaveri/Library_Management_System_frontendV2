// src/pages/Dashboard.jsx
import { useState, useEffect } from "react";

// ── Sparkline SVG (mini chart) ─────────────────────────────
function Sparkline({ color = "#3b82f6" }) {
  const points = [30,45,35,60,40,70,55,80,65,75];
  const max = Math.max(...points);
  const min = Math.min(...points);
  const w = 100; const h = 40;
  const coords = points.map((p, i) => {
    const x = (i / (points.length - 1)) * w;
    const y = h - ((p - min) / (max - min)) * h;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width:"100%", height:40, overflow:"visible" }}>
    {/* <polyline points={coords} fill="none" stroke={color}
        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />*/}
    </svg>
  );
}

// ── Big accent stat card ───────────────────────────────────
function AccentCard({ label, value, sub, bg, textColor="#fff", icon, chart }) {
  return (
    <div style={{
      background: bg, borderRadius: 16, padding: "22px 24px",
      color: textColor, position: "relative", overflow: "hidden",
      boxShadow: "0 4px 20px rgba(0,0,0,0.10)",
      display: "flex", flexDirection: "column", justifyContent: "space-between",
      minHeight: 140,
    }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <div style={{ fontSize:12, fontWeight:600, letterSpacing:"0.06em",
                        textTransform:"uppercase", opacity:0.75, marginBottom:8 }}>
            {label}
          </div>
          <div style={{ fontSize:32, fontWeight:800, lineHeight:1, letterSpacing:"-0.02em" }}>
            {value ?? "—"}
          </div>
          {sub && (
            <div style={{ fontSize:12, opacity:0.7, marginTop:6 }}>{sub}</div>
          )}
        </div>
        <div style={{ fontSize:28, opacity:0.85 }}>{icon}</div>
      </div>
      {chart && (
        <div style={{ marginTop:12, opacity:0.7 }}>
          <Sparkline color={textColor} />
        </div>
      )}
    </div>
  );
}

// ── Small metric row card ──────────────────────────────────
function MetricCard({ label, value, icon, color="#3b82f6", change }) {
  return (
    <div style={{
      background:"#fff", borderRadius:14, padding:"18px 20px",
      border:"1px solid #e8edf3", boxShadow:"0 1px 4px rgba(0,0,0,0.05)",
      display:"flex", alignItems:"center", gap:14,
      transition:"box-shadow 0.2s, transform 0.2s",
      cursor:"default",
    }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.10)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.05)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div style={{
        width:44, height:44, borderRadius:12,
        background: `${color}18`,
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:20, flexShrink:0,
      }}>
        {icon}
      </div>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:11, color:"#94a3b8", fontWeight:600,
                      textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:3 }}>
          {label}
        </div>
        <div style={{ fontSize:22, fontWeight:700, color:"#1e293b", lineHeight:1 }}>
          {value ?? "—"}
        </div>
      </div>
      {change !== undefined && (
        <div style={{
          fontSize:11, fontWeight:600,
          color: change >= 0 ? "#10b981" : "#c70000",
          background: change >= 0 ? "#f0fdf4" : "#fef2f2",
          padding:"3px 8px", borderRadius:20,
        }}>
          {change >= 0 ? "▲" : "▼"} {Math.abs(change)}
        </div>
      )}
    </div>
  );
}

// ── Admin config ───────────────────────────────────────────
function AdminConfig({ config, onSave }) {
  const [form, setForm] = useState({ ...config });
  const [msg,  setMsg]  = useState("");
  useEffect(() => setForm({ ...config }), [config]);

  async function save(e) {
    e.preventDefault();
    const res  = await fetch(`${import.meta.env.VITE_API_URL}/api/fines/config`, {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setMsg(res.ok ? "success" : "error");
    if (res.ok) onSave(form);
    setTimeout(() => setMsg(""), 3000);
  }

  return (
    <div style={{
      background:"#fff", borderRadius:16, padding:"24px 28px",
      border:"1px solid #e8edf3", boxShadow:"0 1px 4px rgba(0,0,0,0.05)"
    }}>
      <div style={{ display:"flex", justifyContent:"space-between",
                    alignItems:"center", marginBottom:20 }}>
        <div>
          <div style={{ fontSize:15, fontWeight:700, color:"#1e293b" }}>
            ⚙️ Library Settings
          </div>
          <div style={{ fontSize:12, color:"#94a3b8", marginTop:2 }}>
            Changes apply to all active issued books immediately
          </div>
        </div>
        {msg === "success" && (
          <span style={{ fontSize:12, color:"#10b981", fontWeight:600,
                         background:"#f0fdf4", padding:"4px 12px", borderRadius:20 }}>
            ✓ Saved
          </span>
        )}
      </div>
      <form onSubmit={save}
        style={{ display:"grid", gridTemplateColumns:"1fr 1fr auto", gap:16, alignItems:"flex-end" }}>
        <div className="form-group" style={{ margin:0 }}>
          <label>Loan Duration (days)</label>
          <input type="number" min="1" max="365" value={form.loan_duration}
            onChange={e => setForm({ ...form, loan_duration: Number(e.target.value) })} />
        </div>
        <div className="form-group" style={{ margin:0 }}>
          <label>Fine Per Day (₹)</label>
          <input type="number" min="1" value={form.fine_per_day}
            onChange={e => setForm({ ...form, fine_per_day: Number(e.target.value) })} />
        </div>
        <button className="btn btn-primary" type="submit">Save</button>
      </form>
    </div>
  );
}

// ── Fine tier table ────────────────────────────────────────
function FineTierTable({ finePerDay=10, loanDuration=7 }) {
  const tiers = [1,3,5,10,15,30].map(d => ({ days:d, fine:d*finePerDay }));
  return (
    <div style={{
      background:"#fff", borderRadius:16, padding:"24px 28px",
      border:"1px solid #e8edf3", boxShadow:"0 1px 4px rgba(0,0,0,0.05)"
    }}>
      <div style={{ fontSize:15, fontWeight:700, color:"#1e293b", marginBottom:4 }}>
        Overdue Fine Schedule
      </div>
      <div style={{ fontSize:12, color:"#94a3b8", marginBottom:20 }}>
        ₹{finePerDay} per day after {loanDuration}-day loan period
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {tiers.map((t, i) => (
          <div key={t.days} style={{
            display:"flex", alignItems:"center", justifyContent:"space-between",
            padding:"10px 14px", borderRadius:10,
            background: i % 2 === 0 ? "#f8fafc" : "#fff",
            border:"1px solid #f1f5f9"
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{
                width:28, height:28, borderRadius:8, background:"#fef2f2",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:12, fontWeight:700, color:"#ef4444"
              }}>
                {t.days}
              </div>
              <span style={{ fontSize:13, color:"#475569" }}>
                Days overdue
              </span>
            </div>
            <div style={{ fontSize:15, fontWeight:700, color:"#ef4444" }}>
              ₹{t.fine}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────
export default function Dashboard() {
  const [stats,         setStats]         = useState({});
  const [config,        setConfig]        = useState({ fine_per_day:10, loan_duration:7 });
  const [overdueIssues, setOverdueIssues] = useState([]);
  const user    = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user.role_name === "Admin";

  function loadStats() {
    const url = isAdmin
      ? `${import.meta.env.VITE_API_URL}/api/fines/stats`
      : `${import.meta.env.VITE_API_URL}/api/fines/stats/${user.user_id}`;
    fetch(url).then(r => r.json()).then(setStats).catch(console.error);
  }

  useEffect(() => {
    loadStats();
    fetch(`${import.meta.env.VITE_API_URL}/api/fines/config`).then(r=>r.json()).then(setConfig);
    if (!isAdmin) {
      fetch(`${import.meta.env.VITE_API_URL}/api/fines/overdue/${user.user_id}`)
        .then(r=>r.json()).then(setOverdueIssues);
    }
  }, []);

  // ── ADMIN ────────────────────────────────────────────────
  if (isAdmin) return (
    <div>
      {/* Header */}
      <div style={{ marginBottom:28 }}>
        <h1 style={{
          fontFamily:"'Playfair Display', serif",
          fontSize:28, fontWeight:700, color:"#0f172a", marginBottom:4
        }}>
          Dashboard
        </h1>
        <p style={{ fontSize:13, color:"#94a3b8" }}>
          {new Date().toLocaleDateString("en-IN",{
            weekday:"long", day:"numeric", month:"long", year:"numeric"
          })}
        </p>
      </div>

      {/* Top accent cards */}
      <div style={{
        display:"grid",
        gridTemplateColumns:"1.4fr 1fr 1fr 1fr",
        gap:16, marginBottom:20
      }}>
        <AccentCard
          label="Total Books"
          value={stats.totalBooks}
          sub={`${stats.totalCopies ?? 0} physical copies`}
          bg="linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)"
          icon="📚"
          chart
        />
        <AccentCard
          label="Available"
          value={stats.availableCopies}
          sub="copies on shelf"
          bg="linear-gradient(135deg, #10b981 0%, #059669 100%)"
          icon="✅"
        />
        <AccentCard
          label="Issued"
          value={stats.currentlyIssued}
          sub="currently out"
          bg="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
          icon="📤"
        />
        <AccentCard
          label="Overdue"
          value={stats.overdueBooks}
          sub={`₹${stats.pendingFines ?? 0} pending`}
          bg="linear-gradient(135deg, #f34f4f 0%, #aa0f0f 100%)"
          icon="⚠️"
        />
      </div>

      {/* Metric row */}
      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(4, 1fr)",
        gap:14, marginBottom:24
      }}>
        <MetricCard icon="🎓" label="Students"       value={stats.totalStudents}              color="#3b82f6" />
        <MetricCard icon="↩️" label="Returned"       value={stats.totalReturned}              color="#10b981" />
        <MetricCard icon="💰" label="Collected"      value={`₹${stats.totalCollected ?? 0}`} color="#10b981" />
        <MetricCard icon="💸" label="Uncollected"    value={`₹${stats.pendingFines   ?? 0}`} color="#ef4444" />
      </div>

      {/* Bottom section — settings + policy */}
      <div style={{ display:"grid", gridTemplateColumns:"1.5fr 1fr", gap:20 }}>
        <AdminConfig config={config} onSave={cfg => { setConfig(cfg); loadStats(); }} />

        {/* Policy summary card */}
        <div style={{
          background:"linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
          borderRadius:16, padding:"24px 28px",
          border:"1px solid #bfdbfe",
        }}>
          <div style={{ fontSize:15, fontWeight:700, color:"#1e40af", marginBottom:20 }}>
            📌 Active Policy
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {[
              { label:"Loan Period",    value:`${config.loan_duration} days`,         icon:"📅" },
              { label:"Fine Rate",      value:`₹${config.fine_per_day} / day`,        icon:"💸" },
              { label:"Overdue Now",    value:stats.overdueBooks ?? 0,                icon:"⚠️" },
              { label:"Out of Stock",   value:stats.outOfStock   ?? 0,                icon:"📵" },
            ].map(item => (
              <div key={item.label} style={{
                display:"flex", justifyContent:"space-between", alignItems:"center",
                padding:"10px 14px", background:"rgba(255,255,255,0.7)",
                borderRadius:10, backdropFilter:"blur(4px)"
              }}>
                <span style={{ fontSize:13, color:"#1e40af", display:"flex",
                               alignItems:"center", gap:8 }}>
                  {item.icon} {item.label}
                </span>
                <span style={{ fontSize:14, fontWeight:700, color:"#1e293b" }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // ── STUDENT ──────────────────────────────────────────────
  return (
    <div>
      <div style={{ marginBottom:28 }}>
        <h1 style={{
          fontFamily:"'Playfair Display', serif",
          fontSize:28, fontWeight:700, color:"#0f172a", marginBottom:4
        }}>
          Welcome back, {user.name} 👋
        </h1>
        <p style={{ fontSize:13, color:"#94a3b8" }}>
          {new Date().toLocaleDateString("en-IN",{
            weekday:"long", day:"numeric", month:"long", year:"numeric"
          })}
        </p>
      </div>

      {/* Student accent cards */}
      <div style={{
        display:"grid",
        gridTemplateColumns:"1.4fr 1fr 1fr",
        gap:16, marginBottom:20
      }}>
        <AccentCard
          label="Books Issued"
          value={stats.currentlyIssued}
          sub={`${stats.totalReturned ?? 0} returned so far`}
          bg="linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)"
          icon="📚"
          chart
        />
        <AccentCard
          label="Pending Fine"
          value={`₹${stats.pendingFines ?? 0}`}
          sub="to be paid"
          bg="linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
          icon="💸"
        />
        <AccentCard
          label="Fines Paid"
          value={`₹${stats.totalPaid ?? 0}`}
          sub="total paid"
          bg="linear-gradient(135deg, #10b981 0%, #05d594 100%)"
          icon="💰"
        />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:20 }}>
        {/* Overdue tracker */}
        <div style={{
          background:"#fff", borderRadius:16, padding:"24px 28px",
          border:"1px solid #e8edf3", boxShadow:"0 1px 4px rgba(0,0,0,0.05)"
        }}>
          <div style={{ fontSize:15, fontWeight:700, color:"#1e293b", marginBottom:4 }}>
            📋 Active Borrows
          </div>
          <div style={{ fontSize:12, color:"#94a3b8", marginBottom:20 }}>
            Books currently issued to you
          </div>

          {overdueIssues.length === 0
            ? (
              <div style={{ textAlign:"center", padding:"32px 0", color:"#94a3b8" }}>
                <div style={{ fontSize:32, marginBottom:8 }}>📭</div>
                <div style={{ fontSize:13 }}>No active borrows</div>
              </div>
            )
            : (
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {overdueIssues.map(o => (
                  <div key={o.issue_id} style={{
                    display:"flex", justifyContent:"space-between", alignItems:"center",
                    padding:"12px 16px", borderRadius:12,
                    background: o.is_overdue ? "#fef2f2" : "#f0fdf4",
                    border:`1px solid ${o.is_overdue ? "#fecaca" : "#bbf7d0"}`
                  }}>
                    <div>
                      <div style={{ fontSize:14, fontWeight:600, color:"#1e293b",
                                    marginBottom:3 }}>
                        {o.book_title}
                      </div>
                      <div style={{ fontSize:12, color:"#64748b" }}>
                        Due: {String(o.due_date).split("T")[0]}
                      </div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      {o.is_overdue
                        ? (
                          <>
                            <div style={{ fontSize:11, fontWeight:700, color:"#ef4444",
                                          background:"#fee2e2", padding:"2px 8px",
                                          borderRadius:20, marginBottom:4 }}>
                              {o.days_overdue}d overdue
                            </div>
                            <div style={{ fontSize:13, fontWeight:700, color:"#ef4444" }}>
                              ₹{o.fine_so_far}
                            </div>
                          </>
                        )
                        : (
                          <div style={{ fontSize:11, fontWeight:700, color:"#10b981",
                                        background:"#dcfce7", padding:"2px 10px",
                                        borderRadius:20 }}>
                            On time
                          </div>
                        )
                      }
                    </div>
                  </div>
                ))}
              </div>
            )
          }
        </div>

        {/* Fine schedule */}
        <FineTierTable finePerDay={config.fine_per_day} loanDuration={config.loan_duration} />
      </div>
    </div>
  );
}