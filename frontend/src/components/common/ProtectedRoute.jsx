import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({ role }) {
    const { user, loading } = useAuth();

    // Wait until context finishes loading
    if (loading) return null;

    // If user is not logged in re-route to login page
    if (!user) return <Navigate to="/login" replace />;

    // If user accidently logs in with wrong role re-route to login
    if (role && user.role !== role) return <Navigate to="/login" replace />;

    return <Outlet />;
}
