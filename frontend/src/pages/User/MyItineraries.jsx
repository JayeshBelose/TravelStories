import { useEffect, useState } from "react";
import { Plus, Trash, Pencil } from "lucide-react";
import ItineraryOverlay from "@/components/ItineraryOverlay";
import CreateItineraryOverlay from "@/components/CreateItineraryOverlay";
import api from "@/api/axiosConfig";
import { toast } from "react-toastify";

export default function MyItineraries() {
    const [activeTab, setActiveTab] = useState("created");
    const [openCreate, setOpenCreate] = useState(false);
    const [openView, setOpenView] = useState(false);
    const [selectedItinerary, setSelectedItinerary] = useState(null);
    const [itineraries, setItineraries] = useState([]);

    const user = JSON.parse(localStorage.getItem("user"));

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

    const confirmUnsave = itineraryId => {
        toast(
            ({ closeToast }) => (
                <div>
                    <p className="mb-2">
                        Are you sure you want to remove this itinerary?
                    </p>

                    <div className="flex gap-2">
                        <button
                            className="bg-red-500 text-white px-3 py-1 rounded"
                            onClick={() => {
                                handleUnsave(itineraryId);
                                closeToast();
                            }}>
                            Remove
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

    const handleOpenItinerary = itinerary => {
        setSelectedItinerary(itinerary);
        setOpenCreate(false);
        setOpenView(true);
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

    // Deleting an itinerary
    const handleDelete = async itineraryId => {
        try {
            await api.delete(`/itineraries/${itineraryId}`);

            setItineraries(prev => prev.filter(it => it.itineraryId !== itineraryId));

            toast.success("Itinerary deleted successfully.");
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete itinerary.");
        }
    };

    // Unsaving an itinerary
    const handleUnsave = async itineraryId => {
        try {
            await api.post(`/users/${user.userId}/savedItineraries/${itineraryId}`);

            setItineraries(prev => prev.filter(it => it.itineraryId !== itineraryId));

            toast.success("Itinerary removed successfully.");
        } catch (error) {
            console.error(error);
            toast.error("Failed to remove itinerary.");
        }
    };

    // Fetch itineraries user has created and is part of as a member
    useEffect(() => {
        if (!user?.userId) return;

        const fetchItineraries = async () => {
            try {
                if (activeTab === "created") {
                    const createdResponse = await api.get(
                        `/itineraries/users/${user.userId}`,
                    );

                    const sharedResponse = await api.get(
                        `/itineraries/${user.userId}/membership`,
                    );

                    const combined = [...createdResponse.data, ...sharedResponse.data];

                    const unique = Array.from(
                        new Map(combined.map(item => [item.itineraryId, item])).values(),
                    );

                    setItineraries(unique);
                } else {
                    const savedResponse = await api.get(
                        `/itineraries/${user.userId}/saved`,
                    );
                    setItineraries(savedResponse.data);
                }
            } catch (error) {
                console.error(error);
            }
        };

        fetchItineraries();
    }, [activeTab, user?.userId]);

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-4xl font-bold font-primary text-primary">
                        My Itineraries
                    </h1>
                    <p className="text-gray-500 mt-2 mb-6">Manage your travel stories</p>
                </div>

                {activeTab === "created" && (
                    <button
                        onClick={() => {
                            setSelectedItinerary(null);
                            setOpenView(false);
                            setOpenCreate(true);
                        }}
                        className="flex items-center gap-2 bg-primary/90 text-white px-6 py-3 rounded-full shadow hover:bg-primary transition">
                        <Plus size={18} />
                        Create New Itinerary
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-8 border-b mb-10">
                <button
                    onClick={() => setActiveTab("created")}
                    className={`pb-3 ${
                        activeTab === "created"
                            ? "border-b-2 border-primary text-primary"
                            : "text-gray-500"
                    }`}>
                    Created & Shared
                </button>

                <button
                    onClick={() => setActiveTab("saved")}
                    className={`pb-3 ${
                        activeTab === "saved"
                            ? "border-b-2 border-primary text-primary"
                            : "text-gray-500"
                    }`}>
                    Saved
                </button>
            </div>

            {/* Content */}
            <div className="space-y-6">
                {itineraries.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <p className="text-gray-500 mb-6">
                            {activeTab === "created"
                                ? "No itineraries yet"
                                : "No saved itineraries yet"}
                        </p>
                    </div>
                ) : (
                    itineraries.map(itinerary => {
                        const isCreator = user?.username === itinerary.createdBy;
                        const isPublic = itinerary.public;

                        return (
                            <div
                                key={itinerary.itineraryId}
                                onClick={e => {
                                    if (e.target.closest(".action-btn")) return;
                                    handleOpenItinerary(itinerary);
                                }}
                                className={`group relative flex gap-6 p-6 rounded-2xl shadow-sm hover:shadow-md transition cursor-pointer
        ${isCreator ? "bg-gray-50" : "bg-secondary/10"}`}>
                                {/* Top Right Action Buttons (Creator Only) */}
                                {isCreator && (
                                    <div className="absolute top-4 right-4 flex gap-3 opacity-0 group-hover:opacity-100 transition">
                                        {/* Edit Button */}
                                        <button
                                            onClick={e => handleEdit(e, itinerary)}
                                            className="action-btn p-2 rounded-full hover:scale-110 transition bg-white shadow">
                                            <Pencil size={18} className="text-primary" />
                                        </button>

                                        {/* Delete Button */}
                                        <button
                                            onClick={e => {
                                                confirmDelete(itinerary.itineraryId);
                                            }}
                                            className="action-btn p-2 rounded-full hover:scale-110 transition bg-white shadow">
                                            <Trash size={18} className="text-red-500" />
                                        </button>
                                    </div>
                                )}
                                {/* Top Right Action Buttons (Viewer Only) */}
                                {!isCreator && activeTab === "saved" && (
                                    <div className="absolute top-4 right-4 flex gap-3 opacity-0 group-hover:opacity-100 transition">
                                        {/* Unsave Button */}
                                        <button
                                            onClick={e => {
                                                confirmUnsave(itinerary.itineraryId);
                                            }}
                                            className="action-btn p-2 rounded-full hover:scale-110 transition bg-white shadow">
                                            <Trash size={18} className="text-red-500" />
                                        </button>
                                    </div>
                                )}

                                {/* Thumbnail */}
                                <img
                                    src={`${import.meta.env.VITE_API_BASE_URL}/itineraries/${itinerary.itineraryId}/thumbnail`}
                                    alt={itinerary.title}
                                    className="w-40 h-40 rounded-xl object-cover"
                                />

                                {/* Details */}
                                <div className="flex flex-col justify-between flex-1">
                                    <div>
                                        <h2 className="text-2xl font-bold font-primary text-primary">
                                            {itinerary.title}
                                        </h2>

                                        <div className="text-sm text-primary/80 mt-2">
                                            {itinerary.place}
                                        </div>

                                        <div className="text-xs text-primary/80 mt-2">
                                            {itinerary.startDate} To {itinerary.endDate}
                                        </div>
                                    </div>

                                    <div className="flex gap-3 mt-4 text-xs">
                                        <span
                                            className={`px-3 py-1 font-semibold rounded-full bg-white ${
                                                isPublic
                                                    ? "border border-green-400 text-green-500"
                                                    : "border border-red-500 text-red-500"
                                            }`}>
                                            {itinerary.public ? "Public" : "Private"}
                                        </span>

                                        <span className="px-3 py-1 border border-secondary rounded-full bg-white text-secondary">
                                            by {itinerary.createdBy}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
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
