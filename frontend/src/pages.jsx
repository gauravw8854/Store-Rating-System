import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import api, { errorMessage } from "./api";
import { useAuth } from "./auth";
import { PageTitle, Table } from "./components";

function Message({ value, error }) {
  return value ? <p className={error ? "notice error" : "notice"}>{value}</p> : null;
}

export function Home() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "ADMIN") return <Navigate to="/admin" replace />;
  if (user.role === "STORE_OWNER") return <Navigate to="/owner" replace />;
  return <Navigate to="/stores" replace />;
}

export function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  if (user) return <Home />;
  async function submit(e) {
    e.preventDefault(); setError("");
    try {
      const loggedIn = await login(form.email, form.password);
      navigate(loggedIn.role === "ADMIN" ? "/admin" : loggedIn.role === "STORE_OWNER" ? "/owner" : "/stores");
    } catch (err) { setError(errorMessage(err)); }
  }
  return <section className="auth-card"><PageTitle title="Welcome back" subtitle="Sign in to your StoreRate account." />
    <Message value={error} error />
    <form onSubmit={submit}>
      <label>Email<input type="email" required value={form.email} onChange={e => setForm({...form,email:e.target.value})}/></label>
      <label>Password<input type="password" required value={form.password} onChange={e => setForm({...form,password:e.target.value})}/></label>
      <button className="primary">Log in</button>
    </form><p className="muted">New here? <Link to="/register">Create an account</Link></p>
  </section>;
}

export function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:"", email:"", address:"", password:"" });
  const [message, setMessage] = useState(""); const [error, setError] = useState("");
  function change(e) { setForm({...form,[e.target.name]:e.target.value}); }
  async function submit(e) {
    e.preventDefault(); setMessage(""); setError("");
    try { await api.post("/auth/register", form); setMessage("Account created. You can now log in."); setTimeout(() => navigate("/login"), 900); }
    catch(err) { setError(errorMessage(err)); }
  }
  return <section className="auth-card"><PageTitle title="Create account" subtitle="Public signup creates a normal user account."/>
    <Message value={error} error/><Message value={message}/>
    <form onSubmit={submit}>
      <label>Name (20–60 characters)<input name="name" minLength="20" maxLength="60" required value={form.name} onChange={change}/></label>
      <label>Email<input name="email" type="email" required value={form.email} onChange={change}/></label>
      <label>Address (max 400 characters)<textarea name="address" maxLength="400" required value={form.address} onChange={change}/></label>
      <label>Password (8–16 characters, uppercase + special character)<input name="password" type="password" minLength="8" maxLength="16" required value={form.password} onChange={change}/></label>
      <button className="primary">Sign up</button>
    </form><p className="muted">Already registered? <Link to="/login">Log in</Link></p>
  </section>;
}

export function ChangePassword() {
  const [form,setForm] = useState({currentPassword:"",newPassword:""});
  const [message,setMessage] = useState(""); const [error,setError] = useState("");
  async function submit(e) { e.preventDefault(); setMessage(""); setError(""); try { const {data}=await api.put("/auth/change-password",form); setMessage(data.message); setForm({currentPassword:"",newPassword:""}); } catch(err) { setError(errorMessage(err)); } }
  return <section className="form-card"><PageTitle title="Change password"/><Message value={error} error/><Message value={message}/>
    <form onSubmit={submit}>
      <label>Current password<input type="password" required value={form.currentPassword} onChange={e=>setForm({...form,currentPassword:e.target.value})}/></label>
      <label>New password<input type="password" required minLength="8" maxLength="16" value={form.newPassword} onChange={e=>setForm({...form,newPassword:e.target.value})}/></label>
      <button className="primary">Update password</button>
    </form>
  </section>;
}

export function AdminDashboard() {
  const [stats,setStats] = useState(null); const [error,setError] = useState("");
  useEffect(()=>{api.get("/admin/dashboard").then(r=>setStats(r.data)).catch(e=>setError(errorMessage(e)));},[]);
  return <><PageTitle title="Administrator dashboard" subtitle="Platform overview."/><Message value={error} error/>
    <div className="stats">{[["Total users",stats?.totalUsers],["Total stores",stats?.totalStores],["Submitted ratings",stats?.totalRatings]].map(([label,value])=><article className="stat" key={label}><span>{label}</span><strong>{value ?? "…"}</strong></article>)}</div>
    <div className="quick-links"><Link className="primary" to="/admin/users">Manage users</Link><Link className="secondary" to="/admin/stores">Manage stores</Link></div>
  </>;
}

