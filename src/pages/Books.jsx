// src/pages/Books.jsx
import { useState, useEffect } from "react";

const EMPTY = {
  title:"", isbn:"", publisher_name:"", publication_year:"",
  num_copies:1, authors:[""], category_ids:[]
};

export default function Books() {
  const [books,         setBooks]         = useState([]);
  const [categories,    setCategories]    = useState([]);
  const [form,          setForm]          = useState(EMPTY);
  const [show,          setShow]          = useState(false);
  const [showCatPanel,  setShowCatPanel]  = useState(false);
  const [newCatName,    setNewCatName]    = useState("");
  const [msg,           setMsg]           = useState("");
  const [catMsg,        setCatMsg]        = useState("");
  const user    = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user.role_name === "Admin";

  function load() {
    fetch(`${import.meta.env.VITE_API_URL}/api/books`).then(r=>r.json()).then(setBooks);
  }
  function loadCats() {
    fetch(`${import.meta.env.VITE_API_URL}/api/books/categories`).then(r=>r.json()).then(setCategories);
  }
  useEffect(() => { load(); loadCats(); }, []);

  function updateAuthor(i,v) { const a=[...form.authors]; a[i]=v; setForm({...form,authors:a}); }
  function addAuthor()       { setForm({...form,authors:[...form.authors,""]}); }
  function removeAuthor(i)   { const a=form.authors.filter((_,idx)=>idx!==i); setForm({...form,authors:a.length?a:[""]}); }
  function toggleCat(id)     {
    const has=form.category_ids.includes(id);
    setForm({...form,category_ids:has?form.category_ids.filter(c=>c!==id):[...form.category_ids,id]});
  }

  // ── Add custom category ───────────────────────────────────
  async function addCategory(e) {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const res  = await fetch(`${import.meta.env.VITE_API_URL}/api/books/categories`, {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ category_name: newCatName.trim() }),
    });
    const data = await res.json();
    if (res.ok) {
      setCatMsg(`✅ ${data.message}`);
      setNewCatName("");
      loadCats();
    } else {
      setCatMsg(`❌ ${data.error}`);
    }
    setTimeout(()=>setCatMsg(""),4000);
  }

  // ── Delete category ───────────────────────────────────────
  async function deleteCategory(id, name) {
    if (!confirm(`Delete category "${name}"?`)) return;
    const res  = await fetch(`${import.meta.env.VITE_API_URL}/api/books/categories/${id}`,{method:"DELETE"});
    const data = await res.json();
    setCatMsg(res.ok ? `✅ Category deleted.` : `❌ ${data.error}`);
    if (res.ok) loadCats();
    setTimeout(()=>setCatMsg(""),4000);
  }

  async function addBook(e) {
    e.preventDefault();
    const payload = { ...form, authors:form.authors.filter(a=>a.trim()) };
    const res  = await fetch(`${import.meta.env.VITE_API_URL}/api/books`,{
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify(payload),
    });
    const data = await res.json();
    setMsg(res.ok ? "✅ Book added successfully!" : `❌ ${data.error}`);
    if (res.ok) { setForm(EMPTY); setShow(false); load(); }
    setTimeout(()=>setMsg(""),5000);
  }

  async function deleteBook(id) {
    if (!confirm("Delete this book and all its copies?")) return;
    const res  = await fetch(`${import.meta.env.VITE_API_URL}/api/books/${id}`,{method:"DELETE"});
    const data = await res.json();
    setMsg(res.ok ? "✅ Book deleted." : `❌ ${data.error}`);
    if (res.ok) load();
    setTimeout(()=>setMsg(""),6000);
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Books</h1>
          <p>{books.length} title{books.length!==1?"s":""} in catalogue</p>
        </div>
   
{isAdmin && (
  <div style={{ display:"flex", gap:10, alignItems:"center" }}>
    <button
      className="btn btn-outline"
      onClick={() => { setShowCatPanel(!showCatPanel); setCatMsg(""); }}>
       {showCatPanel ? "Close Categories" : "Manage Categories"}
    </button>
    <button
      className="btn btn-primary"
      onClick={() => { setShow(!show); setMsg(""); setForm(EMPTY); }}>
      {show ? "✕ Cancel" : "+ Add Book"}
    </button>
  </div>
)}
      </div>

      {msg && (
        <div className={`msg ${msg.startsWith("✅")?"msg-success":"msg-error"}`}>{msg}</div>
      )}

      {/* ── Category Management Panel ── */}
      {showCatPanel && isAdmin && (
        <div className="card" style={{marginBottom:20}}>
          <div className="section-title" style={{marginBottom:16}}> Category Management</div>

          {catMsg && (
            <div className={`msg ${catMsg.startsWith("✅")?"msg-success":"msg-error"}`}>
              {catMsg}
            </div>
          )}

          {/* Add new category */}
          <form onSubmit={addCategory}
            style={{display:"flex",gap:10,marginBottom:20,alignItems:"flex-end"}}>
            <div className="form-group" style={{margin:0,flex:1}}>
              <label>New Category Name</label>
              <input placeholder="e.g. Biography, Self-Help…"
                value={newCatName}
                onChange={e=>setNewCatName(e.target.value)} />
            </div>
            <button className="btn btn-primary" type="submit">Add</button>
          </form>

          <div className="divider" />

          {/* Existing categories */}
          <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:16}}>
            {categories.map(cat => (
              <div key={cat.category_id}
                style={{display:"inline-flex",alignItems:"center",gap:6,
                        padding:"6px 12px",borderRadius:20,
                        background:"#f1f5f9",border:"1px solid #e2e8f0",fontSize:13}}>
                <span style={{color:"#334155",fontWeight:500}}>{cat.category_name}</span>
                <button
                  onClick={()=>deleteCategory(cat.category_id, cat.category_name)}
                  style={{background:"none",border:"none",cursor:"pointer",
                          color:"#94a3b8",fontSize:14,lineHeight:1,padding:"0 2px"}}
                  title="Delete category">
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Add Book Form ── */}
      {show && isAdmin && (
        <div className="card">
          <div className="section-title" style={{marginBottom:20}}>New Book Entry</div>
          <form onSubmit={addBook}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
              <div className="form-group">
                <label>Title *</label>
                <input value={form.title} required
                  onChange={e=>setForm({...form,title:e.target.value})} />
              </div>
              <div className="form-group">
                <label>ISBN</label>
                <input value={form.isbn}
                  onChange={e=>setForm({...form,isbn:e.target.value})} />
              </div>
              <div className="form-group">
                <label>Publisher</label>
                <input value={form.publisher_name} placeholder="e.g. O'Reilly"
                  onChange={e=>setForm({...form,publisher_name:e.target.value})} />
              </div>
              <div className="form-group">
                <label>Publication Year</label>
                <input type="number" min="1000" max="2099" value={form.publication_year}
                  onChange={e=>setForm({...form,publication_year:e.target.value})} />
              </div>
              <div className="form-group">
                <label>Number of Copies</label>
                <input type="number" min="1" value={form.num_copies}
                  onChange={e=>setForm({...form,num_copies:e.target.value})} />
              </div>
            </div>

            {/* Authors */}
            <div className="form-group">
              <label style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <span>Authors</span>
                <button type="button" onClick={addAuthor}
                  style={{fontSize:12,padding:"3px 10px",background:"#f1f5f9",
                          color:"#475569",border:"1px solid #e2e8f0",borderRadius:6,
                          cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>
                  + Add Author
                </button>
              </label>
              {form.authors.map((a,i)=>(
                <div key={i} style={{display:"flex",gap:8,marginBottom:8}}>
                  <input placeholder={`Author ${i+1}`} value={a}
                    onChange={e=>updateAuthor(i,e.target.value)}
                    style={{flex:1,padding:"10px 14px",border:"1.5px solid #e2e8f0",
                            borderRadius:10,fontSize:14,fontFamily:"DM Sans,sans-serif",outline:"none"}}
                    onFocus={e=>e.target.style.borderColor="#3b82f6"}
                    onBlur={e=>e.target.style.borderColor="#e2e8f0"}
                  />
                  {form.authors.length>1&&(
                    <button type="button" onClick={()=>removeAuthor(i)}
                      style={{padding:"8px 12px",background:"#fef2f2",color:"#ef4444",
                              border:"1px solid #fecaca",borderRadius:8,cursor:"pointer"}}>
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Categories */}
            <div className="form-group">
              <label>
                Categories
                {form.category_ids.length>0&&(
                  <span style={{fontSize:11,color:"#3b82f6",marginLeft:8,
                                textTransform:"none",letterSpacing:0,fontWeight:600}}>
                    {form.category_ids.length} selected
                  </span>
                )}
              </label>
              <div style={{display:"flex",flexWrap:"wrap",gap:"8px 10px",
                           padding:"14px 16px",background:"#f8fafc",
                           borderRadius:10,border:"1.5px solid #e2e8f0"}}>
                {categories.map(cat=>(
                  <label key={cat.category_id}
                    style={{display:"flex",alignItems:"center",gap:7,fontSize:13.5,
                            cursor:"pointer",padding:"5px 10px",borderRadius:6,
                            background:form.category_ids.includes(cat.category_id)?"#dbeafe":"transparent",
                            color:form.category_ids.includes(cat.category_id)?"#1d4ed8":"#475569",
                            border:`1px solid ${form.category_ids.includes(cat.category_id)?"#93c5fd":"transparent"}`,
                            transition:"all 0.15s"}}>
                    <input type="checkbox"
                      checked={form.category_ids.includes(cat.category_id)}
                      onChange={()=>toggleCat(cat.category_id)}
                      style={{accentColor:"#3b82f6"}} />
                    {cat.category_name}
                  </label>
                ))}
              </div>
            </div>

            <div style={{display:"flex",gap:10,paddingTop:4}}>
              <button className="btn btn-primary" type="submit">Add to Catalogue</button>
              <button className="btn btn-ghost" type="button"
                onClick={()=>{setShow(false);setForm(EMPTY);}}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* ── Books Table ── */}
      <div className="card" style={{padding:0,overflow:"hidden"}}>
        <table>
          <thead>
            <tr>
              <th style={{paddingLeft:24}}>#</th>
              <th>Title</th><th>Author(s)</th><th>Categories</th>
              <th>Publisher</th><th>Year</th>
              <th>Total</th><th>Available</th><th>Issued</th>
              {isAdmin&&<th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {books.length===0
              ? (
                <tr><td colSpan="10">
                  <div className="empty-state">
                    <div className="empty-state-icon">📚</div>
                    <p>No books in the catalogue yet.</p>
                  </div>
                </td></tr>
              )
              : books.map((b,i)=>(
                <tr key={b.book_id}>
                  <td style={{paddingLeft:24,color:"#94a3b8",fontSize:12}}>{i+1}</td>
                  <td style={{fontWeight:600,color:"#1e293b"}}>{b.title}</td>
                  <td style={{color:"#475569",fontSize:13}}>{b.authors||"—"}</td>
                  <td style={{fontSize:12}}>
                    {b.categories
                      ? b.categories.split(", ").map((c,ci)=>(
                          <span key={ci} className="badge badge-blue"
                            style={{marginRight:4,marginBottom:2,display:"inline-block"}}>
                            {c}
                          </span>
                        ))
                      : <span style={{color:"#94a3b8"}}>—</span>
                    }
                  </td>
                  <td style={{color:"#64748b",fontSize:13}}>{b.publisher_name||"—"}</td>
                  <td style={{color:"#64748b"}}>{b.publication_year||"—"}</td>
                  <td style={{fontWeight:500}}>{b.total_copies}</td>
                  <td>
                    <span className={`badge ${b.available_copies>0?"badge-green":"badge-red"}`}>
                      {b.available_copies}
                    </span>
                  </td>
                  <td style={{color:"#64748b"}}>{b.issued_copies}</td>
                  {isAdmin&&(
                    <td>
                      <button className="btn btn-danger btn-sm"
                        onClick={()=>deleteBook(b.book_id)}>Delete</button>
                    </td>
                  )}
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}