import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({ role }) {
    const { user, loading } = useAuth();

    //Wait until context finishes loading
    if (loading) return null;

    //Not logged in
    if (!user) return <Navigate to="/login" replace />;

    //Logged in but wrong role
    if (role && user.role !== role) return <Navigate to="/login" replace />;

    return <Outlet />;
}
