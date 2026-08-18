import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    ShieldCheck,
    Loader2,
} from "lucide-react";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema } from "../../schemas/authSchemas";
import { resetPasswordService } from "@/services/authService";

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");

    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(resetPasswordSchema),
        mode: "onChange",
        defaultValues: {
            newPassword: "",
            confirmPassword: "",
        },
    });

    const handlePasswordReset = async (data) => {
        try {
            const result = await resetPasswordService({
                token,
                newPassword: data.newPassword,
            });

            if (result.success) {
                toast.success(result.message);

                setTimeout(() => navigate("/login"), 1500);
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error("Password reset failed:", error);
            toast.error("Unable to reset your password. Please try again.");
        }
    };

    const inputBase =
        "w-full border rounded-xl pl-10 pr-10 py-2.5 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none transition-colors";
    const inputIdle = "border-gray-200 focus:border-gray-400";
    const inputError = "border-red-300 focus:border-red-400 bg-red-50/30";

    const newPasswordError = Boolean(errors.newPassword);
    const confirmPasswordError = Boolean(errors.confirmPassword);

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

                    <p className="text-sm text-gray-400">
                        Enter your new password below
                    </p>
                </div>

                {/* Card */}
                <form
                    onSubmit={handleSubmit(handlePasswordReset)}
                    className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8 space-y-4"
                >
                    {/* New Password */}
                    <div>
                        <label
                            htmlFor="reset-new-password"
                            className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-widest"
                        >
                            New Password
                        </label>

                        <div className="relative">
                            <Lock
                                size={14}
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"
                            />

                            <input
                                id="reset-new-password"
                                type={showNew ? "text" : "password"}
                                placeholder="12–16 characters"
                                {...register("newPassword")}
                                disabled={isSubmitting}
                                aria-invalid={
                                    newPasswordError ? "true" : "false"
                                }
                                aria-describedby={
                                    newPasswordError
                                        ? "reset-new-password-error"
                                        : undefined
                                }
                                autoComplete="new-password"
                                className={`${inputBase} ${
                                    newPasswordError ? inputError : inputIdle
                                } disabled:bg-gray-50 disabled:text-gray-400`}
                            />

                            <button
                                type="button"
                                onClick={() => setShowNew((value) => !value)}
                                disabled={isSubmitting}
                                aria-label={
                                    showNew
                                        ? "Hide new password"
                                        : "Show new password"
                                }
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {showNew ? (
                                    <EyeOff size={15} />
                                ) : (
                                    <Eye size={15} />
                                )}
                            </button>
                        </div>

                        {errors.newPassword && (
                            <p
                                id="reset-new-password-error"
                                className="text-xs text-red-400 mt-1"
                            >
                                {errors.newPassword.message}
                            </p>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label
                            htmlFor="reset-confirm-password"
                            className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-widest"
                        >
                            Confirm Password
                        </label>

                        <div className="relative">
                            <Lock
                                size={14}
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"
                            />

                            <input
                                id="reset-confirm-password"
                                type={showConfirm ? "text" : "password"}
                                placeholder="Repeat your password"
                                {...register("confirmPassword")}
                                disabled={isSubmitting}
                                aria-invalid={
                                    confirmPasswordError ? "true" : "false"
                                }
                                aria-describedby={
                                    confirmPasswordError
                                        ? "reset-confirm-password-error"
                                        : undefined
                                }
                                autoComplete="new-password"
                                className={`${inputBase} ${
                                    confirmPasswordError
                                        ? inputError
                                        : inputIdle
                                } disabled:bg-gray-50 disabled:text-gray-400`}
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowConfirm((value) => !value)
                                }
                                disabled={isSubmitting}
                                aria-label={
                                    showConfirm
                                        ? "Hide confirm password"
                                        : "Show confirm password"
                                }
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {showConfirm ? (
                                    <EyeOff size={15} />
                                ) : (
                                    <Eye size={15} />
                                )}
                            </button>
                        </div>

                        {errors.confirmPassword && (
                            <p
                                id="reset-confirm-password-error"
                                className="text-xs text-red-400 mt-1"
                            >
                                {errors.confirmPassword.message}
                            </p>
                        )}
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        aria-busy={isSubmitting}
                        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors mt-2
                            ${
                                !isSubmitting
                                    ? "bg-gray-900 hover:bg-gray-700 text-white cursor-pointer"
                                    : "bg-gray-100 text-gray-300 cursor-not-allowed"
                            }`}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2
                                    size={14}
                                    className="animate-spin"
                                    aria-hidden="true"
                                />
                                Updating…
                            </>
                        ) : (
                            <>
                                Update password
                                <ArrowRight size={14} aria-hidden="true" />
                            </>
                        )}
                    </button>
                </form>

                {/* Back to login */}
                <p className="text-center text-sm text-gray-400 mt-6">
                    Remember your password?{" "}
                    <button
                        type="button"
                        onClick={() => navigate("/login")}
                        disabled={isSubmitting}
                        className="text-gray-700 font-medium hover:underline underline-offset-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Sign in
                    </button>
                </p>
            </div>
        </div>
    );
}
