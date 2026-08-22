import { useEffect, useState, useRef } from "react";
import { X, MapIcon } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import ItineraryCard from "./ItineraryCard";
import ItineraryOverlay from "./ItineraryOverlay";
import ErrorState from "@/components/common/ErrorState";
import { getUserCreatedItinerariesService } from "@/services/itineraryService";

export default function UserItineraryListOverlay({ open, onClose, user }) {
    const [itineraries, setItineraries] = useState([]);
    const [loadingItineraries, setLoadingItineraries] = useState(false);
    const [error, setError] = useState(null);
    const [selectedItinerary, setSelectedItinerary] = useState(null);
    const [retryKey, setRetryKey] = useState(0);

    const dialogRef = useRef(null);
    const previousFocusRef = useRef(null);

    const currentUser = JSON.parse(sessionStorage.getItem("user"));
    const isAdmin = currentUser?.role === "admin";

    useEffect(() => {
        if (!open) {
            return;
        }

        previousFocusRef.current = document.activeElement;

        if (dialogRef.current) {
            dialogRef.current.focus();
        }

        const handleEscape = (event) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("keydown", handleEscape);

            if (
                previousFocusRef.current &&
                typeof previousFocusRef.current.focus === "function"
            ) {
                previousFocusRef.current.focus();
            }
        };
    }, [open, onClose]);

    useEffect(() => {
        if (!open || !user?.userId) {
            return;
        }

        let cancelled = false;

        const fetchItineraries = async () => {
            setLoadingItineraries(true);
            setError(null);
            setItineraries([]);
            setSelectedItinerary(null);

            try {
                const result = await getUserCreatedItinerariesService({
                    userId: user.userId,
                });

                if (cancelled) return;

                if (!result.success) {
                    throw new Error(
                        result.message ||
                            "We couldn't load this user's itineraries.",
                    );
                }

                const visibleItineraries = isAdmin
                    ? result.data
                    : result.data.filter((itinerary) => itinerary.public);

                setItineraries(visibleItineraries);
            } catch (error) {
                if (cancelled) return;

                console.error("Failed to load user itineraries:", error);

                setError(
                    error.message ||
                        "We couldn't load this user's itineraries.",
                );

                setItineraries([]);
            } finally {
                if (!cancelled) {
                    setLoadingItineraries(false);
                }
            }
        };

        fetchItineraries();

        return () => {
            cancelled = true;
        };
    }, [open, user?.userId, isAdmin, retryKey]);

    useEffect(() => {
        if (!open) {
            setSelectedItinerary(null);
        }
    }, [open]);

    const handleRetry = () => {
        setRetryKey((prev) => prev + 1);
    };

    if (!open || !user) {
        return null;
    }

    const itineraryCount = itineraries.length;

    return (
        <>
            {/* User Itinerary Dialog */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
                onClick={onClose}
                role="presentation"
            >
                <div
                    ref={dialogRef}
                    tabIndex={-1}
                    className="bg-white w-full max-w-5xl max-h-[88vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                    onClick={(event) => event.stopPropagation()}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="user-itinerary-overlay-title"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
                        <div className="flex items-center gap-3 min-w-0">
                            <Avatar className="w-10 h-10 ring-2 ring-gray-100 flex-shrink-0">
                                <AvatarImage
                                    src={`${import.meta.env.VITE_API_BASE_URL}/users/${user.userId}/profilePicture`}
                                    alt=""
                                />

                                <AvatarFallback className="bg-gray-900 text-white text-sm font-semibold">
                                    {user.username?.[0]?.toUpperCase() || "U"}
                                </AvatarFallback>
                            </Avatar>

                            <div className="min-w-0">
                                <h2
                                    id="user-itinerary-overlay-title"
                                    className="text-base font-semibold text-gray-900 font-primary leading-tight truncate"
                                >
                                    {user.username}
                                </h2>

                                {loadingItineraries ? (
                                    <Skeleton
                                        className="h-3 w-20 mt-1"
                                        aria-hidden="true"
                                    />
                                ) : error ? (
                                    <p className="text-xs text-red-400 font-medium">
                                        Unable to load
                                    </p>
                                ) : (
                                    <p className="text-xs text-gray-400 font-medium">
                                        {itineraryCount}{" "}
                                        {itineraryCount === 1
                                            ? "itinerary"
                                            : "itineraries"}
                                    </p>
                                )}
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer flex-shrink-0"
                            aria-label={`Close ${user.username}'s itineraries`}
                        >
                            <X size={17} aria-hidden="true" />
                        </button>
                    </div>

                    {/* Body */}
                    <div
                        className="flex-1 overflow-y-auto"
                        aria-busy={loadingItineraries}
                    >
                        {loadingItineraries ? (
                            <div
                                aria-label="Loading itineraries"
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 p-6"
                            >
                                {Array.from({ length: 3 }).map((_, index) => (
                                    <div
                                        key={index}
                                        className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm"
                                        aria-hidden="true"
                                    >
                                        <Skeleton className="h-48 w-full rounded-none" />

                                        <div className="p-4 space-y-2">
                                            <Skeleton className="h-3.5 w-3/4" />
                                            <Skeleton className="h-3 w-1/2" />
                                            <Skeleton className="h-3 w-1/3" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : error ? (
                            <ErrorState
                                title="Unable to load itineraries"
                                message={error}
                                onRetry={handleRetry}
                            />
                        ) : itineraryCount === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 px-6 gap-3 text-gray-400">
                                <div
                                    className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center"
                                    aria-hidden="true"
                                >
                                    <MapIcon
                                        size={22}
                                        className="text-gray-300"
                                    />
                                </div>

                                <p className="text-sm font-medium text-gray-500">
                                    No itineraries yet
                                </p>

                                <p className="text-xs text-gray-300 text-center">
                                    {isAdmin
                                        ? `${user.username} hasn't created any itineraries.`
                                        : `${user.username} hasn't shared any public trips.`}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 p-6">
                                {itineraries.map((itinerary) => (
                                    <ItineraryCard
                                        key={itinerary.itineraryId}
                                        itinerary={itinerary}
                                        onClick={setSelectedItinerary}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Itinerary Detail Overlay */}
            <ItineraryOverlay
                itinerary={selectedItinerary}
                onClose={() => setSelectedItinerary(null)}
                allowRelatedItineraries={false}
            />
        </>
    );
}
