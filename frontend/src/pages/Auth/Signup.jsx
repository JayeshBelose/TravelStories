import { useState } from "react";
import { Eye, EyeOff, User, Mail, Lock, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
import { signupService } from "@/services/authService";

export default function Signup() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailValid = emailRegex.test(email);
    const isNameValid = name.length >= 4;
    const isPasswordValid = password.length >= 8 && password.length <= 12;
    const isFormValid =
        name && email && password && isNameValid && isPasswordValid && isEmailValid;

    const nameError = name.length > 0 && !isNameValid;
    const emailError = email.length > 0 && !isEmailValid;
    const passwordHint = password.length > 0 && !isPasswordValid;

    const handleSignup = async e => {
        e.preventDefault();

        if (!isFormValid) {
            toast.warning("Please fill all fields correctly.");
            return;
        }

        setLoading(true);

        const loadingToast = toast.loading("Creating your account...");

        const result = await signupService({
            username: name,
            email,
            password,
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

        setLoading(false);
    };

    const inputBase =
        "w-full border rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none transition-colors";
    const inputIdle = "border-gray-200 focus:border-gray-400";
    const inputError = "border-red-300 focus:border-red-400 bg-red-50/30";

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
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8 space-y-4">
                    {/* Username */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-widest">
                            Username
                        </label>
                        <div className="relative">
                            <User
                                size={14}
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"
                            />
                            <input
                                type="text"
                                placeholder="Min. 4 characters"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className={`${inputBase} ${nameError ? inputError : inputIdle}`}
                            />
                        </div>
                        {nameError && (
                            <p className="text-xs text-red-400 mt-1">
                                Username must be at least 4 characters
                            </p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-widest">
                            Email
                        </label>
                        <div className="relative">
                            <Mail
                                size={14}
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"
                            />
                            <input
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className={`${inputBase} ${emailError ? inputError : inputIdle}`}
                            />
                        </div>
                        {emailError && (
                            <p className="text-xs text-red-400 mt-1">
                                Enter a valid email address
                            </p>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-widest">
                            Password
                        </label>
                        <div className="relative">
                            <Lock
                                size={14}
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"
                            />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="8–12 characters"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className={`${inputBase} pr-10 ${passwordHint ? inputError : inputIdle}`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(v => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors cursor-pointer">
                                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                        {passwordHint && (
                            <p className="text-xs text-red-400 mt-1">
                                Password must be 8–12 characters
                            </p>
                        )}
                    </div>

                    {/* Submit */}
                    <button
                        onClick={handleSignup}
                        disabled={!isFormValid || loading}
                        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors mt-2
                            ${
                                isFormValid && !loading
                                    ? "bg-gray-900 hover:bg-gray-700 text-white cursor-pointer"
                                    : "bg-gray-100 text-gray-300 cursor-not-allowed"
                            }`}>
                        {loading ? "Creating account…" : "Create account"}
                        {!loading && <ArrowRight size={14} />}
                    </button>
                </div>

                {/* Footer link */}
                <p className="text-center text-sm text-gray-400 mt-6">
                    Already have an account?{" "}
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
