import { NavLink } from "react-router-dom";
import { Button } from "./ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Separator } from "./ui/separator";
import { Home, Users, Map, User, LogOut } from "lucide-react";

export default function Sidebar({ user, onLogout }) {
    const navItems = [
        { name: "Explore", path: "/user", icon: Home },
        { name: "Community", path: "/user/community", icon: Users },
        { name: "My Itineraries", path: "/user/itineraries", icon: Map },
        { name: "Profile", path: "/user/profile", icon: User },
    ];

    return (
        <div className="flex flex-col w-64 bg-primary text-primary-foreground p-5 min-h-screen justify-between">
            {/* Top */}
            <div>
                <h1 className="text-2xl font-bold mb-2 font-primary">Travel Stories</h1>
                <div className="bg-secondary mb-5 w-full h-0.5" />

                {/* Sidebar navItems */}
                <nav className="space-y-1">
                    {navItems.map(item => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.name}
                                to={item.path}
                                end={item.path === "/user"}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                                        isActive
                                            ? "bg-secondary text-black"
                                            : "hover:bg-secondary/10"
                                    }`
                                }>
                                <Icon size={18} />
                                <span className="font-secondary">{item.name}</span>
                            </NavLink>
                        );
                    })}
                </nav>
            </div>

            {/* Bottom */}
            <div>
                <Separator className="my-4 bg-white/20" />
                <div className="flex items-center gap-3 mb-4">
                    <Avatar>
                        <AvatarImage src={user?.image} />
                        <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-sm font-medium font-secondary">{user?.name}</p>
                    </div>
                </div>

                <Button
                    onClick={onLogout}
                    className="w-full flex items-center gap-2 bg-secondary text-black hover:bg-secondary/90">
                    <LogOut size={16} />
                    Logout
                </Button>
            </div>
        </div>
    );
}
