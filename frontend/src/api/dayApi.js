import api from "./axios";

export const getItineraryDaysApi = ({ itineraryId }) =>
    api.get(`/itineraries/${itineraryId}/days`);

export const createDayApi = ({ itineraryId, day }) =>
    api.post(`/itineraries/${itineraryId}/days`, day);

export const updateDayApi = ({ itineraryId, dayId, day }) =>
    api.put(`/itineraries/${itineraryId}/days/${dayId}`, day);

export const deleteDayApi = ({ itineraryId, dayId }) =>
    api.delete(`/itineraries/${itineraryId}/days/${dayId}`);
