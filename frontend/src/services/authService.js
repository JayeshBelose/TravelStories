import { loginApi, signupApi, forgotPasswordApi, resetPasswordApi } from "@/api/authApi";
import { executeServiceRequest, handleServiceMessageResponse } from "./serviceUtils";

export const loginService = async ({ email, password }) => {
    return executeServiceRequest(
        () => loginApi({ email, password }),
        "Login failed. Please try again.",
    );
};

export const signupService = async ({ username, email, password }) => {
    return executeServiceRequest(
        () =>
            signupApi({
                username,
                email,
                password,
            }),
        "Signup failed. Please try again.",
    );
};

export const forgotPasswordService = async ({ email }) => {
    return executeServiceRequest(
        () => forgotPasswordApi({ email }),
        "Failed to generate reset token.",
    );
};

export const resetPasswordService = async ({ token, newPassword }) => {
    return executeServiceRequest(
        () =>
            resetPasswordApi({
                token,
                newPassword,
            }),
        "Invalid or expired reset link. Please try again.",
        response =>
            handleServiceMessageResponse(
                response,
                "Invalid or expired reset link. Please try again.",
            ),
    );
};
