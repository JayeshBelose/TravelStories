import Sidebar from "@/components/sidebar/Sidebar";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function MainLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    // Content structure of user pages
    return (
        <div className="flex min-h-screen bg-background">
            <div className="w-64 sticky top-0 self-start">
                <Sidebar user={user} onLogout={handleLogout} />
            </div>

            <main className="flex-1 p-6 lg:p-8">
                <Outlet />
            </main>
        </div>
    );
}
