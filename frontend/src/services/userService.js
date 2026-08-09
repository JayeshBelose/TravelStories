import {
    deleteUserAccountApi,
    followUserApi,
    getFollowersApi,
    getFollowingApi,
    getLikedStatusApi,
    getSavedStatusApi,
    getUserByUsernameApi,
    searchUsersApi,
    toggleLikeItineraryApi,
    toggleSaveItineraryApi,
    unfollowUserApi,
    updateUserProfileApi,
    uploadProfilePictureApi,
} from "@/api/userApi";
import { executeServiceRequest } from "./serviceUtils";

export const uploadProfilePictureService = async ({ userId, formData }) => {
    return executeServiceRequest(
        () =>
            uploadProfilePictureApi({
                userId,
                formData,
            }),
        "Image upload failed.",
    );
};

export const updateUserProfileService = async ({ userId, username, bio }) => {
    return executeServiceRequest(
        () =>
            updateUserProfileApi({
                userId,
                username,
                bio,
            }),
        "Failed to update profile.",
    );
};

export const deleteUserAccountService = async ({ userId }) => {
    return executeServiceRequest(
        () => deleteUserAccountApi({ userId }),
        "Failed to delete account.",
    );
};

export const getFollowingService = async ({ userId }) => {
    return executeServiceRequest(
        () => getFollowingApi({ userId }),
        "Failed to fetch following list.",
    );
};

export const getFollowersService = async ({ userId }) => {
    return executeServiceRequest(
        () => getFollowersApi({ userId }),
        "Failed to fetch followers.",
    );
};

export const searchUsersService = async ({ query }) => {
    return executeServiceRequest(
        () => searchUsersApi({ query }),
        "Failed to search users.",
    );
};

export const followUserService = async ({ followerId, followingId }) => {
    return executeServiceRequest(
        () =>
            followUserApi({
                followerId,
                followingId,
            }),
        "Failed to follow user.",
    );
};

export const unfollowUserService = async ({ followerId, followingId }) => {
    return executeServiceRequest(
        () =>
            unfollowUserApi({
                followerId,
                followingId,
            }),
        "Failed to unfollow user.",
    );
};

export const getLikedStatusService = async ({ userId, itineraryId }) => {
    return executeServiceRequest(
        () =>
            getLikedStatusApi({
                userId,
                itineraryId,
            }),
        "Failed to fetch like status.",
    );
};

export const getSavedStatusService = async ({ userId, itineraryId }) => {
    return executeServiceRequest(
        () =>
            getSavedStatusApi({
                userId,
                itineraryId,
            }),
        "Failed to fetch saved status.",
    );
};

export const toggleLikeItineraryService = async ({ userId, itineraryId }) => {
    return executeServiceRequest(
        () =>
            toggleLikeItineraryApi({
                userId,
                itineraryId,
            }),
        "Failed to update like status.",
    );
};

export const toggleSaveItineraryService = async ({ userId, itineraryId }) => {
    return executeServiceRequest(
        () =>
            toggleSaveItineraryApi({
                userId,
                itineraryId,
            }),
        "Failed to update saved status.",
    );
};

export const getUserByUsernameService = async ({ username }) => {
    return executeServiceRequest(
        () =>
            getUserByUsernameApi({
                username,
            }),
        "Failed to fetch user.",
    );
};
