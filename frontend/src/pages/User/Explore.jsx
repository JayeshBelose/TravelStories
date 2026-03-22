import { useState, useMemo, useEffect } from "react";
import { Filter, Search } from "lucide-react";
import ItineraryCard from "@/components/ItineraryCard";
import ItineraryOverlay from "@/components/ItineraryOverlay";
import api from "@/api/axiosConfig";

export default function Explore() {
    const [selectedItinerary, setSelectedItinerary] = useState(null);
    const [itineraries, setItineraries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [appliedSearch, setAppliedSearch] = useState("");

    const [sortFilter, setSortFilter] = useState("random");
    const [typeFilter, setTypeFilter] = useState("all");

    const [openSort, setOpenSort] = useState(false);
    const [openType, setOpenType] = useState(false);

    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);

    // Fetching itineraries
    const fetchItineraries = async () => {
        setLoading(true);
        try {
            const response = await api.get("/itineraries", {
                params: {
                    search: appliedSearch,
                    type: typeFilter,
                    sort: sortFilter,
                    page: currentPage - 1,
                    size: 15,
                },
            });

            setItineraries(response.data.content);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Debounced fetch
    useEffect(() => {
        const delay = setTimeout(() => {
            fetchItineraries();
        }, 400);

        return () => clearTimeout(delay);
    }, [appliedSearch, sortFilter, typeFilter, currentPage]);

    // Setting itinerary types for filter
    const itineraryTypes = useMemo(() => {
        const types = itineraries.map(i => i.type).filter(Boolean);
        return ["all", ...new Set(types)];
    }, [itineraries]);

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

    // Setting current page to avoid empty page rendering
    useEffect(() => {
        setCurrentPage(1);
    }, [sortFilter, typeFilter]);

    // Wait for itineraries to be fetched from the database
    if (loading) return <p className="p-10">Loading...</p>;

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div className="flex-2">
                    <h1 className="text-4xl font-bold mb-2 text-primary font-primary">
                        Explore Itineraries
                    </h1>
                    <p className="text-gray-500">Find your next adventure</p>
                </div>

                {/* Search + Filters */}
                <div className="flex-4 flex gap-4">
                    {/* Search */}
                    <div className="flex items-center gap-3 bg-card p-3 rounded-2xl shadow-md flex-1">
                        <Search size={18} className="text-primary" />
                        <input
                            type="text"
                            placeholder="Search by title or place..."
                            className="w-full bg-transparent outline-none text-primary"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === "Enter") {
                                    setCurrentPage(1);
                                    setAppliedSearch(search);
                                }
                            }}
                        />
                    </div>
                    {/* Sort Filter Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setOpenSort(!openSort)}
                            className={`flex items-center gap-2 p-3 rounded-2xl shadow-md hover:bg-secondary/10 ${getSortLabel() === "No Filter" ? "bg-white" : "bg-secondary/10"}`}>
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
                            className={`flex items-center gap-2 p-3 rounded-2xl shadow-md hover:bg-secondary/10 ${getTypeLabel() === "All Types" ? "bg-white" : "bg-secondary/10"}`}>
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
            {itineraries.length === 0 ? (
                <div className="font-primary text-primary text-2xl text-center py-10">
                    No itineraries matching{" "}
                    <span className="font-bold">" {search} "</span>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {itineraries.map(itinerary => (
                        <ItineraryCard
                            key={itinerary.itineraryId}
                            itinerary={itinerary}
                            onClick={setSelectedItinerary}
                        />
                    ))}
                </div>
            )}

            {/* Pagination Logic */}
            <div className="flex justify-center items-center gap-2 mt-10">
                {/* Previous */}
                <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className="px-4 py-2 rounded-2xl shadow-md bg-gray-100 not-disabled:hover:bg-secondary/10 disabled:opacity-40">
                    Prev
                </button>

                {/* Page Numbers */}
                {Array.from({ length: totalPages }, (_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`px-4 py-2 rounded-full shadow-md ${
                            currentPage === i + 1
                                ? "bg-primary text-white"
                                : "bg-gray-100"
                        }`}>
                        {i + 1}
                    </button>
                ))}

                {/* Next */}
                <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="px-4 py-2 rounded-2xl shadow-md bg-gray-100 not-disabled:hover:bg-secondary/10 disabled:opacity-40">
                    Next
                </button>
            </div>

            {/* Overlay Component */}
            <ItineraryOverlay
                itinerary={selectedItinerary}
                onClose={() => setSelectedItinerary(null)}
            />
        </div>
    );
}
