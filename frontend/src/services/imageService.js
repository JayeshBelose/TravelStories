import {
    deleteLocationImageApi,
    getLocationImagesApi,
    uploadLocationImageApi,
} from "@/api/imageApi";

export const getLocationImagesService = async ({ locationId }) => {
    try {
        const response = await getLocationImagesApi({
            locationId,
        });

        return {
            success: true,
            data: response.data,
        };
    } catch (err) {
        let message = "Failed to fetch location images.";

        if (err.response) {
            switch (err.response.status) {
                case 404:
                    message = "No images found.";
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

export const uploadLocationImageService = async ({ locationId, formData }) => {
    try {
        const response = await uploadLocationImageApi({
            locationId,
            formData,
        });

        return {
            success: true,
            data: response.data,
        };
    } catch (err) {
        let message = "Failed to upload image.";

        if (err.response) {
            switch (err.response.status) {
                case 400:
                    message = "Invalid image.";
                    break;

                case 404:
                    message = "Location not found.";
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

export const deleteLocationImageService = async ({ imageId }) => {
    try {
        const response = await deleteLocationImageApi({
            imageId,
        });

        return {
            success: true,
            data: response.data,
        };
    } catch (err) {
        let message = "Failed to delete image.";

        if (err.response) {
            switch (err.response.status) {
                case 404:
                    message = "Image not found.";
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
