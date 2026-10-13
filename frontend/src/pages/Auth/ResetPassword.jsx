import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import {
    Eye,
    EyeOff,
    Mail,
    Lock,
    KeyRound,
    ArrowRight,
    Loader2,
} from "lucide-react";

import {
    forgotPasswordService,
    verifyResetOtpService,
    resetPasswordService,
} from "@/services/authService";

import {
    forgotPasswordSchema,
    resetPasswordSchema,
} from "@/schemas/authSchemas";
import { ui } from "@/styles/uiPrimitives";

const STEP_COPY = {
    email: {
        title: "Forgot password?",
        subtitle: "Enter your email and we'll send you a code",
    },
    otp: {
        title: "Check your email",
        subtitle: "Enter the 6-digit code we sent you",
    },
    password: {
        title: "Set a new password",
        subtitle: "Choose a password you haven't used before",
    },
};

const labelClass =
    "block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-widest";

const iconClass =
    "absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none";

const errorTextClass = "text-xs text-red-400 mt-1";

const textButtonClass =
    "text-xs text-gray-400 hover:text-gray-600 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50";

const eyeButtonClass =
    "absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors cursor-pointer disabled:cursor-not-allowed";

const submitClass = (disabled) =>
    `w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors mt-2 ${
        !disabled
            ? "bg-gray-900 hover:bg-gray-700 text-white cursor-pointer"
            : "bg-gray-100 text-gray-300 cursor-not-allowed"
    }`;

