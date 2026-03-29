import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "@/api/axiosConfig";
import {
    Users,
    Map,
    ImageIcon,
    Trash,
    TrendingUp,
    CalendarDays,
    MapPin,
} from "lucide-react";
import ItineraryOverlay from "@/components/ItineraryOverlay";
import { useAuth } from "@/context/AuthContext";

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

function StatCard({ title, value, icon: Icon, color }) {
    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center justify-between shadow-sm">
            <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
                    {title}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                    {value.toLocaleString()}
                </p>
            </div>
            <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
                <Icon size={18} />
            </div>
        </div>
    );
}

export default function Dashboard() {
    const { user, loading } = useAuth();

    const [openView, setOpenView] = useState(false);
    const [selectedItinerary, setSelectedItinerary] = useState(null);
    const [stats, setStats] = useState({ users: 0, itineraries: 0, images: 0 });
    const [recentItineraries, setRecentItineraries] = useState([]);
    const [activity, setActivity] = useState([]);

    const confirmDelete = itineraryId => {
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
            { autoClose: false },
        );
    };

    useEffect(() => {
        if (!loading && user) fetchDashboard();
    }, [loading, user]);

    const fetchDashboard = async () => {
        try {
            const [statsRes, itineraryRes, activityRes] = await Promise.all([
                api.get("/admin/stats"),
                api.get("/admin/itineraries/recent"),
                api.get("/admin/activity/weekly"),
            ]);
            setStats(statsRes.data);
            setRecentItineraries(itineraryRes.data);
            setActivity(activityRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async id => {
        try {
            await api.delete(`/admin/itineraries/${id}`);
            setRecentItineraries(prev => prev.filter(i => i.itineraryId !== id));
            toast.success("Itinerary deleted successfully.");
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete itinerary.");
        }
    };

    return (
        <div>
            {/* ── Header ── */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 font-primary tracking-tight mb-1">
                    Dashboard
                </h1>
                <p className="text-sm text-gray-400">
                    Overview of Travel Stories platform
                </p>
            </div>

            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <StatCard
                    title="Total Users"
                    value={stats.users}
                    icon={Users}
                    color="bg-blue-50 text-blue-500"
                />
                <StatCard
                    title="Total Itineraries"
                    value={stats.itineraries}
                    icon={Map}
                    color="bg-emerald-50 text-emerald-500"
                />
                <StatCard
                    title="Total Images"
                    value={stats.images}
                    icon={ImageIcon}
                    color="bg-amber-50 text-amber-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* ── Weekly Activity ── */}
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp size={14} className="text-gray-400" />
                        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                            Weekly Activity
                        </h2>
                    </div>
                    <div className="space-y-3">
                        {activity.map((a, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                <div className="flex items-center gap-2">
                                    <CalendarDays
                                        size={13}
                                        className="text-gray-300 flex-shrink-0"
                                    />
                                    <span className="text-xs font-medium text-gray-600">
                                        {a.date}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-xs">
                                    <span className="flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                                        <Users size={10} /> {a.newUsers} users
                                    </span>
                                    <span className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-medium">
                                        <Map size={10} /> {a.newItineraries} trips
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Recent Itineraries ── */}
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <Map size={14} className="text-gray-400" />
                        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                            Recently Added
                        </h2>
                    </div>
                    <div className="space-y-2">
                        {recentItineraries.map(itinerary => (
                            <div
                                key={itinerary.itineraryId}
                                className="group flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                                <button
                                    onClick={() => {
                                        setSelectedItinerary(itinerary);
                                        setOpenView(true);
                                    }}
                                    className="flex items-center gap-3 flex-1 min-w-0 text-left cursor-pointer">
                                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                                        <img
                                            src={`${import.meta.env.VITE_API_BASE_URL}/itineraries/${itinerary.itineraryId}/thumbnail`}
                                            alt={itinerary.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 truncate font-primary">
                                            {itinerary.title}
                                        </p>
                                        <p className="text-xs text-gray-400 flex items-center gap-1">
                                            <MapPin size={10} className="flex-shrink-0" />
                                            {itinerary.place} · {itinerary.createdBy}
                                        </p>
                                    </div>
                                </button>

                                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                                    <span
                                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border
                                        ${
                                            itinerary.public
                                                ? "border-emerald-200 text-emerald-600 bg-emerald-50"
                                                : "border-red-200 text-red-500 bg-red-50"
                                        }`}>
                                        {itinerary.public ? "Public" : "Private"}
                                    </span>
                                    <button
                                        onClick={() =>
                                            confirmDelete(itinerary.itineraryId)
                                        }
                                        className="w-7 h-7 rounded-full flex items-center justify-center text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all cursor-pointer">
                                        <Trash size={13} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

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
