import api from "./axios";

export const getDashboardStatsApi = () => api.get("/admin/stats");

export const getRecentItinerariesApi = () => api.get("/admin/itineraries/recent");

export const getWeeklyActivityApi = () => api.get("/admin/activity/weekly");

export const deleteItineraryByAdminApi = ({ itineraryId }) =>
    api.delete(`/admin/itineraries/${itineraryId}`);

export const getAdminItinerariesApi = ({ page, size, search, filter, type, sort }) =>
    api.get("/admin/itineraries", {
        params: {
            page,
            size,
            search,
            filter,
            type,
            sort,
        },
    });

export const getItineraryTypesAdminApi = () => api.get("/admin/itineraries/types");

export const addItineraryTypeApi = ({ typeName }) =>
    api.post(`/admin/itineraries/types/${typeName}`);

export const deleteItineraryTypeApi = ({ typeId }) =>
    api.delete(`/admin/itineraries/types/${typeId}`);

export const getAdminUsersApi = ({ page, size, search }) =>
    api.get("/admin/users", {
        params: {
            page,
            size,
            search,
        },
    });

export const deleteUserByAdminApi = ({ userId }) => api.delete(`/admin/users/${userId}`);
