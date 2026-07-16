import {
    createLocationApi,
    deleteLocationApi,
    getDayLocationsApi,
    updateLocationApi,
} from "@/api/locationApi";

export const getDayLocationsService = async ({ dayId }) => {
    try {
        const response = await getDayLocationsApi({
            dayId,
        });

        return {
            success: true,
            data: response.data,
        };
    } catch (err) {
        let message = "Failed to fetch day locations.";

        if (err.response) {
            switch (err.response.status) {
                case 404:
                    message = "No locations found.";
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

export const createLocationService = async ({ dayId, location }) => {
    try {
        const response = await createLocationApi({
            dayId,
            location,
        });

        return {
            success: true,
            data: response.data,
        };
    } catch (err) {
        let message = "Failed to create location.";

        if (err.response) {
            switch (err.response.status) {
                case 400:
                    message = "Invalid location details.";
                    break;

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

export const updateLocationService = async ({ dayId, locationId, location }) => {
    try {
        const response = await updateLocationApi({
            dayId,
            locationId,
            location,
        });

        return {
            success: true,
            data: response.data,
        };
    } catch (err) {
        let message = "Failed to update location.";

        if (err.response) {
            switch (err.response.status) {
                case 404:
                    message = "Location not found.";
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

export const deleteLocationService = async ({ locationId }) => {
    try {
        const response = await deleteLocationApi({
            locationId,
        });

        return {
            success: true,
            data: response.data,
        };
    } catch (err) {
        let message = "Failed to delete location.";

        if (err.response) {
            switch (err.response.status) {
                case 404:
                    message = "Location not found.";
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
