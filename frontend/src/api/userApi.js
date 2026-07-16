import api from "./axios";

export const uploadProfilePictureApi = ({ userId, formData }) =>
    api.post(`/users/${userId}/profilePicture`, formData);

export const updateUserProfileApi = ({ userId, username, bio }) =>
    api.put(`/users/${userId}`, {
        username,
        bio,
    });

export const deleteUserAccountApi = ({ userId }) => api.delete(`/users/${userId}`);

export const getFollowingApi = ({ userId }) =>
    api.get(`/users/community/${userId}/following`);

export const getFollowersApi = ({ userId }) =>
    api.get(`/users/community/${userId}/followers`);

export const searchUsersApi = ({ query }) =>
    api.get("/users/search", {
        params: {
            query,
        },
    });

export const followUserApi = ({ followerId, followingId }) =>
    api.post("/users/community", {
        followerId,
        followingId,
    });

export const unfollowUserApi = ({ followerId, followingId }) =>
    api.delete("/users/community", {
        data: {
            followerId,
            followingId,
        },
    });

export const getLikedStatusApi = ({ userId, itineraryId }) =>
    api.get(`/users/${userId}/likedItineraries/${itineraryId}`);

export const getSavedStatusApi = ({ userId, itineraryId }) =>
    api.get(`/users/${userId}/savedItineraries/${itineraryId}`);

export const toggleLikeItineraryApi = ({ userId, itineraryId }) =>
    api.post(`/users/${userId}/likedItineraries/${itineraryId}`);

export const toggleSaveItineraryApi = ({ userId, itineraryId }) =>
    api.post(`/users/${userId}/savedItineraries/${itineraryId}`);

export const getUserByUsernameApi = ({ username }) =>
    api.get(`/users/username/${username}`);
