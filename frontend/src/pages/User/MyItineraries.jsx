import { useEffect, useState } from "react";
import {
    Plus,
    Trash,
    Pencil,
    MapPin,
    Calendar,
    Globe,
    Lock,
    BookMarked,
    LayoutList,
    Loader2,
} from "lucide-react";
import ItineraryOverlay from "@/components/itinerary/ItineraryOverlay";
import CreateItineraryOverlay from "@/components/itinerary/CreateItineraryOverlay";
import ItineraryThumbnail from "@/components/itinerary/ItineraryThumbnail";
import ErrorState from "@/components/common/ErrorState";
import ConfirmToast from "@/components/common/ConfirmToast";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "react-toastify";
import {
    deleteItineraryService,
    getSavedItinerariesService,
    getSharedItinerariesService,
    getUserCreatedItinerariesService,
    toggleSavedItineraryService,
} from "@/services/itineraryService";

export default function MyItineraries() {
    const [activeTab, setActiveTab] = useState("created");
    const [openCreate, setOpenCreate] = useState(false);
    const [openView, setOpenView] = useState(false);
    const [selectedItinerary, setSelectedItinerary] = useState(null);
    const [createdItineraries, setCreatedItineraries] = useState([]);
    const [savedItineraries, setSavedItineraries] = useState([]);
    const [loadingCreated, setLoadingCreated] = useState(true);
    const [loadingSaved, setLoadingSaved] = useState(true);
    const [createdError, setCreatedError] = useState(null);
    const [savedError, setSavedError] = useState(null);
    const [deleteLoadingId, setDeleteLoadingId] = useState(null);
    const [unsaveLoadingId, setUnsaveLoadingId] = useState(null);

    const user = JSON.parse(sessionStorage.getItem("user"));

    const confirmDelete = (itineraryId) => {
        toast(
            ({ closeToast }) => (
                <ConfirmToast
                    message="Are you sure you want to delete this itinerary? This action cannot be undone."
                    confirmLabel="Delete"
                    loadingLabel="Deleting…"
                    loading={deleteLoadingId === itineraryId}
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

    const confirmUnsave = (itineraryId) => {
        toast(
            ({ closeToast }) => (
                <ConfirmToast
                    message="Are you sure you want to remove this saved itinerary?"
                    confirmLabel="Remove"
                    loadingLabel="Removing…"
                    loading={unsaveLoadingId === itineraryId}
                    onConfirm={async () => {
                        await handleUnsave(itineraryId);
                        closeToast();
                    }}
                    onCancel={closeToast}
                />
            ),
            { autoClose: false },
        );
    };

    const handleOpenItinerary = (itinerary) => {
        setSelectedItinerary(itinerary);
        setOpenCreate(false);
        setOpenView(true);
    };

    const handleItinerarySaved = (updatedItinerary) => {
        setCreatedItineraries((prev) =>
            prev.map((it) =>
                it.itineraryId === updatedItinerary.itineraryId
                    ? updatedItinerary
                    : it,
            ),
        );
    };

    const handleEdit = (e, itinerary) => {
        e.stopPropagation();
        setSelectedItinerary(itinerary);
        setOpenView(false);
        setOpenCreate(true);
    };

    const handleDelete = async (itineraryId) => {
        if (deleteLoadingId === itineraryId) return;

        setDeleteLoadingId(itineraryId);

        try {
            const result = await deleteItineraryService({
                itineraryId,
            });

            if (result.success) {
                setCreatedItineraries((prev) =>
                    prev.filter((it) => it.itineraryId !== itineraryId),
                );

                toast.success("Itinerary deleted successfully.");
            } else {
                toast.error(result.message);
            }
        } finally {
            setDeleteLoadingId(null);
        }
    };

    const handleUnsave = async (itineraryId) => {
        if (unsaveLoadingId === itineraryId) return;

        setUnsaveLoadingId(itineraryId);

        try {
            const result = await toggleSavedItineraryService({
                userId: user.userId,
                itineraryId,
            });

            if (result.success) {
                setSavedItineraries((prev) =>
                    prev.filter((it) => it.itineraryId !== itineraryId),
                );

                toast.success("Itinerary removed successfully.");
            } else {
                toast.error(result.message);
            }
        } finally {
            setUnsaveLoadingId(null);
        }
    };

    const fetchCreatedItineraries = async () => {
        if (!user?.userId) return;

        setLoadingCreated(true);
        setCreatedError(null);

        const [createdResult, sharedResult] = await Promise.all([
            getUserCreatedItinerariesService({
                userId: user.userId,
            }),
            getSharedItinerariesService({
                userId: user.userId,
            }),
        ]);

        if (createdResult.success && sharedResult.success) {
            const combined = [...createdResult.data, ...sharedResult.data];

            const unique = Array.from(
                new Map(
                    combined.map((item) => [item.itineraryId, item]),
                ).values(),
            );

            setCreatedItineraries(unique);
        } else {
            setCreatedError(
                createdResult.success
                    ? sharedResult.message
                    : createdResult.message,
            );
        }

        setLoadingCreated(false);
    };

    const fetchSavedItineraries = async () => {
        if (!user?.userId) return;

        setLoadingSaved(true);
        setSavedError(null);

        const result = await getSavedItinerariesService({
            userId: user.userId,
        });

        if (result.success) {
            setSavedItineraries(result.data);
        } else {
            setSavedError(result.message);
        }

        setLoadingSaved(false);
    };

    // Fetch created & shared itineraries
    useEffect(() => {
        fetchCreatedItineraries();
    }, [user?.userId]);

    // Fetch saved itineraries
    useEffect(() => {
        fetchSavedItineraries();
    }, [user?.userId]);

    const TABS = [
        { key: "created", label: "Created & Shared", icon: LayoutList },
        { key: "saved", label: "Saved", icon: BookMarked },
    ];

    return (
        <div>
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold font-primary text-gray-900 tracking-tight mb-1">
                        My Itineraries
                    </h1>

                    <p className="text-sm text-gray-400">
                        Manage your travel stories
                    </p>
                </div>

                {activeTab === "created" && (
                    <button
                        type="button"
                        onClick={() => {
                            setSelectedItinerary(null);
                            setOpenView(false);
                            setOpenCreate(true);
                        }}
                        className="flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl shadow-sm transition-colors cursor-pointer"
                    >
                        <Plus size={15} />
                        New Itinerary
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-gray-100 mb-6">
                {TABS.map((tab) => (
                    <button
                        key={tab.key}
                        type="button"
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors cursor-pointer
                        ${
                            activeTab === tab.key
                                ? "border-gray-900 text-gray-900"
                                : "border-transparent text-gray-400 hover:text-gray-600"
                        }`}
                    >
                        <tab.icon size={14} />

                        {tab.label}

                        <span
                            className={`text-xs px-1.5 py-0.5 rounded-full font-semibold
                        ${
                            activeTab === tab.key
                                ? "bg-gray-900 text-white"
                                : "bg-gray-100 text-gray-400"
                        }`}
                        >
                            {tab.key === "created"
                                ? createdItineraries.length
                                : savedItineraries.length}
                        </span>
                    </button>
                ))}
            </div>

            {/* Content */}
            {(() => {
                const itineraries =
                    activeTab === "created"
                        ? createdItineraries
                        : savedItineraries;

                const loading =
                    activeTab === "created" ? loadingCreated : loadingSaved;

                if (loading)
                    return (
                        <div
                            aria-busy="true"
                            aria-label="Loading itineraries"
                            className="space-y-4"
                        >
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="flex gap-5 p-5 bg-white border border-gray-100 rounded-2xl"
                                >
                                    <Skeleton className="w-36 h-36 rounded-xl flex-shrink-0" />

                                    <div className="flex-1 space-y-3 pt-1">
                                        <Skeleton className="h-4 w-2/3" />
                                        <Skeleton className="h-3 w-1/3" />
                                        <Skeleton className="h-3 w-1/4" />

                                        <div className="flex gap-2 mt-4">
                                            <Skeleton className="h-5 w-16 rounded-full" />
                                            <Skeleton className="h-5 w-20 rounded-full" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    );

                const error =
                    activeTab === "created" ? createdError : savedError;

                if (error)
                    return (
                        <ErrorState
                            message={error}
                            onRetry={
                                activeTab === "created"
                                    ? fetchCreatedItineraries
                                    : fetchSavedItineraries
                            }
                        />
                    );

                if (itineraries.length === 0)
                    return (
                        <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
                            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                                {activeTab === "created" ? (
                                    <LayoutList
                                        size={24}
                                        className="text-gray-300"
                                    />
                                ) : (
                                    <BookMarked
                                        size={24}
                                        className="text-gray-300"
                                    />
                                )}
                            </div>

                            <p className="text-sm font-medium text-gray-500">
                                {activeTab === "created"
                                    ? "No itineraries yet"
                                    : "No saved itineraries yet"}
                            </p>

                            {activeTab === "created" && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedItinerary(null);
                                        setOpenCreate(true);
                                    }}
                                    className="mt-2 flex items-center gap-1.5 text-xs font-medium bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                                >
                                    <Plus size={13} />
                                    Create your first itinerary
                                </button>
                            )}
                        </div>
                    );

                return (
                    <div className="space-y-3">
                        {itineraries.map((itinerary) => {
                            const isCreator =
                                user?.username === itinerary.createdBy;

                            const isPublic = itinerary.public;

                            const deleteLoading =
                                deleteLoadingId === itinerary.itineraryId;

                            const unsaveLoading =
                                unsaveLoadingId === itinerary.itineraryId;

                            const actionLoading =
                                deleteLoading || unsaveLoading;

                            return (
                                <div
                                    key={itinerary.itineraryId}
                                    onClick={(e) => {
                                        if (e.target.closest(".action-btn"))
                                            return;

                                        handleOpenItinerary(itinerary);
                                    }}
                                    className="group relative flex gap-5 p-5 bg-white border border-gray-100 rounded-2xl hover:border-gray-200 hover:shadow-sm transition-all cursor-pointer"
                                >
                                    {/* Action buttons */}
                                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {isCreator && (
                                            <button
                                                type="button"
                                                disabled={actionLoading}
                                                onClick={(e) =>
                                                    handleEdit(e, itinerary)
                                                }
                                                className="action-btn w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:border-gray-400 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                <Pencil
                                                    size={13}
                                                    className="text-gray-500"
                                                />
                                            </button>
                                        )}

                                        {(isCreator ||
                                            activeTab === "saved") && (
                                            <button
                                                type="button"
                                                disabled={actionLoading}
                                                onClick={(e) => {
                                                    e.stopPropagation();

                                                    if (isCreator) {
                                                        confirmDelete(
                                                            itinerary.itineraryId,
                                                        );
                                                    } else {
                                                        confirmUnsave(
                                                            itinerary.itineraryId,
                                                        );
                                                    }
                                                }}
                                                className="action-btn w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:border-red-300 hover:text-red-500 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                {actionLoading ? (
                                                    <Loader2
                                                        size={13}
                                                        className="text-gray-400 animate-spin"
                                                    />
                                                ) : (
                                                    <Trash
                                                        size={13}
                                                        className="text-red-400"
                                                    />
                                                )}
                                            </button>
                                        )}
                                    </div>

                                    {/* Thumbnail */}
                                    <div className="w-36 h-36 rounded-xl overflow-hidden flex-shrink-0">
                                        <ItineraryThumbnail
                                            itineraryId={itinerary.itineraryId}
                                            alt={itinerary.title}
                                            imgClassName="group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>

                                    {/* Details */}
                                    <div className="flex flex-col justify-between flex-1 min-w-0 py-0.5">
                                        <div className="space-y-1.5">
                                            <h2 className="text-base font-semibold text-gray-900 font-primary truncate pr-16">
                                                {itinerary.title}
                                            </h2>

                                            <p className="inline-flex items-center gap-1 text-xs text-gray-400">
                                                <MapPin
                                                    size={11}
                                                    className="flex-shrink-0"
                                                />
                                                {itinerary.place}
                                            </p>

                                            <p className="inline-flex items-center gap-1 text-xs text-gray-400">
                                                <Calendar
                                                    size={11}
                                                    className="flex-shrink-0"
                                                />
                                                {itinerary.startDate} —{" "}
                                                {itinerary.endDate}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {/* Visibility */}
                                            <span
                                                className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border
                                        ${
                                            isPublic
                                                ? "border-emerald-200 text-emerald-600 bg-emerald-50"
                                                : "border-red-200 text-red-500 bg-red-50"
                                        }`}
                                            >
                                                {isPublic ? (
                                                    <Globe size={10} />
                                                ) : (
                                                    <Lock size={10} />
                                                )}

                                                {isPublic
                                                    ? "Public"
                                                    : "Private"}
                                            </span>

                                            {/* Creator */}
                                            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full border border-gray-200 text-gray-500 bg-gray-50">
                                                by {itinerary.createdBy}
                                            </span>

                                            {/* Member badge */}
                                            {!isCreator &&
                                                activeTab === "created" && (
                                                    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full border border-blue-200 text-blue-500 bg-blue-50">
                                                        Member
                                                    </span>
                                                )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                );
            })()}

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
