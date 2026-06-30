import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react";
import { toast } from "react-toastify";
import api from "@/api/axios";

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

    const isPasswordValid = newPassword.length >= 8 && newPassword.length <= 12;
    const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;
    const isFormValid = isPasswordValid && passwordsMatch;

    const passwordHint = newPassword.length > 0 && !isPasswordValid;
    const mismatchHint = confirmPassword.length > 0 && !passwordsMatch;

    const handleSubmit = async e => {
        e.preventDefault();
        if (!isFormValid) return;

        setLoading(true);
        try {
            await api.post("/auth/resetPassword", null, {
                params: { token, newPassword },
            });
            toast.success("Password updated successfully!");
            setTimeout(() => navigate("/login"), 1500);
        } catch (err) {
            toast.error("Invalid or expired reset link. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const inputBase =
        "w-full border rounded-xl pl-10 pr-10 py-2.5 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none transition-colors";
    const inputIdle = "border-gray-200 focus:border-gray-400";
    const inputError = "border-red-300 focus:border-red-400 bg-red-50/30";

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-sm">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-gray-900 flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck size={22} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 font-primary tracking-tight mb-1">
                        Reset password
                    </h1>
                    <p className="text-sm text-gray-400">Enter your new password below</p>
                </div>

                {/* Card */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8 space-y-4">
                    {/* New Password */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-widest">
                            New Password
                        </label>
                        <div className="relative">
                            <Lock
                                size={14}
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"
                            />
                            <input
                                type={showNew ? "text" : "password"}
                                placeholder="8–12 characters"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                className={`${inputBase} ${passwordHint ? inputError : inputIdle}`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowNew(v => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors cursor-pointer">
                                {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                        {passwordHint && (
                            <p className="text-xs text-red-400 mt-1">
                                Password must be 8–12 characters
                            </p>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-widest">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <Lock
                                size={14}
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"
                            />
                            <input
                                type={showConfirm ? "text" : "password"}
                                placeholder="Repeat your password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                className={`${inputBase} ${mismatchHint ? inputError : inputIdle}`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(v => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors cursor-pointer">
                                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                        {mismatchHint && (
                            <p className="text-xs text-red-400 mt-1">
                                Passwords do not match
                            </p>
                        )}
                    </div>

                    {/* Submit */}
                    <button
                        onClick={handleSubmit}
                        disabled={!isFormValid || loading}
                        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors mt-2
                            ${
                                isFormValid && !loading
                                    ? "bg-gray-900 hover:bg-gray-700 text-white cursor-pointer"
                                    : "bg-gray-100 text-gray-300 cursor-not-allowed"
                            }`}>
                        {loading ? "Updating…" : "Update password"}
                        {!loading && <ArrowRight size={14} />}
                    </button>
                </div>

                {/* Back to login */}
                <p className="text-center text-sm text-gray-400 mt-6">
                    Remember your password?{" "}
                    <button
                        onClick={() => navigate("/login")}
                        className="text-gray-700 font-medium hover:underline underline-offset-2 cursor-pointer">
                        Sign in
                    </button>
                </p>
            </div>
        </div>
    );
}
