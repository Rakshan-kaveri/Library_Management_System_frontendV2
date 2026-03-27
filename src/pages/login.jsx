// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [form,  setForm]  = useState({ identifier:"", password:"" });
  const [error, setError] = useState("");
  const [busy,  setBusy]  = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault(); setError(""); setBusy(true);
    try {
      const res  = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Invalid credentials"); setBusy(false); return; }
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/");
    } catch {
      setError("Cannot connect to server");
      setBusy(false);
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-box">
        <div className="auth-logo">
          <img src="/logo.png" alt="Library Logo" className="auth-logo-icon" />
          {/*<span className="auth-logo-icon"></span>*/}
          <h2>Library MS</h2>
          <p>Sign in to your account</p>
        </div>

        {error && <div className="msg msg-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email or Username</label>
            <input type="text" placeholder="user or user@gmail.com"
              value={form.identifier}
              onChange={e => setForm({...form, identifier:e.target.value})} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="Enter your password"
              value={form.password}
              onChange={e => setForm({...form, password:e.target.value})} required />
          </div>
          <button className="btn btn-primary" style={{ width:"100%", padding:"12px", marginTop:4 }}
            disabled={busy}>
            {busy ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <div className="auth-footer">
          No account? <Link to="/register">Create one</Link>
        </div>
      </div>
    </div>
  );
}