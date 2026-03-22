import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
import api from "@/api/axiosConfig";

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailValid = emailRegex.test(email);
    const isPasswordValid = password.length >= 8 && password.length <= 12;
    const isFormValid = email && password && isEmailValid && isPasswordValid;

    const handleLogin = async e => {
        e.preventDefault();

        if (!isFormValid) {
            toast.warning("Please enter valid credentials.");
            return;
        }

        const loadingToast = toast.loading("Logging in...");

        try {
            const response = await api.post(`/auth/login`, { email, password });

            const { token, userId, username, role } = response.data;

            login({ token, userId, username, role });

            toast.update(loadingToast, {
                render: "Login successful!",
                type: "success",
                isLoading: false,
                autoClose: 1000,
            });

            setTimeout(() => {
                navigate(role === "admin" ? "/admin" : "/user");
            }, 1500);
        } catch (err) {
            let message = "Something went wrong. Please try again.";

            if (err.response) {
                const status = err.response.status;

                if (status === 401) {
                    message = "Invalid email or password!";
                } else if (status === 404) {
                    message = "User does not exist.";
                } else if (status >= 500) {
                    message = "Server error. Please try again later.";
                }
            }

            toast.update(loadingToast, {
                render: message,
                type: "error",
                isLoading: false,
                autoClose: 3000,
            });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="bg-white p-10 rounded-lg shadow-md w-96">
                <h1 className="text-2xl font-bold mb-6">Login</h1>

                <input
                    type="email"
                    placeholder="Email"
                    className="w-full p-2 mb-2 border rounded"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
                {!isEmailValid && email.length > 0 && (
                    <p className="text-red-500 text-sm mb-2">Invalid email address</p>
                )}

                <div className="relative mb-2">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password (8-12 chars)"
                        className="w-full p-2 border rounded pr-10"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />

                    {showPassword ? (
                        <EyeOff
                            size={20}
                            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-primary"
                            onClick={() => setShowPassword(false)}
                        />
                    ) : (
                        <Eye
                            size={20}
                            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-secondary"
                            onClick={() => setShowPassword(true)}
                        />
                    )}
                </div>

                <button
                    onClick={handleLogin}
                    disabled={!isFormValid}
                    className={`w-full py-2 rounded mb-4 ${
                        !isFormValid
                            ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                            : "bg-primary text-primary-foreground hover:bg-primary/90"
                    }`}>
                    Login
                </button>

                <p className="text-sm">
                    Don't have an account?{" "}
                    <span
                        className="text-secondary cursor-pointer hover:underline"
                        onClick={() => navigate("/signup")}>
                        Sign up
                    </span>
                </p>
            </div>
        </div>
    );
}
