import { useState, useMemo, useEffect } from "react";

import UserItineraryListOverlay from "@/components/UserItineraryListOverlay";
import ItineraryOverlay from "@/components/ItineraryOverlay";
import api from "@/api/axiosConfig";

export default function Community() {
    const loggedInUser = JSON.parse(localStorage.getItem("user"));

    const [following, setFollowing] = useState([]);
    const [followers, setFollowers] = useState([]);
    const [searchResults, setSearchResults] = useState([]);

    const [activeTab, setActiveTab] = useState("following");
    const [search, setSearch] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedItinerary, setSelectedItinerary] = useState(null);

    // Fetch followers and following of current users
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

    // Dynamic searching
    useEffect(() => {
        if (search.trim() === "") {
            setSearchResults([]);
            return;
        }

        // Delay waits for user to enter something before calling the search API
        const delayDebounce = setTimeout(async () => {
            try {
                const res = await api.get(`/users/search?query=${search}`);

                const filteredResults = res.data.filter(
                    user => user.userId !== loggedInUser?.userId,
                );

                setSearchResults(filteredResults);
            } catch (error) {
                console.error(error);
            }
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [search]);

    // Follow logic
    const isFollowing = userId => following.some(user => user.userId === userId);

    const toggleFollow = async user => {
        try {
            if (isFollowing(user.userId)) {
                await api.delete("/users/community", {
                    data: {
                        followerId: loggedInUser.userId,
                        followingId: user.userId,
                    },
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

    const currentList = activeTab === "following" ? following : followers;

    return (
        <div>
            {/* Header */}
            <h1 className="text-4xl font-bold font-primary text-primary">Community</h1>
            <p className="text-gray-500 mt-2 mb-8">Connect with fellow travelers</p>

            {/* Search Bar */}
            <div className="relative mb-8 w-full">
                <input
                    type="text"
                    placeholder="Search users by username..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full bg-gray-100 border rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />

                {searchResults.length > 0 && (
                    <div className="absolute w-full bg-gray-100 rounded-xl shadow-lg mt-2 max-h-60 overflow-y-auto z-50">
                        {searchResults.map(user => {
                            const followed = isFollowing(user.userId);

                            return (
                                <div
                                    key={user.userId}
                                    className="flex items-center justify-between px-4 py-3 hover:bg-secondary/10">
                                    {/* User Information */}
                                    <div
                                        onClick={() => {
                                            setSelectedUser(user);
                                            setSearch("");
                                            setSearchResults([]);
                                        }}
                                        className="flex items-center gap-3 cursor-pointer">
                                        <img
                                            src={`${import.meta.env.VITE_API_BASE_URL}/users/${user.userId}/profilePicture`}
                                            alt=""
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                        <span>{user.username}</span>
                                    </div>

                                    {/* Follow/Unfollow Button */}
                                    <button
                                        onClick={e => {
                                            e.stopPropagation();
                                            toggleFollow(user);
                                        }}
                                        className={`px-4 py-1 text-sm rounded-full transition ${
                                            followed
                                                ? "bg-primary/60 text-white hover:bg-primary"
                                                : "bg-primary/90 text-white hover:bg-primary"
                                        }`}>
                                        {followed ? "Followed" : "Follow"}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Tabs */}
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

            {/* Following/Followers List */}
            <div className="space-y-4">
                {currentList.map(user => (
                    <div
                        key={user.userId}
                        className="p-4 bg-gray-100 hover:bg-secondary/10 rounded-xl flex items-center justify-between">
                        <div
                            onClick={() => setSelectedUser(user)}
                            className="flex items-center gap-4 cursor-pointer">
                            <img
                                src={`${import.meta.env.VITE_API_BASE_URL}/users/${user.userId}/profilePicture`}
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
                                className="px-4 py-1 bg-primary/60 text-white rounded-full hover:bg-primary">
                                Unfollow
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* User Itinerary List Overlay */}
            <UserItineraryListOverlay
                open={!!selectedUser}
                user={selectedUser}
                onClose={() => setSelectedUser(null)}
                onSelectItinerary={itinerary => {
                    setSelectedItinerary(itinerary);
                }}
            />

            {/* Itinerary Overlay */}
            <ItineraryOverlay
                open={!!selectedItinerary}
                itinerary={selectedItinerary}
                onClose={() => setSelectedItinerary(null)}
            />
        </div>
    );
}
