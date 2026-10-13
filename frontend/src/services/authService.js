import {
    loginApi,
    signupApi,
    forgotPasswordApi,
    resetPasswordApi,
    verifyResetOtpApi,
} from "@/api/authApi";
import {
    executeServiceRequest,
    handleServiceMessageResponse,
} from "./serviceUtils";

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
    return await forgotPasswordApi({ email });
};

export const verifyResetOtpService = async ({ email, otp }) => {
    return await verifyResetOtpApi({ email, otp });
};

export const resetPasswordService = async ({ resetToken, newPassword }) => {
    return await resetPasswordApi({
        resetToken,
        newPassword,
    });
};
