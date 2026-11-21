import { Navigate, Link, useNavigate } from "react-router-dom";
import { useAuth } from "./auth";

export function ProtectedRoute({ roles, children }) {
  const { user } = useAuth();
  if (!localStorage.getItem("token") || !user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

export function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return <div className="shell">
    <header className="topbar">
      <Link to="/" className="brand">StoreRate</Link>
      <nav>
        {user?.role === "ADMIN" && <><Link to="/admin">Dashboard</Link><Link to="/admin/users">Users</Link><Link to="/admin/stores">Stores</Link></>}
        {user?.role === "USER" && <Link to="/stores">Stores</Link>}
        {user?.role === "STORE_OWNER" && <Link to="/owner">Owner Dashboard</Link>}
        {user && <Link to="/change-password">Change Password</Link>}
        {user ? <button className="link-button" onClick={() => { logout(); navigate("/login"); }}>Log out</button> : <><Link to="/login">Login</Link><Link to="/register">Sign up</Link></>}
      </nav>
    </header>
    <main className="container">{children}</main>
  </div>;
}

export function PageTitle({ title, subtitle }) {
  return <div className="page-title"><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>;
}

export function Table({ columns, rows, empty = "No records found." }) {
  return <div className="table-wrap"><table><thead><tr>{columns.map(c => <th key={c.key}>{c.label}</th>)}</tr></thead>
    <tbody>{rows.length ? rows.map((row, i) => <tr key={row.id ?? i}>{columns.map(c => <td key={c.key}>{c.render ? c.render(row) : row[c.key] ?? "—"}</td>)}</tr>) : <tr><td colSpan={columns.length} className="empty">{empty}</td></tr>}</tbody>
  </table></div>;
}
