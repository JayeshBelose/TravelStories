import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { toast } from "react-toastify";
import {
    Search,
    Trash,
    Pencil,
    Filter,
    Plus,
    X,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Globe,
    Lock,
    Tag,
} from "lucide-react";
import CreateItineraryOverlay from "@/components/itinerary/CreateItineraryOverlay";
import ItineraryOverlay from "@/components/itinerary/ItineraryOverlay";
import { Skeleton } from "@/components/ui/skeleton";
import { ui } from "@/styles/uiPrimitives";
import ConfirmToast from "@/components/common/ConfirmToast";
import {
    addItineraryTypeService,
    deleteItineraryByAdminService,
    deleteItineraryTypeService,
    getAdminItinerariesService,
    getItineraryTypesAdminService,
} from "@/services/adminService";
import ItineraryTableRow from "@/components/admin/ItineraryTableRow";
import ItineraryTypeManagement from "@/components/admin/ItineraryTypeManagement";

const SORT_OPTIONS = [
    { value: "none", label: "No Filter" },
    { value: "recent", label: "Most Recent" },
    { value: "likes", label: "Most Liked" },
    { value: "saves", label: "Most Saved" },
];

export default function ItineraryManagement() {
    const [itineraries, setItineraries] = useState([]);
    const [types, setTypes] = useState([]);
    const [newType, setNewType] = useState("");
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("ALL");
    const [selectedItinerary, setSelectedItinerary] = useState(null);
    const [openCreate, setOpenCreate] = useState(false);
    const [openView, setOpenView] = useState(false);
    const [typeFilter, setTypeFilter] = useState("all");
    const [sortFilter, setSortFilter] = useState("none");
    const [openType, setOpenType] = useState(false);
    const [openSort, setOpenSort] = useState(false);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loadingItineraries, setLoadingItineraries] = useState(true);
    const [loadingTypes, setLoadingTypes] = useState(true);

    const [itineraryError, setItineraryError] = useState("");
    const [typeError, setTypeError] = useState("");

    const requestIdRef = useRef(0);
    const sortRef = useRef(null);
    const typeRef = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (sortRef.current && !sortRef.current.contains(e.target))
                setOpenSort(false);
            if (typeRef.current && !typeRef.current.contains(e.target))
                setOpenType(false);
        };

        document.addEventListener("mousedown", handler);

        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // Fetching itinerary types
    const fetchTypes = useCallback(async () => {
        setLoadingTypes(true);
        setTypeError("");

        try {
            const result = await getItineraryTypesAdminService();

            if (result.success) {
                setTypes(result.data || []);
            } else {
                setTypes([]);
                setTypeError(
                    result.message || "Failed to load itinerary types.",
                );
            }
        } catch (error) {
            console.error("Failed to load itinerary types:", error);

            setTypes([]);
            setTypeError("Unable to load itinerary types. Please try again.");
        } finally {
            setLoadingTypes(false);
        }
    }, []);

    useEffect(() => {
        fetchTypes();
    }, [fetchTypes]);

    // Itinerary delete function
    const handleDelete = useCallback(
        async (itineraryId) => {
            const result = await deleteItineraryByAdminService({
                itineraryId,
            });

            if (result.success) {
                setItineraries((prev) => {
                    const remaining = prev.filter(
                        (itinerary) => itinerary.itineraryId !== itineraryId,
                    );

                    if (remaining.length === 0 && page > 0) {
                        setPage((p) => p - 1);
                        return prev;
                    }

                    return remaining;
                });

                toast.success("Itinerary deleted.");
            } else {
                toast.error(result.message);
            }
        },
        [page],
    );

    // Itinerary deletion confirmation
    const confirmDelete = useCallback(
        (itineraryId) => {
            toast(
                ({ closeToast }) => (
                    <ConfirmToast
                        message="Delete this itinerary? This cannot be undone."
                        confirmLabel="Delete"
                        onConfirm={async () => {
                            await handleDelete(itineraryId);
                            closeToast();
                        }}
                        onCancel={closeToast}
                    />
                ),
                { autoClose: false },
            );
        },
        [handleDelete],
    );

    // Fetching itineraries
    const fetchItineraries = useCallback(async () => {
        const requestId = ++requestIdRef.current;

        setLoadingItineraries(true);
        setItineraryError("");

        try {
            const result = await getAdminItinerariesService({
                page,
                size: 10,
                search,
                filter,
                type: typeFilter === "all" ? "" : typeFilter,
                sort: sortFilter,
            });

            if (requestId !== requestIdRef.current) return;

            if (result.success) {
                setItineraries(result.data?.content || []);
                setTotalPages(result.data?.totalPages || 0);
            } else {
                setItineraries([]);
                setTotalPages(0);
                setItineraryError(
                    result.message || "Failed to load itineraries.",
                );
            }
        } catch (error) {
            console.error("Failed to load itineraries:", error);

            if (requestId !== requestIdRef.current) return;

            setItineraries([]);
            setTotalPages(0);
            setItineraryError("Unable to load itineraries. Please try again.");
        } finally {
            if (requestId !== requestIdRef.current) return;

            setLoadingItineraries(false);
        }
    }, [page, search, filter, typeFilter, sortFilter]);

    const itineraryTypes = useMemo(
        () => [{ typeId: "all", name: "All Types" }, ...types],
        [types],
    );

    // Fetching itineraries after filters or searching
    useEffect(() => {
        const delay = setTimeout(() => fetchItineraries(), 400);

        return () => clearTimeout(delay);
    }, [fetchItineraries]);

    const sortLabel = useMemo(
        () =>
            SORT_OPTIONS.find((o) => o.value === sortFilter)?.label ??
            "No Filter",
        [sortFilter],
    );

    const typeLabel = useMemo(() => {
        if (typeFilter === "all") return "All Types";

        return (
            itineraryTypes.find((t) => t.name === typeFilter)?.name ||
            "All Types"
        );
    }, [typeFilter, itineraryTypes]);

    // Handling itinerary saving after edit or viewing
    const handleItinerarySaved = (updatedItinerary) => {
        setItineraries((prev) =>
            prev.map((it) =>
                it.itineraryId === updatedItinerary.itineraryId
                    ? updatedItinerary
                    : it,
            ),
        );
    };

    const handleEdit = useCallback((e, itinerary) => {
        e.stopPropagation();
        setSelectedItinerary(itinerary);
        setOpenView(false);
        setOpenCreate(true);
    }, []);

    const handleView = useCallback((e, itinerary) => {
        e.stopPropagation();
        setSelectedItinerary(itinerary);
        setOpenView(true);
        setOpenCreate(false);
    }, []);

    const handleCloseCreate = useCallback(() => {
        setOpenCreate(false);
        setSelectedItinerary(null);
    }, []);

    const handleCloseView = useCallback(() => {
        setOpenView(false);
        setSelectedItinerary(null);
    }, []);

    const sortActive = useMemo(() => sortFilter !== "none", [sortFilter]);
    const typeActive = useMemo(() => typeFilter !== "all", [typeFilter]);
    const isActive = filter !== "ALL";

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 font-primary tracking-tight mb-1">
                    Itinerary Management
                </h1>
                <p className="text-sm text-gray-400">
                    Manage all itineraries on the platform
                </p>
            </div>

            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 mb-5">
                {/* Search */}
                <div
                    className={`${ui.searchContainer} w-full sm:flex-1 sm:min-w-52 flex items-center gap-2.5`}
                >
                    <Search size={15} className="text-gray-400 flex-shrink-0" />
                    <input
                        type="text"
                        aria-label="Search itineraries by title, place or creator"
                        placeholder="Search by title, place or creator…"
                        className="w-full bg-transparent outline-none text-sm text-gray-700 placeholder:text-gray-300"
                        value={search}
                        onChange={(e) => {
                            setPage(0);
                            setSearch(e.target.value);
                        }}
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={() => setSearch("")}
                            aria-label="Clear itinerary search"
                            className="text-gray-300 hover:text-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 rounded cursor-pointer"
                        >
                            <X size={14} aria-hidden="true" />
                        </button>
                    )}
                </div>

                {/* Visibility */}
                <div className="relative">
                    <div className="flex items-center gap-1.5">
                        <select
                            value={filter}
                            onChange={(e) => {
                                setPage(0);
                                setFilter(e.target.value);
                            }}
                            className={`appearance-none pl-3 pr-7 py-2.5 text-sm font-medium border rounded-xl shadow-sm focus:outline-none transition-colors cursor-pointer
                                ${
                                    isActive
                                        ? "bg-gray-900 text-white border-gray-900"
                                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                                }`}
                        >
                            <option value="ALL">All</option>
                            <option value="PUBLIC">Public</option>
                            <option value="PRIVATE">Private</option>
                        </select>

                        <ChevronDown
                            size={13}
                            className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${
                                isActive ? "text-white" : "text-gray-400"
                            }`}
                        />
                    </div>
                </div>

                {/* Sort dropdown */}
                <div ref={sortRef} className="relative">
                    <button
                        onClick={() => {
                            setOpenSort((v) => !v);
                            setOpenType(false);
                        }}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium shadow-sm transition-colors cursor-pointer
                            ${
                                sortActive
                                    ? "bg-gray-900 text-white border-gray-900"
                                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                            }`}
                    >
                        <Filter size={13} /> {sortLabel}
                    </button>

                    {openSort && (
                        <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl border border-gray-100 shadow-lg z-20 py-1">
                            {SORT_OPTIONS.map((opt) => (
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
                                        }`}
                                >
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
                            setOpenType((v) => !v);
                            setOpenSort(false);
                        }}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium shadow-sm transition-colors cursor-pointer
                            ${
                                typeActive
                                    ? "bg-gray-900 text-white border-gray-900"
                                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                            }`}
                    >
                        <Filter size={13} /> {typeLabel}
                    </button>

                    {openType && (
                        <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl border border-gray-100 shadow-lg z-20 py-1 max-h-56 overflow-y-auto">
                            {itineraryTypes.map((type) => (
                                <button
                                    key={type.typeId}
                                    type="button"
                                    onClick={() => {
                                        setPage(0);
                                        setTypeFilter(
                                            type.typeId === "all"
                                                ? "all"
                                                : type.name,
                                        );
                                        setOpenType(false);
                                    }}
                                    className={`block w-full text-left px-4 py-2 text-sm capitalize transition-colors cursor-pointer
            ${
                typeFilter === (type.typeId === "all" ? "all" : type.name)
                    ? "bg-gray-50 text-gray-900 font-medium"
                    : "text-gray-600 hover:bg-gray-50"
            }`}
                                >
                                    {type.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mb-5">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1000px] text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 text-left">
                                {[
                                    "Title",
                                    "Location",
                                    "Creator",
                                    "Type",
                                    "Visibility",
                                    "Created",
                                    "Likes",
                                    "Saves",
                                    "Actions",
                                ].map((h) => (
                                    <th
                                        key={h}
                                        className={`px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-gray-400 ${
                                            h === "Actions" ? "text-right" : ""
                                        }`}
                                        scope="col"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody
                            aria-busy={loadingItineraries}
                            aria-label="Loading itineraries"
                        >
                            {loadingItineraries &&
                                Array.from({ length: 6 }).map((_, i) => (
                                    <tr
                                        key={i}
                                        className="border-b border-gray-50"
                                    >
                                        <td className="px-4 py-3">
                                            <Skeleton className="h-3.5 w-32" />
                                        </td>
                                        <td className="px-4 py-3">
                                            <Skeleton className="h-3.5 w-24" />
                                        </td>
                                        <td className="px-4 py-3">
                                            <Skeleton className="h-3.5 w-20" />
                                        </td>
                                        <td className="px-4 py-3">
                                            <Skeleton className="h-5 w-16 rounded-full" />
                                        </td>
                                        <td className="px-4 py-3">
                                            <Skeleton className="h-5 w-16 rounded-full" />
                                        </td>
                                        <td className="px-4 py-3">
                                            <Skeleton className="h-3.5 w-20" />
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <Skeleton className="h-3.5 w-8 mx-auto" />
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <Skeleton className="h-3.5 w-8 mx-auto" />
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Skeleton className="h-7 w-7 rounded-full" />
                                                <Skeleton className="h-7 w-7 rounded-full" />
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                            {!loadingItineraries &&
                                !itineraryError &&
                                itineraries.length === 0 && (
                                    <tr>
                                        <td colSpan={9}>
                                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                                                    <Search
                                                        size={20}
                                                        className="text-gray-300"
                                                        aria-hidden="true"
                                                    />
                                                </div>

                                                <p className="text-sm font-medium text-gray-500">
                                                    No itineraries found
                                                </p>

                                                <p className="text-xs text-gray-300 mt-1">
                                                    Try adjusting your search or
                                                    filters.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}

                            {!loadingItineraries &&
                                !itineraryError &&
                                itineraries.map((itinerary) => (
                                    <ItineraryTableRow
                                        key={itinerary.itineraryId}
                                        itinerary={itinerary}
                                        handleView={handleView}
                                        handleEdit={handleEdit}
                                        confirmDelete={confirmDelete}
                                    />
                                ))}
                        </tbody>
                    </table>
                </div>

                {!loadingItineraries && itineraryError && (
                    <div className="py-16 text-center">
                        <p className="text-sm text-gray-500 mb-3">
                            {itineraryError}
                        </p>
                        <button
                            onClick={fetchItineraries}
                            className="text-sm font-medium text-gray-700 hover:text-gray-900 underline underline-offset-2 cursor-pointer"
                        >
                            Try again
                        </button>
                    </div>
                )}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-3 mb-12">
                <button
                    type="button"
                    aria-label="Go to previous page"
                    disabled={page === 0 || totalPages === 0}
                    onClick={() => setPage((p) => p - 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                    <ChevronLeft size={15} aria-hidden="true" />
                </button>

                <span className="text-sm text-gray-500">
                    {totalPages > 0 ? (
                        <>
                            Page{" "}
                            <span className="font-semibold text-gray-900">
                                {page + 1}
                            </span>{" "}
                            of {totalPages}
                        </>
                    ) : (
                        "No pages"
                    )}
                </span>

                <button
                    type="button"
                    aria-label="Go to next page"
                    disabled={totalPages === 0 || page >= totalPages - 1}
                    onClick={() => setPage((p) => p + 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                    <ChevronRight size={15} aria-hidden="true" />
                </button>
            </div>

            {/* Type Management */}
            <ItineraryTypeManagement
                types={types}
                typeError={typeError}
                loadingTypes={loadingTypes}
                fetchTypes={fetchTypes}
            />

            {openCreate && (
                <CreateItineraryOverlay
                    open={openCreate}
                    existingItinerary={selectedItinerary}
                    onClose={handleCloseCreate}
                    onSaved={handleItinerarySaved}
                />
            )}

            {openView && (
                <ItineraryOverlay
                    itinerary={selectedItinerary}
                    onClose={handleCloseView}
                />
            )}
        </div>
    );
}
