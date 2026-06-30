import { useState, useMemo, useEffect, useRef } from "react";
import { Filter, Search, X, Compass, ChevronLeft, ChevronRight } from "lucide-react";
import ItineraryCard from "@/components/ItineraryCard";
import ItineraryOverlay from "@/components/ItineraryOverlay";
import api from "@/api/axiosConfig";

const SORT_OPTIONS = [
    { value: "recent", label: "Most Recent" },
    { value: "likes", label: "Most Liked" },
    { value: "saves", label: "Most Saved" },
    { value: "random", label: "No Filter" },
];

export default function Explore() {
    const [selectedItinerary, setSelectedItinerary] = useState(null);
    const [itineraries, setItineraries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [appliedSearch, setAppliedSearch] = useState("");
    const [sortFilter, setSortFilter] = useState("random");
    const [typeFilter, setTypeFilter] = useState(null); // null = "all"
    const [openSort, setOpenSort] = useState(false);
    const [openType, setOpenType] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [itineraryTypes, setItineraryTypes] = useState([]);

    const sortRef = useRef(null);
    const typeRef = useRef(null);

    // Close dropdowns on outside click
    useEffect(() => {
        const handler = e => {
            if (sortRef.current && !sortRef.current.contains(e.target))
                setOpenSort(false);
            if (typeRef.current && !typeRef.current.contains(e.target))
                setOpenType(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // Fetch itinerary types from API
    useEffect(() => {
        const fetchTypes = async () => {
            try {
                const response = await api.get("/users/itineraries/types");
                setItineraryTypes(response.data);
            } catch (error) {
                console.error("Failed to fetch itinerary types:", error);
            }
        };
        fetchTypes();
    }, []);

    const fetchItineraries = async () => {
        setLoading(true);
        try {
            const response = await api.get("/itineraries", {
                params: {
                    search: appliedSearch,
                    type: typeFilter ?? undefined,
                    sort: sortFilter,
                    page: currentPage - 1,
                    size: 9,
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

    useEffect(() => {
        const delay = setTimeout(() => fetchItineraries(), 400);
        return () => clearTimeout(delay);
    }, [appliedSearch, sortFilter, typeFilter, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [sortFilter, typeFilter]);

    const getSortLabel = () =>
        SORT_OPTIONS.find(o => o.value === sortFilter)?.label ?? "No Filter";

    const getTypeLabel = () =>
        typeFilter === null
            ? "All Types"
            : (itineraryTypes.find(t => t.name === typeFilter)?.name ?? "All Types");

    const sortActive = sortFilter !== "random";
    const typeActive = typeFilter !== null;
    const searchActive = appliedSearch.trim().length > 0;

    // Page numbers with ellipsis
    const pageNumbers = useMemo(() => {
        if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
        const pages = new Set([
            1,
            totalPages,
            currentPage,
            currentPage - 1,
            currentPage + 1,
        ]);
        return [...pages].filter(p => p >= 1 && p <= totalPages).sort((a, b) => a - b);
    }, [totalPages, currentPage]);

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-start justify-between gap-6 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 font-primary tracking-tight mb-1">
                            Explore
                        </h1>
                        <p className="text-sm text-gray-400">
                            Discover trips shared by the community
                        </p>
                    </div>
                </div>

                {/* Search + Filters row */}
                <div className="flex flex-wrap gap-3">
                    {/* Search */}
                    <div className="flex-1 min-w-56 flex items-center gap-2.5 bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 shadow-sm focus-within:border-gray-400 transition-colors">
                        <Search size={15} className="text-gray-400 flex-shrink-0" />
                        <input
                            type="text"
                            placeholder="Search by title or place…"
                            className="w-full bg-transparent outline-none text-sm text-gray-700 placeholder:text-gray-300"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === "Enter") {
                                    setCurrentPage(1);
                                    setAppliedSearch(search);
                                }
                            }}
                        />
                        {search && (
                            <button
                                onClick={() => {
                                    setSearch("");
                                    setAppliedSearch("");
                                }}
                                className="text-gray-300 hover:text-gray-500 transition-colors cursor-pointer">
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {/* Sort dropdown */}
                    <div ref={sortRef} className="relative">
                        <button
                            onClick={() => {
                                setOpenSort(v => !v);
                                setOpenType(false);
                            }}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium shadow-sm transition-colors cursor-pointer
                                ${
                                    sortActive
                                        ? "bg-gray-900 text-white border-gray-900"
                                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                                }`}>
                            <Filter size={13} />
                            {getSortLabel()}
                        </button>
                        {openSort && (
                            <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl border border-gray-100 shadow-lg z-20 overflow-hidden py-1">
                                {SORT_OPTIONS.map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => {
                                            setSortFilter(opt.value);
                                            setOpenSort(false);
                                        }}
                                        className={`block w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer
                                            ${
                                                sortFilter === opt.value
                                                    ? "bg-gray-50 text-gray-900 font-medium"
                                                    : "text-gray-600 hover:bg-gray-50"
                                            }`}>
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Type dropdown */}
                    <div ref={typeRef} className="relative">
                        <button
                            onClick={() => {
                                setOpenType(v => !v);
                                setOpenSort(false);
                            }}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium shadow-sm transition-colors cursor-pointer
                                ${
                                    typeActive
                                        ? "bg-gray-900 text-white border-gray-900"
                                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                                }`}>
                            <Filter size={13} />
                            {getTypeLabel()}
                        </button>
                        {openType && (
                            <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl border border-gray-100 shadow-lg z-20 overflow-hidden py-1 max-h-56 overflow-y-auto">
                                {/* "All Types" option */}
                                <button
                                    onClick={() => {
                                        setTypeFilter(null);
                                        setOpenType(false);
                                    }}
                                    className={`block w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer
                                        ${
                                            typeFilter === null
                                                ? "bg-gray-50 text-gray-900 font-medium"
                                                : "text-gray-600 hover:bg-gray-50"
                                        }`}>
                                    All Types
                                </button>

                                {itineraryTypes.map(type => (
                                    <button
                                        key={type.typeId}
                                        onClick={() => {
                                            setTypeFilter(type.name);
                                            setOpenType(false);
                                        }}
                                        className={`block w-full text-left px-4 py-2 text-sm capitalize transition-colors cursor-pointer
                                            ${
                                                typeFilter === type.name
                                                    ? "bg-gray-50 text-gray-900 font-medium"
                                                    : "text-gray-600 hover:bg-gray-50"
                                            }`}>
                                        {type.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Active filter chips */}
                {(sortActive || typeActive || searchActive) && (
                    <div className="flex flex-wrap gap-2 mt-3">
                        {searchActive && (
                            <span className="inline-flex items-center gap-1.5 text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                                "{appliedSearch}"
                                <button
                                    onClick={() => {
                                        setSearch("");
                                        setAppliedSearch("");
                                    }}
                                    className="hover:text-gray-900 cursor-pointer">
                                    <X size={11} />
                                </button>
                            </span>
                        )}
                        {sortActive && (
                            <span className="inline-flex items-center gap-1.5 text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                                {getSortLabel()}
                                <button
                                    onClick={() => setSortFilter("random")}
                                    className="hover:text-gray-900 cursor-pointer">
                                    <X size={11} />
                                </button>
                            </span>
                        )}
                        {typeActive && (
                            <span className="inline-flex items-center gap-1.5 text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full capitalize">
                                {getTypeLabel()}
                                <button
                                    onClick={() => setTypeFilter(null)}
                                    className="hover:text-gray-900 cursor-pointer">
                                    <X size={11} />
                                </button>
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Loading Skeleton */}
            {loading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div
                            key={i}
                            className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                            <div className="h-48 bg-gray-100 animate-pulse" />
                            <div className="p-4 space-y-2">
                                <div className="h-3.5 bg-gray-100 rounded animate-pulse w-3/4" />
                                <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
                                <div className="h-3 bg-gray-100 rounded animate-pulse w-1/3" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : itineraries.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4 text-gray-400">
                    <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                        <Compass size={26} className="text-gray-300" />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-medium text-gray-600 mb-1">
                            No itineraries found
                        </p>
                        {appliedSearch && (
                            <p className="text-xs text-gray-400">
                                Nothing matched{" "}
                                <span className="font-semibold text-gray-600">
                                    "{appliedSearch}"
                                </span>
                            </p>
                        )}
                    </div>
                    <button
                        onClick={() => {
                            setSearch("");
                            setAppliedSearch("");
                            setSortFilter("random");
                            setTypeFilter(null);
                        }}
                        className="text-xs text-gray-500 underline underline-offset-2 hover:text-gray-800 transition-colors cursor-pointer">
                        Clear all filters
                    </button>
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

            {/* Pagination */}
            {!loading && totalPages > 1 && (
                <div className="flex justify-center items-center gap-1.5 mt-12">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                        className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer">
                        <ChevronLeft size={15} />
                    </button>

                    {pageNumbers.map((page, idx) => {
                        const prev = pageNumbers[idx - 1];
                        const showEllipsis = prev && page - prev > 1;
                        return (
                            <span key={page} className="flex items-center gap-1.5">
                                {showEllipsis && (
                                    <span className="text-gray-300 text-sm px-1">…</span>
                                )}
                                <button
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors cursor-pointer
                                        ${
                                            currentPage === page
                                                ? "bg-gray-900 text-white"
                                                : "text-gray-500 hover:bg-gray-100 border border-gray-200 hover:border-gray-300"
                                        }`}>
                                    {page}
                                </button>
                            </span>
                        );
                    })}

                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => p + 1)}
                        className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer">
                        <ChevronRight size={15} />
                    </button>
                </div>
            )}

            <ItineraryOverlay
                itinerary={selectedItinerary}
                onClose={() => setSelectedItinerary(null)}
            />
        </div>
    );
}
