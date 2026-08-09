import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        Accept: "application/json",
    },
});

let refreshPromise = null;

const clearAuthStorage = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("refreshToken");
    sessionStorage.removeItem("user");
};

const notifyAuthenticationFailure = () => {
    window.dispatchEvent(new Event("auth:session-expired"));
};

const refreshAccessToken = async () => {
    const refreshToken = sessionStorage.getItem("refreshToken");

    if (!refreshToken) {
        throw new Error("No refresh token available.");
    }

    const response = await api.post(
        "/auth/refresh",
        { refreshToken },
        {
            skipAuth: true,
            skipRefresh: true,
        },
    );

    const responseData = response.data;

    if (!responseData.success || !responseData.data) {
        throw new Error(responseData.message || "Token refresh failed.");
    }

    const { accessToken, refreshToken: newRefreshToken, user } = responseData.data;

    sessionStorage.setItem("token", accessToken);
    sessionStorage.setItem("refreshToken", newRefreshToken);
    sessionStorage.setItem("user", JSON.stringify(user));

    return accessToken;
};

api.interceptors.request.use(config => {
    if (!config.skipAuth) {
        const token = sessionStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }

    return config;
});

api.interceptors.response.use(
    response => response,

    async error => {
        const originalRequest = error.config;

        if (!error.response || error.response.status !== 401) {
            return Promise.reject(error);
        }

        if (originalRequest?.skipRefresh || originalRequest?._retry) {
            return Promise.reject(error);
        }

        const refreshToken = sessionStorage.getItem("refreshToken");

        if (!refreshToken) {
            clearAuthStorage();
            notifyAuthenticationFailure();

            return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
            if (!refreshPromise) {
                refreshPromise = refreshAccessToken();
            }

            const newAccessToken = await refreshPromise;

            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

            return api(originalRequest);
        } catch (refreshError) {
            clearAuthStorage();
            notifyAuthenticationFailure();

            return Promise.reject(refreshError);
        } finally {
            refreshPromise = null;
        }
    },
);

export default api;
