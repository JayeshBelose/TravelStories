import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import {
    Search,
    X,
    Users,
    UserCheck,
    UserPlus,
    UserMinus,
    MapIcon,
    Loader2,
} from "lucide-react";
import UserItineraryListOverlay from "@/components/itinerary/UserItineraryListOverlay";
import ItineraryOverlay from "@/components/itinerary/ItineraryOverlay";
import { Skeleton } from "@/components/ui/skeleton";
import ErrorState from "@/components/common/ErrorState";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
    followUserService,
    getFollowersService,
    getFollowingService,
    searchUsersService,
    unfollowUserService,
} from "@/services/userService";

function UserAvatar({ userId, username, size = "md" }) {
    const sizeClass = size === "sm" ? "w-8 h-8 text-xs" : "w-11 h-11 text-sm";

    return (
        <Avatar className={`${sizeClass} flex-shrink-0`}>
            <AvatarImage
                src={`${import.meta.env.VITE_API_BASE_URL}/users/${userId}/profilePicture`}
                alt={username}
            />
            <AvatarFallback className="bg-gray-900 text-white font-semibold">
                {username?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
        </Avatar>
    );
}

export default function Community() {
    const loggedInUser = JSON.parse(sessionStorage.getItem("user"));

    const [following, setFollowing] = useState([]);
    const [followers, setFollowers] = useState([]);
    const [loadingConnections, setLoadingConnections] = useState(true);
    const [followingError, setFollowingError] = useState(null);
    const [followersError, setFollowersError] = useState(null);
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState(null);
    const [activeTab, setActiveTab] = useState("following");
    const [search, setSearch] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedItinerary, setSelectedItinerary] = useState(null);
    const [searchOpen, setSearchOpen] = useState(false);
    const [followActionUserId, setFollowActionUserId] = useState(null);

    const searchRef = useRef(null);
    const inputRef = useRef(null);
    const searchRequestRef = useRef(0);

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

    const fetchConnections = async () => {
        if (!loggedInUser?.userId) return;

        setLoadingConnections(true);
        setFollowingError(null);
        setFollowersError(null);

        const [followingResult, followersResult] = await Promise.all([
            getFollowingService({ userId: loggedInUser.userId }),
            getFollowersService({ userId: loggedInUser.userId }),
        ]);

        if (followingResult.success) {
            setFollowing(followingResult.data);
        } else {
            setFollowing([]);
            setFollowingError(followingResult.message);
        }

        if (followersResult.success) {
            setFollowers(followersResult.data);
        } else {
            setFollowers([]);
            setFollowersError(followersResult.message);
        }

        setLoadingConnections(false);
    };

    useEffect(() => {
        fetchConnections();
    }, []);

    useEffect(() => {
        if (search.trim() === "") {
            setSearchResults([]);
            setSearchError(null);
            setSearchOpen(false);
            setSearchLoading(false);
            return;
        }

        const requestId = ++searchRequestRef.current;

        setSearchLoading(true);
        setSearchError(null);

        const delay = setTimeout(async () => {
            const result = await searchUsersService({
                query: search,
            });

            if (requestId !== searchRequestRef.current) {
                return;
            }

            if (result.success) {
                const filtered = result.data.filter(
                    u => u.userId !== loggedInUser?.userId,
                );

                setSearchResults(filtered);
                setSearchError(null);
                setSearchOpen(true);
            } else {
                setSearchResults([]);
                setSearchError(result.message);
                setSearchOpen(true);
            }

            setSearchLoading(false);
        }, 300);

        return () => clearTimeout(delay);
    }, [search]);

    const isFollowing = userId => following.some(u => u.userId === userId);

    const isFollower = userId => followers.some(u => u.userId === userId);

    const isFriend = userId => isFollowing(userId) && isFollower(userId);

    const toggleFollow = async user => {
        if (followActionUserId === user.userId) return;

        setFollowActionUserId(user.userId);

        try {
            let result;

            if (isFollowing(user.userId)) {
                result = await unfollowUserService({
                    followerId: loggedInUser.userId,
                    followingId: user.userId,
                });

                if (result.success) {
                    setFollowing(prev => prev.filter(u => u.userId !== user.userId));
                } else {
                    toast.error(result.message);
                }
            } else {
                result = await followUserService({
                    followerId: loggedInUser.userId,
                    followingId: user.userId,
                });

                if (result.success) {
                    setFollowing(prev => [...prev, user]);
                } else {
                    toast.error(result.message);
                }
            }
        } finally {
            setFollowActionUserId(null);
        }
    };

    const retrySearch = async () => {
        if (!search.trim()) return;

        const requestId = ++searchRequestRef.current;

        setSearchError(null);
        setSearchLoading(true);

        try {
            const result = await searchUsersService({
                query: search,
            });

            if (requestId !== searchRequestRef.current) {
                return;
            }

            if (result.success) {
                const filtered = result.data.filter(
                    u => u.userId !== loggedInUser?.userId,
                );

                setSearchResults(filtered);
                setSearchError(null);
                setSearchOpen(true);
            } else {
                setSearchResults([]);
                setSearchError(result.message);
                setSearchOpen(true);
            }
        } finally {
            if (requestId === searchRequestRef.current) {
                setSearchLoading(false);
            }
        }
    };

    const clearSearch = () => {
        setSearch("");
        setSearchResults([]);
        setSearchError(null);
        setSearchOpen(false);
        inputRef.current?.focus();
    };

    const handleSelectSearchUser = user => {
        setSelectedUser(user);
        clearSearch();
    };

    const currentList = activeTab === "following" ? following : followers;

    const currentError = activeTab === "following" ? followingError : followersError;

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
                        aria-label="Search travelers"
                    />

                    {searchLoading && (
                        <Loader2
                            size={14}
                            className="text-gray-400 flex-shrink-0 animate-spin"
                            aria-label="Searching"
                        />
                    )}

                    {!searchLoading && search && (
                        <button
                            type="button"
                            onClick={clearSearch}
                            className="text-gray-300 hover:text-gray-500 transition-colors cursor-pointer"
                            aria-label="Clear search">
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* Search Results Dropdown */}
                {searchOpen && (
                    <div className="absolute w-full bg-white border border-gray-100 rounded-xl shadow-xl mt-2 max-h-64 overflow-y-auto z-50 py-1">
                        {searchError ? (
                            <ErrorState
                                title="Unable to search users"
                                message={searchError}
                                onRetry={retrySearch}
                                retryLabel="Try again"
                                compact
                            />
                        ) : searchResults.length === 0 ? (
                            <div
                                role="status"
                                className="flex flex-col items-center justify-center py-8 px-4 text-center">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                    <Users
                                        size={18}
                                        className="text-gray-300"
                                        aria-hidden="true"
                                    />
                                </div>

                                <p className="text-sm font-medium text-gray-600 mt-3">
                                    No users found
                                </p>

                                <p className="text-xs text-gray-400 mt-1">
                                    Try searching with a different username.
                                </p>
                            </div>
                        ) : (
                            searchResults.map(user => {
                                const followed = isFollowing(user.userId);
                                const friend = isFriend(user.userId);
                                const followLoading = followActionUserId === user.userId;

                                return (
                                    <div
                                        key={user.userId}
                                        className="flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 transition-colors">
                                        <button
                                            type="button"
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

                                        <div className="ml-3 flex items-center gap-2 flex-shrink-0">
                                            {friend && followed && (
                                                <span className="inline-flex items-center px-2 py-1 text-[10px] font-semibold text-gray-500 bg-green-100 rounded-full">
                                                    Friend
                                                </span>
                                            )}

                                            <button
                                                type="button"
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    toggleFollow(user);
                                                }}
                                                disabled={followLoading}
                                                className={`flex items-center justify-center gap-1.5 min-w-[86px] px-3 py-1 text-xs font-medium rounded-full transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-60
            ${
                followed
                    ? "bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500"
                    : "bg-gray-900 text-white hover:bg-gray-700"
            }`}>
                                                {followLoading ? (
                                                    <>
                                                        <Loader2
                                                            size={11}
                                                            className="animate-spin"
                                                        />
                                                        {followed
                                                            ? "Unfollowing…"
                                                            : "Following…"}
                                                    </>
                                                ) : followed ? (
                                                    <>
                                                        <UserMinus size={11} />
                                                        Unfollow
                                                    </>
                                                ) : (
                                                    <>
                                                        <UserPlus size={11} />
                                                        Follow
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </div>

            {/* Tabs */}
            {/* Tabs */}
            <div className="mb-5 flex items-center gap-1 border-b border-gray-200">
                <button
                    type="button"
                    onClick={() => setActiveTab("following")}
                    className={`relative px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                        activeTab === "following"
                            ? "text-gray-900"
                            : "text-gray-400 hover:text-gray-600"
                    }`}>
                    Following
                    <span
                        className={`ml-1.5 text-xs ${
                            activeTab === "following" ? "text-gray-500" : "text-gray-300"
                        }`}>
                        {following.length}
                    </span>
                    {activeTab === "following" && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-full" />
                    )}
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab("followers")}
                    className={`relative px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                        activeTab === "followers"
                            ? "text-gray-900"
                            : "text-gray-400 hover:text-gray-600"
                    }`}>
                    Followers
                    <span
                        className={`ml-1.5 text-xs ${
                            activeTab === "followers" ? "text-gray-500" : "text-gray-300"
                        }`}>
                        {followers.length}
                    </span>
                    {activeTab === "followers" && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-full" />
                    )}
                </button>
            </div>

            {loadingConnections ? (
                <div
                    aria-busy="true"
                    aria-label="Loading connections"
                    className="space-y-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div
                            key={i}
                            className="flex items-center justify-between px-4 py-3 bg-white border border-gray-100 rounded-xl">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <Skeleton className="w-11 h-11 rounded-full flex-shrink-0" />

                                <div className="min-w-0 space-y-1.5 flex-1">
                                    <Skeleton className="h-3.5 w-32" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                            </div>

                            <Skeleton className="h-7 w-24 rounded-full flex-shrink-0" />
                        </div>
                    ))}
                </div>
            ) : currentError ? (
                <ErrorState
                    title={
                        activeTab === "following"
                            ? "Unable to load following"
                            : "Unable to load followers"
                    }
                    message={currentError}
                    onRetry={fetchConnections}
                />
            ) : currentList.length === 0 ? (
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
                    {currentList.map(user => {
                        const followingUser = isFollowing(user.userId);
                        const friend = isFriend(user.userId);
                        const followLoading = followActionUserId === user.userId;

                        return (
                            <div
                                key={user.userId}
                                className="flex items-center justify-between px-4 py-3 bg-white border border-gray-100 rounded-xl hover:border-gray-200 hover:shadow-sm transition-all">
                                {/* User info */}

                                <button
                                    type="button"
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
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {friend && (
                                            <span className="inline-flex items-center px-2 py-1 text-[10px] font-semibold text-gray-500 bg-green-100 rounded-full">
                                                Friend
                                            </span>
                                        )}

                                        <button
                                            type="button"
                                            onClick={e => {
                                                e.stopPropagation();
                                                toggleFollow(user);
                                            }}
                                            disabled={followLoading}
                                            className="flex items-center justify-center gap-1.5 min-w-[82px] px-3 py-1.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer flex-shrink-0 disabled:cursor-not-allowed disabled:opacity-60">
                                            {followLoading ? (
                                                <>
                                                    <Loader2
                                                        size={12}
                                                        className="animate-spin"
                                                    />
                                                    Unfollowing…
                                                </>
                                            ) : (
                                                <>
                                                    <UserMinus size={12} />
                                                    Unfollow
                                                </>
                                            )}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {friend && followingUser && (
                                            <span className="inline-flex items-center px-2 py-1 text-[10px] font-semibold text-gray-500 bg-gray-100 rounded-full">
                                                Friend
                                            </span>
                                        )}

                                        <button
                                            type="button"
                                            onClick={e => {
                                                e.stopPropagation();
                                                toggleFollow(user);
                                            }}
                                            disabled={followLoading}
                                            className={`flex items-center justify-center gap-1.5 min-w-[92px] px-3 py-1.5 text-xs font-medium rounded-full transition-colors cursor-pointer flex-shrink-0 disabled:cursor-not-allowed disabled:opacity-60
            ${
                followingUser
                    ? "bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500"
                    : "bg-gray-900 text-white hover:bg-gray-700"
            }`}>
                                            {followLoading ? (
                                                <>
                                                    <Loader2
                                                        size={12}
                                                        className="animate-spin"
                                                    />
                                                    {followingUser
                                                        ? "Unfollowing…"
                                                        : "Following…"}
                                                </>
                                            ) : followingUser ? (
                                                <>
                                                    <UserMinus size={12} />
                                                    Unfollow
                                                </>
                                            ) : (
                                                <>
                                                    <UserPlus size={12} />
                                                    Follow Back
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
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
