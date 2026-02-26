import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
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

    const handleLogin = async () => {
        if (!isFormValid) return;

        try {
            const response = await api.post(
                `${import.meta.env.VITE_API_BASE_URL}/auth/login`,
                { email, password },
            );

            const { token, userId, username, role } = response.data;

            localStorage.setItem("token", token);

            login({ userId, username, role });

            navigate(role === "ADMIN" ? "/admin" : "/user");
        } catch (error) {
            console.error(error);
            alert("Invalid credentials!");
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
