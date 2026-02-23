import { useState, useMemo } from "react";
import { usersData } from "@/assets/propData";
import UserItineraryListOverlay from "@/components/UserItineraryListOverlay";
import ItineraryOverlay from "@/components/ItineraryOverlay";

export default function Community() {
    const users = Array.isArray(usersData) ? usersData : [];

    const [activeTab, setActiveTab] = useState("following");
    const [search, setSearch] = useState("");

    // ✅ Always store FULL user objects
    const [following, setFollowing] = useState(() =>
        users.filter((_, index) => index === 0 || index === 1),
    );

    const followers = useMemo(() => {
        return users.length > 2 ? [users[2]] : [];
    }, [users]);

    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedItinerary, setSelectedItinerary] = useState(null);

    // ---------------- SEARCH FILTER ----------------
    const filteredUsers =
        search.trim() === ""
            ? []
            : users.filter(user =>
                  user.username?.toLowerCase().includes(search.toLowerCase()),
              );

    // ---------------- FOLLOW LOGIC ----------------
    const isFollowing = userId => following.some(user => user.id === userId);

    const toggleFollow = user => {
        setFollowing(prev => {
            const alreadyFollowing = prev.some(u => u.id === user.id);

            if (alreadyFollowing) {
                return prev.filter(u => u.id !== user.id);
            }

            // ensure full object from usersData
            const fullUser = users.find(u => u.id === user.id);
            if (!fullUser) return prev;

            return [...prev, fullUser];
        });
    };

    const currentList = activeTab === "following" ? following : followers;

    return (
        <div>
            <h1 className="text-4xl font-bold font-primary text-primary">Community</h1>
            <p className="text-gray-500 mt-2 mb-8">Connect with fellow travelers</p>

            {/* SEARCH */}
            <div className="relative mb-8 w-full">
                <input
                    type="text"
                    placeholder="Search users by username..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full border rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                />

                {filteredUsers.length > 0 && (
                    <div className="absolute w-full bg-white border rounded-xl shadow-lg mt-2 max-h-60 overflow-y-auto z-50">
                        {filteredUsers.map(user => {
                            const followed = isFollowing(user.id);

                            return (
                                <div
                                    key={user.id}
                                    className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
                                    {/* USER INFO */}
                                    <div
                                        onClick={() => {
                                            setSelectedUser(user);
                                            setSearch(""); // close dropdown
                                        }}
                                        className="flex items-center gap-3 cursor-pointer">
                                        <img
                                            src={user.profilePic}
                                            alt=""
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                        <span>{user.username}</span>
                                    </div>

                                    {/* FOLLOW BUTTON */}
                                    <button
                                        onClick={e => {
                                            e.stopPropagation(); // prevent overlay opening
                                            toggleFollow(user);
                                        }}
                                        className={`px-4 py-1 text-sm rounded-full transition ${
                                            followed
                                                ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                                : "bg-primary text-white hover:opacity-90"
                                        }`}>
                                        {followed ? "Followed" : "Follow"}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* TABS */}
            <div className="flex gap-8 border-b mb-10">
                <button
                    onClick={() => setActiveTab("following")}
                    className={`pb-3 ${
                        activeTab === "following"
                            ? "border-b-2 border-primary text-primary"
                            : "text-gray-500"
                    }`}>
                    Following ({following.length})
                </button>

                <button
                    onClick={() => setActiveTab("followers")}
                    className={`pb-3 ${
                        activeTab === "followers"
                            ? "border-b-2 border-primary text-primary"
                            : "text-gray-500"
                    }`}>
                    Followers ({followers.length})
                </button>
            </div>

            {/* TAB LIST */}
            <div className="space-y-4">
                {currentList.map(user => (
                    <div
                        key={user.id}
                        className="p-4 border rounded-xl flex items-center justify-between">
                        <div
                            onClick={() => setSelectedUser(user)}
                            className="flex items-center gap-4 cursor-pointer">
                            <img
                                src={user.profilePic}
                                alt=""
                                className="w-12 h-12 rounded-full object-cover"
                            />
                            <span>{user.username}</span>
                        </div>

                        {activeTab === "following" && (
                            <button
                                onClick={e => {
                                    e.stopPropagation();
                                    toggleFollow(user);
                                }}
                                className="px-4 py-1 bg-gray-100 rounded-full hover:bg-gray-200">
                                Unfollow
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* USER ITINERARY LIST OVERLAY */}
            <UserItineraryListOverlay
                open={!!selectedUser}
                user={selectedUser}
                onClose={() => setSelectedUser(null)}
                onSelectItinerary={itinerary => {
                    setSelectedItinerary(itinerary);
                }}
            />

            {/* ITINERARY DETAIL OVERLAY */}
            <ItineraryOverlay
                open={!!selectedItinerary}
                itinerary={selectedItinerary}
                onClose={() => setSelectedItinerary(null)}
            />
        </div>
    );
}
