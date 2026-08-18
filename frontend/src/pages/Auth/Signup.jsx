import { useState } from "react";
import {
    Eye,
    EyeOff,
    User,
    Mail,
    Lock,
    ArrowRight,
    Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema } from "../../schemas/authSchemas";
import { signupService } from "@/services/authService";

export default function Signup() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(signupSchema),
        mode: "onChange",
        defaultValues: {
            username: "",
            email: "",
            password: "",
        },
    });

    const handleSignup = async (data) => {
        const loadingToast = toast.loading("Creating your account...");

        try {
            const result = await signupService({
                username: data.username,
                email: data.email,
                password: data.password,
            });

            if (result.success) {
                login(result.data);

                const role = result.data.user.role;

                toast.update(loadingToast, {
                    render: "Account created! Welcome aboard.",
                    type: "success",
                    isLoading: false,
                    autoClose: 2000,
                });

                setTimeout(() => {
                    navigate(role === "ADMIN" ? "/admin" : "/user");
                }, 1000);
            } else {
                toast.update(loadingToast, {
                    render: result.message,
                    type: "error",
                    isLoading: false,
                    autoClose: 3000,
                });
            }
        } catch (error) {
            toast.update(loadingToast, {
                render: "Unable to create your account. Please try again.",
                type: "error",
                isLoading: false,
                autoClose: 3000,
            });
        }
    };

    const inputBase =
        "w-full border rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none transition-colors";
    const inputIdle = "border-gray-200 focus:border-gray-400";
    const inputError = "border-red-300 focus:border-red-400 bg-red-50/30";

    const usernameError = Boolean(errors.username);
    const emailError = Boolean(errors.email);
    const passwordError = Boolean(errors.password);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-sm">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 font-primary tracking-tight mb-1">
                        Create an account
                    </h1>
                    <p className="text-sm text-gray-400">
                        Start planning your next adventure
                    </p>
                </div>

                {/* Card */}
                <form
                    onSubmit={handleSubmit(handleSignup)}
                    className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8 space-y-4"
                >
                    {/* Username */}
                    <div>
                        <label
                            htmlFor="signup-username"
                            className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-widest"
                        >
                            Username
                        </label>

                        <div className="relative">
                            <User
                                size={14}
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"
                            />

                            <input
                                id="signup-username"
                                type="text"
                                placeholder="Min. 4 characters"
                                {...register("username")}
                                disabled={isSubmitting}
                                aria-invalid={usernameError ? "true" : "false"}
                                aria-describedby={
                                    usernameError
                                        ? "signup-username-error"
                                        : undefined
                                }
                                autoComplete="username"
                                className={`${inputBase} ${
                                    usernameError ? inputError : inputIdle
                                } disabled:bg-gray-50 disabled:cursor-not-allowed`}
                            />
                        </div>

                        {errors.username && (
                            <p
                                id="signup-username-error"
                                className="text-xs text-red-400 mt-1"
                            >
                                {errors.username.message}
                            </p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label
                            htmlFor="signup-email"
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
                                id="signup-email"
                                type="email"
                                placeholder="you@example.com"
                                {...register("email")}
                                disabled={isSubmitting}
                                aria-invalid={emailError ? "true" : "false"}
                                aria-describedby={
                                    emailError
                                        ? "signup-email-error"
                                        : undefined
                                }
                                autoComplete="email"
                                className={`${inputBase} ${
                                    emailError ? inputError : inputIdle
                                } disabled:bg-gray-50 disabled:cursor-not-allowed`}
                            />
                        </div>

                        {errors.email && (
                            <p
                                id="signup-email-error"
                                className="text-xs text-red-400 mt-1"
                            >
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <label
                            htmlFor="signup-password"
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
                                id="signup-password"
                                type={showPassword ? "text" : "password"}
                                placeholder="12–16 characters"
                                {...register("password")}
                                disabled={isSubmitting}
                                aria-invalid={passwordError ? "true" : "false"}
                                aria-describedby={
                                    passwordError
                                        ? "signup-password-error"
                                        : undefined
                                }
                                autoComplete="new-password"
                                className={`${inputBase} pr-10 ${
                                    passwordError ? inputError : inputIdle
                                } disabled:bg-gray-50 disabled:cursor-not-allowed`}
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowPassword((value) => !value)
                                }
                                disabled={isSubmitting}
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
                                id="signup-password-error"
                                className="text-xs text-red-400 mt-1"
                            >
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors mt-2
                            ${
                                !isSubmitting
                                    ? "bg-gray-900 hover:bg-gray-700 text-white cursor-pointer"
                                    : "bg-gray-100 text-gray-300 cursor-not-allowed"
                            }`}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 size={14} className="animate-spin" />
                                Creating account…
                            </>
                        ) : (
                            <>
                                Create account
                                <ArrowRight size={14} />
                            </>
                        )}
                    </button>
                </form>

                {/* Footer link */}
                <p className="text-center text-sm text-gray-400 mt-6">
                    Already have an account?{" "}
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
