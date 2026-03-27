// src/pages/Students.jsx
import { useState, useEffect } from "react";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [msg,      setMsg]      = useState("");
  const [isError,  setIsError]  = useState(false);

  function load() {
    fetch(`${import.meta.env.VITE_API_URL}/api/users`).then(r=>r.json()).then(setStudents);
  }
  useEffect(load, []);

  function showMsg(text, error=false) {
    setMsg(text); setIsError(error);
    setTimeout(()=>setMsg(""), 6000);
  }

  async function remove(id) {
    if (!confirm("Remove this student?")) return;
    const res  = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${id}`,{method:"DELETE"});
    const data = await res.json();
    if (!res.ok) showMsg(`❌ ${data.error}`, true);
    else { showMsg("✅ Student removed.", false); load(); }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Students</h1>
          <p>{students.length} registered student{students.length!==1?"s":""}</p>
        </div>
      </div>

      {msg && (
        <div className={`msg ${isError?"msg-error":"msg-success"}`}>{msg}</div>
      )}

      <div className="card" style={{padding:0,overflow:"hidden"}}>
        <table>
          <thead>
            <tr>
              <th style={{paddingLeft:24}}>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Joined</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {students.length===0
              ? (
                <tr><td colSpan="6">
                  <div className="empty-state">
                    <div className="empty-state-icon">🎓</div>
                    <p>No students registered yet.</p>
                  </div>
                </td></tr>
              )
              : students.map((s,i)=>(
                <tr key={s.user_id}>
                  <td style={{paddingLeft:24,color:"#94a3b8",fontSize:12}}>{i+1}</td>
                  <td>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div style={{
                        width:32,height:32,borderRadius:"50%",
                        background:"#dbeafe",color:"#1d4ed8",
                        display:"flex",alignItems:"center",justifyContent:"center",
                        fontSize:13,fontWeight:700,flexShrink:0
                      }}>
                        {s.name[0].toUpperCase()}
                      </div>
                      <span style={{fontWeight:500,color:"#1e293b"}}>{s.name}</span>
                    </div>
                  </td>
                  <td style={{color:"#475569",fontSize:13}}>{s.email}</td>
                  <td style={{color:"#64748b",fontVariantNumeric:"tabular-nums"}}>{s.phone}</td>
                  <td style={{color:"#64748b",fontSize:13}}>
                    {new Date(s.created_at).toLocaleDateString("en-IN",{
                      day:"numeric",month:"short",year:"numeric"
                    })}
                  </td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={()=>remove(s.user_id)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}