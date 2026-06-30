import { useState, useEffect, useRef } from "react";
import { Search, X, Users, UserCheck, UserPlus, UserMinus, MapIcon } from "lucide-react";
import UserItineraryListOverlay from "@/components/itinerary/UserItineraryListOverlay";
import ItineraryOverlay from "@/components/itinerary/ItineraryOverlay";
import api from "@/api/axiosConfig";

function UserAvatar({ userId, username, size = "md" }) {
    const sizeClass = size === "sm" ? "w-8 h-8 text-xs" : "w-11 h-11 text-sm";
    return (
        <div
            className={`${sizeClass} rounded-full overflow-hidden flex-shrink-0 bg-gray-200`}>
            <img
                src={`${import.meta.env.VITE_API_BASE_URL}/users/${userId}/profilePicture`}
                alt={username}
                className="w-full h-full object-cover"
                onError={e => {
                    e.currentTarget.style.display = "none";
                }}
            />
        </div>
    );
}

export default function Community() {
    const loggedInUser = JSON.parse(localStorage.getItem("user"));

    const [following, setFollowing] = useState([]);
    const [followers, setFollowers] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [activeTab, setActiveTab] = useState("following");
    const [search, setSearch] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedItinerary, setSelectedItinerary] = useState(null);
    const [searchOpen, setSearchOpen] = useState(false);

    const searchRef = useRef(null);
    const inputRef = useRef(null);

    // Close search dropdown on outside click
    useEffect(() => {
        const handler = e => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setSearchOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    useEffect(() => {
        if (!loggedInUser?.userId) return;
        const fetchData = async () => {
            try {
                const [followingRes, followersRes] = await Promise.all([
                    api.get(`/users/community/${loggedInUser.userId}/following`),
                    api.get(`/users/community/${loggedInUser.userId}/followers`),
                ]);
                setFollowing(followingRes.data);
                setFollowers(followersRes.data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (search.trim() === "") {
            setSearchResults([]);
            setSearchOpen(false);
            return;
        }
        const delay = setTimeout(async () => {
            try {
                const res = await api.get(`/users/search?query=${search}`);
                const filtered = res.data.filter(u => u.userId !== loggedInUser?.userId);
                setSearchResults(filtered);
                setSearchOpen(filtered.length > 0);
            } catch (error) {
                console.error(error);
            }
        }, 300);
        return () => clearTimeout(delay);
    }, [search]);

    const isFollowing = userId => following.some(u => u.userId === userId);

    const toggleFollow = async user => {
        try {
            if (isFollowing(user.userId)) {
                await api.delete("/users/community", {
                    data: { followerId: loggedInUser.userId, followingId: user.userId },
                });
                setFollowing(prev => prev.filter(u => u.userId !== user.userId));
            } else {
                await api.post("/users/community", {
                    followerId: loggedInUser.userId,
                    followingId: user.userId,
                });
                setFollowing(prev => [...prev, user]);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const clearSearch = () => {
        setSearch("");
        setSearchResults([]);
        setSearchOpen(false);
        inputRef.current?.focus();
    };

    const handleSelectSearchUser = user => {
        setSelectedUser(user);
        clearSearch();
    };

    const currentList = activeTab === "following" ? following : followers;

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-primary text-gray-900 tracking-tight mb-1">
                    Community
                </h1>
                <p className="text-sm text-gray-400">Connect with fellow travelers</p>
            </div>

            {/* Search */}
            <div ref={searchRef} className="relative mb-8">
                <div className="flex items-center gap-2.5 bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 shadow-sm focus-within:border-gray-400 transition-colors">
                    <Search size={15} className="text-gray-400 flex-shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search travelers to connect with…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-transparent outline-none text-sm text-gray-700 placeholder:text-gray-300"
                    />
                    {search && (
                        <button
                            onClick={clearSearch}
                            className="text-gray-300 hover:text-gray-500 transition-colors cursor-pointer">
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* Search Results Dropdown */}
                {searchOpen && searchResults.length > 0 && (
                    <div className="absolute w-full bg-white border border-gray-100 rounded-xl shadow-xl mt-2 max-h-64 overflow-y-auto z-50 py-1">
                        {searchResults.map(user => {
                            const followed = isFollowing(user.userId);
                            return (
                                <div
                                    key={user.userId}
                                    className="flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 transition-colors">
                                    <button
                                        onClick={() => handleSelectSearchUser(user)}
                                        className="flex items-center gap-3 cursor-pointer flex-1 min-w-0 text-left">
                                        <UserAvatar
                                            userId={user.userId}
                                            username={user.username}
                                            size="sm"
                                        />
                                        <span className="text-sm font-medium text-gray-800 truncate">
                                            {user.username}
                                        </span>
                                    </button>
                                    <button
                                        onClick={e => {
                                            e.stopPropagation();
                                            toggleFollow(user);
                                        }}
                                        className={`ml-3 flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full transition-colors cursor-pointer flex-shrink-0
                                            ${
                                                followed
                                                    ? "bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500"
                                                    : "bg-gray-900 text-white hover:bg-gray-700"
                                            }`}>
                                        {followed ? (
                                            <>
                                                <UserMinus size={11} /> Following
                                            </>
                                        ) : (
                                            <>
                                                <UserPlus size={11} /> Follow
                                            </>
                                        )}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-gray-100 mb-6">
                {[
                    {
                        key: "following",
                        label: "Following",
                        count: following.length,
                        icon: UserCheck,
                    },
                    {
                        key: "followers",
                        label: "Followers",
                        count: followers.length,
                        icon: Users,
                    },
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors cursor-pointer
                            ${
                                activeTab === tab.key
                                    ? "border-gray-900 text-gray-900"
                                    : "border-transparent text-gray-400 hover:text-gray-600"
                            }`}>
                        <tab.icon size={14} />
                        {tab.label}
                        <span
                            className={`text-xs px-1.5 py-0.5 rounded-full font-semibold
                            ${
                                activeTab === tab.key
                                    ? "bg-gray-900 text-white"
                                    : "bg-gray-100 text-gray-400"
                            }`}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* User List */}
            {currentList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                        <Users size={22} className="text-gray-300" />
                    </div>
                    <p className="text-sm font-medium text-gray-500">
                        {activeTab === "following"
                            ? "You're not following anyone yet"
                            : "No followers yet"}
                    </p>
                    <p className="text-xs text-gray-300">
                        Search for travelers above to connect
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {currentList.map(user => (
                        <div
                            key={user.userId}
                            className="flex items-center justify-between px-4 py-3 bg-white border border-gray-100 rounded-xl hover:border-gray-200 hover:shadow-sm transition-all">
                            {/* User info */}
                            <button
                                onClick={() => setSelectedUser(user)}
                                className="flex items-center gap-3 cursor-pointer flex-1 min-w-0 text-left">
                                <UserAvatar
                                    userId={user.userId}
                                    username={user.username}
                                />
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 truncate">
                                        {user.username}
                                    </p>
                                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                        <MapIcon size={10} />
                                        View itineraries
                                    </p>
                                </div>
                            </button>

                            {/* Action button */}
                            {activeTab === "following" ? (
                                <button
                                    onClick={e => {
                                        e.stopPropagation();
                                        toggleFollow(user);
                                    }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer flex-shrink-0">
                                    <UserMinus size={12} />
                                    Unfollow
                                </button>
                            ) : (
                                <button
                                    onClick={e => {
                                        e.stopPropagation();
                                        toggleFollow(user);
                                    }}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-colors cursor-pointer flex-shrink-0
                                        ${
                                            isFollowing(user.userId)
                                                ? "bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500"
                                                : "bg-gray-900 text-white hover:bg-gray-700"
                                        }`}>
                                    {isFollowing(user.userId) ? (
                                        <>
                                            <UserMinus size={12} /> Unfollow
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus size={12} /> Follow Back
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Overlays */}
            <UserItineraryListOverlay
                open={!!selectedUser}
                user={selectedUser}
                onClose={() => setSelectedUser(null)}
                onSelectItinerary={itinerary => setSelectedItinerary(itinerary)}
            />
            <ItineraryOverlay
                open={!!selectedItinerary}
                itinerary={selectedItinerary}
                onClose={() => setSelectedItinerary(null)}
            />
        </div>
    );
}
