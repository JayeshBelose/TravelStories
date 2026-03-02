import { useState, useEffect } from "react";
import { Heart, Bookmark } from "lucide-react";
import api from "@/api/axiosConfig";

export default function ItineraryCard({ itinerary, onClick }) {
    const loggedInUser = JSON.parse(localStorage.getItem("user"));

    const [likes, setLikes] = useState(itinerary.likeCount);
    const [saves, setSaves] = useState(itinerary.saveCount);
    const [liked, setLiked] = useState(false);
    const [saved, setSaved] = useState(false);

    // Check initial like & save status
    useEffect(() => {
        if (!loggedInUser?.userId) return;

        const fetchStatus = async () => {
            try {
                const [likeRes, saveRes] = await Promise.all([
                    api.get(
                        `/users/${loggedInUser.userId}/likedItineraries/${itinerary.itineraryId}`,
                    ),
                    api.get(
                        `/users/${loggedInUser.userId}/savedItineraries/${itinerary.itineraryId}`,
                    ),
                ]);

                setLiked(likeRes.data);
                setSaved(saveRes.data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchStatus();
    }, [itinerary.itineraryId, loggedInUser?.userId]);

    // Like
    const handleLike = async e => {
        e.stopPropagation();

        if (!loggedInUser?.userId) return;

        try {
            await api.post(
                `/users/${loggedInUser.userId}/likedItineraries/${itinerary.itineraryId}`,
            );

            setLiked(prev => !prev);
            setLikes(prev => (liked ? prev - 1 : prev + 1));
        } catch (error) {
            console.error(error);
        }
    };

    // Save
    const handleSave = async e => {
        e.stopPropagation();

        if (!loggedInUser?.userId) return;

        try {
            await api.post(
                `/users/${loggedInUser.userId}/savedItineraries/${itinerary.itineraryId}`,
            );

            setSaved(prev => !prev);
            setSaves(prev => (saved ? prev - 1 : prev + 1));
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div
            onClick={() => onClick(itinerary)}
            className="relative rounded-2xl overflow-hidden cursor-pointer group shadow-md transition duration-300">
            {/* Thumbnail */}
            <img
                src={`${import.meta.env.VITE_API_BASE_URL}/itineraries/${itinerary.itineraryId}/thumbnail`}
                alt={itinerary.title}
                className="w-full h-80 object-cover group-hover:scale-105 transition duration-500"
            />

            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/0 transition" />
            {/* Itinerary Basic Details */}
            <div className="absolute bottom-5 left-5 right-5 text-white">
                <h3 className="text-xl font-semibold font-primary">{itinerary.title}</h3>

                <p className="text-sm opacity-90">{itinerary.place}</p>

                <p className="text-xs mt-1 opacity-80">
                    By {itinerary.createdBy || "Anonymous"}
                </p>

                <div className="flex items-center gap-6 mt-3 text-sm">
                    {/* Like */}
                    <button
                        onClick={handleLike}
                        className="flex items-center gap-1 hover:scale-105 transition">
                        <Heart
                            size={16}
                            className={liked ? "fill-red-500 text-red-500" : ""}
                        />
                        {likes}
                    </button>

                    {/* Save */}
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-1 hover:scale-105 transition">
                        <Bookmark
                            size={16}
                            className={saved ? "fill-yellow-400 text-yellow-400" : ""}
                        />
                        {saves}
                    </button>
                </div>
            </div>
        </div>
    );
}
