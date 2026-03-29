import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, Map, LogOut, Shield } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";

const navItems = [
    { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { name: "User Management", path: "/admin/user-management", icon: Users },
    { name: "Itinerary Management", path: "/admin/itinerary-management", icon: Map },
];

export default function AdminSidebar({ user, onLogout }) {
    const imageUrl = `${import.meta.env.VITE_API_BASE_URL}/users/${user.userId}/profilePicture`;

    return (
        <div className="flex flex-col w-64 bg-primary text-primary-foreground min-h-screen px-4 py-6 justify-between flex-shrink-0">
            {/* Top */}
            <div>
                {/* Title */}
                <div className="px-2 mb-3 pb-4 border-b border-white/10">
                    <div className="flex items-center gap-2 mb-0.5">
                        <div className="w-6 h-6 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                            <Shield size={13} className="text-black" />
                        </div>
                        <div>
                            <span className="text-xl font-bold font-primary tracking-tight text-primary-foreground">
                                Travel Stories
                            </span>
                            <p className="text-[11px] font-medium uppercase tracking-widest text-primary-foreground/50">
                                Admin Panel
                            </p>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav className="space-y-0.5">
                    {navItems.map(item => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.name}
                                to={item.path}
                                end={item.path === "/admin"}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                                    ${
                                        isActive
                                            ? "bg-secondary text-black"
                                            : "text-primary-foreground/70 hover:bg-white/10 hover:text-primary-foreground"
                                    }`
                                }>
                                {({ isActive }) => (
                                    <>
                                        <Icon
                                            size={15}
                                            className={
                                                isActive
                                                    ? "text-black"
                                                    : "text-primary-foreground/50"
                                            }
                                        />
                                        <span>{item.name}</span>
                                    </>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>
            </div>

            {/* Bottom */}
            <div>
                <div className="border-t border-white/10 pt-4">
                    {/* User chip */}
                    <div className="flex items-center gap-3 px-2 mb-3">
                        <Avatar className="w-8 h-8 flex-shrink-0 ring-2 ring-white/20">
                            <AvatarImage src={imageUrl} alt={user?.username} />
                            <AvatarFallback className="bg-white/10 text-primary-foreground text-xs font-semibold">
                                {user?.username?.[0]?.toUpperCase() || "A"}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-primary-foreground truncate">
                                {user?.username}
                            </p>
                            <p className="text-[11px] text-primary-foreground/50 font-medium">
                                Administrator
                            </p>
                        </div>
                    </div>

                    {/* Logout */}
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-primary-foreground/70 hover:bg-white/10 hover:text-primary-foreground transition-colors cursor-pointer">
                        <LogOut size={15} />
                        Sign out
                    </button>
                </div>
            </div>
        </div>
    );
}
