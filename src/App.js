import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AdminRoute from "./components/AdminRoute";
import PortalLayout from "./components/PortalLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { ToastProvider } from "./components/ui/ToastProvider";
import { AuthProvider } from "./context/AuthContext";

import AdminPanel from "./pages/AdminPanel";
import Applications from "./pages/Applications";
import Dashboard from "./pages/Dashboard";
import Documents from "./pages/Documents";
import Home from "./pages/Home";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import Scholarships from "./pages/Scholarships";
import VerifyAccount from "./pages/VerifyAccount";

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Home />} path="/" />
            <Route element={<Login />} path="/login" />
            <Route element={<Register />} path="/register" />
            <Route element={<VerifyAccount />} path="/verify-account" />

            <Route element={<ProtectedRoute />}>
              <Route element={<PortalLayout />}>
                <Route element={<Dashboard />} path="/dashboard" />
                <Route element={<Scholarships />} path="/scholarships" />
                <Route element={<Scholarships />} path="/scholarships/:scholarshipId/apply" />
                <Route element={<Applications />} path="/applications" />
                <Route element={<Documents />} path="/documents" />
                <Route element={<Profile />} path="/profile" />

                <Route element={<AdminRoute />}>
                  <Route element={<AdminPanel />} path="/admin" />
                </Route>

                <Route element={<NotFound />} path="*" />
              </Route>
            </Route>

            <Route element={<Navigate replace to="/" />} path="/home" />
            <Route element={<NotFound />} path="*" />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
