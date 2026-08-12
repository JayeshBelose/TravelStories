import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Search, Trash, X, ChevronLeft, ChevronRight, Shield, User } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import ErrorState from "@/components/common/ErrorState";
import ItineraryOverlay from "@/components/itinerary/ItineraryOverlay";
import UserItineraryListOverlay from "@/components/itinerary/UserItineraryListOverlay";
import { deleteUserByAdminService, getAdminUsersService } from "@/services/adminService";

function ConfirmToast({ message, confirmLabel, onConfirm, onCancel }) {
    return (
        <div>
            <p className="text-sm text-gray-700 mb-3">{message}</p>
            <div className="flex gap-2">
                <button
                    onClick={onConfirm}
                    className="bg-red-500 hover:bg-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer">
                    {confirmLabel}
                </button>
                <button
                    onClick={onCancel}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer">
                    Cancel
                </button>
            </div>
        </div>
    );
}

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedItinerary, setSelectedItinerary] = useState(null);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [usersError, setUsersError] = useState(null);
    const [deletingUserId, setDeletingUserId] = useState(null);

    const confirmDelete = userId => {
        toast(
            ({ closeToast }) => (
                <ConfirmToast
                    message="Are you sure you want to delete this user? This action cannot be undone."
                    confirmLabel="Delete"
                    onConfirm={() => {
                        handleDelete(userId);
                        closeToast();
                    }}
                    onCancel={closeToast}
                />
            ),
            { autoClose: false },
        );
    };

    useEffect(() => {
        fetchUsers();
    }, [page, debouncedSearch]);

    const fetchUsers = async () => {
        setLoadingUsers(true);
        setUsersError(null);

        try {
            const result = await getAdminUsersService({
                page,
                size: 10,
                search: debouncedSearch,
            });

            if (!result.success) {
                console.error("Failed to load admin users:", result.message);

                setUsersError(
                    result.message || "We couldn't load the users. Please try again.",
                );

                setUsers([]);
                setTotalPages(0);
                return;
            }

            setUsers(result.data.content);
            setTotalPages(result.data.totalPages);
        } catch (error) {
            console.error("Failed to load admin users:", error);

            setUsersError(
                error.message || "We couldn't load the users. Please try again.",
            );

            setUsers([]);
            setTotalPages(0);
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleUsersRetry = () => {
        fetchUsers();
    };

    const handleDelete = async userId => {
        setDeletingUserId(userId);

        try {
            const result = await deleteUserByAdminService({
                userId,
            });

            if (result.success) {
                setUsers(prev => prev.filter(user => user.userId !== userId));

                toast.success("User deleted successfully.");
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error("Failed to delete user:", error);
            toast.error("Unable to delete user. Please try again.");
        } finally {
            setDeletingUserId(null);
        }
    };

    useEffect(() => {
        const delay = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(0);
        }, 400);
        return () => clearTimeout(delay);
    }, [search]);

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 font-primary tracking-tight mb-1">
                    User Management
                </h1>
                <p className="text-sm text-gray-400">Manage all platform users</p>
            </div>

            {/* Search */}
            <div className="w-full sm:max-w-md flex items-center gap-2.5 bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 shadow-sm focus-within:border-gray-400 transition-colors mb-5">
                <Search size={15} className="text-gray-400 flex-shrink-0" />
                <input
                    type="text"
                    aria-label="Search users by username or email"
                    placeholder="Search by username or email…"
                    className="w-full bg-transparent outline-none text-sm text-gray-700 placeholder:text-gray-300"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                {search && (
                    <button
                        type="button"
                        onClick={() => setSearch("")}
                        aria-label="Clear user search"
                        className="text-gray-300 hover:text-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 rounded cursor-pointer">
                        <X size={14} aria-hidden="true" />
                    </button>
                )}
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 text-left">
                                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                                    User
                                </th>
                                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                                    Email
                                </th>
                                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                                    Role
                                </th>
                                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                                    Joined
                                </th>
                                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-gray-400 text-center">
                                    Followers
                                </th>
                                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-gray-400 text-center">
                                    Following
                                </th>
                                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-gray-400 text-right">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody aria-busy={loadingUsers} aria-label="Loading users">
                            {loadingUsers &&
                                Array.from({ length: 6 }).map((_, i) => (
                                    <tr key={i} className="border-b border-gray-50">
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-3">
                                                <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                                                <Skeleton className="h-3.5 w-24" />
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Skeleton className="h-3.5 w-36" />
                                        </td>
                                        <td className="px-4 py-3">
                                            <Skeleton className="h-5 w-16 rounded-full" />
                                        </td>
                                        <td className="px-4 py-3">
                                            <Skeleton className="h-3.5 w-20" />
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <Skeleton className="h-3.5 w-8 mx-auto" />
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <Skeleton className="h-3.5 w-8 mx-auto" />
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Skeleton className="h-7 w-7 rounded-full ml-auto" />
                                        </td>
                                    </tr>
                                ))}

                            {!loadingUsers && usersError && (
                                <tr>
                                    <td colSpan={7}>
                                        <ErrorState
                                            compact
                                            title="Unable to load users"
                                            message={usersError}
                                            onRetry={handleUsersRetry}
                                        />
                                    </td>
                                </tr>
                            )}

                            {!loadingUsers &&
                                !usersError &&
                                users.map(user => (
                                    <tr
                                        key={user.userId}
                                        className="border-b border-gray-50 hover:bg-gray-50/70 transition-colors">
                                        {/* User */}
                                        <td className="px-5 py-3">
                                            <button
                                                onClick={() => setSelectedUser(user)}
                                                className="flex items-center gap-3 cursor-pointer text-left">
                                                <Avatar className="w-8 h-8 flex-shrink-0">
                                                    <AvatarImage
                                                        src={`${import.meta.env.VITE_API_BASE_URL}/users/${user.userId}/profilePicture`}
                                                        alt={user.username}
                                                    />
                                                    <AvatarFallback className="bg-gray-100 text-gray-600 text-xs font-semibold">
                                                        {user.username?.[0]?.toUpperCase() ||
                                                            "U"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="text-sm font-medium text-gray-900 hover:underline underline-offset-2">
                                                    {user.username}
                                                </span>
                                            </button>
                                        </td>

                                        {/* Email */}
                                        <td className="px-4 py-3 text-sm text-gray-500">
                                            {user.email}
                                        </td>

                                        {/* Role */}
                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full
                                        ${
                                            user.role === "admin" || user.role === "ADMIN"
                                                ? "bg-purple-50 text-purple-600 border border-purple-200"
                                                : "bg-gray-100 text-gray-500 border border-gray-200"
                                        }`}>
                                                {user.role === "admin" ||
                                                user.role === "ADMIN" ? (
                                                    <>
                                                        <Shield size={9} /> Admin
                                                    </>
                                                ) : (
                                                    <>
                                                        <User size={9} /> User
                                                    </>
                                                )}
                                            </span>
                                        </td>

                                        {/* Joined */}
                                        <td className="px-4 py-3 text-sm text-gray-400">
                                            {new Date(user.createdAt).toLocaleDateString(
                                                "en-GB",
                                                {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric",
                                                },
                                            )}
                                        </td>

                                        {/* Followers */}
                                        <td className="px-4 py-3 text-sm text-gray-600 text-center">
                                            {user.followersCount}
                                        </td>

                                        {/* Following */}
                                        <td className="px-4 py-3 text-sm text-gray-600 text-center">
                                            {user.followingCount}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-4 py-3 text-right">
                                            {user.role !== "ADMIN" &&
                                                user.role !== "admin" && (
                                                    <button
                                                        onClick={() =>
                                                            confirmDelete(user.userId)
                                                        }
                                                        disabled={
                                                            deletingUserId === user.userId
                                                        }
                                                        className="w-7 h-7 rounded-full inline-flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                                        aria-label={`Delete user ${user.username}`}>
                                                        <Trash size={14} />
                                                    </button>
                                                )}
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>

                {!loadingUsers && !usersError && users.length === 0 && (
                    <div className="py-16 text-center text-sm text-gray-400">
                        No users found.
                    </div>
                )}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-3 mt-5">
                <button
                    aria-label="Go to previous page"
                    disabled={page === 0 || loadingUsers || !!usersError}
                    onClick={() => setPage(p => p - 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer">
                    <ChevronLeft size={15} />
                </button>
                <span className="text-sm text-gray-500">
                    Page <span className="font-semibold text-gray-900">{page + 1}</span>{" "}
                    of {totalPages}
                </span>
                <button
                    aria-label="Go to next page"
                    disabled={page >= totalPages - 1 || loadingUsers || !!usersError}
                    onClick={() => setPage(p => p + 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer">
                    <ChevronRight size={15} />
                </button>
            </div>

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
