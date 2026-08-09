export const handleServiceResponse = (response, defaultMessage) => {
    const apiResponse = response.data;

    if (apiResponse?.success) {
        return {
            success: true,
            data: apiResponse.data,
        };
    }

    return {
        success: false,
        message: apiResponse?.message || defaultMessage,
    };
};

export const handleServiceMessageResponse = (response, defaultMessage) => {
    const apiResponse = response.data;

    if (apiResponse?.success) {
        return {
            success: true,
            message: apiResponse.message,
        };
    }

    return {
        success: false,
        message: apiResponse?.message || defaultMessage,
    };
};

export const handleServiceError = (
    error,
    defaultMessage = "Something went wrong. Please try again.",
) => {
    if (!error.response) {
        return {
            success: false,
            message: "Network error. Please check your connection and try again.",
        };
    }

    const { data, status } = error.response;

    if (data?.message) {
        return {
            success: false,
            message: data.message,
        };
    }

    if (status >= 500) {
        return {
            success: false,
            message: "Server error. Please try again later.",
        };
    }

    return {
        success: false,
        message: defaultMessage,
    };
};

export const executeServiceRequest = async (
    request,
    defaultMessage,
    responseHandler = response => handleServiceResponse(response, defaultMessage),
) => {
    try {
        const response = await request();

        return responseHandler(response);
    } catch (error) {
        return handleServiceError(error, defaultMessage);
    }
};
