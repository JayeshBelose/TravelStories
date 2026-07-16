import api from "./axios";

export const getLocationImagesApi = ({ locationId }) =>
    api.get(`/itineraries/days/locations/${locationId}/images`);

export const uploadLocationImageApi = ({ locationId, formData }) =>
    api.post(`/itineraries/days/locations/${locationId}/images`, formData);

export const deleteLocationImageApi = ({ imageId }) =>
    api.delete(`/itineraries/days/locations/images/${imageId}`);
