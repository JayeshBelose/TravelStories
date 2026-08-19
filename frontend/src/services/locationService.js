import {
    createLocationApi,
    deleteLocationApi,
    getDayLocationsApi,
    updateLocationApi,
} from "@/api/locationApi";
import { executeServiceRequest } from "./serviceUtils";

export const getDayLocationsService = async ({ dayId }) => {
    return executeServiceRequest(
        () =>
            getDayLocationsApi({
                dayId,
            }),
        "Failed to fetch day locations.",
    );
};

export const createLocationService = async ({ dayId, location }) => {
    return executeServiceRequest(
        () =>
            createLocationApi({
                dayId,
                location,
            }),
        "Failed to create location.",
    );
};

export const updateLocationService = async ({
    dayId,
    locationId,
    location,
}) => {
    return executeServiceRequest(
        () =>
            updateLocationApi({
                dayId,
                locationId,
                location,
            }),
        "Failed to update location.",
    );
};

export const deleteLocationService = async ({ dayId, locationId }) => {
    return executeServiceRequest(
        () =>
            deleteLocationApi({
                dayId,
                locationId,
            }),
        "Failed to delete location.",
    );
};
