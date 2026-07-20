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

export const getItineraryTypesService = async () => {
    try {
        const response = await getItineraryTypesApi();

        return {
            success: true,
            data: response.data.data,
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
            data: response.data.data,
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
            data: response.data.data,
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
            data: response.data.data,
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
            data: response.data.data,
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
            data: response.data.data,
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
            data: response.data.data,
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

export const getItineraryDetailsService = async ({ itineraryId }) => {
    try {
        const response = await getItineraryDetailsApi({
            itineraryId,
        });

        return {
            success: true,
            data: response.data.data,
        };
    } catch (err) {
        let message = "Failed to fetch itinerary details.";

        if (err.response) {
            switch (err.response.status) {
                case 404:
                    message = "Itinerary not found.";
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

export const createItineraryService = async ({ userId, itinerary }) => {
    try {
        const response = await createItineraryApi({
            userId,
            itinerary,
        });

        return {
            success: true,
            data: response.data.data,
        };
    } catch (err) {
        let message = "Failed to create itinerary.";

        if (err.response) {
            switch (err.response.status) {
                case 400:
                    message = "Invalid itinerary details.";
                    break;

                case 403:
                    message = "You are not authorized to create itineraries.";
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

export const updateItineraryService = async ({ itineraryId, itinerary }) => {
    try {
        const response = await updateItineraryApi({
            itineraryId,
            itinerary,
        });

        return {
            success: true,
            data: response.data.data,
        };
    } catch (err) {
        let message = "Failed to update itinerary.";

        if (err.response) {
            switch (err.response.status) {
                case 404:
                    message = "Itinerary not found.";
                    break;

                case 403:
                    message = "You are not authorized to update this itinerary.";
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

export const uploadThumbnailService = async ({ itineraryId, formData }) => {
    try {
        const response = await uploadThumbnailApi({
            itineraryId,
            formData,
        });

        return {
            success: true,
            data: response.data.data,
        };
    } catch (err) {
        let message = "Failed to upload thumbnail.";

        if (err.response) {
            switch (err.response.status) {
                case 400:
                    message = "Invalid thumbnail.";
                    break;

                case 404:
                    message = "Itinerary not found.";
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

export const addMemberService = async ({ itineraryId, userId }) => {
    try {
        const response = await addMemberApi({
            itineraryId,
            userId,
        });

        return {
            success: true,
            data: response.data.data,
        };
    } catch (err) {
        let message = "Failed to add member.";

        if (err.response) {
            switch (err.response.status) {
                case 404:
                    message = "User or itinerary not found.";
                    break;

                case 409:
                    message = "User is already a member.";
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

export const removeMemberService = async ({ itineraryId, userId }) => {
    try {
        const response = await removeMemberApi({
            itineraryId,
            userId,
        });

        return {
            success: true,
            data: response.data.data,
        };
    } catch (err) {
        let message = "Failed to remove member.";

        if (err.response) {
            switch (err.response.status) {
                case 404:
                    message = "Member not found.";
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