export function AdminUsers() {
  const [users,setUsers] = useState([]); const [filters,setFilters] = useState({name:"",email:"",address:"",role:"",sortBy:"name",order:"asc"});
  const [error,setError] = useState(""); const [message,setMessage] = useState("");
  const [form,setForm] = useState({name:"",email:"",address:"",password:"",role:"USER"});
  async function load() { try { const {data}=await api.get("/admin/users",{params:filters}); setUsers(data.users); setError(""); } catch(e) { setError(errorMessage(e)); } }
  useEffect(()=>{load();},[]);
  async function create(e) { e.preventDefault(); setError(""); setMessage(""); try { await api.post("/admin/users",form); setMessage("User created."); setForm({name:"",email:"",address:"",password:"",role:"USER"}); load(); } catch(e) { setError(errorMessage(e)); } }
  function filterChange(e) { setFilters({...filters,[e.target.name]:e.target.value}); }
  return <><PageTitle title="Manage users" subtitle="Create accounts, search and sort users."/><Message value={error} error/><Message value={message}/>
    <section className="panel"><h2>Create user</h2><form className="grid-form" onSubmit={create}>
      <label>Name<input name="name" minLength="20" maxLength="60" required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label>
      <label>Email<input name="email" type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label>
      <label>Address<input name="address" maxLength="400" required value={form.address} onChange={e=>setForm({...form,address:e.target.value})}/></label>
      <label>Password<input name="password" type="password" minLength="8" maxLength="16" required value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></label>
      <label>Role<select value={form.role} onChange={e=>setForm({...form,role:e.target.value})}><option value="USER">Normal User</option><option value="ADMIN">Administrator</option><option value="STORE_OWNER">Store Owner</option></select></label>
      <button className="primary">Create user</button>
    </form></section>
    <section className="panel"><h2>Filter users</h2><div className="filters">
      <input name="name" placeholder="Name" value={filters.name} onChange={filterChange}/>
      <input name="email" placeholder="Email" value={filters.email} onChange={filterChange}/>
      <input name="address" placeholder="Address" value={filters.address} onChange={filterChange}/>
      <select name="role" value={filters.role} onChange={filterChange}><option value="">All roles</option><option>ADMIN</option><option>USER</option><option>STORE_OWNER</option></select>
      <select name="sortBy" value={filters.sortBy} onChange={filterChange}><option value="name">Sort: Name</option><option value="email">Email</option><option value="address">Address</option><option value="role">Role</option></select>
      <select name="order" value={filters.order} onChange={filterChange}><option value="asc">Ascending</option><option value="desc">Descending</option></select>
      <button className="secondary" onClick={load}>Apply</button>
    </div></section>
    <Table columns={[{key:"name",label:"Name"},{key:"email",label:"Email"},{key:"address",label:"Address"},{key:"role",label:"Role"},{key:"storeAverageRating",label:"Owner rating"},{key:"id",label:"Details",render:u=><Link to={`/admin/users/${u.id}`}>View</Link>}]} rows={users}/>
  </>;
}

export function AdminUserDetails() {
  const id = window.location.pathname.split("/").pop();
  const [result,setResult] = useState(null); const [error,setError] = useState("");
  useEffect(()=>{api.get(`/admin/users/${id}`).then(r=>setResult(r.data)).catch(e=>setError(errorMessage(e)));},[id]);
  if(error) return <Message value={error} error/>;
  if(!result) return <p>Loading…</p>;
  const u=result.user;
  return <><PageTitle title="User details"/><section className="panel detail-grid">
    <p><b>Name</b>{u.name}</p><p><b>Email</b>{u.email}</p><p><b>Address</b>{u.address}</p><p><b>Role</b>{u.role}</p>
    {u.role==="STORE_OWNER" && <><p><b>Store</b>{u.ownedStore?.name || "No store linked"}</p><p><b>Average rating</b>{result.storeAverageRating ?? "—"}</p></>}
  </section></>;
}

