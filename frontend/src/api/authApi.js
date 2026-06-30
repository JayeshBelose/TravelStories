import api from "./axios";

export const loginApi = ({ email, password }) =>
    api.post("/auth/login", { email, password });

export const forgotPasswordApi = ({ email }) =>
    api.post(`/auth/forgotPassword?email=${email}`);
