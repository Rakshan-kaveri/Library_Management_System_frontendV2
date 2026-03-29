// src/pages/Register.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [form,    setForm]    = useState({ name:"", email:"", password:"", phone:"" });
  const [msg,     setMsg]     = useState("");
  const [isError, setIsError] = useState(false);
  const [busy,    setBusy]    = useState(false);
  const navigate = useNavigate();

  function handlePhone(e) {
    setForm({ ...form, phone: e.target.value.replace(/\D/g,"").slice(0,10) });
  }

  function handleEmail(e) {
    setForm({ ...form, email: e.target.value });
  }

  // Live gmail check
  const emailValid = form.email === "" || form.email.toLowerCase().endsWith("@gmail.com");

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.email.toLowerCase().endsWith("@gmail.com")) {
      setIsError(true); return setMsg("Only Gmail addresses (@gmail.com) are allowed.");
    }
    if (form.phone.length !== 10) {
      setIsError(true); return setMsg("Phone must be exactly 10 digits.");
    }

    setBusy(true);
    try {
      const res  = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setIsError(true); setMsg(data.error); setBusy(false); return; }
      setIsError(false); setMsg("Account created! Redirecting…");
      setTimeout(() => navigate("/login"), 1500);
    } catch {
      setIsError(true); setMsg("Cannot connect to server"); setBusy(false);
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-box">
        <div className="auth-logo">
           <img src="/logo.png" alt="Library Logo" className="auth-logo-icon" />
          {/*<span className="auth-logo-icon">📚</span>*/}
          <h2>Create Account</h2>
          <p>Join the library system</p>
        </div>

        {msg && <div className={`msg ${isError?"msg-error":"msg-success"}`}>{msg}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" placeholder="Your full name" value={form.name}
              onChange={e => setForm({...form, name:e.target.value})} required />
          </div>

          <div className="form-group">
            <label>
              Gmail Address
              {form.email && (
                <span style={{
                  marginLeft:8, fontSize:11, fontWeight:600,
                  color: emailValid ? "#15803d" : "#b91c1c",
                  textTransform:"none", letterSpacing:0,
                }}>
                  {emailValid ? "✓ valid" : "✗ must end with @gmail.com"}
                </span>
              )}
            </label>
            <input
              type="text"
              placeholder="yourname@gmail.com"
              value={form.email}
              onChange={handleEmail}
              required
              style={{ borderColor: form.email && !emailValid ? "#ef4444" : undefined }}
            />
          </div>

          <div className="form-group">
            <label>
              Phone
              <span style={{
                fontSize:11, color: form.phone.length===10 ? "#15803d" : "#94a3b8",
                marginLeft:8, textTransform:"none", letterSpacing:0, fontWeight:600,
              }}>
                {form.phone.length}/10
              </span>
            </label>
            <input type="tel" placeholder="10-digit mobile number"
              value={form.phone} onChange={handlePhone} maxLength={10} required />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="Create a password"
              value={form.password}
              onChange={e => setForm({...form, password:e.target.value})} required />
          </div>

          <button className="btn btn-primary"
            style={{ width:"100%", padding:"12px", marginTop:4 }}
            disabled={busy}>
            {busy ? "Creating…" : "Create Account"}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}