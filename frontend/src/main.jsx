import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth";
import { Layout, ProtectedRoute } from "./components";
import {
  Home, Login, Register, ChangePassword, AdminDashboard, AdminUsers,
  AdminUserDetails, AdminStores, StoreList, OwnerDashboard
} from "./pages";
import "./style.css";

function App() {
  return <AuthProvider><BrowserRouter><Layout><Routes>
    <Route path="/" element={<Home/>}/>
    <Route path="/login" element={<Login/>}/>
    <Route path="/register" element={<Register/>}/>
    <Route path="/change-password" element={<ProtectedRoute><ChangePassword/></ProtectedRoute>}/>
    <Route path="/admin" element={<ProtectedRoute roles={["ADMIN"]}><AdminDashboard/></ProtectedRoute>}/>
    <Route path="/admin/users" element={<ProtectedRoute roles={["ADMIN"]}><AdminUsers/></ProtectedRoute>}/>
    <Route path="/admin/users/:id" element={<ProtectedRoute roles={["ADMIN"]}><AdminUserDetails/></ProtectedRoute>}/>
    <Route path="/admin/stores" element={<ProtectedRoute roles={["ADMIN"]}><AdminStores/></ProtectedRoute>}/>
    <Route path="/stores" element={<ProtectedRoute roles={["USER"]}><StoreList/></ProtectedRoute>}/>
    <Route path="/owner" element={<ProtectedRoute roles={["STORE_OWNER"]}><OwnerDashboard/></ProtectedRoute>}/>
    <Route path="*" element={<Home/>}/>
  </Routes></Layout></BrowserRouter></AuthProvider>;
}

createRoot(document.getElementById("root")).render(<React.StrictMode><App/></React.StrictMode>);
