import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "@/api/axiosConfig";
import { Search, Trash } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import ItineraryOverlay from "@/components/ItineraryOverlay";
import UserItineraryListOverlay from "@/components/UserItineraryListOverlay";

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");

    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedItinerary, setSelectedItinerary] = useState(null);

    const confirmDelete = userId => {
        toast(
            ({ closeToast }) => (
                <div>
                    <p className="mb-2">
                        Are you sure you want to delete this user? This action cannot be
                        undone.
                    </p>

                    <div className="flex gap-2">
                        <button
                            className="bg-red-500 text-white px-3 py-1 rounded"
                            onClick={() => {
                                handleDelete(userId);
                                closeToast();
                            }}>
                            Delete
                        </button>

                        <button
                            className="bg-gray-300 px-3 py-1 rounded"
                            onClick={closeToast}>
                            Cancel
                        </button>
                    </div>
                </div>
            ),
            { autoClose: false },
        );
    };

    // Fetch all users
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get("/admin/users");
            setUsers(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async id => {
        try {
            await api.delete(`/admin/users/${id}`);
            setUsers(prev => prev.filter(u => u.id !== id));
            toast.success("User deleted successfully.");
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete user.");
        }
    };

    const filteredUsers = users.filter(
        u =>
            u.username.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase()),
    );

    return (
        <div>
            <h1 className="text-4xl font-bold mb-2 text-primary font-primary">
                User Management
            </h1>
            <p className="text-gray-500 pb-6">Manage platform users</p>

            {/* Search */}
            <div className="bg-card rounded-2xl shadow-md p-4 mb-6 flex items-center gap-3">
                <Search size={18} className="text-primary" />
                <input
                    type="text"
                    placeholder="Search by username or email..."
                    className="w-full bg-transparent outline-none text-primary"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <table className="w-full text-sm">
                    {/* Column Names */}
                    <thead className="text-white items-center bg-primary font-primary">
                        <tr>
                            <th className="p-4">User</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Joined On</th>
                            <th>Followers</th>
                            <th>Following</th>
                            <th className="text-right pr-6">Actions</th>
                        </tr>
                    </thead>

                    {/* Table Data */}
                    <tbody className="text-center items-center">
                        {filteredUsers.map(user => (
                            <tr
                                key={user.userId}
                                className="border-b border-primary/20 hover:bg-secondary/10">
                                <td className="p-4 flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage
                                            src={`${import.meta.env.VITE_API_BASE_URL}/users/${user.userId}/profilePicture`}
                                            alt={user?.username}
                                        />
                                        <AvatarFallback>
                                            {user?.username?.[0]?.toUpperCase() || "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span
                                        onClick={() => setSelectedUser(user)}
                                        className="text-primary font-medium cursor-pointer">
                                        {user.username}
                                    </span>
                                </td>

                                <td className="text-primary">{user.email}</td>

                                <td>
                                    <span
                                        className={`px-2 py-1 text-xs rounded-full ${
                                            user.role === "admin"
                                                ? "bg-primary/10 text-primary"
                                                : "bg-secondary/20 text-secondary"
                                        }`}>
                                        {user.role.toLowerCase()}
                                    </span>
                                </td>

                                <td className="text-primary">
                                    {new Date(user.createdAt).toLocaleDateString(
                                        "en-GB",
                                        {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                        },
                                    )}
                                </td>

                                <td className="text-primary">{user.followersCount}</td>
                                <td className="text-primary">{user.followingCount}</td>

                                <td className="text-right pr-6">
                                    {user.role !== "ADMIN" && (
                                        <button
                                            onClick={e => {
                                                confirmDelete(user.userId);
                                            }}
                                            className="text-red-500 rounded-full p-2 hover:scale-110 hover:bg-white hover:shadow-md">
                                            <Trash size={18} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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