const ResetPassword = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const emailFromLogin = location.state?.email || "";

    const [step, setStep] = useState(emailFromLogin ? "otp" : "email");

    const [email, setEmail] = useState(emailFromLogin);
    const [resetToken, setResetToken] = useState(null);
    const [loading, setLoading] = useState(false);
    const [otpError, setOtpError] = useState("");

    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const emailForm = useForm({
        resolver: zodResolver(forgotPasswordSchema),
        mode: "onChange",
        defaultValues: {
            email: emailFromLogin,
        },
    });

    const passwordForm = useForm({
        resolver: zodResolver(resetPasswordSchema),
        mode: "onChange",
        defaultValues: {
            newPassword: "",
            confirmPassword: "",
        },
    });

    const handleSendOtp = async (data) => {
        try {
            setLoading(true);

            await forgotPasswordService({
                email: data.email.trim(),
            });

            setEmail(data.email.trim());
            setResetToken(null);
            setOtpError("");
            setStep("otp");

            toast.success(
                "If an account exists, a verification code has been sent.",
            );
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                    "Unable to process your request.",
            );
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (event) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const otp = String(formData.get("otp") || "").trim();

        if (!/^\d{6}$/.test(otp)) {
            setOtpError("Enter a valid 6-digit OTP.");
            return;
        }

        setOtpError("");

        try {
            setLoading(true);

            const result = await verifyResetOtpService({
                email,
                otp,
            });

            const token = result.data?.data?.resetToken;

            if (!token) {
                throw new Error("Reset token was not returned by the server.");
            }

            setResetToken(token);
            setStep("password");

            toast.success("OTP verified successfully.");
        } catch (error) {
            toast.error(
                error.response?.data?.message || "Invalid or expired OTP.",
            );
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (!email) {
            setStep("email");
            return;
        }

        try {
            setLoading(true);

            await forgotPasswordService({
                email,
            });

            // A new OTP invalidates the previous reset attempt.
            setResetToken(null);

            toast.success(
                "If an account exists, a new verification code has been sent.",
            );
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                    "Unable to resend the verification code.",
            );
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (data) => {
        if (!resetToken) {
            toast.error(
                "Your reset session has expired. Please request a new OTP.",
            );

            setStep("email");
            return;
        }

        try {
            setLoading(true);

            await resetPasswordService({
                resetToken,
                newPassword: data.newPassword,
            });

            toast.success("Password updated successfully.");

            // Remove the sensitive reset token from memory.
            setResetToken(null);

            passwordForm.reset();

            navigate("/login", {
                replace: true,
            });
        } catch (error) {
            toast.error(
                error.response?.data?.message || "Unable to reset password.",
            );
        } finally {
            setLoading(false);
        }
    };

    const handleUseAnotherEmail = () => {
        setEmail("");
        setResetToken(null);
        setOtpError("");

        emailForm.reset({
            email: "",
        });

        setStep("email");
    };

    const emailErrors = emailForm.formState.errors;
    const passwordErrors = passwordForm.formState.errors;

    const emailError = Boolean(emailErrors.email);
    const newPasswordError = Boolean(passwordErrors.newPassword);
    const confirmPasswordError = Boolean(passwordErrors.confirmPassword);

    const copy = STEP_COPY[step];

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-sm">
                {/* Heading */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 font-primary tracking-tight mb-1">
                        {copy.title}
                    </h1>
                    <p className="text-sm text-gray-400">{copy.subtitle}</p>
                </div>

                {/* Step 1: Email */}
                {step === "email" && (
                    <form
                        onSubmit={emailForm.handleSubmit(handleSendOtp)}
                        className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8 space-y-4"
                    >
                        <div>
                            <label htmlFor="reset-email" className={labelClass}>
                                Email
                            </label>

                            <div className="relative">
                                <Mail size={14} className={iconClass} />

                                <input
                                    id="reset-email"
                                    type="email"
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                    {...emailForm.register("email")}
                                    disabled={loading}
                                    aria-invalid={emailError ? "true" : "false"}
                                    aria-describedby={
                                        emailError
                                            ? "reset-email-error"
                                            : undefined
                                    }
                                    className={`${ui.inputBase} ${
                                        emailError
                                            ? ui.inputError
                                            : ui.inputIdle
                                    } disabled:bg-gray-50 disabled:cursor-not-allowed`}
                                />
                            </div>

                            {emailErrors.email && (
                                <p
                                    id="reset-email-error"
                                    className={errorTextClass}
                                >
                                    {emailErrors.email.message}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={submitClass(loading)}
                        >
                            {loading ? (
                                <>
                                    <Loader2
                                        size={14}
                                        className="animate-spin"
                                    />
                                    Sending…
                                </>
                            ) : (
                                <>
                                    Send OTP
                                    <ArrowRight size={14} />
                                </>
                            )}
                        </button>
                    </form>
                )}

                {/* Step 2: OTP */}
                {step === "otp" && (
                    <form
                        onSubmit={handleVerifyOtp}
                        className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8 space-y-4"
                    >
                        <div>
                            <label htmlFor="reset-otp" className={labelClass}>
                                Verification code
                            </label>

                            <div className="relative">
                                <KeyRound size={14} className={iconClass} />

                                <input
                                    id="reset-otp"
                                    name="otp"
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    maxLength={6}
                                    pattern="[0-9]{6}"
                                    placeholder="6-digit code"
                                    disabled={loading}
                                    onChange={() => otpError && setOtpError("")}
                                    aria-invalid={otpError ? "true" : "false"}
                                    aria-describedby={
                                        otpError ? "reset-otp-error" : undefined
                                    }
                                    className={`${ui.inputBase} ${
                                        otpError ? ui.inputError : ui.inputIdle
                                    } disabled:bg-gray-50 disabled:cursor-not-allowed`}
                                />
                            </div>

                            {otpError && (
                                <p
                                    id="reset-otp-error"
                                    className={errorTextClass}
                                >
                                    {otpError}
                                </p>
                            )}

                            {email && (
                                <p className="text-xs text-gray-400 mt-2 break-all">
                                    Sent to {email}
                                </p>
                            )}
                        </div>

                        {/* Resend / change email */}
                        <div className="flex items-center justify-between">
                            <button
                                type="button"
                                onClick={handleUseAnotherEmail}
                                disabled={loading}
                                className={textButtonClass}
                            >
                                Use another email
                            </button>

                            <button
                                type="button"
                                onClick={handleResendOtp}
                                disabled={loading}
                                className={textButtonClass}
                            >
                                Resend OTP
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={submitClass(loading)}
                        >
                            {loading ? (
                                <>
                                    <Loader2
                                        size={14}
                                        className="animate-spin"
                                    />
                                    Verifying…
                                </>
                            ) : (
                                <>
                                    Verify OTP
                                    <ArrowRight size={14} />
                                </>
                            )}
                        </button>
                    </form>
                )}

                {/* Step 3: New password */}
                {step === "password" && (
                    <form
                        onSubmit={passwordForm.handleSubmit(
                            handleResetPassword,
                        )}
                        className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8 space-y-4"
                    >
                        {/* New password */}
                        <div>
                            <label
                                htmlFor="reset-new-password"
                                className={labelClass}
                            >
                                New password
                            </label>

                            <div className="relative">
                                <Lock size={14} className={iconClass} />

                                <input
                                    id="reset-new-password"
                                    type={showNewPassword ? "text" : "password"}
                                    placeholder="12–16 characters"
                                    autoComplete="new-password"
                                    {...passwordForm.register("newPassword")}
                                    disabled={loading}
                                    aria-invalid={
                                        newPasswordError ? "true" : "false"
                                    }
                                    aria-describedby={
                                        newPasswordError
                                            ? "reset-new-password-error"
                                            : undefined
                                    }
                                    className={`${ui.inputBase} pr-10 ${
                                        newPasswordError
                                            ? ui.inputError
                                            : ui.inputIdle
                                    } disabled:bg-gray-50 disabled:cursor-not-allowed`}
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowNewPassword((value) => !value)
                                    }
                                    disabled={loading}
                                    aria-label={
                                        showNewPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                    className={eyeButtonClass}
                                >
                                    {showNewPassword ? (
                                        <EyeOff size={15} />
                                    ) : (
                                        <Eye size={15} />
                                    )}
                                </button>
                            </div>

                            {passwordErrors.newPassword && (
                                <p
                                    id="reset-new-password-error"
                                    className={errorTextClass}
                                >
                                    {passwordErrors.newPassword.message}
                                </p>
                            )}
                        </div>

                        {/* Confirm password */}
                        <div>
                            <label
                                htmlFor="reset-confirm-password"
                                className={labelClass}
                            >
                                Confirm password
                            </label>

                            <div className="relative">
                                <Lock size={14} className={iconClass} />

                                <input
                                    id="reset-confirm-password"
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    placeholder="Re-enter your password"
                                    autoComplete="new-password"
                                    {...passwordForm.register(
                                        "confirmPassword",
                                    )}
                                    disabled={loading}
                                    aria-invalid={
                                        confirmPasswordError ? "true" : "false"
                                    }
                                    aria-describedby={
                                        confirmPasswordError
                                            ? "reset-confirm-password-error"
                                            : undefined
                                    }
                                    className={`${ui.inputBase} pr-10 ${
                                        confirmPasswordError
                                            ? ui.inputError
                                            : ui.inputIdle
                                    } disabled:bg-gray-50 disabled:cursor-not-allowed`}
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            (value) => !value,
                                        )
                                    }
                                    disabled={loading}
                                    aria-label={
                                        showConfirmPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                    className={eyeButtonClass}
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff size={15} />
                                    ) : (
                                        <Eye size={15} />
                                    )}
                                </button>
                            </div>

                            {passwordErrors.confirmPassword && (
                                <p
                                    id="reset-confirm-password-error"
                                    className={errorTextClass}
                                >
                                    {passwordErrors.confirmPassword.message}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !resetToken}
                            className={submitClass(loading || !resetToken)}
                        >
                            {loading ? (
                                <>
                                    <Loader2
                                        size={14}
                                        className="animate-spin"
                                    />
                                    Updating…
                                </>
                            ) : (
                                <>
                                    Reset password
                                    <ArrowRight size={14} />
                                </>
                            )}
                        </button>
                    </form>
                )}

                {/* Footer link */}
                <p className="text-center text-sm text-gray-400 mt-6">
                    Remembered your password?{" "}
                    <button
                        type="button"
                        onClick={() => navigate("/login")}
                        disabled={loading}
                        className="text-gray-700 font-medium hover:underline underline-offset-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Sign in
                    </button>
                </p>
            </div>
        </div>
    );
};

export default ResetPassword;
