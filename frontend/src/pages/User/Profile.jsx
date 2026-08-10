import { useEffect, useState } from "react";
import { Camera, Save, Trash, X, AlertTriangle, Check } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
    deleteUserAccountService,
    updateUserProfileService,
    uploadProfilePictureService,
} from "@/services/userService";

export default function Profile() {
    const { logout } = useAuth();
    const user = JSON.parse(sessionStorage.getItem("user"));
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [bio, setBio] = useState("");
    const [profileImage, setProfileImage] = useState(null);
    const [previewPicture, setPreviewPicture] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    useEffect(() => {
        if (user) {
            setUsername(user.username || "");
            setBio(user.bio || "");
        }
    }, []);

    const handleImageChange = e => {
        const file = e.target.files[0];
        if (!file) return;
        setProfileImage(file);
        setPreviewPicture(URL.createObjectURL(file));
    };

    const handleImageUpload = async () => {
        if (!profileImage) return;

        setUploadingImage(true);

        const formData = new FormData();
        formData.append("file", profileImage);

        const result = await uploadProfilePictureService({
            userId: user.userId,
            formData,
        });

        if (result.success) {
            toast.success("Profile picture updated!");
            setProfileImage(null);
        } else {
            toast.error(result.message);
        }

        setUploadingImage(false);
    };

    const handleSave = async () => {
        setSavingProfile(true);

        const result = await updateUserProfileService({
            userId: user.userId,
            username,
            bio,
        });

        if (result.success) {
            sessionStorage.setItem(
                "user",
                JSON.stringify({
                    ...user,
                    username,
                    bio,
                }),
            );

            toast.success("Profile updated!");
        } else {
            toast.error(result.message);
        }

        setSavingProfile(false);
    };

    const handleDelete = async () => {
        const loadingToast = toast.loading("Deleting account...");

        const result = await deleteUserAccountService({
            userId: user.userId,
        });

        if (result.success) {
            toast.update(loadingToast, {
                render: "Account deleted successfully",
                type: "success",
                isLoading: false,
                autoClose: 2000,
            });

            logout();
            sessionStorage.removeItem("user");
            navigate("/");
        } else {
            toast.update(loadingToast, {
                render: result.message,
                type: "error",
                isLoading: false,
                autoClose: 3000,
            });
        }

        setConfirmOpen(false);
    };

    const avatarSrc =
        previewPicture ||
        `${import.meta.env.VITE_API_BASE_URL}/users/${user.userId}/profilePicture`;

    return (
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-primary text-gray-900 tracking-tight mb-1">
                    Profile Settings
                </h1>
                <p className="text-sm text-gray-400">Manage your account information</p>
            </div>

            <div className="space-y-4">
                {/* Avatar Card */}
                <div className="bg-white border border-gray-100 rounded-2xl p-6">
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
                        Profile Picture
                    </p>
                    <div className="flex items-center gap-5">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                            <Avatar className="w-20 h-20 ring-2 ring-gray-100">
                                <AvatarImage src={avatarSrc} alt={username} />
                                <AvatarFallback className="bg-gray-900 text-white text-xl font-semibold">
                                    {username?.[0]?.toUpperCase() || "U"}
                                </AvatarFallback>
                            </Avatar>
                            {/* Camera overlay trigger */}
                            <label className="absolute inset-0 rounded-full flex items-center justify-center bg-black/0 hover:bg-black/30 transition-colors cursor-pointer group">
                                <Camera
                                    size={18}
                                    className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                />
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                                {username}
                            </p>
                            <label className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 cursor-pointer mt-1 transition-colors">
                                <Camera size={12} />
                                Change photo
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>

                            {/* Preview & upload */}
                            {profileImage && (
                                <div className="flex items-center gap-2 mt-3">
                                    <span className="text-xs text-gray-500 truncate max-w-[160px]">
                                        {profileImage.name}
                                    </span>
                                    <button
                                        onClick={handleImageUpload}
                                        disabled={uploadingImage}
                                        className="flex items-center gap-1.5 text-xs font-medium bg-gray-900 hover:bg-gray-700 text-white px-3 py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50">
                                        <Check size={11} />
                                        {uploadingImage ? "Uploading…" : "Upload"}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setProfileImage(null);
                                            setPreviewPicture(null);
                                        }}
                                        className="text-gray-300 hover:text-gray-500 transition-colors cursor-pointer">
                                        <X size={14} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Info Card */}
                <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5">
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                        Account Details
                    </p>

                    {/* Username */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Username
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-gray-400 transition-colors"
                        />
                    </div>

                    {/* Bio */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Bio
                        </label>
                        <textarea
                            rows={4}
                            placeholder="Tell us about yourself…"
                            value={bio}
                            onChange={e => setBio(e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-gray-400 transition-colors resize-none"
                        />
                        <p className="text-xs text-gray-300 mt-1 text-right">
                            {bio.length} / 300
                        </p>
                    </div>

                    {/* Save */}
                    <div className="flex justify-end pt-1">
                        <button
                            onClick={handleSave}
                            disabled={savingProfile}
                            className="flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors cursor-pointer disabled:opacity-50">
                            <Save size={14} />
                            {savingProfile ? "Saving…" : "Save Changes"}
                        </button>
                    </div>
                </div>

                {/* Danger Zone Card */}
                <div className="bg-white border border-red-100 rounded-2xl p-6">
                    <div className="flex items-start gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <AlertTriangle size={14} className="text-red-500" />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-red-600 mb-0.5">
                                Danger Zone
                            </h2>
                            <p className="text-xs text-gray-400 leading-relaxed">
                                Once you delete your account, all your data will be
                                permanently removed. This cannot be undone.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setConfirmOpen(true)}
                        className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-500 border border-red-200 text-sm font-medium px-4 py-2 rounded-xl transition-colors cursor-pointer">
                        <Trash size={13} />
                        Delete Account
                    </button>
                </div>
            </div>

            {/* Confirm Delete Dialog */}
            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent className="bg-white rounded-2xl border border-gray-100 shadow-xl max-w-sm">
                    <DialogHeader>
                        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mb-3">
                            <AlertTriangle size={18} className="text-red-500" />
                        </div>
                        <DialogTitle className="text-base font-semibold text-gray-900">
                            Delete your account?
                        </DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-gray-400 mt-1">
                        This action is permanent and cannot be undone. All your
                        itineraries, saves, and followers will be lost.
                    </p>
                    <DialogFooter className="mt-5 flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setConfirmOpen(false)}
                            className="flex-1 rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50 text-sm">
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            className="flex-1 rounded-xl bg-red-500 hover:bg-red-600 text-sm">
                            Yes, Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
