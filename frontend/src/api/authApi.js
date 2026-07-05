import api from "./axios";

export const loginApi = ({ email, password }) =>
    api.post("/auth/login", { email, password });

export const forgotPasswordApi = ({ email }) =>
    api.post(`/auth/forgotPassword?email=${email}`);

export const resetPasswordApi = ({ token, newPassword }) =>
    api.post("/auth/resetPassword", null, {
        params: { token, newPassword },
    });
