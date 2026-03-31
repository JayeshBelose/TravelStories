import AdminSidebar from "@/components/sidebars/AdminSidebar";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function AdminLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    // Content structure of admin pages
    return (
        <div className="flex min-h-screen bg-background">
            <div className="w-64 sticky top-0 self-start">
                <AdminSidebar user={user} onLogout={handleLogout} />
            </div>

            <main className="flex-1 p-8">
                <Outlet />
            </main>
        </div>
    );
}
