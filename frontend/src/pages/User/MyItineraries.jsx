import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import ItineraryOverlay from "@/components/ItineraryOverlay";
import CreateItineraryOverlay from "@/components/CreateItineraryOverlay";
import api from "@/api/axiosConfig";

export default function MyItineraries() {
    const [activeTab, setActiveTab] = useState("created");
    const [openCreate, setOpenCreate] = useState(false);
    const [openView, setOpenView] = useState(false);
    const [selectedItinerary, setSelectedItinerary] = useState(null);
    const [itineraries, setItineraries] = useState([]);

    const user = JSON.parse(localStorage.getItem("user"));

    const handleOpenItinerary = itinerary => {
        setSelectedItinerary(itinerary);

        if (activeTab === "saved") {
            setOpenCreate(false);
            setOpenView(true);
            return;
        }

        if (itinerary.createdBy === user?.username) {
            // Creator → edit
            setOpenView(false);
            setOpenCreate(true);
        } else {
            // Member → view
            setOpenCreate(false);
            setOpenView(true);
        }
    };

    const handleItinerarySaved = updatedItinerary => {
        setItineraries(prev =>
            prev.map(it =>
                it.itineraryId === updatedItinerary.itineraryId ? updatedItinerary : it,
            ),
        );
    };

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
                        className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full shadow hover:opacity-90 transition">
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

            {/* CONTENT */}
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
                    itineraries.map(itinerary => (
                        <div
                            key={itinerary.itineraryId}
                            onClick={() => handleOpenItinerary(itinerary)}
                            className="flex gap-6 bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition cursor-pointer border">
                            <img
                                src={`${import.meta.env.VITE_API_BASE_URL}/itineraries/${itinerary.itineraryId}/thumbnail`}
                                alt={itinerary.title}
                                className="w-40 h-40 rounded-xl object-cover"
                            />

                            <div className="flex flex-col justify-between flex-1">
                                <div>
                                    <h2 className="text-2xl font-bold font-primary text-primary">
                                        {itinerary.title}
                                    </h2>

                                    <div className="text-sm text-gray-500 mt-2">
                                        {itinerary.place}
                                    </div>

                                    <div className="text-xs text-gray-500 mt-2">
                                        {itinerary.startDate} - {itinerary.endDate}
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-4 text-xs">
                                    <span className="px-3 py-1 rounded-full bg-gray-100">
                                        {itinerary.isPublic ? "Public" : "Private"}
                                    </span>
                                    <span className="px-3 py-1 rounded-full bg-secondary/80 text-primary">
                                        by {itinerary.createdBy}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* 🔥 CONDITIONAL RENDERING FIX */}
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
