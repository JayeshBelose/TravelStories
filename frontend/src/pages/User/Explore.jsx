import { useState, useMemo, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import ItineraryCard from "@/components/ItineraryCard";
import ItineraryOverlay from "@/components/ItineraryOverlay";
import axios from "axios";
import api from "@/api/axiosConfig";

export default function Explore() {
    const [selectedItinerary, setSelectedItinerary] = useState(null);
    const [itineraries, setItineraries] = useState([]);
    const [loading, setLoading] = useState(true);

    const [sortFilter, setSortFilter] = useState("random");
    const [typeFilter, setTypeFilter] = useState("all");

    const [openSort, setOpenSort] = useState(false);
    const [openType, setOpenType] = useState(false);

    // Fetching itineraries using API
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

    // Get unique itinerary types dynamically
    const itineraryTypes = useMemo(() => {
        const types = itineraries.map(i => i.type).filter(Boolean);
        return ["all", ...new Set(types)];
    }, [itineraries]);

    // Combined filter logic
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

    const getSortLabel = () => {
        if (sortFilter === "likes") return "Most Liked";
        if (sortFilter === "saves") return "Most Saved";
        if (sortFilter === "recent") return "Most Recent";
        return "Random";
    };

    const getTypeLabel = () => {
        if (typeFilter === "all") return "All Types";
        return typeFilter;
    };

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
                    {/* Sort Filter */}
                    <div className="relative">
                        <button
                            onClick={() => setOpenSort(!openSort)}
                            className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg shadow-sm hover:bg-gray-50">
                            {getSortLabel()}
                            <ChevronDown size={16} />
                        </button>

                        {openSort && (
                            <div className="absolute right-0 mt-2 w-44 bg-white border rounded-lg shadow-lg z-10 overflow-hidden">
                                <button
                                    onClick={() => {
                                        setSortFilter("recent");
                                        setOpenSort(false);
                                    }}
                                    className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                                    Most Recent
                                </button>

                                <button
                                    onClick={() => {
                                        setSortFilter("likes");
                                        setOpenSort(false);
                                    }}
                                    className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                                    Most Liked
                                </button>

                                <button
                                    onClick={() => {
                                        setSortFilter("saves");
                                        setOpenSort(false);
                                    }}
                                    className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                                    Most Saved
                                </button>

                                <button
                                    onClick={() => {
                                        setSortFilter("random");
                                        setOpenSort(false);
                                    }}
                                    className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                                    Clear Sort
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Type Filter */}
                    <div className="relative">
                        <button
                            onClick={() => setOpenType(!openType)}
                            className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg shadow-sm hover:bg-gray-50">
                            {getTypeLabel()}
                            <ChevronDown size={16} />
                        </button>

                        {openType && (
                            <div className="absolute right-0 mt-2 w-44 bg-white border rounded-lg shadow-lg z-10 overflow-hidden max-h-60 overflow-y-auto">
                                {itineraryTypes.map(type => (
                                    <button
                                        key={type}
                                        onClick={() => {
                                            setTypeFilter(type);
                                            setOpenType(false);
                                        }}
                                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 capitalize">
                                        {type === "all" ? "Clear Type Filter" : type}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItineraries.map(itinerary => (
                    <ItineraryCard
                        key={itinerary.itineraryId}
                        itinerary={itinerary}
                        onClick={setSelectedItinerary}
                    />
                ))}
            </div>

            {/* Overlay */}
            <ItineraryOverlay
                itinerary={selectedItinerary}
                onClose={() => setSelectedItinerary(null)}
            />
        </div>
    );
}
