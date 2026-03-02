import { useState, useMemo, useEffect } from "react";
import { Filter } from "lucide-react";
import ItineraryCard from "@/components/ItineraryCard";
import ItineraryOverlay from "@/components/ItineraryOverlay";
import api from "@/api/axiosConfig";

export default function Explore() {
    const [selectedItinerary, setSelectedItinerary] = useState(null);
    const [itineraries, setItineraries] = useState([]);
    const [loading, setLoading] = useState(true);

    const [sortFilter, setSortFilter] = useState("random");
    const [typeFilter, setTypeFilter] = useState("all");

    const [openSort, setOpenSort] = useState(false);
    const [openType, setOpenType] = useState(false);

    // Fetching itineraries
    useEffect(() => {
        const fetchItineraries = async () => {
            try {
                const response = await api.get(
                    `${import.meta.env.VITE_API_BASE_URL}/itineraries`,
                );
                setItineraries(response.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchItineraries();
    }, []);

    // Setting itinerary types for filter
    const itineraryTypes = useMemo(() => {
        const types = itineraries.map(i => i.type).filter(Boolean);
        return ["all", ...new Set(types)];
    }, [itineraries]);

    // Combined filter logic for most liked/saved/recent and type
    const filteredItineraries = useMemo(() => {
        let filtered = [...itineraries];

        if (typeFilter !== "all") {
            filtered = filtered.filter(i => i.type === typeFilter);
        }

        if (sortFilter === "likes") {
            filtered.sort((a, b) => b.likes - a.likes);
        } else if (sortFilter === "saves") {
            filtered.sort((a, b) => b.saves - a.saves);
        } else if (sortFilter === "recent") {
            filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else {
            filtered.sort(() => Math.random() - 0.5);
        }

        return filtered;
    }, [itineraries, sortFilter, typeFilter]);

    // Get sort label to filter
    const getSortLabel = () => {
        if (sortFilter === "likes") return "Most Liked";
        if (sortFilter === "saves") return "Most Saved";
        if (sortFilter === "recent") return "Most Recent";
        return "No Filter";
    };

    // Get type label to filter
    const getTypeLabel = () => {
        if (typeFilter === "all") return "All Types";
        return typeFilter;
    };

    // Wait for itineraries to be fetched from the database
    if (loading) return <p className="p-10">Loading...</p>;

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-bold mb-2 text-primary font-primary">
                        Explore Itineraries
                    </h1>
                    <p className="text-gray-500">Find your next adventure</p>
                </div>

                {/* Filters */}
                <div className="flex gap-4">
                    {/* Sort Filter Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setOpenSort(!openSort)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm hover:bg-secondary/10 ${getSortLabel() === "No Filter" ? "bg-gray-50" : "bg-secondary/10"}`}>
                            {getSortLabel()}
                            <Filter size={16} />
                        </button>

                        {openSort && (
                            <div className="absolute right-0 mt-2 w-44 bg-gray-50 rounded-lg shadow-lg z-10 overflow-hidden">
                                <button
                                    onClick={() => {
                                        setSortFilter("recent");
                                        setOpenSort(false);
                                    }}
                                    className="block w-full text-left px-4 py-2 hover:bg-secondary/10">
                                    Most Recent
                                </button>

                                <button
                                    onClick={() => {
                                        setSortFilter("likes");
                                        setOpenSort(false);
                                    }}
                                    className="block w-full text-left px-4 py-2 hover:bg-secondary/10">
                                    Most Liked
                                </button>

                                <button
                                    onClick={() => {
                                        setSortFilter("saves");
                                        setOpenSort(false);
                                    }}
                                    className="block w-full text-left px-4 py-2 hover:bg-secondary/10">
                                    Most Saved
                                </button>

                                <button
                                    onClick={() => {
                                        setSortFilter("random");
                                        setOpenSort(false);
                                    }}
                                    className="block w-full text-left px-4 py-2 hover:bg-secondary/10">
                                    No Filter
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Type Filter Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setOpenType(!openType)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm hover:bg-secondary/10 ${getTypeLabel() === "All Types" ? "bg-gray-50" : "bg-secondary/10"}`}>
                            {getTypeLabel()}
                            <Filter size={16} />
                        </button>

                        {openType && (
                            <div className="absolute right-0 mt-2 w-44 bg-gray-50 rounded-lg shadow-lg z-10 overflow-hidden max-h-60 overflow-y-auto">
                                {itineraryTypes.map(type => (
                                    <button
                                        key={type}
                                        onClick={() => {
                                            setTypeFilter(type);
                                            setOpenType(false);
                                        }}
                                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 capitalize">
                                        {type === "all" ? "All Types" : type}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Grid Display Of Itineraries */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItineraries.map(itinerary => (
                    <ItineraryCard
                        key={itinerary.itineraryId}
                        itinerary={itinerary}
                        onClick={setSelectedItinerary}
                    />
                ))}
            </div>

            {/* Overlay Component */}
            <ItineraryOverlay
                itinerary={selectedItinerary}
                onClose={() => setSelectedItinerary(null)}
            />
        </div>
    );
}
