// src/pages/IssueReturn.jsx
import { useState, useEffect } from "react";

function PaymentModal({ fineData, issueId, onDone, onClose }) {
  const [method, setMethod] = useState("");
  const [msg,    setMsg]    = useState("");
  const [busy,   setBusy]   = useState(false);

  async function confirmPayment() {
    if (!method) return setMsg("Please select a payment method.");
    setBusy(true);
    const res  = await fetch(`${import.meta.env.VITE_API_URL}/api/issues/return/commit`, {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ issue_id:issueId, payment_method:method }),
    });
    const data = await res.json();
    setBusy(false);
    if (res.ok) onDone(`✅ ${data.message}`);
    else setMsg(`❌ ${data.error}`);
  }

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.6)",
                 display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,
                 backdropFilter:"blur(4px)"}}>
      <div style={{background:"#fff",borderRadius:16,padding:36,width:440,
                   boxShadow:"0 24px 64px rgba(0,0,0,0.25)"}}>

        <div style={{marginBottom:20}}>
          <h3 style={{fontSize:18,fontWeight:700,color:"#1e293b",marginBottom:4}}>
            Fine Payment Required
          </h3>
          <p style={{fontSize:13,color:"#64748b"}}>
            Book returned late. Complete payment to finish the return.
          </p>
        </div>

        <div style={{background:"#fef2f2",borderRadius:10,padding:"16px 20px",
                     marginBottom:24,border:"1px solid #fecaca",
                     display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:11,color:"#94a3b8",textTransform:"uppercase",
                         letterSpacing:"0.06em",marginBottom:4}}>Amount Due</div>
            <div style={{fontSize:34,fontWeight:700,color:"#ef4444",lineHeight:1}}>
              ₹{fineData.fine_amount}
            </div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:11,color:"#94a3b8",textTransform:"uppercase",
                         letterSpacing:"0.06em",marginBottom:4}}>Days Overdue</div>
            <div style={{fontSize:28,fontWeight:700,color:"#f97316"}}>{fineData.days}</div>
          </div>
        </div>

        <div style={{marginBottom:22}}>
          <div style={{fontSize:11,fontWeight:600,letterSpacing:"0.07em",
                       textTransform:"uppercase",color:"#64748b",marginBottom:12}}>
            Select Payment Method
          </div>
          <div style={{display:"flex",gap:10}}>
            {[
              {id:"Cash", icon:"💵", label:"Cash"},
              {id:"UPI",  icon:"📲", label:"UPI"},
              {id:"Card", icon:"💳", label:"Card"},
            ].map(m=>(
              <button key={m.id} type="button"
                onClick={()=>{setMethod(m.id);setMsg("");}}
                style={{flex:1,padding:"14px 8px",
                        border:`2px solid ${method===m.id?"#3b82f6":"#e2e8f0"}`,
                        borderRadius:10,background:method===m.id?"#eff6ff":"#fff",
                        cursor:"pointer",transition:"all 0.15s"}}>
                <div style={{fontSize:24,marginBottom:6}}>{m.icon}</div>
                <div style={{fontSize:13,fontWeight:600,
                             color:method===m.id?"#1d4ed8":"#475569"}}>
                  {m.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        {msg && <div className="msg msg-error" style={{marginBottom:16}}>{msg}</div>}

        <div style={{display:"flex",gap:10}}>
          <button className="btn btn-primary" style={{flex:1}}
            onClick={confirmPayment} disabled={busy}>
            {busy?"Processing…":"Confirm Payment & Return"}
          </button>
          <button className="btn btn-ghost" onClick={onClose} disabled={busy}>
            Cancel
          </button>
        </div>
        <p style={{fontSize:11,color:"#94a3b8",marginTop:12,textAlign:"center"}}>
          Cancelling keeps the book as issued. Use the same Issue ID to retry.
        </p>
      </div>
    </div>
  );
}

export default function IssueReturn() {
  const [records,        setRecords]        = useState([]);
  const [users,          setUsers]          = useState([]);
  const [books,          setBooks]          = useState([]);
  const [issueForm,      setIssueForm]      = useState({ user_id:"", book_id:"" });
  const [returnId,       setReturnId]       = useState("");
  const [msg,            setMsg]            = useState({ text:"", ok:true });
  const [modal,          setModal]          = useState(null);
  const [pendingIssueId, setPendingIssueId] = useState(null);

  const user    = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user.role_name === "Admin";

  function loadRecords() {
    const url = isAdmin
      ? `${import.meta.env.VITE_API_URL}/api/issues`
      : `${import.meta.env.VITE_API_URL}/api/issues/my/${user.user_id}`;
    fetch(url).then(r=>r.json()).then(setRecords).catch(console.error);
  }
  function loadBooks() {
    fetch(`${import.meta.env.VITE_API_URL}/api/books`).then(r=>r.json()).then(setBooks);
  }

  useEffect(() => {
    loadRecords(); loadBooks();
    if (isAdmin) fetch(`${import.meta.env.VITE_API_URL}/api/users`).then(r=>r.json()).then(setUsers);
  }, []);

  function showMsg(text, ok=true) {
    setMsg({text,ok});
    setTimeout(()=>setMsg({text:"",ok:true}),5000);
  }

  async function issueBook(e) {
    e.preventDefault();
    const res  = await fetch(`${import.meta.env.VITE_API_URL}/api/issues/issue`,{
      method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify(issueForm),
    });
    const data = await res.json();
    showMsg(res.ok?`✅ ${data.message} — Due: ${data.due_date}`:`❌ ${data.error}`,res.ok);
    if (res.ok) { setIssueForm({user_id:"",book_id:""}); loadRecords(); loadBooks(); }
  }

  async function handleReturn(e) {
    e.preventDefault();
    const res  = await fetch(`${import.meta.env.VITE_API_URL}/api/issues/return/preview`,{
      method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({issue_id:returnId}),
    });
    const data = await res.json();
    if (!res.ok) return showMsg(`❌ ${data.error}`,false);

    if (data.overdue) {
      setPendingIssueId(returnId);
      setModal({fine_amount:data.fine_amount,days:data.days});
    } else {
      const res2  = await fetch(`${import.meta.env.VITE_API_URL}/api/issues/return/commit`,{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({issue_id:returnId}),
      });
      const data2 = await res2.json();
      if (res2.ok) { showMsg(`✅ ${data2.message}`,true); setReturnId(""); loadRecords(); loadBooks(); }
      else showMsg(`❌ ${data2.error}`,false);
    }
  }

  function handlePaymentDone(message) {
    setModal(null); setPendingIssueId(null); setReturnId("");
    showMsg(message,true); loadRecords(); loadBooks();
  }

  function handleModalClose() {
    setModal(null);
    showMsg("⚠️ Return cancelled. Book is still issued. Use the same Issue ID to retry.",false);
  }

  const badge = s =>
    s==="Issued"?"badge-yellow":s==="Returned"?"badge-green":"badge-red";

  return (
    <div>
      {modal&&pendingIssueId&&(
        <PaymentModal fineData={modal} issueId={pendingIssueId}
          onDone={handlePaymentDone} onClose={handleModalClose} />
      )}

      <div className="page-header">
        <div>
          <h1>{isAdmin?"Issue / Return":"My Books"}</h1>
          <p>{isAdmin?"Manage book lending and returns":"Your borrowing history"}</p>
        </div>
      </div>

      {msg.text&&(
        <div className={`msg ${msg.ok?"msg-success":msg.text.startsWith("⚠")?"msg-warning":"msg-error"}`}>
          {msg.text}
        </div>
      )}

      {isAdmin&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:24}}>
          <div className="card">
            <div className="section-title" style={{marginBottom:20}}>Issue a Book</div>
            <form onSubmit={issueBook}>
              <div className="form-group">
                <label>Student</label>
                <select value={issueForm.user_id}
                  onChange={e=>setIssueForm({...issueForm,user_id:e.target.value})} required>
                  <option value="">Select a student…</option>
                  {users.map(u=>(
                    <option key={u.user_id} value={u.user_id}>{u.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Book</label>
                <select value={issueForm.book_id}
                  onChange={e=>setIssueForm({...issueForm,book_id:e.target.value})} required>
                  <option value="">Select a book…</option>
                  {books.filter(b=>b.available_copies>0).map(b=>(
                    <option key={b.book_id} value={b.book_id}>
                      {b.title} — {b.available_copies} {b.available_copies===1?"copy":"copies"} left
                    </option>
                  ))}
                </select>
              </div>
              <button className="btn btn-primary">Issue Book</button>
            </form>
          </div>

          <div className="card">
            <div className="section-title" style={{marginBottom:8}}>Return a Book</div>
            <p style={{fontSize:13,color:"#64748b",marginBottom:20}}>
              If overdue, a payment modal will appear before the return is saved.
            </p>
            <form onSubmit={handleReturn}>
              <div className="form-group">
                <label>Issue ID</label>
                <input type="number" placeholder="Enter the issue record ID"
                  value={returnId} onChange={e=>setReturnId(e.target.value)} required />
              </div>
              <button className="btn btn-success">Check & Return</button>
            </form>
          </div>
        </div>
      )}

      <div className="card" style={{padding:0,overflow:"hidden"}}>
        <div style={{padding:"20px 28px 16px",borderBottom:"1px solid #f1f5f9"}}>
          <div className="section-title" style={{margin:0}}>
            {isAdmin?"All Issue Records":"My Issue Records"}
          </div>
        </div>
        {records.length===0
          ? (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <p>No issue records found.</p>
            </div>
          )
          : (
            <table>
              <thead>
                <tr>
                  <th style={{paddingLeft:28}}>ID</th>
                  {isAdmin&&<th>Student</th>}
                  <th>Book</th>
                  <th>Copy</th>
                  <th>Issued</th>
                  <th>Due</th>
                  <th>Returned</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map(r=>(
                  <tr key={r.issue_id}>
                    <td style={{paddingLeft:28,color:"#94a3b8",fontSize:12,
                                fontVariantNumeric:"tabular-nums"}}>
                      #{r.issue_id}
                    </td>
                    {isAdmin&&(
                      <td>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <div style={{width:26,height:26,borderRadius:"50%",
                                       background:"#f1f5f9",color:"#475569",
                                       display:"flex",alignItems:"center",justifyContent:"center",
                                       fontSize:11,fontWeight:700,flexShrink:0}}>
                            {r.student_name?.[0]?.toUpperCase()}
                          </div>
                          <span style={{fontWeight:500}}>{r.student_name}</span>
                        </div>
                      </td>
                    )}
                    <td style={{fontWeight:500,color:"#1e293b"}}>{r.book_title}</td>
                    <td style={{color:"#94a3b8",fontSize:12}}>#{r.copy_id}</td>
                    <td style={{color:"#64748b",fontSize:13}}>{r.issue_date}</td>
                    <td style={{color:"#64748b",fontSize:13}}>{r.due_date}</td>
                    <td style={{color:"#64748b",fontSize:13}}>{r.return_date||"—"}</td>
                    <td>
                      <span className={`badge ${badge(r.status)}`}>{r.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        }
      </div>
    </div>
  );
}