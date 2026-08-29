import { memo } from "react";
import ItineraryThumbnail from "../itinerary/ItineraryThumbnail";
import { MapPin, Trash } from "lucide-react";

function RecentItineraies({
    itinerary,
    setSelectedItinerary,
    setOpenView,
    confirmDelete,
}) {
    return (
        <div
            key={itinerary.itineraryId}
            className="group flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 transition-colors"
        >
            <button
                type="button"
                onClick={() => {
                    setSelectedItinerary(itinerary);
                    setOpenView(true);
                }}
                className="flex items-center gap-3 flex-1 min-w-0 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-1"
                aria-label={`View itinerary ${itinerary.title}`}
            >
                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                    <ItineraryThumbnail
                        itineraryId={itinerary.itineraryId}
                        alt={itinerary.title}
                    />
                </div>

                <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate font-primary">
                        {itinerary.title}
                    </p>

                    <p className="text-xs text-gray-400 flex items-center gap-1">
                        <MapPin
                            size={10}
                            className="flex-shrink-0"
                            aria-hidden="true"
                        />
                        {itinerary.place} · {itinerary.createdBy}
                    </p>
                </div>
            </button>

            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        itinerary.public
                            ? "border-emerald-200 text-emerald-600 bg-emerald-50"
                            : "border-red-200 text-red-500 bg-red-50"
                    }`}
                >
                    {itinerary.public ? "Public" : "Private"}
                </span>

                <button
                    type="button"
                    onClick={() => confirmDelete(itinerary.itineraryId)}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all cursor-pointer focus:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-1"
                    aria-label={`Delete itinerary ${itinerary.title}`}
                >
                    <Trash size={13} aria-hidden="true" />
                </button>
            </div>
        </div>
    );
}

export default memo(RecentItineraies);
