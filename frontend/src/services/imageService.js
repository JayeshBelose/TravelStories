import {
    deleteLocationImageApi,
    getLocationImagesApi,
    uploadLocationImageApi,
} from "@/api/imageApi";
import { executeServiceRequest } from "./serviceUtils";

export const getLocationImagesService = async ({ locationId }) => {
    return executeServiceRequest(
        () =>
            getLocationImagesApi({
                locationId,
            }),
        "Failed to fetch location images.",
    );
};

export const uploadLocationImageService = async ({ locationId, formData }) => {
    return executeServiceRequest(
        () =>
            uploadLocationImageApi({
                locationId,
                formData,
            }),
        "Failed to upload image.",
    );
};

export const deleteLocationImageService = async ({ imageId }) => {
    return executeServiceRequest(
        () =>
            deleteLocationImageApi({
                imageId,
            }),
        "Failed to delete image.",
    );
};
