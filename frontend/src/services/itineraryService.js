import {
    deleteItineraryApi,
    getItinerariesApi,
    getItineraryTypesApi,
    getSavedItinerariesApi,
    getSharedItinerariesApi,
    getUserCreatedItinerariesApi,
    toggleSavedItineraryApi,
} from "@/api/itineraryApi";

export const getItineraryTypesService = async () => {
    try {
        const response = await getItineraryTypesApi();

        return {
            success: true,
            data: response.data,
        };
    } catch (err) {
        let message = "Failed to fetch itinerary types.";

        if (err.response) {
            if (err.response.status >= 500) {
                message = "Server error. Please try again later.";
            }
        }

        return {
            success: false,
            message,
        };
    }
};

export const getItinerariesService = async ({ search, type, sort, page, size }) => {
    try {
        const response = await getItinerariesApi({
            search,
            type,
            sort,
            page,
            size,
        });

        return {
            success: true,
            data: response.data,
        };
    } catch (err) {
        let message = "Failed to fetch itineraries.";

        if (err.response) {
            if (err.response.status >= 500) {
                message = "Server error. Please try again later.";
            }
        }

        return {
            success: false,
            message,
        };
    }
};

export const deleteItineraryService = async ({ itineraryId }) => {
    try {
        const response = await deleteItineraryApi({ itineraryId });

        return {
            success: true,
            data: response.data,
        };
    } catch (err) {
        let message = "Failed to delete itinerary.";

        if (err.response) {
            switch (err.response.status) {
                case 404:
                    message = "Itinerary not found.";
                    break;

                case 403:
                    message = "You are not authorized to delete this itinerary.";
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

export const toggleSavedItineraryService = async ({ userId, itineraryId }) => {
    try {
        const response = await toggleSavedItineraryApi({
            userId,
            itineraryId,
        });

        return {
            success: true,
            data: response.data,
        };
    } catch (err) {
        let message = "Failed to update saved itinerary.";

        if (err.response) {
            switch (err.response.status) {
                case 404:
                    message = "Itinerary not found.";
                    break;

                case 403:
                    message = "You are not authorized to perform this action.";
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

export const getUserCreatedItinerariesService = async ({ userId }) => {
    try {
        const response = await getUserCreatedItinerariesApi({ userId });

        return {
            success: true,
            data: response.data,
        };
    } catch (err) {
        let message = "Failed to fetch created itineraries.";

        if (err.response?.status >= 500) {
            message = "Server error. Please try again later.";
        }

        return {
            success: false,
            message,
        };
    }
};

export const getSharedItinerariesService = async ({ userId }) => {
    try {
        const response = await getSharedItinerariesApi({ userId });

        return {
            success: true,
            data: response.data,
        };
    } catch (err) {
        let message = "Failed to fetch shared itineraries.";

        if (err.response?.status >= 500) {
            message = "Server error. Please try again later.";
        }

        return {
            success: false,
            message,
        };
    }
};

export const getSavedItinerariesService = async ({ userId }) => {
    try {
        const response = await getSavedItinerariesApi({ userId });

        return {
            success: true,
            data: response.data,
        };
    } catch (err) {
        let message = "Failed to fetch saved itineraries.";

        if (err.response) {
            switch (err.response.status) {
                case 404:
                    message = "No saved itineraries found.";
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
