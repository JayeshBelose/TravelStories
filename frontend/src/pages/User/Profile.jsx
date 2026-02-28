import { useEffect, useState } from "react";
import { Camera, Save, Trash2, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import api from "@/api/axiosConfig";

export default function Profile() {
    const { logout } = useAuth();
    const user = JSON.parse(localStorage.getItem("user"));

    const [username, setUsername] = useState("");
    const [bio, setBio] = useState("");
    const [profileImage, setProfileImage] = useState(null);
    const [previewPicture, setPreviewPicture] = useState(null);

    useEffect(() => {
        if (user) {
            setUsername(user.username || "");
            setBio(user.bio || "");
        }
    }, []);

    // Image change
    const handleImageChange = e => {
        const file = e.target.files[0];
        if (!file) return;

        setProfileImage(file);
        setPreviewPicture(URL.createObjectURL(file));
    };

    // Image Update
    const handleImageUpload = async () => {
        if (!profileImage) return;

        const formData = new FormData();
        formData.append("file", profileImage);

        try {
            await api.post(`/users/${user.userId}/profilePicture`, formData);
            alert("Profile picture updated!");
        } catch (error) {
            console.error(error);
            alert("Image upload failed");
        }
    };

    // Update User
    const handleSave = async () => {
        try {
            await api.put(`/users/${user.userId}`, {
                username,
                bio,
            });

            const updatedUser = {
                ...user,
                username,
                bio,
            };

            localStorage.setItem("user", JSON.stringify(updatedUser));

            alert("Profile updated!");
        } catch (error) {
            console.log(error);
            alert("Failed to update profile");
        }
    };

    // User Deletion
    const handleDelete = async () => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete your account?",
        );

        if (!confirmDelete) return;

        try {
            await api.delete(`/users/${user.userId}`);
            logout();
        } catch (error) {
            console.error(error);
            alert("Image upload failed");
        }
    };

    return (
        <div className="min-h-screen flex justify-center">
            <div className="w-full max-w-4xl">
                {/* Page Header */}
                <h1 className="text-4xl font-bold font-primary text-primary mb-3">
                    Profile Settings
                </h1>
                <p className="text-muted-foreground mb-10">
                    Manage your account information
                </p>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-lg p-10 border">
                    {/* Profile Picture */}
                    <div className="flex items-center gap-8 mb-10">
                        <div className="w-28 h-28 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                            <img
                                src={`${import.meta.env.VITE_API_BASE_URL}/users/${user.userId}/profilePicture`}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div>
                            <p className="font-medium text-2xl mb-2 font-primary">
                                Profile Picture
                            </p>
                            <label className="flex items-center gap-2 text-primary cursor-pointer hover:underline">
                                <Camera size={18} />
                                <span>Choose file</span>
                                <input
                                    type="file"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>

                            {profileImage && (
                                <button
                                    onClick={handleImageUpload}
                                    className="mt-3 bg-primary text-white px-4 py-2 rounded-full">
                                    Upload Image
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Username */}
                    <div className="mb-8">
                        <label className="block mb-2 text-2xl font-medium font-primary">
                            Username
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    {/* Bio */}
                    <div className="mb-10">
                        <label className="text-2xl block mb-2 font-medium font-primary">
                            Bio
                        </label>
                        <textarea
                            rows={5}
                            placeholder="Tell us about yourself..."
                            value={bio}
                            onChange={e => setBio(e.target.value)}
                            className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                        />
                    </div>

                    {/* Save Button */}
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full shadow-md hover:opacity-90 transition">
                        <Save size={18} />
                        Save Changes
                    </button>

                    {/* Divider */}
                    <div className="border-t my-12"></div>

                    {/* Danger Zone */}
                    <div>
                        <h2 className="text-2xl font-semibold text-red-600 mb-2">
                            Danger Zone
                        </h2>
                        <p className="text-muted-foreground mb-6">
                            Once you delete your account, there is no going back. Please
                            be certain.
                        </p>

                        <button
                            onClick={handleDelete}
                            className="flex items-center gap-2 bg-red-500 text-white px-6 py-3 rounded-full shadow-md hover:bg-red-600 transition">
                            <Trash2 size={18} />
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
