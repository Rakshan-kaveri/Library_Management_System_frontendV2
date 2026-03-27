// src/components/Navbar.jsx
import { NavLink, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const user     = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin  = user.role_name === "Admin";

  function logout() {
    localStorage.removeItem("user");
    navigate("/login");
  }

  const initials = user.name
    ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const navItems = [
    { to: "/",         icon: "▦",  label: "Dashboard"     },
    { to: "/books",    icon: "◫",  label: "Books"         },
    { to: "/issues",   icon: "⇄",  label: "Issue / Return" },
    ...(isAdmin ? [{ to: "/students", icon: "◈", label: "Students" }] : []),
  ];

  return (
    <div className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
       <img src="/logo.png" alt="Library Logo" className="nav-logo" />
        <h2>Library</h2>
        <p>Management System</p>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Navigation</div>
        {navItems.map(item => (
          <NavLink key={item.to} to={item.to}
            className={({ isActive }) => isActive ? "active" : ""}
            end={item.to === "/"}>
            <span style={{ fontSize:15, opacity:0.85 }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <p>{user.name}</p>
            <span>{user.role_name}</span>
          </div>
        </div>
        <button className="sidebar-logout" onClick={logout}>
          <span>↩</span> Sign Out
        </button>
      </div>
    </div>
  );
}