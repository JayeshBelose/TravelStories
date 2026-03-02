import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
import api from "@/api/axiosConfig";

export default function Signup() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailValid = emailRegex.test(email);
    const isNameValid = name.length >= 8;
    const isPasswordValid = password.length >= 8 && password.length <= 12;
    const isFormValid =
        name && email && password && isNameValid && isPasswordValid && isEmailValid;

    const handleSignup = async e => {
        e.preventDefault();

        if (!isFormValid) {
            toast.warning("Please enter valid credentials.");
            return;
        }

        const loadingToast = toast.loading("Signing up...");

        try {
            const res = await api.post(`/auth/signup`, {
                username: name,
                email,
                password,
            });

            const { token, userId, username, role } = response.data;

            localStorage.setItem("token", token);
            login({ userId, username, role });

            toast.update(loadingToast, {
                render: "Signup successful!",
                type: "success",
                isLoading: false,
                autoClose: 2000,
            });

            etTimeout(() => {
                navigate(role === "ADMIN" ? "/admin" : "/user");
            }, 1000);
        } catch (error) {
            console.log(error);

            toast.update(loadingToast, {
                render:
                    error.response?.data?.message || "Signup failed. Please try again.",
                type: "error",
                isLoading: false,
                autoClose: 3000,
            });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="bg-white p-10 rounded-lg shadow-md w-96">
                <h1 className="text-2xl font-bold mb-6">Sign Up</h1>

                <input
                    type="text"
                    placeholder="Name (min 8 chars)"
                    className="w-full p-2 mb-2 border rounded"
                    value={name}
                    onChange={e => setName(e.target.value)}
                />
                {!isNameValid && name.length > 0 && (
                    <p className="text-red-500 text-sm mb-2">
                        Name must be at least 8 characters
                    </p>
                )}

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
                    onClick={handleSignup}
                    disabled={!isFormValid}
                    className={`w-full py-2 rounded mb-4 ${
                        !isFormValid
                            ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                            : "bg-primary text-primary-foreground hover:bg-primary/90"
                    }`}>
                    Sign Up
                </button>

                <p className="text-sm">
                    Already have an account?{" "}
                    <span
                        className="text-secondary cursor-pointer hover:underline"
                        onClick={() => navigate("/login")}>
                        Login
                    </span>
                </p>
            </div>
        </div>
    );
}
