import {
    createDayApi,
    deleteDayApi,
    getItineraryDaysApi,
    updateDayApi,
} from "@/api/dayApi";
import { executeServiceRequest } from "./serviceUtils";

export const getItineraryDaysService = async ({ itineraryId }) => {
    return executeServiceRequest(
        () =>
            getItineraryDaysApi({
                itineraryId,
            }),
        "Failed to fetch itinerary days.",
    );
};

export const createDayService = async ({ itineraryId, day }) => {
    return executeServiceRequest(
        () =>
            createDayApi({
                itineraryId,
                day,
            }),
        "Failed to create day.",
    );
};

export const updateDayService = async ({ itineraryId, dayId, day }) => {
    return executeServiceRequest(
        () =>
            updateDayApi({
                itineraryId,
                dayId,
                day,
            }),
        "Failed to update day.",
    );
};

export const deleteDayService = async ({ itineraryId, dayId }) => {
    return executeServiceRequest(
        () =>
            deleteDayApi({
                itineraryId,
                dayId,
            }),
        "Failed to delete day.",
    );
};
