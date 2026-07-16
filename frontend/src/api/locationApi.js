import api from "./axios";

export const getDayLocationsApi = ({ dayId }) =>
    api.get(`/itineraries/days/${dayId}/locations`);

export const createLocationApi = ({ dayId, location }) =>
    api.post(`/itineraries/days/${dayId}/locations`, location);

export const updateLocationApi = ({ dayId, locationId, location }) =>
    api.put(`/itineraries/days/${dayId}/locations/${locationId}`, location);

export const deleteLocationApi = ({ locationId }) =>
    api.delete(`/itineraries/days/locations/${locationId}`);
