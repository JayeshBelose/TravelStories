import { useState } from "react";
import { Camera, Save, Trash2, User } from "lucide-react";

export default function Profile() {
    const [username, setUsername] = useState("Demouser");
    const [bio, setBio] = useState("");
    const [profileImage, setProfileImage] = useState(null);

    const handleImageChange = e => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(URL.createObjectURL(file));
        }
    };

    const handleSave = () => {
        console.log("Saved:", { username, bio });
    };

    const handleDelete = () => {
        console.log("Account Deleted");
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
                            {profileImage ? (
                                <img
                                    src={profileImage}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <User size={40} className="text-gray-500" />
                            )}
                        </div>

                        <div>
                            <p className="font-medium mb-2">Profile Picture</p>
                            <label className="flex items-center gap-2 text-primary cursor-pointer hover:underline">
                                <Camera size={18} />
                                <span>Choose file</span>
                                <input
                                    type="file"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    </div>

                    {/* Username */}
                    <div className="mb-8">
                        <label className="block mb-2 font-medium">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    {/* Bio */}
                    <div className="mb-10">
                        <label className="block mb-2 font-medium">Bio</label>
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
