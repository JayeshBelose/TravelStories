import {
    deleteUserAccountApi,
    followUserApi,
    getFollowersApi,
    getFollowingApi,
    searchUsersApi,
    unfollowUserApi,
    updateUserProfileApi,
    uploadProfilePictureApi,
} from "@/api/userApi";

export const uploadProfilePictureService = async ({ userId, formData }) => {
    try {
        const response = await uploadProfilePictureApi({
            userId,
            formData,
        });

        return {
            success: true,
            data: response.data,
        };
    } catch (err) {
        let message = "Image upload failed.";

        if (err.response) {
            switch (err.response.status) {
                case 400:
                    message = "Please select a valid image.";
                    break;

                case 413:
                    message = "Image is too large.";
                    break;

                case 404:
                    message = "User not found.";
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

export const updateUserProfileService = async ({ userId, username, bio }) => {
    try {
        const response = await updateUserProfileApi({
            userId,
            username,
            bio,
        });

        return {
            success: true,
            data: response.data,
        };
    } catch (err) {
        let message = "Failed to update profile.";

        if (err.response) {
            switch (err.response.status) {
                case 400:
                    message = "Please enter valid profile details.";
                    break;

                case 404:
                    message = "User not found.";
                    break;

                case 409:
                    message = "Username is already taken.";
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

export const deleteUserAccountService = async ({ userId }) => {
    try {
        const response = await deleteUserAccountApi({ userId });

        return {
            success: true,
            data: response.data,
        };
    } catch (err) {
        let message = "Failed to delete account.";

        if (err.response) {
            switch (err.response.status) {
                case 404:
                    message = "User not found.";
                    break;

                case 403:
                    message = "You are not authorized to delete this account.";
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

export const getFollowingService = async ({ userId }) => {
    try {
        const response = await getFollowingApi({ userId });

        return {
            success: true,
            data: response.data,
        };
    } catch (err) {
        let message = "Failed to fetch following list.";

        if (err.response?.status >= 500) {
            message = "Server error. Please try again later.";
        }

        return {
            success: false,
            message,
        };
    }
};

export const getFollowersService = async ({ userId }) => {
    try {
        const response = await getFollowersApi({ userId });

        return {
            success: true,
            data: response.data,
        };
    } catch (err) {
        let message = "Failed to fetch followers.";

        if (err.response?.status >= 500) {
            message = "Server error. Please try again later.";
        }

        return {
            success: false,
            message,
        };
    }
};

export const searchUsersService = async ({ query }) => {
    try {
        const response = await searchUsersApi({ query });

        return {
            success: true,
            data: response.data,
        };
    } catch (err) {
        let message = "Failed to search users.";

        if (err.response) {
            switch (err.response.status) {
                case 400:
                    message = "Invalid search query.";
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

export const followUserService = async ({ followerId, followingId }) => {
    try {
        const response = await followUserApi({
            followerId,
            followingId,
        });

        return {
            success: true,
            data: response.data,
        };
    } catch (err) {
        let message = "Failed to follow user.";

        if (err.response?.status >= 500) {
            message = "Server error. Please try again later.";
        }

        return {
            success: false,
            message,
        };
    }
};

export const unfollowUserService = async ({ followerId, followingId }) => {
    try {
        const response = await unfollowUserApi({
            followerId,
            followingId,
        });

        return {
            success: true,
            data: response.data,
        };
    } catch (err) {
        let message = "Failed to unfollow user.";

        if (err.response?.status >= 500) {
            message = "Server error. Please try again later.";
        }

        return {
            success: false,
            message,
        };
    }
};
