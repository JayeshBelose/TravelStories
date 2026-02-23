import { X } from "lucide-react";

export default function ItineraryOverlay({ itinerary, onClose }) {
    if (!itinerary) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-start justify-center overflow-y-auto p-6 z-50">
            <div className="bg-white w-11/12 max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-y-auto relative">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 bg-white p-2 rounded-full shadow z-10">
                    <X size={18} />
                </button>

                {/* Thumbnail (NOT sticky anymore) */}
                <img
                    src={itinerary.thumbnail}
                    alt={itinerary.title}
                    className="w-full h-72 object-cover"
                />

                {/* Content */}
                <div className="p-8">
                    {/* Title */}
                    <h2 className="text-3xl font-bold mb-2 font-primary">
                        {itinerary.title}
                    </h2>

                    {/* Location */}
                    <p className="text-gray-500 mb-2">{itinerary.location}</p>

                    {/* Dates */}
                    <p className="text-sm text-gray-600 mb-2">
                        {itinerary.startDate} - {itinerary.endDate}
                    </p>
                    {/* Itinerary Type */}
                    <div className="text-sm text-gray-900 mb-2 bg-secondary w-fit py-1 px-2 rounded-2xl">
                        {itinerary.type}
                    </div>

                    {/* Creator */}
                    <p className="text-sm text-gray-700 mb-8">
                        Created by{" "}
                        <span className="font-semibold">{itinerary.creator}</span>
                    </p>

                    {/* Days Section */}
                    {itinerary.days?.length > 0 && (
                        <div className="space-y-8">
                            {itinerary.days.map((day, index) => (
                                <div key={index} className="border-t pt-6 pb-6">
                                    {/* Day Header */}
                                    <h4 className="text-xl font-semibold mb-2">
                                        Day {day.dayNumber}
                                    </h4>

                                    {/* Day Description */}
                                    {day.description && (
                                        <p className="text-gray-600 mb-4">
                                            {day.description}
                                        </p>
                                    )}

                                    {/* Locations */}
                                    {day.locations?.length > 0 && (
                                        <div className="space-y-4">
                                            {day.locations.map((location, i) => (
                                                <div
                                                    key={i}
                                                    className="bg-gray-50 p-4 rounded-lg">
                                                    <h5 className="font-semibold">
                                                        {location.name}
                                                    </h5>

                                                    <p className="text-sm text-gray-500 mb-2">
                                                        {location.address}
                                                    </p>

                                                    {/* Location Images */}
                                                    {location.images?.length > 0 && (
                                                        <div className="flex gap-3 flex-wrap mt-2">
                                                            {location.images.map(
                                                                (img, idx) => (
                                                                    <img
                                                                        key={idx}
                                                                        src={img}
                                                                        alt="location"
                                                                        className="w-24 h-24 object-cover rounded-lg"
                                                                    />
                                                                ),
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Members Section */}
                    {itinerary.members?.length > 0 && (
                        <div className="mt-10 pt-6 border-t">
                            <h4 className="font-semibold mb-3">Members</h4>

                            <div className="flex flex-wrap gap-3">
                                {itinerary.members.map((member, index) => (
                                    <span
                                        key={index}
                                        className="bg-secondary/20 text-secondary px-3 py-1 rounded-full text-sm">
                                        {member}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
