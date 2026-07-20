import {
    createDayApi,
    deleteDayApi,
    getItineraryDaysApi,
    updateDayApi,
} from "@/api/dayApi";

export const getItineraryDaysService = async ({ itineraryId }) => {
    try {
        const response = await getItineraryDaysApi({
            itineraryId,
        });

        return {
            success: true,
            data: response.data.data,
        };
    } catch (err) {
        let message = "Failed to fetch itinerary days.";

        if (err.response) {
            switch (err.response.status) {
                case 404:
                    message = "No itinerary days found.";
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

export const createDayService = async ({ itineraryId, day }) => {
    try {
        const response = await createDayApi({
            itineraryId,
            day,
        });

        return {
            success: true,
            data: response.data.data,
        };
    } catch (err) {
        let message = "Failed to create day.";

        if (err.response) {
            switch (err.response.status) {
                case 400:
                    message = "Invalid day details.";
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

export const updateDayService = async ({ itineraryId, dayId, day }) => {
    try {
        const response = await updateDayApi({
            itineraryId,
            dayId,
            day,
        });

        return {
            success: true,
            data: response.data.data,
        };
    } catch (err) {
        let message = "Failed to update day.";

        if (err.response) {
            switch (err.response.status) {
                case 404:
                    message = "Day not found.";
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

export const deleteDayService = async ({ itineraryId, dayId }) => {
    try {
        const response = await deleteDayApi({
            itineraryId,
            dayId,
        });

        return {
            success: true,
            data: response.data.data,
        };
    } catch (err) {
        let message = "Failed to delete day.";

        if (err.response) {
            switch (err.response.status) {
                case 404:
                    message = "Day not found.";
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
