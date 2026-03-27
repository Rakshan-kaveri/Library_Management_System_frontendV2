// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login      from "./pages/Login";
import Register   from "./pages/Register";
import Dashboard  from "./pages/Dashboard";
import Books      from "./pages/Books";
import Students   from "./pages/Students";
import IssueReturn from "./pages/IssueReturn";
import Navbar     from "./components/Navbar";

function PrivateRoute({ children }) {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  return user ? children : <Navigate to="/login" />;
}

function Layout({ children }) {
  return (
    <div className="layout">
      <Navbar />
      <div className="main-content">{children}</div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
        <Route path="/books"   element={<PrivateRoute><Layout><Books /></Layout></PrivateRoute>} />
        <Route path="/students" element={<PrivateRoute><Layout><Students /></Layout></PrivateRoute>} />
        <Route path="/issues"  element={<PrivateRoute><Layout><IssueReturn /></Layout></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}