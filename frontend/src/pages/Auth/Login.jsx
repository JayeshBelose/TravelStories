import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../../schemas/authSchemas";
import { loginService, forgotPasswordService } from "@/services/authService";

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [showPassword, setShowPassword] = useState(false);
    const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);

    const {
        register,
        handleSubmit,
        getValues,
        trigger,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(loginSchema),
        mode: "onChange",
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const handleLogin = async (data) => {
        const loadingToast = toast.loading("Logging in...");

        try {
            const result = await loginService({
                email: data.email,
                password: data.password,
            });

            if (result.success) {
                login(result.data);

                const role = result.data.user.role;

                toast.update(loadingToast, {
                    render: "Welcome back!",
                    type: "success",
                    isLoading: false,
                    autoClose: 1000,
                });

                setTimeout(() => {
                    navigate(role === "admin" ? "/admin" : "/user");
                }, 1500);
            } else {
                toast.update(loadingToast, {
                    render: result.message,
                    type: "error",
                    isLoading: false,
                    autoClose: 3000,
                });
            }
        } finally {
            // React Hook Form manages the submission state through
            // formState.isSubmitting.
        }
    };

    const handleForgotPassword = async () => {
        const isEmailValid = await trigger("email");

        if (!isEmailValid) {
            return;
        }

        if (isSubmitting || forgotPasswordLoading) {
            return;
        }

        const email = getValues("email");

        setForgotPasswordLoading(true);

        const loadingToast = toast.loading("Generating link...");

        try {
            const result = await forgotPasswordService({ email });

            if (result.success) {
                const { token } = result.data;

                toast.update(loadingToast, {
                    render: "Reset link generated!",
                    type: "success",
                    isLoading: false,
                    autoClose: 1000,
                });

                setTimeout(() => {
                    navigate(`/reset-password?token=${token}`);
                }, 1500);
            } else {
                toast.update(loadingToast, {
                    render: result.message,
                    type: "error",
                    isLoading: false,
                    autoClose: 3000,
                });
            }
        } finally {
            setForgotPasswordLoading(false);
        }
    };

    const inputBase =
        "w-full border rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none transition-colors";
    const inputIdle = "border-gray-200 focus:border-gray-400";
    const inputError = "border-red-300 focus:border-red-400 bg-red-50/30";

    const emailError = Boolean(errors.email);
    const passwordError = Boolean(errors.password);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-sm">
                {/* Wordmark */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 font-primary tracking-tight mb-1">
                        Welcome back
                    </h1>
                    <p className="text-sm text-gray-400">
                        Sign in to continue your journey
                    </p>
                </div>

                {/* Card */}
                <form
                    onSubmit={handleSubmit(handleLogin)}
                    className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8 space-y-4"
                >
                    {/* Email */}
                    <div>
                        <label
                            htmlFor="login-email"
                            className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-widest"
                        >
                            Email
                        </label>

                        <div className="relative">
                            <Mail
                                size={14}
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"
                            />

                            <input
                                id="login-email"
                                type="email"
                                placeholder="you@example.com"
                                {...register("email")}
                                disabled={isSubmitting || forgotPasswordLoading}
                                aria-invalid={emailError ? "true" : "false"}
                                aria-describedby={
                                    emailError ? "login-email-error" : undefined
                                }
                                autoComplete="email"
                                className={`${inputBase} ${
                                    emailError ? inputError : inputIdle
                                } disabled:bg-gray-50 disabled:cursor-not-allowed`}
                            />
                        </div>

                        {errors.email && (
                            <p
                                id="login-email-error"
                                className="text-xs text-red-400 mt-1"
                            >
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <label
                            htmlFor="login-password"
                            className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-widest"
                        >
                            Password
                        </label>

                        <div className="relative">
                            <Lock
                                size={14}
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"
                            />

                            <input
                                id="login-password"
                                type={showPassword ? "text" : "password"}
                                placeholder="12–16 characters"
                                {...register("password")}
                                disabled={isSubmitting || forgotPasswordLoading}
                                aria-invalid={passwordError ? "true" : "false"}
                                aria-describedby={
                                    passwordError
                                        ? "login-password-error"
                                        : undefined
                                }
                                autoComplete="current-password"
                                className={`${inputBase} pr-10 ${
                                    passwordError ? inputError : inputIdle
                                } disabled:bg-gray-50 disabled:cursor-not-allowed`}
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowPassword((value) => !value)
                                }
                                disabled={isSubmitting || forgotPasswordLoading}
                                aria-label={
                                    showPassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors cursor-pointer disabled:cursor-not-allowed"
                            >
                                {showPassword ? (
                                    <EyeOff size={15} />
                                ) : (
                                    <Eye size={15} />
                                )}
                            </button>
                        </div>

                        {errors.password && (
                            <p
                                id="login-password-error"
                                className="text-xs text-red-400 mt-1"
                            >
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    {/* Forgot Password */}
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={handleForgotPassword}
                            disabled={isSubmitting || forgotPasswordLoading}
                            className="text-xs text-gray-400 hover:text-gray-600 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {forgotPasswordLoading ? (
                                <span className="inline-flex items-center gap-1.5">
                                    <Loader2
                                        size={12}
                                        className="animate-spin"
                                    />
                                    Generating…
                                </span>
                            ) : (
                                "Forgot Password?"
                            )}
                        </button>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isSubmitting || forgotPasswordLoading}
                        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors mt-2
                            ${
                                !isSubmitting && !forgotPasswordLoading
                                    ? "bg-gray-900 hover:bg-gray-700 text-white cursor-pointer"
                                    : "bg-gray-100 text-gray-300 cursor-not-allowed"
                            }`}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 size={14} className="animate-spin" />
                                Signing in…
                            </>
                        ) : (
                            <>
                                Sign in
                                <ArrowRight size={14} />
                            </>
                        )}
                    </button>
                </form>

                {/* Footer link */}
                <p className="text-center text-sm text-gray-400 mt-6">
                    Don't have an account?{" "}
                    <button
                        type="button"
                        onClick={() => navigate("/signup")}
                        disabled={isSubmitting || forgotPasswordLoading}
                        className="text-gray-700 font-medium hover:underline underline-offset-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Sign up
                    </button>
                </p>
            </div>
        </div>
    );
}
