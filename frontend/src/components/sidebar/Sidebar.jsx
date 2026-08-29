import { NavLink } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Home, Users, Map, User, LogOut, Compass } from "lucide-react";
import logo from "@/assets/icons/travel_stories_icon.svg";
import { memo } from "react";

const navItems = [
    { name: "Explore", path: "/user", icon: Home },
    { name: "Community", path: "/user/community", icon: Users },
    { name: "My Itineraries", path: "/user/itineraries", icon: Map },
    { name: "Profile", path: "/user/profile", icon: User },
];

function Sidebar({ user, onLogout }) {
    const imageUrl = useMemo(
        () =>
            `${import.meta.env.VITE_API_BASE_URL}/users/${user.userId}/profilePicture`,
        [user.userId],
    );

    return (
        <div className="flex flex-col w-64 bg-primary text-primary-foreground min-h-screen px-4 py-6 justify-between flex-shrink-0">
            {/* Top */}
            <div>
                {/* Title */}
                <div className="px-2 mb-3 pb-4 border-b border-white/10">
                    <div className="flex items-center gap-2 mb-0.5">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0">
                            <img src={logo} alt="Travel Stories" />
                        </div>
                        <span className="text-xl font-bold font-primary tracking-tight text-primary-foreground">
                            Travel Stories
                        </span>
                    </div>
                </div>

                {/* Nav */}
                <nav className="space-y-0.5" aria-label="Primary navigation">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.name}
                                to={item.path}
                                end={item.path === "/user"}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                                    ${
                                        isActive
                                            ? "bg-secondary text-black"
                                            : "text-primary-foreground/70 hover:bg-white/10 hover:text-primary-foreground"
                                    }`
                                }
                            >
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
            <div className="border-t border-white/10 pt-4">
                {/* User chip */}
                <div className="flex items-center gap-3 px-2 mb-3">
                    <Avatar className="w-8 h-8 flex-shrink-0 ring-2 ring-white/20">
                        <AvatarImage src={imageUrl} alt={user?.username} />
                        <AvatarFallback className="bg-white/10 text-primary-foreground text-xs font-semibold">
                            {user?.username?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-primary-foreground truncate">
                            {user?.username}
                        </p>
                    </div>
                </div>

                {/* Logout */}
                <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-primary-foreground/70 hover:bg-white/10 hover:text-primary-foreground transition-colors cursor-pointer"
                >
                    <LogOut size={15} />
                    Sign out
                </button>
            </div>
        </div>
    );
}

export default memo(Sidebar);
