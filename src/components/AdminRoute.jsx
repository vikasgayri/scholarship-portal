import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LoadingScreen } from "./ui/Skeleton";

export default function AdminRoute() {
  const { isLoading, user } = useAuth();

  if (isLoading) {
    return <LoadingScreen message="Confirming admin access..." />;
  }

  if (user?.role !== "ADMIN") {
    return <Navigate replace to="/dashboard" />;
  }

  return <Outlet />;
}
