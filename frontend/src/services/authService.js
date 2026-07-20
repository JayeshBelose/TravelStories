import { loginApi, signupApi, forgotPasswordApi, resetPasswordApi } from "@/api/authApi";

export const loginService = async ({ email, password }) => {
    try {
        const response = await loginApi({ email, password });

        return {
            success: true,
            data: response.data.data,
        };
    } catch (err) {
        let message = "Something went wrong. Please try again.";

        if (err.response) {
            switch (err.response.status) {
                case 401:
                    message = "Invalid email or password.";
                    break;
                case 404:
                    message = "No account found with this email.";
                    break;
                default:
                    if (err.response.status >= 500) {
                        message = "Server error. Please try again later.";
                    }
            }
        }

        return {
            success: false,
            message,
        };
    }
};

export const signupService = async ({ username, email, password }) => {
    try {
        const response = await signupApi({
            username,
            email,
            password,
        });

        return {
            success: true,
            data: response.data.data,
        };
    } catch (err) {
        let message = "Signup failed. Please try again.";

        if (err.response) {
            switch (err.response.status) {
                case 400:
                    message = "Please enter valid details.";
                    break;

                case 409:
                    message = "An account with this email or username already exists.";
                    break;

                default:
                    if (err.response.status >= 500) {
                        message = "Server error. Please try again later.";
                    }
            }
        }

        return {
            success: false,
            message,
        };
    }
};

export const forgotPasswordService = async ({ email }) => {
    try {
        const response = await forgotPasswordApi({ email });

        return {
            success: true,
            data: response.data.data,
        };
    } catch (err) {
        let message = "Failed to generate reset token";

        if (err.response) {
            switch (err.response.status) {
                case 404:
                    message = "No account found with this email.";
                    break;
                case 400:
                    message = "Invalid email address.";
                    break;
                default:
                    if (err.response.status >= 500) {
                        message = "Server error. Please try again later.";
                    }
            }
        }

        return {
            success: false,
            message,
        };
    }
};

export const resetPasswordService = async ({ token, newPassword }) => {
    try {
        const response = await resetPasswordApi({ token, newPassword });

        return {
            success: true,
            message: response.data.data,
        };
    } catch (err) {
        return {
            success: false,
            message:
                err.response?.data || "Invalid or expired reset link. Please try again.",
        };
    }
};
