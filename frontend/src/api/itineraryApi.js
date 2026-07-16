import api from "./axios";

export const getItineraryTypesApi = () => api.get("/users/itineraries/types");

export const getItinerariesApi = ({ search, type, sort, page, size }) =>
    api.get("/itineraries", {
        params: {
            search,
            type,
            sort,
            page,
            size,
        },
    });

export const deleteItineraryApi = ({ itineraryId }) =>
    api.delete(`/itineraries/${itineraryId}`);

export const toggleSavedItineraryApi = ({ userId, itineraryId }) =>
    api.post(`/users/${userId}/savedItineraries/${itineraryId}`);

export const getUserCreatedItinerariesApi = ({ userId }) =>
    api.get(`/itineraries/users/${userId}`);

export const getSharedItinerariesApi = ({ userId }) =>
    api.get(`/itineraries/${userId}/membership`);

export const getSavedItinerariesApi = ({ userId }) =>
    api.get(`/itineraries/${userId}/saved`);

export const getItineraryDetailsApi = ({ itineraryId }) =>
    api.get(`/itineraries/${itineraryId}`);

export const createItineraryApi = ({ userId, itinerary }) =>
    api.post(`/itineraries/users/${userId}`, itinerary);

export const updateItineraryApi = ({ itineraryId, itinerary }) =>
    api.put(`/itineraries/${itineraryId}`, itinerary);

export const uploadThumbnailApi = ({ itineraryId, formData }) =>
    api.post(`/itineraries/${itineraryId}/thumbnail`, formData);

export const addMemberApi = ({ itineraryId, userId }) =>
    api.post(`/itineraries/members/${itineraryId}/${userId}`);

export const removeMemberApi = ({ itineraryId, userId }) =>
    api.delete(`/itineraries/members/${itineraryId}/${userId}`);
