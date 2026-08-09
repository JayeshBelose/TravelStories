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
import { executeServiceRequest } from "./serviceUtils";

export const getDashboardStatsService = async () => {
    return executeServiceRequest(
        () => getDashboardStatsApi(),
        "Failed to fetch dashboard statistics.",
    );
};

export const getRecentItinerariesService = async () => {
    return executeServiceRequest(
        () => getRecentItinerariesApi(),
        "Failed to fetch recent itineraries.",
    );
};

export const getWeeklyActivityService = async () => {
    return executeServiceRequest(
        () => getWeeklyActivityApi(),
        "Failed to fetch weekly activity.",
    );
};

export const deleteItineraryByAdminService = async ({ itineraryId }) => {
    return executeServiceRequest(
        () =>
            deleteItineraryByAdminApi({
                itineraryId,
            }),
        "Failed to delete itinerary.",
    );
};

export const getAdminItinerariesService = async ({
    page,
    size,
    search,
    filter,
    type,
    sort,
}) => {
    return executeServiceRequest(
        () =>
            getAdminItinerariesApi({
                page,
                size,
                search,
                filter,
                type,
                sort,
            }),
        "Failed to fetch itineraries.",
    );
};

export const getItineraryTypesAdminService = async () => {
    return executeServiceRequest(
        () => getItineraryTypesAdminApi(),
        "Failed to fetch itinerary types.",
    );
};

export const addItineraryTypeService = async ({ typeName }) => {
    return executeServiceRequest(
        () =>
            addItineraryTypeApi({
                typeName,
            }),
        "Failed to add itinerary type.",
    );
};

export const deleteItineraryTypeService = async ({ typeId }) => {
    return executeServiceRequest(
        () =>
            deleteItineraryTypeApi({
                typeId,
            }),
        "Failed to delete itinerary type.",
    );
};

export const getAdminUsersService = async ({ page, size, search }) => {
    return executeServiceRequest(
        () =>
            getAdminUsersApi({
                page,
                size,
                search,
            }),
        "Failed to fetch users.",
    );
};

export const deleteUserByAdminService = async ({ userId }) => {
    return executeServiceRequest(
        () =>
            deleteUserByAdminApi({
                userId,
            }),
        "Failed to delete user.",
    );
};
