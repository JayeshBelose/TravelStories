import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
    Users,
    Map,
    ImageIcon,
    Trash,
    TrendingUp,
    CalendarDays,
    MapPin,
} from "lucide-react";
import ItineraryOverlay from "@/components/itinerary/ItineraryOverlay";
import ItineraryThumbnail from "@/components/itinerary/ItineraryThumbnail";
import { Skeleton } from "@/components/ui/skeleton";
import ErrorState from "@/components/common/ErrorState";
import ConfirmToast from "@/components/common/ConfirmToast";
import { useAuth } from "@/context/AuthContext";
import {
    deleteItineraryByAdminService,
    getDashboardStatsService,
    getRecentItinerariesService,
    getWeeklyActivityService,
} from "@/services/adminService";

// Stat card
function StatCard({ title, value, icon: Icon, color, loading, error }) {
    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center justify-between shadow-sm">
            <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
                    {title}
                </p>

                {loading ? (
                    <Skeleton
                        className="h-7 w-16"
                        aria-label={`Loading ${title}`}
                    />
                ) : error ? (
                    <p className="text-xs font-medium text-red-400">
                        Unavailable
                    </p>
                ) : (
                    <p className="text-2xl font-bold text-gray-900">
                        {value.toLocaleString()}
                    </p>
                )}
            </div>

            <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}
                aria-hidden="true"
            >
                <Icon size={18} />
            </div>
        </div>
    );
}

