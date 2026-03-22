import { X } from "lucide-react";
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

    // Fetch selected user's itineraries
    useEffect(() => {
        if (!open || !user?.userId) return;

        const fetchItineraries = async () => {
            try {
                if (currentUser?.role === "admin") {
                    const res = await api.get(`/itineraries/users/${user.userId}`);
                    setItineraries(res.data || []);
                } else {
                    const res = await api.get(`/itineraries/users/${user.userId}`);
                    setItineraries((res.data || []).filter(i => i?.public === true));
                }
            } catch (err) {
                console.error("Failed to fetch itineraries", err);
                setItineraries([]);
            }
        };

        fetchItineraries();
    }, [user, open]);

    // Avoids opening overlay from if user is not selected
    if (!open || !user) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center">
            <div className="bg-white w-[75vw] max-h-[85vh] overflow-y-auto rounded-2xl shadow-2xl ml-64">
                <div className="flex justify-between items-center p-6 bg-primary">
                    <div className="flex items-center gap-4">
                        <Avatar>
                            <AvatarImage
                                src={`${import.meta.env.VITE_API_BASE_URL}/users/${user.userId}/profilePicture`}
                                alt={user?.username}
                            />
                            <AvatarFallback>
                                {user?.username?.[0]?.toUpperCase() || "U"}
                            </AvatarFallback>
                        </Avatar>
                        <h2 className="text-2xl text-white font-primary font-semibold">
                            {user.username}'s ( {itineraries.length} ) Itineraries
                        </h2>
                    </div>

                    <button onClick={onClose}>
                        <X
                            size={24}
                            className="text-white hover:scale-110 hover:cursor-pointer"
                        />
                    </button>
                </div>

                {/* List Of Itineraries */}
                {!Array.isArray(itineraries) || itineraries.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">
                        No itineraries yet
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-6 p-6">
                        {Array.isArray(itineraries) &&
                            itineraries.map(itinerary => (
                                <ItineraryCard
                                    key={itinerary.itineraryId}
                                    itinerary={itinerary}
                                    onClick={setSelectedItinerary}
                                />
                            ))}
                    </div>
                )}
            </div>

            {/* Overlay Component */}
            <ItineraryOverlay
                itinerary={selectedItinerary}
                onClose={() => setSelectedItinerary(null)}
            />
        </div>
    );
}
