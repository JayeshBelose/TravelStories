import { useState, useEffect } from "react";
import { Heart, Bookmark, MapPin, User } from "lucide-react";
import ItineraryThumbnail from "./ItineraryThumbnail";
import {
    getLikedStatusService,
    getSavedStatusService,
    toggleLikeItineraryService,
    toggleSaveItineraryService,
} from "@/services/userService";

export default function ItineraryCard({ itinerary, onClick }) {
    const loggedInUser = JSON.parse(sessionStorage.getItem("user"));

    const [likes, setLikes] = useState(itinerary.likeCount);
    const [saves, setSaves] = useState(itinerary.saveCount);
    const [liked, setLiked] = useState(false);
    const [saved, setSaved] = useState(false);

    // Fetching itinerary likes and saves
    useEffect(() => {
        if (!loggedInUser?.userId) return;

        const fetchStatus = async () => {
            const [likeResult, saveResult] = await Promise.all([
                getLikedStatusService({
                    userId: loggedInUser.userId,
                    itineraryId: itinerary.itineraryId,
                }),
                getSavedStatusService({
                    userId: loggedInUser.userId,
                    itineraryId: itinerary.itineraryId,
                }),
            ]);

            if (likeResult.success) {
                setLiked(likeResult.data);
            } else {
                console.error(likeResult.message);
            }

            if (saveResult.success) {
                setSaved(saveResult.data);
            } else {
                console.error(saveResult.message);
            }
        };

        fetchStatus();
    }, [itinerary.itineraryId, loggedInUser?.userId]);

    // Like and save functions
    const handleLike = async e => {
        e.stopPropagation();

        if (!loggedInUser?.userId) return;

        const result = await toggleLikeItineraryService({
            userId: loggedInUser.userId,
            itineraryId: itinerary.itineraryId,
        });

        if (result.success) {
            setLiked(prev => !prev);
            setLikes(prev => (liked ? prev - 1 : prev + 1));
        } else {
            console.error(result.message);
        }
    };

    const handleSave = async e => {
        e.stopPropagation();

        if (!loggedInUser?.userId) return;
        if (loggedInUser.username === itinerary.createdBy) return;

        const result = await toggleSaveItineraryService({
            userId: loggedInUser.userId,
            itineraryId: itinerary.itineraryId,
        });

        if (result.success) {
            setSaved(prev => !prev);
            setSaves(prev => (saved ? prev - 1 : prev + 1));
        } else {
            console.error(result.message);
        }
    };

    const isOwner = loggedInUser?.username === itinerary.createdBy;

    return (
        <div
            onClick={() => onClick(itinerary)}
            className="group relative rounded-2xl overflow-hidden cursor-pointer bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 flex flex-col">
            {/* Thumbnail */}
            <div className="relative h-48 overflow-hidden flex-shrink-0">
                <ItineraryThumbnail
                    itineraryId={itinerary.itineraryId}
                    alt={itinerary.title}
                    imgClassName="transition-transform duration-500 group-hover:scale-105"
                />

                {/* Visibility */}
                <div className="absolute top-3 left-3">
                    <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full
                            ${
                                itinerary.public
                                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 backdrop-blur-sm"
                                    : "bg-red-500/15 text-red-400 border border-red-400/25 backdrop-blur-sm"
                            }`}>
                        {itinerary.public ? "Public" : "Private"}
                    </span>
                </div>

                {/* Type */}
                {itinerary.type && (
                    <div className="absolute top-3 right-3">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/15 text-white border border-white/25 backdrop-blur-sm">
                            {itinerary.type}
                        </span>
                    </div>
                )}
            </div>

            {/* Card Body */}
            <div className="flex flex-col flex-1 p-4 gap-2">
                {/* Title */}
                <h3 className="text-sm font-semibold text-gray-900 font-primary leading-snug line-clamp-2">
                    {itinerary.title}
                </h3>

                {/* Place */}
                <p className="inline-flex items-center gap-1 text-xs text-gray-400">
                    <MapPin size={11} className="flex-shrink-0" />
                    <span className="truncate">{itinerary.place}</span>
                </p>

                {/* Creator */}
                <p className="inline-flex items-center gap-1 text-xs text-gray-400">
                    <User size={11} className="flex-shrink-0" />
                    <span className="truncate">{itinerary.createdBy || "Anonymous"}</span>
                </p>

                {/* Divider + Actions */}
                <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                    {/* Dates */}
                    {itinerary.startDate && (
                        <span className="text-[10px] text-gray-300 font-medium">
                            {itinerary.startDate} — {itinerary.endDate}
                        </span>
                    )}

                    {/* Like & Save */}
                    <div className="flex items-center gap-3 ml-auto">
                        <button
                            onClick={handleLike}
                            className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors cursor-pointer">
                            <Heart
                                size={14}
                                className={`transition-colors ${liked ? "fill-red-500 text-red-500" : ""}`}
                            />
                            <span className={liked ? "text-red-500" : ""}>{likes}</span>
                        </button>

                        <button
                            onClick={handleSave}
                            disabled={isOwner}
                            className={`flex items-center gap-1 text-xs transition-colors
                                ${
                                    isOwner
                                        ? "text-gray-200 cursor-default"
                                        : "text-gray-400 hover:text-yellow-500 cursor-pointer"
                                }`}>
                            <Bookmark
                                size={14}
                                className={`transition-colors ${saved ? "fill-yellow-400 text-yellow-400" : ""}`}
                            />
                            <span className={saved ? "text-yellow-400" : ""}>
                                {saves}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
