import {
    addMemberApi,
    createItineraryApi,
    deleteItineraryApi,
    getItinerariesApi,
    getItineraryDetailsApi,
    getItineraryTypesApi,
    getSavedItinerariesApi,
    getSharedItinerariesApi,
    getUserCreatedItinerariesApi,
    removeMemberApi,
    toggleSavedItineraryApi,
    updateItineraryApi,
    uploadThumbnailApi,
} from "@/api/itineraryApi";
import { executeServiceRequest } from "./serviceUtils";

export const getItineraryTypesService = async () => {
    return executeServiceRequest(
        () => getItineraryTypesApi(),
        "Failed to fetch itinerary types.",
    );
};

export const getItinerariesService = async ({ search, type, sort, page, size }) => {
    return executeServiceRequest(
        () =>
            getItinerariesApi({
                search,
                type,
                sort,
                page,
                size,
            }),
        "Failed to fetch itineraries.",
    );
};

export const deleteItineraryService = async ({ itineraryId }) => {
    return executeServiceRequest(
        () => deleteItineraryApi({ itineraryId }),
        "Failed to delete itinerary.",
    );
};

export const toggleSavedItineraryService = async ({ userId, itineraryId }) => {
    return executeServiceRequest(
        () =>
            toggleSavedItineraryApi({
                userId,
                itineraryId,
            }),
        "Failed to update saved itinerary.",
    );
};

export const getUserCreatedItinerariesService = async ({ userId }) => {
    return executeServiceRequest(
        () => getUserCreatedItinerariesApi({ userId }),
        "Failed to fetch created itineraries.",
    );
};

export const getSharedItinerariesService = async ({ userId }) => {
    return executeServiceRequest(
        () => getSharedItinerariesApi({ userId }),
        "Failed to fetch shared itineraries.",
    );
};

export const getSavedItinerariesService = async ({ userId }) => {
    return executeServiceRequest(
        () => getSavedItinerariesApi({ userId }),
        "Failed to fetch saved itineraries.",
    );
};

export const getItineraryDetailsService = async ({ itineraryId }) => {
    return executeServiceRequest(
        () =>
            getItineraryDetailsApi({
                itineraryId,
            }),
        "Failed to fetch itinerary details.",
    );
};

export const createItineraryService = async ({ userId, itinerary }) => {
    return executeServiceRequest(
        () =>
            createItineraryApi({
                userId,
                itinerary,
            }),
        "Failed to create itinerary.",
    );
};

export const updateItineraryService = async ({ itineraryId, itinerary }) => {
    return executeServiceRequest(
        () =>
            updateItineraryApi({
                itineraryId,
                itinerary,
            }),
        "Failed to update itinerary.",
    );
};

export const uploadThumbnailService = async ({ itineraryId, formData }) => {
    return executeServiceRequest(
        () =>
            uploadThumbnailApi({
                itineraryId,
                formData,
            }),
        "Failed to upload thumbnail.",
    );
};

export const addMemberService = async ({ itineraryId, userId }) => {
    return executeServiceRequest(
        () =>
            addMemberApi({
                itineraryId,
                userId,
            }),
        "Failed to add member.",
    );
};

export const removeMemberService = async ({ itineraryId, userId }) => {
    return executeServiceRequest(
        () =>
            removeMemberApi({
                itineraryId,
                userId,
            }),
        "Failed to remove member.",
    );
};
