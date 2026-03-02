import api from "@/api/axiosConfig";
import axios from "axios";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

export default function ItineraryOverlay({ itinerary, onClose }) {
    const [days, setDays] = useState([]);
    const [locationsByDay, setLocationsByDays] = useState({});
    const [imagesByLocation, setImagesByLocation] = useState({});

    const [loading, setLoading] = useState(true);

    const [selectedImage, setSelectedImage] = useState(null);

    // Fetch Days
    useEffect(() => {
        if (!itinerary?.itineraryId) return;

        setLoading(true);

        const fetchDays = async () => {
            try {
                const response = await api.get(
                    `/itineraries/${itinerary.itineraryId}/days`,
                );
                setDays(response.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchDays();
    }, [itinerary]);

    // Fetch Locations
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
                    const dayId = days[index].dayId;
                    locations[dayId] = res.data;
                });

                setLocationsByDays(locations);
            } catch (error) {
                console.error(error);
            }
        };

        fetchLocationsForAllDays();
    }, [days]);

    // Fetch Images
    useEffect(() => {
        if (!locationsByDay || Object.keys(locationsByDay).length === 0) return;

        const fetchImagesForAllLocations = async () => {
            try {
                const allLocations = Object.values(locationsByDay).flat();

                const requests = allLocations.map(location =>
                    api.get(`/itineraries/days/locations/${location.locationId}/images`),
                );

                const responses = await Promise.all(requests);

                const images = {};
                responses.forEach((res, index) => {
                    const locationId = allLocations[index].locationId;
                    images[locationId] = res.data;
                });

                setImagesByLocation(images);
            } catch (error) {
                console.log(error);
            }
        };

        fetchImagesForAllLocations();
    }, [locationsByDay]);

    if (!itinerary) return null;

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
                <div className="bg-white p-6 rounded-xl">Loading...</div>
            </div>
        );
    }

    return (
        <div>
            <div className="fixed inset-0 bg-black/70 flex items-start justify-center overflow-y-auto p-6 z-50">
                <div className="bg-white w-11/12 max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-y-auto relative ml-64">
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 bg-white p-2 rounded-full shadow z-10">
                        <X size={18} className="hover:scale-110 hover:cursor-pointer" />
                    </button>

                    {/* Thumbnail */}
                    <img
                        src={`${import.meta.env.VITE_API_BASE_URL}/itineraries/${itinerary.itineraryId}/thumbnail`}
                        alt={itinerary.title}
                        className="w-full h-72 object-cover"
                    />

                    {/* Content */}
                    <div className="p-8">
                        {/* Title */}
                        <h2 className="text-3xl font-bold mb-2 font-primary">
                            {itinerary.title}
                        </h2>

                        {/* PLace */}
                        <p className="text-gray-500 mb-2">{itinerary.place}</p>

                        {/* Dates */}
                        <p className="text-sm text-gray-600 mb-2">
                            {itinerary.startDate} To {itinerary.endDate}
                        </p>
                        {/* Itinerary Type */}
                        <div className="text-sm text-secondary mb-2 bg-secondary/20 w-fit py-1 px-2 rounded-2xl">
                            {itinerary.type}
                        </div>

                        {/* Creator */}
                        <p className="text-sm text-primary/60 mb-8">
                            Created by{" "}
                            <span className="font-semibold text-primary">
                                {itinerary.createdBy}
                            </span>
                        </p>

                        {/* Days Section */}
                        {days?.length > 0 && (
                            <div className="space-y-8 mb-12">
                                {days.map(day => (
                                    <div key={day.dayId} className="border-t pt-6">
                                        {/* Day Header */}
                                        <h4 className="text-xl font-primary font-semibold mb-2">
                                            Day {day.dayNumber}
                                        </h4>

                                        {/* Day Description */}
                                        {day.description && (
                                            <p className="text-gray-600 mb-4">
                                                {day.description}
                                            </p>
                                        )}

                                        {/* Locations */}
                                        {locationsByDay[day.dayId]?.length > 0 && (
                                            <div className="space-y-4">
                                                {locationsByDay[day.dayId]?.map(
                                                    location => (
                                                        <div
                                                            key={location.locationId}
                                                            className="bg-gray-50 p-4 rounded-lg">
                                                            <h5 className="font-semibold font-primary">
                                                                {location.locationName}
                                                            </h5>

                                                            <p className="text-sm text-gray-500 mb-2">
                                                                {location.locationAddress}
                                                            </p>

                                                            {/* Location Images */}
                                                            {imagesByLocation[
                                                                location.locationId
                                                            ]?.map(img => {
                                                                const imageUrl = `${import.meta.env.VITE_API_BASE_URL}/itineraries/days/locations/images/${img.imageId}`;

                                                                return (
                                                                    <img
                                                                        key={img.imageId}
                                                                        src={imageUrl}
                                                                        alt="location"
                                                                        onClick={() =>
                                                                            setSelectedImage(
                                                                                imageUrl,
                                                                            )
                                                                        }
                                                                        className="w-24 h-24 object-cover rounded-lg cursor-pointer"
                                                                    />
                                                                );
                                                            })}
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Members Section */}
                        <h4 className="font-primary font-semibold text-xl border-t pt-6 pb-2">
                            Members
                        </h4>
                        {itinerary.members && itinerary.members.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {itinerary.members.map(member => (
                                    <span
                                        key={member.userId}
                                        className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm">
                                        {member.username}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Image Overlay */}
            {selectedImage && (
                <div
                    className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
                    onClick={() => setSelectedImage(null)}>
                    <img
                        src={selectedImage}
                        alt="preview"
                        className="max-h-[90vh] max-w-[90vw] rounded-xl shadow-2xl"
                    />
                </div>
            )}
        </div>
    );
}
