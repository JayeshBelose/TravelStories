import { loginApi, forgotPasswordApi } from "@/api/authApi";

export const loginService = async ({ email, password }) => {
    try {
        const response = await loginApi({ email, password });

        return {
            success: true,
            data: response.data,
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

export const forgotPasswordService = async ({ email }) => {
    const response = await forgotPasswordApi({ email });
    return response.data;
};
