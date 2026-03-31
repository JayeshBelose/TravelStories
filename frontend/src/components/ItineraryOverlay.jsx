import api from "@/api/axiosConfig";
import {
    X,
    MapPin,
    Calendar,
    Users,
    Globe,
    Lock,
    Image as ImageIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import UserItineraryListOverlay from "./UserItineraryListOverlay";

export default function ItineraryOverlay({ itinerary, onClose }) {
    const [days, setDays] = useState([]);
    const [locationsByDay, setLocationsByDays] = useState({});
    const [imagesByLocation, setImagesByLocation] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);
    const [activeDay, setActiveDay] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [itineraryCreator, setItineraryCreator] = useState([]);

    // Fetching user info the itinerary creator
    useEffect(() => {
        if (!itinerary?.itineraryId) return;
        setLoading(true);
        const fetchCreator = async () => {
            try {
                const response = await api.get(`/users/username/${itinerary.createdBy}`);
                setItineraryCreator(response.data);
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };
        fetchCreator();
    }, [itinerary]);

    // Fetching itinerary days, locations and images
    useEffect(() => {
        if (!itinerary?.itineraryId) return;
        setLoading(true);
        const fetchDays = async () => {
            try {
                const response = await api.get(
                    `/itineraries/${itinerary.itineraryId}/days`,
                );
                setDays(response.data);
                if (response.data.length > 0) setActiveDay(response.data[0].dayId);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchDays();
    }, [itinerary]);

    useEffect(() => {
        if (!days || days.length === 0) return;
        const fetchLocationsForAllDays = async () => {
            try {
                const requests = days.map(day =>
                    api.get(`/itineraries/days/${day.dayId}/locations`),
                );
                const responses = await Promise.all(requests);
                const locations = {};
                responses.forEach((res, index) => {
                    locations[days[index].dayId] = res.data;
                });
                setLocationsByDays(locations);
            } catch (error) {
                console.error(error);
            }
        };
        fetchLocationsForAllDays();
    }, [days]);

    useEffect(() => {
        if (!locationsByDay || Object.keys(locationsByDay).length === 0) return;
        const fetchImagesForAllLocations = async () => {
            try {
                const allLocations = Object.values(locationsByDay).flat();
                const requests = allLocations.map(loc =>
                    api.get(`/itineraries/days/locations/${loc.locationId}/images`),
                );
                const responses = await Promise.all(requests);
                const images = {};
                responses.forEach((res, index) => {
                    images[allLocations[index].locationId] = res.data;
                });
                setImagesByLocation(images);
            } catch (error) {
                console.log(error);
            }
        };
        fetchImagesForAllLocations();
    }, [locationsByDay]);

    if (!itinerary) return null;

    const totalLocations = Object.values(locationsByDay).reduce(
        (acc, locs) => acc + locs.length,
        0,
    );

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-end p-4 z-50"
                onClick={onClose}>
                {/* Panel */}
                <div
                    className="bg-white w-full max-w-lg h-[calc(100vh-2rem)] rounded-2xl overflow-hidden flex flex-col shadow-2xl"
                    onClick={e => e.stopPropagation()}>
                    {/* Thumbnail */}
                    <div className="relative h-56 flex-shrink-0">
                        <img
                            src={`${import.meta.env.VITE_API_BASE_URL}/itineraries/${itinerary.itineraryId}/thumbnail`}
                            alt={itinerary.title}
                            className="w-full h-full object-cover"
                        />
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                        {/* Badges */}
                        <div className="absolute top-3 left-4 flex gap-2">
                            <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm
                                    ${
                                        itinerary.public
                                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-400/30"
                                            : "bg-red-500/15 text-red-400 border-red-400/25"
                                    }`}>
                                {itinerary.public ? (
                                    <Globe size={11} />
                                ) : (
                                    <Lock size={11} />
                                )}
                                {itinerary.public ? "Public" : "Private"}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-white/15 text-white border border-white/25 backdrop-blur-sm">
                                {itinerary.type}
                            </span>
                        </div>

                        {/* Close button */}
                        <button
                            onClick={onClose}
                            aria-label="Close"
                            className="absolute top-3 right-4 w-8 h-8 rounded-full bg-white/15 border border-white/25 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/30 transition-colors cursor-pointer">
                            <X size={15} />
                        </button>

                        {/* Title, Place and Duration */}
                        <div className="absolute bottom-4 left-4 right-4">
                            <h2 className="text-xl font-bold text-white mb-1.5 leading-tight font-primary">
                                {itinerary.title}
                            </h2>
                            <div className="flex flex-wrap gap-3">
                                <span className="inline-flex items-center gap-1 text-xs text-white/80">
                                    <MapPin size={12} /> {itinerary.place}
                                </span>
                                <span className="inline-flex items-center gap-1 text-xs text-white/80">
                                    <Calendar size={12} />
                                    {itinerary.startDate} – {itinerary.endDate}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Stats Bar */}
                    <div className="flex items-center bg-gray-50 border-b border-gray-100 px-5 py-3 flex-shrink-0">
                        <div className="flex-1 flex flex-col items-center gap-0.5">
                            <span className="text-sm font-bold text-gray-900">
                                {days.length}
                            </span>
                            <span className="text-[10px] uppercase tracking-widest text-gray-400 font-medium">
                                Days
                            </span>
                        </div>
                        <div className="w-px h-7 bg-gray-200" />
                        <div className="flex-1 flex flex-col items-center gap-0.5">
                            <span className="text-sm font-bold text-gray-900">
                                {totalLocations}
                            </span>
                            <span className="text-[10px] uppercase tracking-widest text-gray-400 font-medium">
                                Locations
                            </span>
                        </div>
                        <div className="w-px h-7 bg-gray-200" />
                        <div className="flex-1 flex flex-col items-center gap-0.5">
                            <span className="text-sm font-bold text-gray-900">
                                {itinerary.members?.length ?? 0}
                            </span>
                            <span className="text-[10px] uppercase tracking-widest text-gray-400 font-medium">
                                Members
                            </span>
                        </div>
                        <div className="w-px h-7 bg-gray-200" />
                        <div className="flex-[1.4] flex flex-col items-center gap-0.5 px-1">
                            <span className="text-[10px] uppercase tracking-widest text-gray-400 font-medium">
                                By
                            </span>
                            <span
                                onClick={() => setSelectedUser(itineraryCreator)}
                                className="text-sm font-bold text-gray-900 truncate max-w-full cursor-pointer">
                                {itinerary.createdBy}
                            </span>
                        </div>
                    </div>

                    {/* Scrollable Body */}
                    {loading ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-400">
                            <div className="flex gap-1.5">
                                {[0, 1, 2].map(i => (
                                    <span
                                        key={i}
                                        className="w-2 h-2 rounded-full bg-gray-300 animate-bounce"
                                        style={{ animationDelay: `${i * 0.15}s` }}
                                    />
                                ))}
                            </div>
                            <p className="text-sm">Loading itinerary…</p>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto pb-8">
                            {/* Day Tabs */}
                            {days.length > 0 && (
                                <>
                                    <div className="overflow-x-auto border-b border-gray-100 px-5 pt-4">
                                        <div className="flex gap-1 whitespace-nowrap">
                                            {days.map(day => (
                                                <button
                                                    key={day.dayId}
                                                    onClick={() =>
                                                        setActiveDay(day.dayId)
                                                    }
                                                    className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors cursor-pointer bg-transparent
                                                        ${
                                                            activeDay === day.dayId
                                                                ? "border-gray-900 text-gray-900"
                                                                : "border-transparent text-gray-400 hover:text-gray-600"
                                                        }`}>
                                                    Day {day.dayNumber}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Active Day Content */}
                                    {days
                                        .filter(d => d.dayId === activeDay)
                                        .map(day => (
                                            <div key={day.dayId} className="px-5 pt-5">
                                                {day.description && (
                                                    <p className="text-sm text-gray-500 italic mb-4 leading-relaxed">
                                                        {day.description}
                                                    </p>
                                                )}

                                                {/* Locations Timeline */}
                                                {locationsByDay[day.dayId]?.length > 0 ? (
                                                    <div className="flex flex-col">
                                                        {locationsByDay[day.dayId].map(
                                                            (location, idx) => (
                                                                <div
                                                                    key={
                                                                        location.locationId
                                                                    }
                                                                    className="flex gap-3 items-start">
                                                                    {/* Timeline marker */}
                                                                    <div className="flex flex-col items-center flex-shrink-0 pt-3.5">
                                                                        <span className="w-6 h-6 rounded-full bg-gray-900 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                                                                            {idx + 1}
                                                                        </span>
                                                                        {idx <
                                                                            locationsByDay[
                                                                                day.dayId
                                                                            ].length -
                                                                                1 && (
                                                                            <span className="w-px flex-1 min-h-4 bg-gray-200 my-1.5" />
                                                                        )}
                                                                    </div>

                                                                    {/* Location card */}
                                                                    <div className="flex-1 bg-gray-50 border border-gray-100 rounded-xl p-3.5 mb-3">
                                                                        <h5 className="text-sm font-semibold text-gray-900 mb-0.5 font-primary">
                                                                            {
                                                                                location.locationName
                                                                            }
                                                                        </h5>
                                                                        {location.locationAddress && (
                                                                            <p className="inline-flex items-center gap-1 text-xs text-gray-400">
                                                                                <MapPin
                                                                                    size={
                                                                                        10
                                                                                    }
                                                                                />
                                                                                {
                                                                                    location.locationAddress
                                                                                }
                                                                            </p>
                                                                        )}

                                                                        {/* Images */}
                                                                        {imagesByLocation[
                                                                            location
                                                                                .locationId
                                                                        ]?.length > 0 && (
                                                                            <div className="flex flex-wrap gap-2 mt-3">
                                                                                {imagesByLocation[
                                                                                    location
                                                                                        .locationId
                                                                                ].map(
                                                                                    img => {
                                                                                        const imageUrl = `${import.meta.env.VITE_API_BASE_URL}/itineraries/days/locations/images/${img.imageId}`;
                                                                                        return (
                                                                                            <button
                                                                                                key={
                                                                                                    img.imageId
                                                                                                }
                                                                                                onClick={() =>
                                                                                                    setSelectedImage(
                                                                                                        imageUrl,
                                                                                                    )
                                                                                                }
                                                                                                className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 group border-0 p-0 cursor-pointer">
                                                                                                <img
                                                                                                    src={
                                                                                                        imageUrl
                                                                                                    }
                                                                                                    alt="location"
                                                                                                    className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
                                                                                                />
                                                                                                <div className="absolute inset-0 bg-black/35 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                                                                    <ImageIcon
                                                                                                        size={
                                                                                                            13
                                                                                                        }
                                                                                                    />
                                                                                                </div>
                                                                                            </button>
                                                                                        );
                                                                                    },
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-gray-400 text-center py-8">
                                                        No locations added for this day.
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                </>
                            )}

                            {/* Members */}
                            {itinerary.members?.length > 0 && (
                                <div className="px-5 pt-5 mt-2 border-t border-gray-100">
                                    <div className="flex items-center gap-1.5 mb-3">
                                        <Users size={13} className="text-gray-400" />
                                        <h4 className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                                            Members
                                        </h4>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {itinerary.members.map(member => (
                                            <div
                                                key={member.userId}
                                                onClick={() => setSelectedUser(member)}
                                                className="inline-flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-full pl-1.5 pr-3 py-1">
                                                <div className="w-5 h-5 rounded-full bg-gray-900 text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0">
                                                    {member.username
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </div>
                                                <span className="text-xs text-gray-700 font-medium cursor-pointer">
                                                    {member.username}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Lightbox */}
            {selectedImage && (
                <div
                    className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] cursor-zoom-out"
                    onClick={() => setSelectedImage(null)}>
                    <button
                        onClick={() => setSelectedImage(null)}
                        className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                        <X size={17} />
                    </button>
                    <img
                        src={selectedImage}
                        alt="preview"
                        className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain"
                        onClick={e => e.stopPropagation()}
                    />
                </div>
            )}

            {/* User Itinerary List Overlay */}
            <UserItineraryListOverlay
                open={!!selectedUser}
                user={selectedUser}
                onClose={() => setSelectedUser(null)}
                onSelectItinerary={itinerary => {
                    setSelectedItinerary(itinerary);
                }}
            />
        </>
    );
}
