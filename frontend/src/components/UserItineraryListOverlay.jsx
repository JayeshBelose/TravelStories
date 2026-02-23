import { X } from "lucide-react";

export default function UserItineraryListOverlay({
    open,
    onClose,
    user,
    onSelectItinerary,
}) {
    if (!open || !user) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center">
            <div className="bg-white w-[900px] max-h-[85vh] overflow-y-auto rounded-2xl shadow-2xl">
                <div className="flex justify-between items-center p-6 border-b">
                    <div className="flex items-center gap-4">
                        <img
                            src={user.profilePic}
                            alt=""
                            className="w-12 h-12 rounded-full object-cover"
                        />
                        <h2 className="text-2xl font-bold">
                            {user.username}'s Itineraries
                        </h2>
                    </div>

                    <button onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                {user.itineraries.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">
                        No itineraries yet
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-6 p-6">
                        {user.itineraries.map(itinerary => (
                            <div
                                key={itinerary.id}
                                onClick={() => onSelectItinerary(itinerary)}
                                className="cursor-pointer rounded-xl overflow-hidden shadow hover:shadow-lg transition">
                                <img
                                    src={itinerary.thumbnail}
                                    alt=""
                                    className="w-full h-40 object-cover"
                                />
                                <div className="p-4">
                                    <h3 className="font-semibold">{itinerary.title}</h3>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