export function AdminStores() {
  const [stores,setStores] = useState([]); const [owners,setOwners] = useState([]);
  const [filters,setFilters] = useState({name:"",email:"",address:"",sortBy:"name",order:"asc"});
  const [form,setForm] = useState({name:"",email:"",address:"",ownerId:""});
  const [error,setError] = useState(""); const [message,setMessage] = useState("");
  async function load() { try { const [s,u]=await Promise.all([api.get("/admin/stores",{params:filters}),api.get("/admin/users",{params:{role:"STORE_OWNER"}})]); setStores(s.data.stores); setOwners(u.data.users); } catch(e) { setError(errorMessage(e)); } }
  useEffect(()=>{load();},[]);
  async function create(e) { e.preventDefault(); setError(""); setMessage(""); try { await api.post("/admin/stores",{...form,ownerId:form.ownerId || null}); setMessage("Store created."); setForm({name:"",email:"",address:"",ownerId:""}); load(); } catch(e) { setError(errorMessage(e)); } }
  return <><PageTitle title="Manage stores" subtitle="Register stores and view their average ratings."/><Message value={error} error/><Message value={message}/>
    <section className="panel"><h2>Add store</h2><form className="grid-form" onSubmit={create}>
      <label>Store name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label>
      <label>Store email<input type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label>
      <label>Address<input maxLength="400" required value={form.address} onChange={e=>setForm({...form,address:e.target.value})}/></label>
      <label>Store owner<select value={form.ownerId} onChange={e=>setForm({...form,ownerId:e.target.value})}><option value="">No owner assigned</option>{owners.map(o=><option key={o.id} value={o.id}>{o.name} ({o.email})</option>)}</select></label>
      <button className="primary">Add store</button>
    </form><p className="muted">Create a STORE_OWNER account in Manage Users before assigning an owner.</p></section>
    <section className="panel"><h2>Search and sort</h2><div className="filters">
      {["name","email","address"].map(k=><input key={k} placeholder={k} value={filters[k]} onChange={e=>setFilters({...filters,[k]:e.target.value})}/>)}
      <select value={filters.sortBy} onChange={e=>setFilters({...filters,sortBy:e.target.value})}><option value="name">Sort: Name</option><option value="email">Email</option><option value="address">Address</option></select>
      <select value={filters.order} onChange={e=>setFilters({...filters,order:e.target.value})}><option value="asc">Ascending</option><option value="desc">Descending</option></select>
      <button className="secondary" onClick={load}>Apply</button>
    </div></section>
    <Table columns={[{key:"name",label:"Store"},{key:"email",label:"Email"},{key:"address",label:"Address"},{key:"averageRating",label:"Average rating"},{key:"owner",label:"Owner",render:s=>s.owner?.name || "Unassigned"}]} rows={stores}/>
  </>;
}

export function StoreList() {
  const [stores,setStores] = useState([]); const [search,setSearch] = useState(""); const [error,setError] = useState(""); const [message,setMessage] = useState("");
  async function load() { try { const {data}=await api.get("/stores",{params:{search}}); setStores(data.stores); setError(""); } catch(e) { setError(errorMessage(e)); } }
  useEffect(()=>{load();},[]);
  async function rate(storeId,rating) { setError(""); setMessage(""); try { await api.post("/ratings",{storeId,rating:Number(rating)}); setMessage("Your rating has been saved."); load(); } catch(e) { setError(errorMessage(e)); } }
  return <><PageTitle title="Explore stores" subtitle="Search stores and submit a rating from 1 to 5."/><Message value={error} error/><Message value={message}/>
    <div className="search-row"><input placeholder="Search by store name or address" value={search} onChange={e=>setSearch(e.target.value)}/><button className="secondary" onClick={load}>Search</button></div>
    <div className="store-grid">{stores.map(s=><article className="store-card" key={s.id}>
      <h2>{s.name}</h2><p>{s.address}</p><div className="rating-line">Overall rating <strong>{s.averageRating ? `${s.averageRating} / 5` : "Not rated yet"}</strong></div>
      <div className="rating-line">Your rating <strong>{s.userRating ?? "Not rated"}</strong></div>
      <label>Submit or update your rating<select value={s.userRating ?? ""} onChange={e=>e.target.value && rate(s.id,e.target.value)}><option value="" disabled>Select 1–5</option>{[1,2,3,4,5].map(n=><option key={n} value={n}>{n} star{n>1?"s":""}</option>)}</select></label>
    </article>)}</div>
    {!stores.length && <p className="empty">No stores found.</p>}
  </>;
}

export function OwnerDashboard() {
  const [data,setData] = useState(null); const [error,setError] = useState("");
  useEffect(()=>{api.get("/owner/dashboard").then(r=>setData(r.data)).catch(e=>setError(errorMessage(e)));},[]);
  if(error) return <><PageTitle title="Store owner dashboard"/><Message value={error} error/></>;
  if(!data) return <p>Loading dashboard…</p>;
  return <><PageTitle title={data.store.name} subtitle={data.store.address}/><div className="stats">
    <article className="stat"><span>Average rating</span><strong>{data.averageRating} / 5</strong></article>
    <article className="stat"><span>Total ratings</span><strong>{data.totalRatings}</strong></article>
  </div><PageTitle title="Customer ratings"/><Table columns={[{key:"user",label:"User",render:r=>r.user.name},{key:"email",label:"Email",render:r=>r.user.email},{key:"rating",label:"Rating"},{key:"updatedAt",label:"Last updated",render:r=>new Date(r.updatedAt).toLocaleString()}]} rows={data.ratings}/></>;
}
