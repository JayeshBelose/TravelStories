import { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import api from "@/api/axiosConfig";
import { Search, Trash, Pencil, Filter } from "lucide-react";
import CreateItineraryOverlay from "@/components/CreateItineraryOverlay";
import ItineraryOverlay from "@/components/ItineraryOverlay";

export default function ItineraryManagement() {
    const [itineraries, setItineraries] = useState([]);
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

    const confirmDelete = itineraryId => {
        toast(
            ({ closeToast }) => (
                <div>
                    <p className="mb-2">
                        Are you sure you want to delete this itinerary? This action cannot
                        be undone.
                    </p>

                    <div className="flex gap-2">
                        <button
                            className="bg-red-500 text-white px-3 py-1 rounded"
                            onClick={() => {
                                handleDelete(itineraryId);
                                closeToast();
                            }}>
                            Delete
                        </button>

                        <button
                            className="bg-gray-300 px-3 py-1 rounded"
                            onClick={closeToast}>
                            Cancel
                        </button>
                    </div>
                </div>
            ),
            { autoClose: false },
        );
    };

    // Fetch data
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

    // Get Itinerary Types
    const itineraryTypes = useMemo(() => {
        const types = itineraries.map(i => i.type).filter(Boolean);
        return ["all", ...new Set(types)];
    }, [itineraries]);

    // Debounced fetch
    useEffect(() => {
        const delay = setTimeout(() => {
            fetchItineraries();
        }, 400);

        return () => clearTimeout(delay);
    }, [search, filter, typeFilter, sortFilter, page]);

    // Delete
    const handleDelete = async id => {
        try {
            await api.delete(`/admin/itineraries/${id}`);
            setItineraries(prev => prev.filter(i => i.id !== id));
            toast.success("Itinerary deleted successfully.");
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete itinerary.");
        }
    };

    // Labels
    const getSortLabel = () => {
        if (sortFilter === "likes") return "Most Liked";
        if (sortFilter === "saves") return "Most Saved";
        if (sortFilter === "recent") return "Most Recent";
        return "No Filter";
    };

    const getTypeLabel = () => {
        if (typeFilter === "all") return "All Types";
        return typeFilter;
    };

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

    return (
        <div>
            <h1 className="text-4xl font-bold mb-2 text-primary font-primary">
                Itinerary Management
            </h1>
            <p className="text-gray-500 pb-6">Manage all itineraries on the platform</p>

            {/* Search + Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                {/* Search */}
                <div className="flex items-center gap-3 bg-card p-3 rounded-2xl shadow-md flex-1">
                    <Search size={18} className="text-primary" />
                    <input
                        type="text"
                        placeholder="Search by title, place or creator..."
                        className="w-full bg-transparent outline-none text-primary"
                        value={search}
                        onChange={e => {
                            setPage(0);
                            setSearch(e.target.value);
                        }}
                    />
                </div>

                {/* Visibility Filter */}
                <div className="flex items-center gap-1 bg-white p-3 rounded-2xl shadow-md hover:bg-secondary/10">
                    <select
                        value={filter}
                        onChange={e => {
                            setPage(0);
                            setFilter(e.target.value);
                        }}
                        className="text-primary outline-none">
                        <option value="ALL">All</option>
                        <option value="PUBLIC">Public</option>
                        <option value="PRIVATE">Private</option>
                    </select>
                    <Filter size={16} className="text-primary" />
                </div>

                {/* Sort Filter */}
                <div className="relative bg-white">
                    <button
                        onClick={() => setOpenSort(!openSort)}
                        className={`flex items-center gap-2 p-3 rounded-2xl shadow-md hover:bg-secondary/10 ${getSortLabel() === "No Filter" ? "" : "bg-secondary/10"}`}>
                        {getSortLabel()}
                        <Filter size={16} />
                    </button>

                    {openSort && (
                        <div className="absolute overflow-hidden right-0 mt-2 w-44 bg-white rounded-2xl shadow-lg z-10">
                            <button
                                onClick={() => {
                                    setSortFilter("none");
                                    setOpenSort(false);
                                }}
                                className="block w-full text-left px-4 py-2 hover:bg-secondary/10">
                                No Filter
                            </button>
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
                        </div>
                    )}
                </div>

                {/* Type Filter */}
                <div className="relative bg-white">
                    <button
                        onClick={() => setOpenType(!openType)}
                        className={`flex items-center gap-2 p-3 rounded-2xl shadow-md hover:bg-secondary/10 ${typeFilter === "all" ? "" : "bg-secondary/10"}`}>
                        {getTypeLabel()}
                        <Filter size={16} />
                    </button>

                    {openType && (
                        <div className="absolute overflow-hidden right-0 mt-2 w-44 bg-white rounded-2xl shadow-lg z-10 max-h-60 overflow-y-auto">
                            {itineraryTypes.map(type => (
                                <button
                                    key={type}
                                    onClick={() => {
                                        setTypeFilter(type);
                                        setOpenType(false);
                                    }}
                                    className="block w-full text-left px-4 py-2 hover:bg-secondary/10 capitalize">
                                    {type === "all" ? "All Types" : type}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <table className="w-full text-sm">
                    {/* Column Names */}
                    <thead className="text-white items-center bg-primary font-primary">
                        <tr>
                            <th className="p-4">Title</th>
                            <th>Location</th>
                            <th>Creator</th>
                            <th>Type</th>
                            <th>Visibility</th>
                            <th>Created</th>
                            <th>Likes</th>
                            <th>Saves</th>
                            <th className="text-right pr-6">Actions</th>
                        </tr>
                    </thead>

                    {/* Table Data */}
                    <tbody className="text-center">
                        {itineraries.map(item => (
                            <tr
                                key={item.itineraryId}
                                className="border-b border-primary/20 hover:bg-secondary/10">
                                <td
                                    onClick={e => handleView(e, item)}
                                    className="p-4 text-primary font-medium cursor-pointer">
                                    {item.title}
                                </td>

                                <td className="text-primary">{item.place}</td>

                                <td className="text-primary capitalize">
                                    {item.createdBy}
                                </td>

                                <td>
                                    <span className="text-secondary bg-secondary/20 px-2 py-1 rounded-2xl">
                                        {item.type || "-"}
                                    </span>
                                </td>

                                <td>
                                    <span
                                        className={`px-2 py-1 rounded-2xl ${
                                            item.public
                                                ? "bg-green-100 text-green-500"
                                                : "bg-red-100 text-red-500"
                                        }`}>
                                        {item.public ? "Public" : "Private"}
                                    </span>
                                </td>

                                <td className="text-primary">
                                    {new Date(item.createdAt).toLocaleDateString(
                                        "en-GB",
                                        {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                        },
                                    )}
                                </td>

                                <td>{item.likeCount}</td>

                                <td>{item.saveCount}</td>

                                <td>
                                    <button
                                        onClick={e => handleEdit(e, item)}
                                        className="text-blue-500 rounded-full bg-white p-1 mr-2 cursor-pointer hover:scale-110 hover:shadow-md">
                                        <Pencil size={18} />
                                    </button>
                                    <button
                                        onClick={e => {
                                            confirmDelete(item.itineraryId);
                                        }}
                                        className="text-red-500 rounded-full bg-white p-1 cursor-pointer hover:scale-110 hover:shadow-md">
                                        <Trash size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-center gap-3 mt-6">
                <button
                    disabled={page === 0}
                    onClick={() => setPage(p => p - 1)}
                    className="px-3 py-1 bg-card rounded disabled:opacity-50">
                    Prev
                </button>

                <span className="px-3 py-1 text-primary">
                    {page + 1} / {totalPages}
                </span>

                <button
                    disabled={page === totalPages - 1}
                    onClick={() => setPage(p => p + 1)}
                    className="px-3 py-1 bg-card rounded disabled:opacity-50">
                    Next
                </button>
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
