import {
    addItineraryTypeApi,
    deleteItineraryByAdminApi,
    deleteItineraryTypeApi,
    deleteUserByAdminApi,
    getAdminItinerariesApi,
    getAdminUsersApi,
    getDashboardStatsApi,
    getItineraryTypesAdminApi,
    getRecentItinerariesApi,
    getWeeklyActivityApi,
} from "@/api/adminApi";

export const getDashboardStatsService = async () => {
    try {
        const response = await getDashboardStatsApi();

        return {
            success: true,
            data: response.data,
        };
    } catch (err) {
        let message = "Failed to fetch dashboard statistics.";

        if (err.response?.status >= 500) {
            message = "Server error. Please try again later.";
        }

        return {
            success: false,
            message,
        };
    }
};

export const getRecentItinerariesService = async () => {
    try {
        const response = await getRecentItinerariesApi();

        return {
            success: true,
            data: response.data,
        };
    } catch (err) {
        let message = "Failed to fetch recent itineraries.";

        if (err.response?.status >= 500) {
            message = "Server error. Please try again later.";
        }

        return {
            success: false,
            message,
        };
    }
};

export const getWeeklyActivityService = async () => {
    try {
        const response = await getWeeklyActivityApi();

        return {
            success: true,
            data: response.data,
        };
    } catch (err) {
        let message = "Failed to fetch weekly activity.";

        if (err.response?.status >= 500) {
            message = "Server error. Please try again later.";
        }

        return {
            success: false,
            message,
        };
    }
};

export const deleteItineraryByAdminService = async ({ itineraryId }) => {
    try {
        const response = await deleteItineraryByAdminApi({
            itineraryId,
        });

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

export const getAdminItinerariesService = async ({
    page,
    size,
    search,
    filter,
    type,
    sort,
}) => {
    try {
        const response = await getAdminItinerariesApi({
            page,
            size,
            search,
            filter,
            type,
            sort,
        });

        return {
            success: true,
            data: response.data,
        };
    } catch (err) {
        let message = "Failed to fetch itineraries.";

        if (err.response) {
            switch (err.response.status) {
                case 400:
                    message = "Invalid request parameters.";
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

export const getItineraryTypesAdminService = async () => {
    try {
        const response = await getItineraryTypesAdminApi();

        return {
            success: true,
            data: response.data,
        };
    } catch (err) {
        let message = "Failed to fetch itinerary types.";

        if (err.response) {
            switch (err.response.status) {
                case 404:
                    message = "No itinerary types found.";
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

export const addItineraryTypeService = async ({ typeName }) => {
    try {
        const response = await addItineraryTypeApi({
            typeName,
        });

        return {
            success: true,
            data: response.data,
        };
    } catch (err) {
        let message = "Failed to add itinerary type.";

        if (err.response) {
            switch (err.response.status) {
                case 400:
                    message = "Invalid type name.";
                    break;

                case 409:
                    message = "Type already exists.";
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

export const deleteItineraryTypeService = async ({ typeId }) => {
    try {
        const response = await deleteItineraryTypeApi({
            typeId,
        });

        return {
            success: true,
            data: response.data,
        };
    } catch (err) {
        let message = "Failed to delete itinerary type.";

        if (err.response) {
            switch (err.response.status) {
                case 404:
                    message = "Type not found.";
                    break;

                case 409:
                    message = "This type is currently in use and cannot be deleted.";
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

export const getAdminUsersService = async ({ page, size, search }) => {
    try {
        const response = await getAdminUsersApi({
            page,
            size,
            search,
        });

        return {
            success: true,
            data: response.data,
        };
    } catch (err) {
        let message = "Failed to fetch users.";

        if (err.response) {
            switch (err.response.status) {
                case 400:
                    message = "Invalid request parameters.";
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

export const deleteUserByAdminService = async ({ userId }) => {
    try {
        const response = await deleteUserByAdminApi({
            userId,
        });

        return {
            success: true,
            data: response.data,
        };
    } catch (err) {
        let message = "Failed to delete user.";

        if (err.response) {
            switch (err.response.status) {
                case 404:
                    message = "User not found.";
                    break;

                case 403:
                    message = "You are not authorized to delete this user.";
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
