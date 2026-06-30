import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "@/api/axios";
import { Search, Trash, X, ChevronLeft, ChevronRight, Shield, User } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import ItineraryOverlay from "@/components/itinerary/ItineraryOverlay";
import UserItineraryListOverlay from "@/components/itinerary/UserItineraryListOverlay";

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
        try {
            const res = await api.get("/admin/users", {
                params: { page, size: 10, search: debouncedSearch },
            });
            setUsers(res.data.content);
            setTotalPages(res.data.totalPages);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async id => {
        try {
            await api.delete(`/admin/users/${id}`);
            setUsers(prev => prev.filter(u => u.userId !== id));
            toast.success("User deleted successfully.");
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete user.");
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
            <div className="flex items-center gap-2.5 bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 shadow-sm focus-within:border-gray-400 transition-colors mb-5 max-w-md">
                <Search size={15} className="text-gray-400 flex-shrink-0" />
                <input
                    type="text"
                    placeholder="Search by username or email…"
                    className="w-full bg-transparent outline-none text-sm text-gray-700 placeholder:text-gray-300"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                {search && (
                    <button
                        onClick={() => setSearch("")}
                        className="text-gray-300 hover:text-gray-500 cursor-pointer">
                        <X size={14} />
                    </button>
                )}
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-sm">
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
                    <tbody>
                        {users.map(user => (
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
                                                {user.username?.[0]?.toUpperCase() || "U"}
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
                                    {user.role !== "ADMIN" && user.role !== "admin" && (
                                        <button
                                            onClick={() => confirmDelete(user.userId)}
                                            className="w-7 h-7 rounded-full inline-flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer">
                                            <Trash size={14} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {users.length === 0 && (
                    <div className="py-16 text-center text-sm text-gray-400">
                        No users found.
                    </div>
                )}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-3 mt-5">
                <button
                    disabled={page === 0}
                    onClick={() => setPage(p => p - 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer">
                    <ChevronLeft size={15} />
                </button>
                <span className="text-sm text-gray-500">
                    Page <span className="font-semibold text-gray-900">{page + 1}</span>{" "}
                    of {totalPages}
                </span>
                <button
                    disabled={page >= totalPages - 1}
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