export default function Dashboard() {
    const { user, loading } = useAuth();

    const [openView, setOpenView] = useState(false);
    const [selectedItinerary, setSelectedItinerary] = useState(null);

    const [stats, setStats] = useState({
        users: 0,
        itineraries: 0,
        images: 0,
    });

    const [recentItineraries, setRecentItineraries] = useState([]);
    const [activity, setActivity] = useState([]);
    const [loadingDashboard, setLoadingDashboard] = useState(true);

    const [loadingStats, setLoadingStats] = useState(true);
    const [loadingItineraries, setLoadingItineraries] = useState(true);
    const [loadingActivity, setLoadingActivity] = useState(true);

    const [statsError, setStatsError] = useState(null);
    const [itinerariesError, setItinerariesError] = useState(null);
    const [activityError, setActivityError] = useState(null);

    const fetchDashboard = async () => {
        setLoadingDashboard(true);

        setLoadingStats(true);
        setLoadingItineraries(true);
        setLoadingActivity(true);

        setStatsError(null);
        setItinerariesError(null);
        setActivityError(null);

        try {
            const [statsResult, itinerariesResult, activityResult] =
                await Promise.all([
                    getDashboardStatsService(),
                    getRecentItinerariesService(),
                    getWeeklyActivityService(),
                ]);

            if (statsResult.success) {
                setStats(statsResult.data);
            } else {
                console.error(
                    "Failed to load dashboard statistics:",
                    statsResult.message,
                );

                setStatsError(
                    statsResult.message ||
                        "We couldn't load the dashboard statistics.",
                );
            }

            if (itinerariesResult.success) {
                setRecentItineraries(itinerariesResult.data);
            } else {
                console.error(
                    "Failed to load recent itineraries:",
                    itinerariesResult.message,
                );

                setItinerariesError(
                    itinerariesResult.message ||
                        "We couldn't load recent itineraries.",
                );
            }

            if (activityResult.success) {
                setActivity(activityResult.data);
            } else {
                console.error(
                    "Failed to load weekly activity:",
                    activityResult.message,
                );

                setActivityError(
                    activityResult.message ||
                        "We couldn't load the weekly activity.",
                );
            }
        } catch (error) {
            console.error("Failed to load dashboard:", error);

            const message =
                error.message ||
                "We couldn't load the dashboard data. Please try again.";

            setStatsError(message);
            setItinerariesError(message);
            setActivityError(message);
        } finally {
            setLoadingDashboard(false);
            setLoadingStats(false);
            setLoadingItineraries(false);
            setLoadingActivity(false);
        }
    };

    // Fetch dashboard data once authentication is ready.
    useEffect(() => {
        if (loading || !user) return;

        fetchDashboard();
    }, [loading, user]);

    const handleStatsRetry = () => {
        setLoadingStats(true);
        setStatsError(null);

        getDashboardStatsService()
            .then((result) => {
                if (result.success) {
                    setStats(result.data);
                    setStatsError(null);
                } else {
                    setStatsError(
                        result.message ||
                            "We couldn't load the dashboard statistics.",
                    );
                }
            })
            .catch((error) => {
                console.error("Failed to reload dashboard statistics:", error);

                setStatsError(
                    "We couldn't load the dashboard statistics. Please try again.",
                );
            })
            .finally(() => {
                setLoadingStats(false);
            });
    };

    const handleActivityRetry = () => {
        setLoadingActivity(true);
        setActivityError(null);

        getWeeklyActivityService()
            .then((result) => {
                if (result.success) {
                    setActivity(result.data);
                    setActivityError(null);
                } else {
                    setActivityError(
                        result.message ||
                            "We couldn't load the weekly activity.",
                    );
                }
            })
            .catch((error) => {
                console.error("Failed to reload weekly activity:", error);

                setActivityError(
                    "We couldn't load the weekly activity. Please try again.",
                );
            })
            .finally(() => {
                setLoadingActivity(false);
            });
    };

    const handleItinerariesRetry = () => {
        setLoadingItineraries(true);
        setItinerariesError(null);

        getRecentItinerariesService()
            .then((result) => {
                if (result.success) {
                    setRecentItineraries(result.data);
                    setItinerariesError(null);
                } else {
                    setItinerariesError(
                        result.message ||
                            "We couldn't load recent itineraries.",
                    );
                }
            })
            .catch((error) => {
                console.error("Failed to reload recent itineraries:", error);

                setItinerariesError(
                    "We couldn't load recent itineraries. Please try again.",
                );
            })
            .finally(() => {
                setLoadingItineraries(false);
            });
    };

    // Itinerary delete function
    const handleDelete = async (itineraryId) => {
        const result = await deleteItineraryByAdminService({
            itineraryId,
        });

        if (result.success) {
            setRecentItineraries((prev) =>
                prev.filter(
                    (itinerary) => itinerary.itineraryId !== itineraryId,
                ),
            );

            toast.success("Itinerary deleted successfully.");
        } else {
            toast.error(result.message);
        }
    };

    // Itinerary deletion confirmation
    const confirmDelete = (itineraryId) => {
        toast(
            ({ closeToast }) => (
                <ConfirmToast
                    message="Are you sure you want to delete this itinerary? This action cannot be undone."
                    confirmLabel="Delete"
                    onConfirm={() => {
                        handleDelete(itineraryId);
                        closeToast();
                    }}
                    onCancel={closeToast}
                />
            ),
            {
                autoClose: false,
            },
        );
    };

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 font-primary tracking-tight mb-1">
                    Dashboard
                </h1>

                <p className="text-sm text-gray-400">
                    Overview of Travel Stories platform
                </p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <StatCard
                    title="Total Users"
                    value={stats.users}
                    icon={Users}
                    color="bg-blue-50 text-blue-500"
                    loading={loadingStats}
                    error={statsError}
                />

                <StatCard
                    title="Total Itineraries"
                    value={stats.itineraries}
                    icon={Map}
                    color="bg-emerald-50 text-emerald-500"
                    loading={loadingStats}
                    error={statsError}
                />

                <StatCard
                    title="Total Images"
                    value={stats.images}
                    icon={ImageIcon}
                    color="bg-amber-50 text-amber-500"
                    loading={loadingStats}
                    error={statsError}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Weekly Activity */}
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp
                            size={14}
                            className="text-gray-400"
                            aria-hidden="true"
                        />

                        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                            Weekly Activity
                        </h2>
                    </div>

                    <div
                        aria-busy={loadingActivity}
                        aria-label="Weekly activity"
                        className="space-y-3"
                    >
                        {loadingActivity ? (
                            Array.from({ length: 5 }).map((_, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                                >
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="w-3.5 h-3.5 rounded-full" />
                                        <Skeleton className="h-3 w-20" />
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Skeleton className="h-5 w-16 rounded-full" />
                                        <Skeleton className="h-5 w-16 rounded-full" />
                                    </div>
                                </div>
                            ))
                        ) : activityError ? (
                            <ErrorState
                                compact
                                title="Unable to load activity"
                                message={activityError}
                                onRetry={handleActivityRetry}
                            />
                        ) : activity.length > 0 ? (
                            activity.map((item, index) => (
                                <div
                                    key={`${item.date}-${index}`}
                                    className="flex items-start sm:items-center justify-between gap-3 py-2 border-b border-gray-50 last:border-0"
                                >
                                    <div className="flex items-center gap-2">
                                        <CalendarDays
                                            size={13}
                                            className="text-gray-300 flex-shrink-0"
                                            aria-hidden="true"
                                        />

                                        <span className="text-xs font-medium text-gray-600">
                                            {item.date}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-end gap-2 flex-wrap text-xs">
                                        <span className="flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                                            <Users
                                                size={10}
                                                aria-hidden="true"
                                            />
                                            {item.newUsers} users
                                        </span>

                                        <span className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-medium">
                                            <Map size={10} aria-hidden="true" />
                                            {item.newItineraries} trips
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-400 py-4 text-center">
                                No activity data available.
                            </p>
                        )}
                    </div>
                </div>

                {/* Recent Itineraries */}
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <Map
                            size={14}
                            className="text-gray-400"
                            aria-hidden="true"
                        />

                        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                            Recently Added
                        </h2>
                    </div>

                    <div
                        aria-busy={loadingItineraries}
                        aria-label="Recently added itineraries"
                        className="space-y-2"
                    >
                        {loadingItineraries ? (
                            Array.from({ length: 4 }).map((_, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-2.5 rounded-xl"
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />

                                        <div className="min-w-0 space-y-1.5 flex-1">
                                            <Skeleton className="h-3.5 w-32" />
                                            <Skeleton className="h-3 w-40" />
                                        </div>
                                    </div>

                                    <Skeleton className="h-5 w-14 rounded-full flex-shrink-0" />
                                </div>
                            ))
                        ) : itinerariesError ? (
                            <ErrorState
                                compact
                                title="Unable to load itineraries"
                                message={itinerariesError}
                                onRetry={handleItinerariesRetry}
                            />
                        ) : recentItineraries.length > 0 ? (
                            recentItineraries.map((itinerary) => (
                                <div
                                    key={itinerary.itineraryId}
                                    className="group flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedItinerary(itinerary);
                                            setOpenView(true);
                                        }}
                                        className="flex items-center gap-3 flex-1 min-w-0 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-1"
                                        aria-label={`View itinerary ${itinerary.title}`}
                                    >
                                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                                            <ItineraryThumbnail
                                                itineraryId={
                                                    itinerary.itineraryId
                                                }
                                                alt={itinerary.title}
                                            />
                                        </div>

                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 truncate font-primary">
                                                {itinerary.title}
                                            </p>

                                            <p className="text-xs text-gray-400 flex items-center gap-1">
                                                <MapPin
                                                    size={10}
                                                    className="flex-shrink-0"
                                                    aria-hidden="true"
                                                />
                                                {itinerary.place} ·{" "}
                                                {itinerary.createdBy}
                                            </p>
                                        </div>
                                    </button>

                                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                                        <span
                                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                                                itinerary.public
                                                    ? "border-emerald-200 text-emerald-600 bg-emerald-50"
                                                    : "border-red-200 text-red-500 bg-red-50"
                                            }`}
                                        >
                                            {itinerary.public
                                                ? "Public"
                                                : "Private"}
                                        </span>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                confirmDelete(
                                                    itinerary.itineraryId,
                                                )
                                            }
                                            className="w-9 h-9 rounded-full flex items-center justify-center text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all cursor-pointer focus:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-1"
                                            aria-label={`Delete itinerary ${itinerary.title}`}
                                        >
                                            <Trash
                                                size={13}
                                                aria-hidden="true"
                                            />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-400 py-4 text-center">
                                No itineraries found.
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Itinerary Details Overlay */}
            {openView && selectedItinerary && (
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
