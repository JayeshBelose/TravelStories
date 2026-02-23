import { useState } from "react";
import { Plus } from "lucide-react";
import CreateItineraryOverlay from "@/components/CreateItineraryOverlay";
import ItineraryOverlay from "@/components/ItineraryOverlay";
import { savedItineraries } from "@/assets/propData";

export default function MyItineraries() {
    const [activeTab, setActiveTab] = useState("created");
    const [openCreate, setOpenCreate] = useState(false);
    const [openView, setOpenView] = useState(false);
    const [selectedItinerary, setSelectedItinerary] = useState(null);

    const handleOpenSaved = itinerary => {
        setSelectedItinerary(itinerary);
        setOpenView(true);
    };

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

                {/* Show Create Button ONLY in Created Tab */}
                {activeTab === "created" && (
                    <button
                        onClick={() => setOpenCreate(true)}
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

            {/* CONTENT AREA */}
            {activeTab === "created" ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <p className="text-gray-500 mb-6">No itineraries created yet</p>

                    <button
                        onClick={() => setOpenCreate(true)}
                        className="bg-primary text-white px-6 py-3 rounded-full shadow hover:opacity-90 transition">
                        Create Your First Itinerary
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {savedItineraries.length === 0 ? (
                        <div className="text-center py-20 text-gray-500">
                            No saved itineraries yet
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {savedItineraries.map(itinerary => (
                                <div
                                    key={itinerary.id}
                                    onClick={() => handleOpenSaved(itinerary)}
                                    className="flex gap-6 bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition cursor-pointer border">
                                    {/* Thumbnail */}
                                    <img
                                        src={itinerary.thumbnail}
                                        alt={itinerary.title}
                                        className="w-40 h-40 rounded-xl object-cover"
                                    />

                                    {/* Content */}
                                    <div className="flex flex-col justify-between flex-1">
                                        <div>
                                            {/* Title */}
                                            <h2 className="text-2xl font-bold font-primary text-primary">
                                                {itinerary.title}
                                            </h2>

                                            {/* Location + Dates */}
                                            <div className="flex items-center gap-6 text-gray-500 mt-2 text-sm">
                                                <span>📍 {itinerary.location}</span>
                                                <span>
                                                    📅 {itinerary.startDate} -{" "}
                                                    {itinerary.endDate}
                                                </span>
                                            </div>

                                            {/* Created + Updated */}
                                            <div className="flex items-center gap-4 text-xs text-gray-400 mt-3">
                                                <span>
                                                    Created: {itinerary.createdAt}
                                                </span>
                                                <span>
                                                    Updated: {itinerary.updatedAt}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Bottom Row */}
                                        <div className="flex items-center gap-3 mt-4">
                                            <span className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                                                {itinerary.visibility}
                                            </span>

                                            <span className="px-3 py-1 text-xs rounded-full bg-orange-100 text-orange-600">
                                                by {itinerary.creator}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Create Overlay */}
            <CreateItineraryOverlay
                open={openCreate}
                onClose={() => setOpenCreate(false)}
            />

            {/* View Saved Overlay */}
            <ItineraryOverlay
                itinerary={selectedItinerary}
                onClose={() => {
                    setOpenView(false);
                    setSelectedItinerary(null);
                }}
            />
        </div>
    );
}
