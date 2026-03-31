import { X, MapIcon } from "lucide-react";
import { useEffect, useState } from "react";
import api from "@/api/axiosConfig";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import ItineraryCard from "./ItineraryCard";
import ItineraryOverlay from "./ItineraryOverlay";

export default function UserItineraryListOverlay({
    open,
    onClose,
    user,
    onSelectItinerary,
}) {
    const [itineraries, setItineraries] = useState([]);
    const [selectedItinerary, setSelectedItinerary] = useState(null);

    const currentUser = JSON.parse(localStorage.getItem("user"));

    // Fetching all user itineraries
    useEffect(() => {
        if (!open || !user?.userId) return;

        const fetchItineraries = async () => {
            try {
                const res = await api.get(`/itineraries/users/${user.userId}`);
                const data = res.data || [];
                setItineraries(
                    currentUser?.role === "admin"
                        ? data
                        : data.filter(i => i?.public === true),
                );
            } catch (err) {
                console.error("Failed to fetch itineraries", err);
                setItineraries([]);
            }
        };

        fetchItineraries();
    }, [user, open]);

    if (!open || !user) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
                onClick={onClose}>
                <div
                    className="bg-white w-full max-w-5xl max-h-[88vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                    onClick={e => e.stopPropagation()}>
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
                        <div className="flex items-center gap-3">
                            {/* Avatar */}
                            <Avatar className="w-10 h-10 ring-2 ring-gray-100">
                                <AvatarImage
                                    src={`${import.meta.env.VITE_API_BASE_URL}/users/${user.userId}/profilePicture`}
                                    alt={user?.username}
                                />
                                <AvatarFallback className="bg-gray-900 text-white text-sm font-semibold">
                                    {user?.username?.[0]?.toUpperCase() || "U"}
                                </AvatarFallback>
                            </Avatar>

                            {/* Name + Itinerary Count */}
                            <div>
                                <h2 className="text-base font-semibold text-gray-900 font-primary leading-tight">
                                    {user.username}
                                </h2>
                                <p className="text-xs text-gray-400 font-medium">
                                    {itineraries.length}{" "}
                                    {itineraries.length === 1
                                        ? "itinerary"
                                        : "itineraries"}
                                </p>
                            </div>
                        </div>

                        {/* Close */}
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                            aria-label="Close">
                            <X size={17} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto">
                        {itineraries.length === 0 ? (
                            // Empty state
                            <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
                                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                                    <MapIcon size={22} className="text-gray-300" />
                                </div>
                                <p className="text-sm font-medium">No itineraries yet</p>
                                <p className="text-xs text-gray-300">
                                    {user.username} hasn't shared any trips.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 p-6">
                                {itineraries.map(itinerary => (
                                    <ItineraryCard
                                        key={itinerary.itineraryId}
                                        itinerary={itinerary}
                                        onClick={setSelectedItinerary}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Itinerary Detail Overlay */}
            <ItineraryOverlay
                itinerary={selectedItinerary}
                onClose={() => setSelectedItinerary(null)}
            />
        </>
    );
}
