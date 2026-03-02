import { X } from "lucide-react";
import { useEffect, useState } from "react";
import api from "@/api/axiosConfig";

export default function UserItineraryListOverlay({
    open,
    onClose,
    user,
    onSelectItinerary,
}) {
    const [itineraries, setItineraries] = useState([]);

    // Fetch selected user's itineraries
    useEffect(() => {
        if (!open || !user?.userId) return;

        const fetchItineraries = async () => {
            try {
                const res = await api.get(`/itineraries/users/${user.userId}`);
                setItineraries(res.data || []);
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
            <div className="bg-white w-[900px] max-h-[85vh] overflow-y-auto rounded-2xl shadow-2xl ml-64">
                <div className="flex justify-between items-center p-6 bg-primary">
                    <div className="flex items-center gap-4">
                        <img
                            src={`${import.meta.env.VITE_API_BASE_URL}/users/${user.userId}/profilePicture`}
                            alt=""
                            className="w-12 h-12 rounded-full object-cover"
                        />
                        <h2 className="text-2xl text-white font-primary font-semibold">
                            {user.username}'s Itineraries
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
                                <div
                                    key={itinerary.itineraryId}
                                    onClick={() => onSelectItinerary(itinerary)}
                                    className="cursor-pointer rounded-xl overflow-hidden shadow hover:shadow-lg transition">
                                    <img
                                        src={`${import.meta.env.VITE_API_BASE_URL}/itineraries/${itinerary.itineraryId}/thumbnail`}
                                        alt=""
                                        className="w-full h-40 object-cover"
                                    />
                                    <div className="p-4">
                                        <h3 className="font-semibold">
                                            {itinerary.title}
                                        </h3>
                                    </div>
                                </div>
                            ))}
                    </div>
                )}
            </div>
        </div>
    );
}
