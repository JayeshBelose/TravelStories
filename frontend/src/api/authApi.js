import api from "./axios";

export const loginApi = ({ email, password }) =>
    api.post("/auth/login", { email, password });

export const signupApi = ({ username, email, password }) =>
    api.post("/auth/signup", {
        username,
        email,
        password,
    });

export const forgotPasswordApi = ({ email }) =>
    api.post("/auth/forgotPassword", null, {
        params: { email },
        skipAuth: true,
        skipRefresh: true,
    });

export const verifyResetOtpApi = ({ email, otp }) =>
    api.post("/auth/verifyResetOtp", null, {
        params: { email, otp },
        skipAuth: true,
        skipRefresh: true,
    });

export const resetPasswordApi = ({ resetToken, newPassword }) =>
    api.post("/auth/resetPassword", null, {
        params: { resetToken, newPassword },
        skipAuth: true,
        skipRefresh: true,
    });
