import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
import api from "@/api/axiosConfig";

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

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

            localStorage.setItem("token", token);
            login({ userId, username, role });

            toast.update(loadingToast, {
                render: "Login successful!",
                type: "success",
                isLoading: false,
                autoClose: 1000,
            });

            setTimeout(() => {
                navigate(role === "ADMIN" ? "/admin" : "/user");
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

                <input
                    type="password"
                    placeholder="Password (8-12 chars)"
                    className="w-full p-2 mb-2 border rounded"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
                {!isPasswordValid && password.length > 0 && (
                    <p className="text-red-500 text-sm mb-2">
                        Password must be 8-12 characters
                    </p>
                )}

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
