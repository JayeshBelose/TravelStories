import { Shield, Trash, User } from "lucide-react";
import { memo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

function UserTableRow({
    user,
    setSelectedUser,
    confirmDelete,
    deletingUserId,
}) {
    return (
        <tr
            key={user.userId}
            className="border-b border-gray-50 hover:bg-gray-50/70 transition-colors"
        >
            {/* User */}
            <td className="px-5 py-3">
                <button
                    onClick={() => setSelectedUser(user)}
                    className="flex items-center gap-3 cursor-pointer text-left"
                >
                    <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarImage
                            src={`${import.meta.env.VITE_API_BASE_URL}/users/${user.userId}/profilePicture`}
                            alt={user.username}
                        />
                        <AvatarFallback className="bg-gray-100 text-gray-600 text-xs font-semibold">
                            {user.username?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                    </Avatar>
                    <span
                        className="text-sm font-medium text-gray-900 hover:underline underline-offset-2"
                        scope="row"
                    >
                        {user.username}
                    </span>
                </button>
            </td>

            {/* Email */}
            <td className="px-4 py-3 text-sm text-gray-500" scope="row">
                {user.email}
            </td>

            {/* Role */}
            <td className="px-4 py-3" scope="row">
                <span
                    className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full
                                        ${
                                            user.role === "admin" ||
                                            user.role === "ADMIN"
                                                ? "bg-purple-50 text-purple-600 border border-purple-200"
                                                : "bg-gray-100 text-gray-500 border border-gray-200"
                                        }`}
                >
                    {user.role === "admin" || user.role === "ADMIN" ? (
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
            <td className="px-4 py-3 text-sm text-gray-400" scope="row">
                {new Date(user.createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                })}
            </td>

            {/* Followers */}
            <td
                className="px-4 py-3 text-sm text-gray-600 text-center"
                scope="row"
            >
                {user.followersCount}
            </td>

            {/* Following */}
            <td
                className="px-4 py-3 text-sm text-gray-600 text-center"
                scope="row"
            >
                {user.followingCount}
            </td>

            {/* Actions */}
            <td className="px-4 py-3 text-right" scope="row">
                {user.role !== "ADMIN" && user.role !== "admin" && (
                    <button
                        onClick={() => confirmDelete(user.userId)}
                        disabled={deletingUserId === user.userId}
                        className="w-7 h-7 rounded-full inline-flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        aria-label={`Delete user ${user.username}`}
                    >
                        <Trash size={14} />
                    </button>
                )}
            </td>
        </tr>
    );
}

export default memo(UserTableRow);
