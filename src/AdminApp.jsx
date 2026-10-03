import { Route, Routes, Navigate } from "react-router";
import { AuthProvider } from "./Dashboard/context/AuthContext";
import { ToastProvider } from "./Dashboard/shared/ToastContext";
import ProtectedRoute from "./Dashboard/shared/ProtectedRoute";
import AppProviders from "./Dashboard/shared/AppProviders";
import Login from "./Dashboard/Login/Login";
import Dashboard from "./Dashboard/Dashboard";
import Overview from "./Dashboard/Overview/Overview";
import Properties from "./Dashboard/Properties/Properties";
import PropertyFormPage from "./Dashboard/Properties/PropertyFormPage";
import Featured from "./Dashboard/Featured/Featured";
import Neighborhoods from "./Dashboard/Neighborhoods/Neighborhoods";
import Agents from "./Dashboard/Agents/Agents";
import Categories from "./Dashboard/Categories/Categories";
import Conveniences from "./Dashboard/Conveniences/Conveniences";
import Settings from "./Dashboard/Settings/Settings";
import useNoIndex from "./hooks/useNoIndex";

// This <Routes> tree matches against the full URL, same as every other
// <Routes> in this app (see App.jsx) — it's only ever rendered when
// location.pathname is already under /admin, so the paths below stay
// exactly as they were when the dashboard was its own standalone project.
export default function AdminApp() {
  useNoIndex();

  return (
    <ToastProvider>
      <AuthProvider>
        <Routes>
          <Route path="/admin/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppProviders />}>
              <Route path="/admin" element={<Dashboard />}>
                <Route index element={<Overview />} />
                <Route path="properties" element={<Properties />} />
                <Route path="properties/new" element={<PropertyFormPage />} />
                <Route path="properties/:id/edit" element={<PropertyFormPage />} />
                <Route path="featured" element={<Featured />} />
                <Route path="neighborhoods" element={<Neighborhoods />} />
                <Route path="agents" element={<Agents />} />
                <Route path="categories" element={<Categories />} />
                <Route path="conveniences" element={<Conveniences />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Route>
          </Route>

          <Route path="/admin/*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </AuthProvider>
    </ToastProvider>
  );
}
