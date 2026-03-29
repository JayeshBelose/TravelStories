import { useEffect, useState, useMemo, useRef } from "react";
import { toast } from "react-toastify";
import api from "@/api/axiosConfig";
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
import CreateItineraryOverlay from "@/components/CreateItineraryOverlay";
import ItineraryOverlay from "@/components/ItineraryOverlay";

const SORT_OPTIONS = [
    { value: "none", label: "No Filter" },
    { value: "recent", label: "Most Recent" },
    { value: "likes", label: "Most Liked" },
    { value: "saves", label: "Most Saved" },
];

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

    const confirmDelete = itineraryId => {
        toast(
            ({ closeToast }) => (
                <ConfirmToast
                    message="Delete this itinerary? This cannot be undone."
                    confirmLabel="Delete"
                    onConfirm={() => {
                        handleDelete(itineraryId);
                        closeToast();
                    }}
                    onCancel={closeToast}
                />
            ),
            { autoClose: false },
        );
    };

    const confirmDeleteType = typeId => {
        toast(
            ({ closeToast }) => (
                <ConfirmToast
                    message="Delete this itinerary type? This cannot be undone."
                    confirmLabel="Delete"
                    onConfirm={() => {
                        deleteType(typeId);
                        closeToast();
                    }}
                    onCancel={closeToast}
                />
            ),
            { autoClose: false },
        );
    };

    const fetchItineraries = async () => {
        try {
            const res = await api.get("/admin/itineraries", {
                params: {
                    page,
                    size: 10,
                    search,
                    filter,
                    type: typeFilter,
                    sort: sortFilter,
                },
            });
            setItineraries(res.data.content || []);
            setTotalPages(res.data.totalPages || 0);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchTypes = async () => {
        try {
            const res = await api.get("/admin/itineraries/types");
            setTypes(res.data);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchTypes();
    }, []);

    const addType = async () => {
        if (!newType.trim()) {
            toast.error("Type name cannot be empty");
            return;
        }
        if (types.some(t => t.name.toLowerCase() === newType.trim().toLowerCase())) {
            toast.error("Type already exists");
            return;
        }
        try {
            await api.post(`/admin/itineraries/types/${newType}`);
            toast.success("Type added.");
            setNewType("");
            fetchTypes();
        } catch (err) {
            console.error(err);
            toast.error("Failed to add type");
        }
    };

    const deleteType = async typeId => {
        try {
            await api.delete(`/admin/itineraries/types/${typeId}`);
            toast.success("Type deleted.");
            fetchTypes();
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete type");
        }
    };

    const itineraryTypes = useMemo(() => {
        const t = itineraries.map(i => i.type).filter(Boolean);
        return ["all", ...new Set(t)];
    }, [itineraries]);

    useEffect(() => {
        const delay = setTimeout(() => fetchItineraries(), 400);
        return () => clearTimeout(delay);
    }, [search, filter, typeFilter, sortFilter, page]);

    const handleDelete = async id => {
        try {
            await api.delete(`/admin/itineraries/${id}`);
            setItineraries(prev => prev.filter(i => i.itineraryId !== id));
            toast.success("Itinerary deleted.");
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete itinerary.");
        }
    };

    const getSortLabel = () =>
        SORT_OPTIONS.find(o => o.value === sortFilter)?.label ?? "No Filter";
    const getTypeLabel = () => (typeFilter === "all" ? "All Types" : typeFilter);

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
            <div className="flex flex-wrap gap-3 mb-5">
                {/* Search */}
                <div className="flex-1 min-w-52 flex items-center gap-2.5 bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 shadow-sm focus-within:border-gray-400 transition-colors">
                    <Search size={15} className="text-gray-400 flex-shrink-0" />
                    <input
                        type="text"
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
                            onClick={() => setSearch("")}
                            className="text-gray-300 hover:text-gray-500 cursor-pointer">
                            <X size={14} />
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
                                ${visActive ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"}`}>
                            <option value="ALL">All</option>
                            <option value="PUBLIC">Public</option>
                            <option value="PRIVATE">Private</option>
                        </select>
                        <ChevronDown
                            size={13}
                            className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${visActive ? "text-white" : "text-gray-400"}`}
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
                            ${sortActive ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"}`}>
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
                                        ${sortFilter === opt.value ? "bg-gray-50 text-gray-900 font-medium" : "text-gray-600 hover:bg-gray-50"}`}>
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
                            ${typeActive ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"}`}>
                        <Filter size={13} /> {getTypeLabel()}
                    </button>
                    {openType && (
                        <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl border border-gray-100 shadow-lg z-20 py-1 max-h-56 overflow-y-auto">
                            {itineraryTypes.map(type => (
                                <button
                                    key={type}
                                    onClick={() => {
                                        setTypeFilter(type);
                                        setOpenType(false);
                                    }}
                                    className={`block w-full text-left px-4 py-2 text-sm capitalize transition-colors cursor-pointer
                                        ${typeFilter === type ? "bg-gray-50 text-gray-900 font-medium" : "text-gray-600 hover:bg-gray-50"}`}>
                                    {type === "all" ? "All Types" : type}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mb-5">
                <table className="w-full text-sm">
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
                                    className={`px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-gray-400 ${h === "Actions" ? "text-right" : ""}`}>
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {itineraries.map(item => (
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
                                            onClick={e => handleEdit(e, item)}
                                            className="w-7 h-7 rounded-full inline-flex items-center justify-center text-blue-400 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer">
                                            <Pencil size={13} />
                                        </button>
                                        <button
                                            onClick={() =>
                                                confirmDelete(item.itineraryId)
                                            }
                                            className="w-7 h-7 rounded-full inline-flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer">
                                            <Trash size={13} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {itineraries.length === 0 && (
                    <div className="py-16 text-center text-sm text-gray-400">
                        No itineraries found.
                    </div>
                )}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-3 mb-12">
                <button
                    disabled={page === 0}
                    onClick={() => setPage(p => p - 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer">
                    <ChevronLeft size={15} />
                </button>
                <span className="text-sm text-gray-500">
                    Page <span className="font-semibold text-gray-900">{page + 1}</span>{" "}
                    of {totalPages}
                </span>
                <button
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage(p => p + 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer">
                    <ChevronRight size={15} />
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

                {/* Type chips */}
                <div className="flex flex-wrap gap-2 mb-5">
                    {[...types]
                        .sort((a, b) =>
                            a.name
                                .trim()
                                .toLowerCase()
                                .localeCompare(b.name.trim().toLowerCase(), undefined, {
                                    sensitivity: "base",
                                }),
                        )
                        .map(type => (
                            <div
                                key={type.typeId}
                                className="group inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium px-3 py-1.5 rounded-full shadow-sm hover:border-gray-300 transition-colors">
                                <Tag size={12} className="text-gray-400" />
                                {type.name}
                                <button
                                    onClick={() => confirmDeleteType(type.typeId)}
                                    className="text-gray-300 hover:text-red-500 transition-colors cursor-pointer opacity-0 group-hover:opacity-100">
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                </div>

                {/* Add type input */}
                <div className="flex items-center gap-2 max-w-sm">
                    <div className="flex-1 flex items-center gap-2.5 bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 shadow-sm focus-within:border-gray-400 transition-colors">
                        <Tag size={14} className="text-gray-300 flex-shrink-0" />
                        <input
                            type="text"
                            value={newType}
                            placeholder="New type name…"
                            className="w-full bg-transparent outline-none text-sm text-gray-700 placeholder:text-gray-300"
                            onChange={e => setNewType(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === "Enter") addType();
                            }}
                        />
                    </div>
                    <button
                        onClick={addType}
                        className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors cursor-pointer flex-shrink-0">
                        <Plus size={14} /> Add
                    </button>
                </div>
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
