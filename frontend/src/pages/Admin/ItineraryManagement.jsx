import { useEffect, useState, useRef } from "react";
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
import {
    addItineraryTypeService,
    deleteItineraryByAdminService,
    deleteItineraryTypeService,
    getAdminItinerariesService,
    getItineraryTypesAdminService,
} from "@/services/adminService";

const SORT_OPTIONS = [
    { value: "none", label: "No Filter" },
    { value: "recent", label: "Most Recent" },
    { value: "likes", label: "Most Liked" },
    { value: "saves", label: "Most Saved" },
];

// Confirmation window
function ConfirmToast({ message, confirmLabel, onConfirm, onCancel }) {
    return (
        <div>
            <p className="text-sm text-gray-700 mb-3">{message}</p>
            <div className="flex gap-2">
                <button
                    onClick={onConfirm}
                    className="bg-red-500 hover:bg-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer">
                    {confirmLabel}
                </button>
                <button
                    onClick={onCancel}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer">
                    Cancel
                </button>
            </div>
        </div>
    );
}

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

    const sortRef = useRef(null);
    const typeRef = useRef(null);

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

    // Itinerary deletion confirmation
    const confirmDelete = itineraryId => {
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
    };

    // Itinerary type deletion confirmation
    const confirmDeleteType = typeId => {
        toast(
            ({ closeToast }) => (
                <ConfirmToast
                    message="Delete this itinerary type? This cannot be undone."
                    confirmLabel="Delete"
                    onConfirm={async () => {
                        await deleteType(typeId);
                        closeToast();
                    }}
                    onCancel={closeToast}
                />
            ),
            { autoClose: false },
        );
    };

    // Fetching itineraries
    const fetchItineraries = async () => {
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

            if (result.success) {
                setItineraries(result.data?.content || []);
                setTotalPages(result.data?.totalPages || 0);
            } else {
                setItineraries([]);
                setTotalPages(0);
                setItineraryError(result.message || "Failed to load itineraries.");
            }
        } catch (error) {
            console.error("Failed to load itineraries:", error);

            setItineraries([]);
            setTotalPages(0);
            setItineraryError("Unable to load itineraries. Please try again.");
        } finally {
            setLoadingItineraries(false);
        }
    };

    // Fetching itinerary types
    const fetchTypes = async () => {
        setLoadingTypes(true);
        setTypeError("");

        try {
            const result = await getItineraryTypesAdminService();

            if (result.success) {
                setTypes(result.data || []);
            } else {
                setTypes([]);
                setTypeError(result.message || "Failed to load itinerary types.");
            }
        } catch (error) {
            console.error("Failed to load itinerary types:", error);

            setTypes([]);
            setTypeError("Unable to load itinerary types. Please try again.");
        } finally {
            setLoadingTypes(false);
        }
    };

    const itineraryTypes = [{ typeId: "all", name: "All Types" }, ...types];

    useEffect(() => {
        fetchTypes();
    }, []);

    // Add and delete functions for itinerary types
    const addType = async () => {
        if (!newType.trim()) {
            toast.error("Type name cannot be empty");
            return;
        }

        if (types.some(t => t.name.toLowerCase() === newType.trim().toLowerCase())) {
            toast.error("Type already exists");
            return;
        }

        const result = await addItineraryTypeService({
            typeName: newType.trim(),
        });

        if (result.success) {
            toast.success("Type added.");
            setNewType("");
            fetchTypes();
        } else {
            toast.error(result.message);
        }
    };

    const deleteType = async typeId => {
        const result = await deleteItineraryTypeService({
            typeId,
        });

        if (result.success) {
            toast.success("Type deleted.");
            fetchTypes();
        } else {
            toast.error(result.message);
        }
    };

    // Fetching itineraries after filters or searching
    useEffect(() => {
        const delay = setTimeout(() => fetchItineraries(), 400);

        return () => clearTimeout(delay);
    }, [search, filter, typeFilter, sortFilter, page]);

    // Itinerary delete function
    const handleDelete = async itineraryId => {
        const result = await deleteItineraryByAdminService({
            itineraryId,
        });

        if (result.success) {
            const remaining = itineraries.filter(
                itinerary => itinerary.itineraryId !== itineraryId,
            );

            if (remaining.length === 0 && page > 0) {
                setPage(prev => prev - 1);
            } else {
                setItineraries(remaining);
            }

            toast.success("Itinerary deleted.");
        } else {
            toast.error(result.message);
        }
    };

    const getSortLabel = () =>
        SORT_OPTIONS.find(o => o.value === sortFilter)?.label ?? "No Filter";

    const getTypeLabel = () => (typeFilter === "all" ? "All Types" : typeFilter);

    // Handling itinerary saving after edit or viewing
    const handleItinerarySaved = updatedItinerary => {
        setItineraries(prev =>
            prev.map(it =>
                it.itineraryId === updatedItinerary.itineraryId ? updatedItinerary : it,
            ),
        );
    };

    const handleEdit = (e, itinerary) => {
        e.stopPropagation();
        setSelectedItinerary(itinerary);
        setOpenView(false);
        setOpenCreate(true);
    };

    const handleView = (e, itinerary) => {
        e.stopPropagation();
        setSelectedItinerary(itinerary);
        setOpenView(true);
        setOpenCreate(false);
    };

    const sortActive = sortFilter !== "none";
    const typeActive = typeFilter !== "all";
    const visActive = filter !== "ALL";

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
                <div className="w-full sm:flex-1 sm:min-w-52 flex items-center gap-2.5 bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 shadow-sm focus-within:border-gray-400 transition-colors">
                    <Search size={15} className="text-gray-400 flex-shrink-0" />
                    <input
                        type="text"
                        aria-label="Search itineraries by title, place or creator"
                        placeholder="Search by title, place or creator…"
                        className="w-full bg-transparent outline-none text-sm text-gray-700 placeholder:text-gray-300"
                        value={search}
                        onChange={e => {
                            setPage(0);
                            setSearch(e.target.value);
                        }}
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={() => setSearch("")}
                            aria-label="Clear itinerary search"
                            className="text-gray-300 hover:text-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 rounded cursor-pointer">
                            <X size={14} aria-hidden="true" />
                        </button>
                    )}
                </div>

                {/* Visibility */}
                <div className="relative">
                    <div className="flex items-center gap-1.5">
                        <select
                            value={filter}
                            onChange={e => {
                                setPage(0);
                                setFilter(e.target.value);
                            }}
                            className={`appearance-none pl-3 pr-7 py-2.5 text-sm font-medium border rounded-xl shadow-sm focus:outline-none transition-colors cursor-pointer
                                ${
                                    visActive
                                        ? "bg-gray-900 text-white border-gray-900"
                                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                                }`}>
                            <option value="ALL">All</option>
                            <option value="PUBLIC">Public</option>
                            <option value="PRIVATE">Private</option>
                        </select>

                        <ChevronDown
                            size={13}
                            className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${
                                visActive ? "text-white" : "text-gray-400"
                            }`}
                        />
                    </div>
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
                        <Filter size={13} /> {getSortLabel()}
                    </button>

                    {openSort && (
                        <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl border border-gray-100 shadow-lg z-20 py-1">
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
                        <Filter size={13} /> {getTypeLabel()}
                    </button>

                    {openType && (
                        <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl border border-gray-100 shadow-lg z-20 py-1 max-h-56 overflow-y-auto">
                            {itineraryTypes.map(type => (
                                <button
                                    key={type.typeId}
                                    type="button"
                                    onClick={() => {
                                        setPage(0);
                                        setTypeFilter(
                                            type.typeId === "all" ? "all" : type.name,
                                        );
                                        setOpenType(false);
                                    }}
                                    className={`block w-full text-left px-4 py-2 text-sm capitalize transition-colors cursor-pointer
            ${
                typeFilter === (type.typeId === "all" ? "all" : type.name)
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
                                ].map(h => (
                                    <th
                                        key={h}
                                        className={`px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-gray-400 ${
                                            h === "Actions" ? "text-right" : ""
                                        }`}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody
                            aria-busy={loadingItineraries}
                            aria-label="Loading itineraries">
                            {loadingItineraries &&
                                Array.from({ length: 6 }).map((_, i) => (
                                    <tr key={i} className="border-b border-gray-50">
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
                                itineraries.map(item => (
                                    <tr
                                        key={item.itineraryId}
                                        className="border-b border-gray-50 hover:bg-gray-50/70 transition-colors">
                                        {/* Title */}
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={e => handleView(e, item)}
                                                className="text-sm font-semibold text-gray-900 hover:underline underline-offset-2 cursor-pointer text-left font-primary">
                                                {item.title}
                                            </button>
                                        </td>

                                        {/* Place */}
                                        <td className="px-4 py-3 text-sm text-gray-500">
                                            {item.place}
                                        </td>

                                        {/* Creator */}
                                        <td className="px-4 py-3 text-sm text-gray-600 capitalize">
                                            {item.createdBy}
                                        </td>

                                        {/* Type */}
                                        <td className="px-4 py-3">
                                            <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-gray-100 text-gray-500 border border-gray-200 px-2 py-0.5 rounded-full capitalize">
                                                <Tag size={9} /> {item.type || "—"}
                                            </span>
                                        </td>

                                        {/* Visibility */}
                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border
                                        ${
                                            item.public
                                                ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                                                : "bg-red-50 border-red-200 text-red-500"
                                        }`}>
                                                {item.public ? (
                                                    <>
                                                        <Globe size={9} /> Public
                                                    </>
                                                ) : (
                                                    <>
                                                        <Lock size={9} /> Private
                                                    </>
                                                )}
                                            </span>
                                        </td>

                                        {/* Date */}
                                        <td className="px-4 py-3 text-sm text-gray-400">
                                            {new Date(item.createdAt).toLocaleDateString(
                                                "en-GB",
                                                {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric",
                                                },
                                            )}
                                        </td>

                                        {/* Likes */}
                                        <td className="px-4 py-3 text-sm text-gray-600 text-center">
                                            {item.likeCount}
                                        </td>

                                        {/* Saves */}
                                        <td className="px-4 py-3 text-sm text-gray-600 text-center">
                                            {item.saveCount}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    type="button"
                                                    onClick={e => handleEdit(e, item)}
                                                    aria-label={`Edit itinerary ${item.title}`}
                                                    className="w-9 h-9 rounded-full inline-flex items-center justify-center text-blue-400 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer">
                                                    <Pencil size={14} />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        confirmDelete(item.itineraryId)
                                                    }
                                                    aria-label={`Delete itinerary ${item.title}`}
                                                    className="w-9 h-9 rounded-full inline-flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer">
                                                    <Trash size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>

                {!loadingItineraries && itineraryError && (
                    <div className="py-16 text-center">
                        <p className="text-sm text-gray-500 mb-3">{itineraryError}</p>
                        <button
                            onClick={fetchItineraries}
                            className="text-sm font-medium text-gray-700 hover:text-gray-900 underline underline-offset-2 cursor-pointer">
                            Try again
                        </button>
                    </div>
                )}

                {!loadingItineraries && !itineraryError && itineraries.length === 0 && (
                    <div className="py-16 text-center text-sm text-gray-400">
                        No itineraries found.
                    </div>
                )}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-3 mb-12">
                <button
                    type="button"
                    aria-label="Go to previous page"
                    disabled={page === 0 || totalPages === 0}
                    onClick={() => setPage(p => p - 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer">
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
                    onClick={() => setPage(p => p + 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer">
                    <ChevronRight size={15} aria-hidden="true" />
                </button>
            </div>

            {/* Type Management */}
            <div className="border-t border-gray-100 pt-10">
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 font-primary tracking-tight mb-1">
                        Itinerary Types
                    </h2>
                    <p className="text-sm text-gray-400">
                        Add or remove itinerary categories
                    </p>
                </div>

                {/* Type management state */}
                {loadingTypes ? (
                    <div className="flex flex-wrap gap-2 mb-5">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <Skeleton key={index} className="h-8 w-24 rounded-full" />
                        ))}
                    </div>
                ) : typeError ? (
                    <div className="mb-5 text-sm text-gray-500">
                        <p className="mb-2">{typeError}</p>

                        <button
                            type="button"
                            onClick={fetchTypes}
                            className="font-medium text-gray-700 hover:text-gray-900 underline underline-offset-2 cursor-pointer">
                            Try again
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Type chips */}
                        <div className="flex flex-wrap gap-2 mb-5">
                            {[...types]
                                .sort((a, b) =>
                                    a.name
                                        .trim()
                                        .toLowerCase()
                                        .localeCompare(
                                            b.name.trim().toLowerCase(),
                                            undefined,
                                            {
                                                sensitivity: "base",
                                            },
                                        ),
                                )
                                .map(type => (
                                    <div
                                        key={type.typeId}
                                        className="group inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium px-3 py-1.5 rounded-full shadow-sm hover:border-gray-300 transition-colors">
                                        <Tag size={12} className="text-gray-400" />

                                        {type.name}

                                        <button
                                            type="button"
                                            onClick={() => confirmDeleteType(type.typeId)}
                                            aria-label={`Delete itinerary type ${type.name}`}
                                            className="text-gray-300 hover:text-red-500 transition-colors cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100">
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                        </div>

                        {/* Add type input */}
                        <div className="flex items-center gap-2 max-w-sm">
                            <div className="flex-1 flex items-center gap-2.5 bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 shadow-sm focus-within:border-gray-400 transition-colors">
                                <Tag
                                    size={14}
                                    className="text-gray-300 flex-shrink-0"
                                    aria-hidden="true"
                                />

                                <input
                                    type="text"
                                    value={newType}
                                    placeholder="New type name…"
                                    aria-label="New itinerary type name"
                                    className="w-full bg-transparent outline-none text-sm text-gray-700 placeholder:text-gray-300"
                                    onChange={e => setNewType(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            addType();
                                        }
                                    }}
                                />
                            </div>

                            <button
                                type="button"
                                onClick={addType}
                                className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors cursor-pointer flex-shrink-0">
                                <Plus size={14} aria-hidden="true" />
                                Add
                            </button>
                        </div>
                    </>
                )}
            </div>

            {openCreate && (
                <CreateItineraryOverlay
                    open={openCreate}
                    existingItinerary={selectedItinerary}
                    onClose={() => {
                        setOpenCreate(false);
                        setSelectedItinerary(null);
                    }}
                    onSaved={handleItinerarySaved}
                />
            )}

            {openView && (
                <ItineraryOverlay
                    itinerary={selectedItinerary}
                    onClose={() => {
                        setOpenView(false);
                        setSelectedItinerary(null);
                    }}
                />
            )}
        </div>
    );
}
