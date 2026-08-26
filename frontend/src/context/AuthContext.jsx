import { createContext, useContext, useEffect, useState, useMemo } from "react";
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

    useEffect(() => {
        const handleSessionExpired = () => {
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("refreshToken");
            sessionStorage.removeItem("user");

            setUser(null);
            navigate("/login");
        };

        window.addEventListener("auth:session-expired", handleSessionExpired);

        return () => {
            window.removeEventListener(
                "auth:session-expired",
                handleSessionExpired,
            );
        };
    }, [navigate]);

    const login = (data) => {
        sessionStorage.setItem("token", data.accessToken);
        sessionStorage.setItem("refreshToken", data.refreshToken);
        sessionStorage.setItem("user", JSON.stringify(data.user));

        setUser(data.user);
    };

    const logout = () => {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("refreshToken");
        sessionStorage.removeItem("user");

        setUser(null);
        navigate("/login");
    };

    const contextValue = useMemo(
        () => ({
            user,
            loading,
            login,
            logout,
        }),
        [user, loading, login, logout],
    );

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
