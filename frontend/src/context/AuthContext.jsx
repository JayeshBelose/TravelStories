import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = sessionStorage.getItem("user");
        const token = sessionStorage.getItem("token");

        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
        }

        setLoading(false);
    }, []);

    const login = data => {
        sessionStorage.setItem("token", data.token);

        const user = {
            userId: data.userId,
            username: data.username,
            role: data.role,
        };

        sessionStorage.setItem("user", JSON.stringify(user));
        setUser(user);
    };

    const logout = () => {
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("token");
        setUser(null);
        navigate("/login");
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
